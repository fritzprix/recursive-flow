#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Interfaces from README.md
interface ToDo {
    id: number;
    text: string;
    check: boolean;
}

interface CurrentTodo {
    todoId: number;
    todoText: string;
    toolPlan: string[];
    currentToolIndex: number;
}

interface ExecutionRecord {
    tool: string;
    result: any;
    timestamp: number;
}

interface JobContext {
    id: string;
    goal: string;
    status: 'planning' | 'executing' | 'complete';
    todos: ToDo[];
    currentTodo?: CurrentTodo;
    executionHistory: ExecutionRecord[];
    thoughts: string[];
    finalReport?: any;
}

interface JobResponse {
    context: JobContext;
    nextAction: string | null;
}

const jobs = new Map<string, JobContext>();

const server = new McpServer({
    name: "mcp-agentic-server",
    version: "1.0.0",
});

server.registerTool("startJob", {
    title: "Start Job",
    description: "Starts a new job with a given goal.",
    inputSchema: z.object({
        goal: z.string().describe("The main objective to accomplish")
    }).shape
}, async ({ goal }) => {
    const jobId = randomUUID();
    const jobContext: JobContext = {
        id: jobId,
        goal,
        status: 'planning',
        todos: [],
        executionHistory: [],
        thoughts: [],
    };
    jobs.set(jobId, jobContext);
    const response: JobResponse = {
        context: jobContext,
        nextAction: 'setPlan',
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("setPlan", {
    title: "Set Plan",
    description: "Sets the plan (todos) for a job.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job"),
        todos: z.array(z.string()).describe("Array of todo descriptions in execution order")
    }).shape
}, async ({ jobId, todos }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext) {
        return { content: [{ type: "text", text: "Job not found" }], isError: true };
    }
    jobContext.todos = todos.map((text: string, i: number) => ({ id: i + 1, text, check: false }));
    jobContext.status = 'executing';
    const response: JobResponse = {
        context: jobContext,
        nextAction: 'selectNextTodo',
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("selectNextTodo", {
    title: "Select Next Todo",
    description: "Selects the next todo to execute.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job")
    }).shape
}, async ({ jobId }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext) {
        return { content: [{ type: "text", text: "Job not found" }], isError: true };
    }
    const nextTodo = jobContext.todos.find(todo => !todo.check);
    if (nextTodo) {
        jobContext.currentTodo = {
            todoId: nextTodo.id,
            todoText: nextTodo.text,
            toolPlan: [],
            currentToolIndex: 0,
        };
        const response: JobResponse = {
            context: jobContext,
            nextAction: 'planTodoExecution',
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
    } else {
        const response: JobResponse = {
            context: jobContext,
            nextAction: 'finishJob',
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
});

server.registerTool("planTodoExecution", {
    title: "Plan Todo Execution",
    description: "Plans the execution of a todo by defining a sequence of tools.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job"),
        tools: z.array(z.string()).describe("Array of tool names to execute in sequence")
    }).shape
}, async ({ jobId, tools }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext || !jobContext.currentTodo) {
        return { content: [{ type: "text", text: "Job or current todo not found" }], isError: true };
    }
    jobContext.currentTodo.toolPlan = tools;
    jobContext.currentTodo.currentToolIndex = 0;
    const nextTool = tools[0];
    const response: JobResponse = {
        context: jobContext,
        nextAction: nextTool,
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("reportExecution", {
    title: "Report Execution",
    description: "Reports the result of a tool execution.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job"),
        tool: z.string().describe("Name of the tool that was executed"),
        result: z.any().describe("Result from the tool execution")
    }).shape
}, async ({ jobId, tool, result }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext || !jobContext.currentTodo) {
        return { content: [{ type: "text", text: "Job or current todo not found" }], isError: true };
    }
    jobContext.executionHistory.push({ tool, result, timestamp: Date.now() });
    jobContext.currentTodo.currentToolIndex++;
    const { currentToolIndex, toolPlan } = jobContext.currentTodo;
    const nextTool = toolPlan[currentToolIndex];
    const response: JobResponse = {
        context: jobContext,
        nextAction: nextTool || 'completeTodo',
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("completeTodo", {
    title: "Complete Todo",
    description: "Marks a todo as complete.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job"),
        todoId: z.number().describe("The ID of the todo to mark as complete")
    }).shape
}, async ({ jobId, todoId }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext) {
        return { content: [{ type: "text", text: "Job not found" }], isError: true };
    }
    const todo = jobContext.todos.find(t => t.id === todoId);
    if (todo) {
        todo.check = true;
    }
    jobContext.currentTodo = undefined;
    const response: JobResponse = {
        context: jobContext,
        nextAction: 'selectNextTodo',
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("finishJob", {
    title: "Finish Job",
    description: "Completes the job and generates final report with all accumulated results.",
    inputSchema: z.object({
        jobId: z.string().describe("The unique identifier of the job")
    }).shape
}, async ({ jobId }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext) {
        return { content: [{ type: "text", text: "Job not found" }], isError: true };
    }
    
    jobContext.status = 'complete';
    
    // Generate final report with all accumulated knowledge
    jobContext.finalReport = {
        objective: jobContext.goal,
        completedTodos: jobContext.todos.filter(todo => todo.check),
        totalExecutions: jobContext.executionHistory.length,
        executionSummary: jobContext.executionHistory.map(record => ({
            tool: record.tool,
            timestamp: new Date(record.timestamp).toISOString(),
            hasResult: !!record.result
        })),
        fullExecutionHistory: jobContext.executionHistory
    };
    
    const response: JobResponse = {
        context: jobContext,
        nextAction: null,
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Agentic Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
