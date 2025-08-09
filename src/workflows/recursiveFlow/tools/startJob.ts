import { randomUUID } from "node:crypto";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobContext, JobResponse } from "../../../types";

export default function registerStartJob(server: McpServer) {
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
        jobStore.set(jobContext);
        const response: JobResponse = {
            context: jobContext,
            nextAction: 'setPlan',
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
    });
}
