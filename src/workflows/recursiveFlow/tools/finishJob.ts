import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerFinishJob(server: McpServer) {
    server.registerTool("finishJob", {
        title: "Finish Job",
        description: "Completes the job and generates final report with all accumulated results.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job")
        }).shape
    }, async ({ jobId }) => {
        const jobContext = jobStore.get(jobId);
        if (!jobContext) {
            return { content: [{ type: "text", text: "Job not found" }], isError: true };
        }

        jobContext.status = 'complete';

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
}
