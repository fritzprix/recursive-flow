import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Tool registrars
import registerStartJob from "./tools/startJob";
import registerSetPlan from "./tools/setPlan";
import registerSelectNextTodo from "./tools/selectNextTodo";
import registerPlanTodoExecution from "./tools/planTodoExecution";
import registerReportExecution from "./tools/reportExecution";
import registerCompleteTodo from "./tools/completeTodo";
import registerFinishJob from "./tools/finishJob";

export function registerRecursiveFlow(server: McpServer) {
    registerStartJob(server);
    registerSetPlan(server);
    registerSelectNextTodo(server);
    registerPlanTodoExecution(server);
    registerReportExecution(server);
    registerCompleteTodo(server);
    registerFinishJob(server);
}
