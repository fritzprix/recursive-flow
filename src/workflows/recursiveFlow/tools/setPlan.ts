import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerSetPlan(server: McpServer) {
    server.registerTool("setPlan", {
        title: "Set Plan",
        description: "Sets the plan (todos) for a job.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job"),
            todos: z.array(z.string()).describe("Array of todo descriptions in execution order")
        }).shape
    }, async ({ jobId, todos }) => {
        const jobContext = jobStore.get(jobId);
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
}
