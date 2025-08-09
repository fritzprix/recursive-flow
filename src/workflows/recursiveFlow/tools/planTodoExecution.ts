import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerPlanTodoExecution(server: McpServer) {
    server.registerTool("planTodoExecution", {
        title: "Plan Todo Execution",
        description: "Plans the execution of a todo by defining a sequence of tools.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job"),
            tools: z.array(z.string()).describe("Array of tool names to execute in sequence")
        }).shape
    }, async ({ jobId, tools }) => {
        const jobContext = jobStore.get(jobId);
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
}
