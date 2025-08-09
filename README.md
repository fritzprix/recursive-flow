# Recursive Flow: AI Agent Workflow Manager

Recursive Flow is a powerful MCP (Model Context Protocol) server that enables AI agents to break down complex tasks into manageable steps and execute them systematically. Perfect for automating multi-step workflows with Claude Desktop and other MCP-compatible AI assistants.

## What It Does

- **Smart Task Breaking**: Automatically breaks down complex requests into smaller, manageable todo items
- **Guided Execution**: Provides step-by-step guidance to AI agents on what to do next
- **Tool Orchestration**: Coordinates multiple tools and services to complete complex workflows
- **Progress Tracking**: Keeps track of what's been done and what's still pending
- **Context Preservation**: Maintains full context throughout the entire workflow

## Key Benefits

- **Autonomous Operation**: AI agents can work independently without constant guidance
- **Reliable Execution**: Systematic approach ensures nothing gets missed
- **Flexible Integration**: Works with any MCP-compatible tools and services
- **Complete Transparency**: Full audit trail of all actions taken
- **Self-Managing**: Agents know exactly what to do next at each step

## How It Works

When you give your AI assistant a complex task, Recursive Flow helps it work through the task systematically:

1. **Planning Phase**: The AI breaks down your request into specific action items
2. **Execution Phase**: Each action item is tackled step-by-step with the right tools
3. **Progress Tracking**: The system keeps track of what's done and what's next
4. **Completion**: Once all items are finished, you get a complete summary

### Example Workflow

Let's say you ask your AI to "Research competitors and create a market analysis report":

1. **Planning**: The AI creates a plan with steps like:

   - Research main competitors
   - Analyze their pricing strategies
   - Compare product features
   - Create summary document

2. **Execution**: For each step, the AI:

   - Identifies the right tools to use (web search, data analysis, document creation)
   - Executes each tool in the right order
   - Records the results for the next step

3. **Completion**: You receive a comprehensive market analysis with all supporting research

### Recursive Flow Architecture

The following sequence diagram shows how the tools work together in a recursive, self-managing workflow:

```plantuml
@startuml
title Recursive Flow: Agentic Workflow Management

participant User
participant Agent
participant "Recursive Flow" as RF
participant "External Tools" as Tools

== 1. Workflow Initiation ==
User -> Agent: "Complex task request"
Agent -> RF: startJob(goal)
RF -> Agent: {context: {id, goal, status:'planning'}, nextAction: 'setPlan'}

== 2. Planning Phase ==
Agent -> RF: setPlan(jobId, todos)
RF -> Agent: {context: {todos: [...]}, nextAction: 'selectNextTodo'}

== 3. Recursive Execution Loop ==
loop For each TODO item
    Agent -> RF: selectNextTodo(jobId)
    RF -> Agent: {context: {currentTodo: {...}}, nextAction: 'planTodoExecution'}

    Agent -> RF: planTodoExecution(jobId, tools)
    RF -> Agent: {context: {toolPlan: [...]}, nextAction: 'tool1'}

    loop For each tool in toolPlan
        Agent -> Tools: execute_tool(params)
        Tools -> Agent: tool_result
        Agent -> RF: reportExecution(jobId, tool, result)
        alt More tools remaining
            RF -> Agent: {context: {executionHistory: [...]}, nextAction: 'next_tool'}
        else All tools completed
            RF -> Agent: {context: {executionHistory: [...]}, nextAction: 'completeTodo'}
        end
    end

    Agent -> RF: completeTodo(jobId, todoId)
    alt More TODOs remaining
        RF -> Agent: {context: {todos: [✓,○,○]}, nextAction: 'selectNextTodo'}
    else All TODOs completed
        RF -> Agent: {context: {todos: [✓,✓,✓]}, nextAction: 'finishJob'}
    end
end

== 4. Workflow Completion ==
Agent -> RF: finishJob(jobId)
RF -> Agent: {context: {status: 'complete', finalReport: '...'}, nextAction: null}
Agent -> User: "Complete results with full context"

@enduml
```

### Key Architectural Features

- **Self-Directed**: Each tool returns `nextAction` to guide the agent
- **Context Accumulation**: `executionHistory` builds comprehensive knowledge
- **Variable Length**: Workflow adapts to any number of steps and tools
- **Recursive Pattern**: Core loop of select → plan → execute → complete
- **Clean Termination**: `nextAction: null` signals workflow completion

## What Makes It Special

- **No Manual Intervention**: Once started, the AI can complete complex multi-step tasks without you having to guide each step
- **Reliable Results**: The systematic approach ensures consistent, thorough completion of tasks
- **Full Visibility**: You can see exactly what was done and how decisions were made
- **Extensible**: Works with any tools your AI assistant has access to

## Installation & Setup

### Quick Setup with Claude Desktop (Recommended)

> **Note**: Make sure the package is published to npm before using npx. If not published yet, use the "Local Development Setup" method below.

The easiest way to use Recursive Flow is with `npx`, which automatically downloads and runs the latest version:

1. **Locate your Claude Desktop configuration file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

1. **Add Recursive Flow** to your MCP servers configuration:

```json
{
  "mcpServers": {
    "recursive-flow": {
      "command": "npx",
      "args": ["recursive-flow"],
      "env": {}
    }
  }
}
```

1. **Restart Claude Desktop**

That's it! Claude will automatically download and run Recursive Flow when needed.

### Alternative Setup Methods

#### Option 1: Global Installation

```bash
npm install -g recursive-flow
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "recursive-flow": {
      "command": "recursive-flow",
      "args": [],
      "env": {}
    }
  }
}
```

#### Option 2: Local Development Setup

If you want to run from source code:

```bash
git clone [repository-url]
cd recursive-flow
npm install
npm run build
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "recursive-flow": {
      "command": "node",
      "args": ["/absolute/path/to/recursive-flow/dist/index.js"],
      "env": {}
    }
  }
}
```

### Verification

After setup, restart Claude Desktop and ask it to use Recursive Flow:

> "Can you start a job to research competitors in the AI industry?"

If configured correctly, Claude will use the `startJob` tool to begin a workflow.

## Publishing to NPM

If you're the package maintainer, here's how to publish for npx usage:

```bash
# Build the package
npm run build

# Test locally first
npm pack
npm install -g ./recursive-flow-1.0.2.tgz

# Publish to NPM
npm publish
```

After publishing, users can immediately use `npx recursive-flow` without any installation.

### Using with Other AI Assistants

Recursive Flow works with any AI assistant that supports the Model Context Protocol (MCP). Check your AI assistant's documentation for MCP server setup instructions.

## How to Use

Once installed, you can give your AI assistant complex tasks and it will automatically use Recursive Flow to manage the workflow. Here are some examples:

### Simple Usage

Just ask your AI assistant to handle complex tasks naturally:

> "I need you to research the top 5 competitors in the electric vehicle market and create a detailed comparison report"

### What Happens Behind the Scenes

1. **Job Creation**: The AI starts a new workflow job
2. **Planning**: Breaks down the task into specific steps
3. **Execution**: Works through each step systematically
4. **Completion**: Provides comprehensive results

### Example Tasks Perfect for Recursive Flow

- **Market Research**: "Research competitors and create analysis reports"
- **Content Creation**: "Plan and create a complete social media campaign"
- **Data Analysis**: "Analyze sales data and prepare executive presentations"
- **Project Planning**: "Create a detailed project timeline with milestones"
- **Research Projects**: "Investigate a topic and compile comprehensive findings"

## Available Tools

Recursive Flow provides these tools for AI agents (in execution order):

- `startJob`: Begin a new workflow with a specific goal
- `setPlan`: Break down the goal into actionable steps
- `selectNextTodo`: Choose the next task to execute
- `planTodoExecution`: Plan how to execute a specific task
- `reportExecution`: Record the results of task execution
- `completeTodo`: Mark a task as finished
- `finishJob`: Complete the entire workflow (needs implementation)

### Flow Pattern

The tools follow a recursive pattern:

1. **Start** → setPlan → selectNextTodo
2. **Loop**: selectNextTodo → planTodoExecution → [external tools] → reportExecution → completeTodo → selectNextTodo
3. **End**: selectNextTodo → finishJob → null (workflow complete)

## Benefits for Users

- **Save Time**: No need to break down complex tasks manually
- **Ensure Completeness**: Nothing gets missed in multi-step processes
- **Track Progress**: See exactly what's been done and what's remaining
- **Reduce Errors**: Systematic approach minimizes mistakes
- **Work Autonomously**: AI handles complex workflows independently

## Troubleshooting

### Common Issues

**Claude doesn't recognize Recursive Flow tools:**

- Check that the MCP server configuration uses `npx` and `recursive-flow` correctly
- Ensure you have an internet connection (npx needs to download the package)
- Restart Claude Desktop after configuration changes
- Try running `npx recursive-flow` in terminal to verify it works

**NPX-related issues:**

- If you get "command not found", ensure Node.js and npm are installed
- For the first run, npx might take a moment to download the package
- If download fails, try: `npm cache clean --force` then restart Claude

**Tasks aren't being broken down properly:**

- Try being more specific about what you want to achieve
- Break very large tasks into smaller initial requests

**Performance issues:**

- The first run might be slower as npx downloads the package
- Subsequent runs will be faster as the package is cached

## 🤖 System Prompt for LLM Agents

> **Use this prompt to instruct your LLM agent on how to interact with Recursive Flow.**

### System Prompt Template

```text
You are an autonomous workflow agent using the Recursive Flow MCP server.
Follow this exact protocol to handle complex multi-step tasks:

1. **Job Initialization**
   - Start by calling `startJob` with the user's main goal
   - Extract the `jobId` from the response

2. **Planning Phase**
   - Call `setPlan` with the `jobId` and an ordered array of todo descriptions
   - Each todo should be a clear, actionable step toward the goal

3. **Execution Loop**
   For each todo:
   - Call `selectNextTodo` with the `jobId`
   - When a todo is selected, call `planTodoExecution` with the `jobId` and array of tool names
   - Execute each tool in the planned sequence:
     - Use external tools as needed (web search, file operations, calculations, etc.)
     - After each tool execution, call `reportExecution` with `jobId`, tool name, and result
   - When all tools for the todo are complete, call `completeTodo` with `jobId` and `todoId`

4. **Completion**
   - When `selectNextTodo` returns `nextAction: 'finishJob'`, call `finishJob` with the `jobId`
   - This generates a comprehensive final report with all accumulated results

**Critical Rules:**
- ALWAYS follow the `nextAction` field in responses to know what to do next
- NEVER skip steps or change the protocol order
- Track the full `context` to understand current workflow state
- Report ALL tool executions with their actual results
- When `nextAction` is null, the workflow is complete

**Example Workflow:**
User: "Research competitors and create a market analysis report"

1. startJob(goal: "Research competitors and create a market analysis report")
2. setPlan(jobId, ["Research top 3 competitors", "Analyze pricing strategies", "Compare product features", "Create summary report"])
3. selectNextTodo(jobId) → todo: "Research top 3 competitors"
4. planTodoExecution(jobId, ["web_search", "data_collection"])
5. [Execute web_search] → reportExecution(jobId, "web_search", search_results)
6. [Execute data_collection] → reportExecution(jobId, "data_collection", collected_data)
7. completeTodo(jobId, 1)
8. [Repeat steps 3-7 for remaining todos]
9. finishJob(jobId) → final comprehensive report

Always maintain systematic execution and provide complete, actionable results.
```

### Integration Examples

**For Claude Desktop:**
Copy the system prompt above and use it when giving Claude complex tasks that require systematic breakdown and execution.

**For API Integration:**
Include the system prompt in your assistant's configuration to enable automatic workflow management for complex requests.

## Support

For issues, questions, or contributions, please visit the project repository or contact the maintainers.
