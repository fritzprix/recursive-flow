import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerSelectNextTodo(server: McpServer) {
    server.registerTool("selectNextTodo", {
        title: "Select Next Todo",
        description: "Selects the next todo to execute.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job")
        }).shape
    }, async ({ jobId }) => {
        const jobContext = jobStore.get(jobId);
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
}
