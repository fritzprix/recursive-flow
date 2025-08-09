export interface ToDo {
    id: number;
    text: string;
    check: boolean;
}

export interface CurrentTodo {
    todoId: number;
    todoText: string;
    toolPlan: string[];
    currentToolIndex: number;
}

export interface ExecutionRecord {
    tool: string;
    result: any;
    timestamp: number;
}

export type JobStatus = 'planning' | 'executing' | 'complete';

export interface JobContext {
    id: string;
    goal: string;
    status: JobStatus;
    todos: ToDo[];
    currentTodo?: CurrentTodo;
    executionHistory: ExecutionRecord[];
    thoughts: string[];
    finalReport?: any;
}

export interface JobResponse {
    context: JobContext;
    nextAction: string | null;
}
