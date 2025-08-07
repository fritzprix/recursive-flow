# MCP (Model Context Protocol) Tools를 활용한 확장성 높은 Agentic Workflow

- MCP Tools의 Chaining을 통해 다양한 Tool을 활용하여 복잡한 Task를 수행하도록 하기 위한 MCP Tool 기반 Framework 제공
- 범용적 Framework으로써 많은 Workflow를 수용할 수 있음

## Framework Concept

- Tool Call의 Parameter를 통해 각 단계의 필요한 정보의 생성을 강제화
- Job Context를 Tool 호출 시 항상 노출하여 맥락의 유지를 강화
- LLM 기반 Agent는 이 MCP 도구를 호출하면서 자연스럽게 복잡한 Task를 수행해나가게됨
- 각 단계는 다음단계가 명시적이며 다음에 어떤 도구를 호출해야 하는지 nextAction의 값으로 LLM 기반 Agent에 Return하게됨
- Return된 정보는 Tool Output으로 Message Context 내에 포함되게됨
- **핵심: Recursive Turn-Taking을 통해 Agent가 자율적으로 작업을 진행하도록 유도**

### Context Type

```ts
interface ToDo {
    id: number;
    text: string;
    check: boolean;
}

interface CurrentTodo {
    todoId: number;
    todoText: string;
    toolPlan: string[];        // 실행할 도구 순서
    currentToolIndex: number;   // 현재 실행 중인 도구 인덱스
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
    nextAction: string;  // Agent가 다음에 호출해야 할 function/tool
}
```

### MCP Tool Methods

```ts
// Job 시작
startJob(goal: string): JobResponse

// 계획 수립
setPlan(jobId: string, todos: string[]): JobResponse

// 다음 ToDo 선택
selectNextTodo(jobId: string): JobResponse

// ToDo 실행 계획 수립 (도구 시퀀스 정의)
planTodoExecution(jobId: string, tools: string[]): JobResponse

// 도구 실행 결과 보고
reportExecution(jobId: string, tool: string, result: any): JobResponse

// ToDo 완료 처리
completeTodo(jobId: string, todoId: number): JobResponse
```

### Workflow

```plantuml
@startuml
title Agentic MCP Workflow with External Tools

participant User
participant Agent
participant "MCP_Agentic" as MCP
participant "External Tools" as Tools

== 1. 작업 시작 ==
User -> Agent: "작업 요청"
Agent -> MCP: startJob("사용자 요구사항...")
MCP -> Agent: {context: {id:"job-123", status:"planning"}, nextAction:"setPlan"}

== 2. 계획 수립 ==
Agent -> MCP: setPlan("job-123", ["작업1", "작업2", "작업3"])
MCP -> Agent: {context: {todos:[...]}, nextAction:"selectNextTodo"}

== 3. ToDo 실행 ==
Agent -> MCP: selectNextTodo("job-123")
MCP -> Agent: {context: {currentTodo:{id:1, text:"작업1"}}, nextAction:"planTodoExecution"}

Agent -> MCP: planTodoExecution("job-123", ["tool1", "tool2"])
MCP -> Agent: {context: {currentTodo:{toolPlan:[...], currentToolIndex:0}}, nextAction:"tool1"}

== 4. 도구 실행 및 보고 (반복) ==
Agent -> Tools: tool1(params)
Tools -> Agent: result1
Agent -> MCP: reportExecution("job-123", "tool1", result1)
MCP -> Agent: {context: {currentToolIndex:1}, nextAction:"tool2"}

Agent -> Tools: tool2(params)
Tools -> Agent: result2
Agent -> MCP: reportExecution("job-123", "tool2", result2)
MCP -> Agent: {nextAction:"completeTodo"}

== 5. ToDo 완료 ==
Agent -> MCP: completeTodo("job-123", 1)
MCP -> Agent: {context: {todos:[✓,◯,◯]}, nextAction:"selectNextTodo"}

note right: 모든 ToDo가 완료될 때까지\n3-5 단계 반복

== 6. 작업 완료 ==
MCP -> Agent: {context: {status:"complete"}, nextAction:"complete"}
Agent -> User: "작업 완료 보고"
@enduml
```

### 특징

1. **상태 기반 가이드**: MCP가 상태를 관리하고 nextAction으로 Agent를 가이드
2. **자율적 실행**: Agent는 MCP의 가이드를 따라 자율적으로 도구 호출 및 작업 수행
3. **투명한 추적**: 모든 도구 실행 결과가 executionHistory에 기록되어 추적 가능
4. **유연한 도구 통합**: 어떤 외부 도구든 toolPlan에 포함시켜 실행 가능

## Publishing to NPM

To publish this package to NPM, follow these steps:

1. **Login to NPM:**

    ```bash
    npm login
    ```

2. **Update Package Version:**

    ```bash
    npm version <patch|minor|major>
    ```

3. **Publish:**

    ```bash
    npm publish
    ```

## Claude Desktop Configuration

This MCP server is designed to work with Claude Desktop application using the stdio transport protocol.

### 1. Install Claude Desktop

Download and install Claude Desktop from [https://claude.ai/download](https://claude.ai/download)

### 2. Configure MCP Server

Add this server to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**On Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

#### Production Mode (Using published npm package)

```json
{
  "mcpServers": {
    "mcp-flow": {
      "command": "npx",
      "args": ["mcp-flow"]
    }
  }
}
```

#### Development Mode (Using local source)

```json
{
  "mcpServers": {
    "mcp-flow": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-flow/src/index.ts"]
    }
  }
}
```

### 3. Installation and Setup

#### For Production Use

```bash
# Install globally via npm (optional)
npm install -g mcp-flow

# Or use directly with npx (recommended)
# No installation needed - npx will download and run automatically
```

#### For Development

```bash
# Clone and install dependencies
git clone <your-repo>
cd mcp-flow
npm install

# Install tsx for TypeScript execution
npm install -g tsx
```

Then restart Claude Desktop to load the MCP server.
