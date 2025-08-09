import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jobStore } from "../../../state/jobStore";
import type { JobResponse } from "../../../types";

export default function registerCompleteTodo(server: McpServer) {
    server.registerTool("completeTodo", {
        title: "Complete Todo",
        description: "Marks a todo as complete.",
        inputSchema: z.object({
            jobId: z.string().describe("The unique identifier of the job"),
            todoId: z.number().describe("The ID of the todo to mark as complete")
        }).shape
    }, async ({ jobId, todoId }) => {
        const jobContext = jobStore.get(jobId);
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
}
