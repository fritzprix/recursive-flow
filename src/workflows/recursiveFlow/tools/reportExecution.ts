import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerReportExecution(server: McpServer) {
    server.registerTool("reportExecution", {
        title: "Report Execution",
        description: "Reports the result of a tool execution.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job"),
            tool: z.string().describe("Name of the tool that was executed"),
            result: z.any().describe("Result from the tool execution")
        }).shape
    }, async ({ jobId, tool, result }) => {
        const jobContext = jobStore.get(jobId);
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
}
