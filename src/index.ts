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
}

interface JobResponse {
    context: JobContext;
    nextAction: string;
}

const jobs = new Map<string, JobContext>();

const server = new McpServer({
    name: "mcp-agentic-server",
    version: "1.0.0",
});

server.registerTool("startJob", {
    title: "Start Job",
    description: "Starts a new job with a given goal.",
    inputSchema: { goal: z.string() },
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
    inputSchema: { jobId: z.string(), todos: z.array(z.string()) },
}, async ({ jobId, todos }) => {
    const jobContext = jobs.get(jobId);
    if (!jobContext) {
        return { content: [{ type: "text", text: "Job not found" }], isError: true };
    }
    jobContext.todos = todos.map((text, i) => ({ id: i + 1, text, check: false }));
    const response: JobResponse = {
        context: jobContext,
        nextAction: 'selectNextTodo',
    };
    return { content: [{ type: "text", text: JSON.stringify(response) }] };
});

server.registerTool("selectNextTodo", {
    title: "Select Next Todo",
    description: "Selects the next todo to execute.",
    inputSchema: { jobId: z.string() },
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
        jobContext.status = 'complete';
        const response: JobResponse = {
            context: jobContext,
            nextAction: 'complete',
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
});

server.registerTool("planTodoExecution", {
    title: "Plan Todo Execution",
    description: "Plans the execution of a todo by defining a sequence of tools.",
    inputSchema: { jobId: z.string(), tools: z.array(z.string()) },
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
    inputSchema: { jobId: z.string(), tool: z.string(), result: z.any() },
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
    inputSchema: { jobId: z.string(), todoId: z.number() },
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

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Agentic Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
