# Agentic RAG Context Engineering

An agent system built with BAML that can execute various tools using pattern matching.

## Overview

This project demonstrates an agentic system that:
- Uses BAML to define tool schemas and agent behavior
- Implements tool handlers using Python's `match` statement
- Supports 16 different tool types for file operations, code execution, web fetching, and more

## Architecture

### BAML Components

- **`baml_src/agent-tools.baml`**: Defines all tool types with full descriptions embedded in `@description` annotations
- **`baml_src/agent.baml`**: Defines the agent loop function that decides which tools to call
- **`main.py`**: Python implementation with tool handlers using pattern matching

### Tool Types

The agent supports the following tools:

1. **AgentTool** - Launch recursive sub-agents (fully implemented)
2. **BashTool** - Execute bash commands (fully implemented)
3. **GlobTool** - Find files by glob patterns (fully implemented)
4. **GrepTool** - Search file contents with regex (fully implemented)
5. **LSTool** - List directory contents (fully implemented)
6. **ReadTool** - Read files with line numbers (fully implemented)
7. **EditTool** - Edit files with string replacement (fully implemented)
8. **MultiEditTool** - Multiple edits in one operation (fully implemented)
9. **WriteTool** - Write new files (fully implemented)
10. **NotebookReadTool** - Read Jupyter notebooks (fully implemented)
11. **NotebookEditTool** - Edit Jupyter notebook cells (fully implemented)
12. **WebFetchTool** - Fetch and process web content (requires `requests` + `beautifulsoup4`)
13. **TodoReadTool** - Read todo list (in-memory storage)
14. **TodoWriteTool** - Write todo list (in-memory storage)
15. **WebSearchTool** - Search the web (stub - requires search API)
16. **ExitPlanModeTool** - Exit planning mode

## Tool Handler Pattern

All tools are handled through a single async `execute_tool()` function using Python 3.10+ match statements on the `action` field:

```python
async def execute_tool(tool: types.AgentTools) -> str:
    """Execute a tool based on its type using match statement"""
    match tool.action:
        case "Bash":
            return execute_bash(tool)
        case "Glob":
            return execute_glob(tool)
        case "Agent":
            return await execute_agent(tool)  # Async for recursive calls
        # ... etc for all 16 tools
        case other:
            return f"Unknown tool type: {other}"
```

## Setup

### Prerequisites

- Python 3.10+ (required for match statements)
- OpenAI API key (set as `OPENAI_API_KEY` environment variable)
- Exa API key (set as `EXA_API_KEY` environment variable) - for WebSearch tool

### Installation

```bash
# Install dependencies
uv sync

# Generate BAML client
uv run baml-cli generate
```

### Running

```bash
# Set your API keys
export OPENAI_API_KEY="your-key-here"
export EXA_API_KEY="your-exa-key-here"  # Optional, for WebSearch tool

# Run a single command (uses current directory)
uv run python main.py "What files are in this directory?"

# Interactive mode - keeps asking for commands
uv run python main.py "List files" --interactive

# TUI mode - beautiful text user interface 🎨
uv run python main.py "Start" --tui

# TUI with specific directory
uv run python main.py "Start" --tui --dir ~/myproject

# Specify a working directory (CLI mode)
uv run python main.py "Find all Python files" --dir /path/to/project

# View all options
uv run python main.py --help
```

## User Interfaces

### TUI Mode (Recommended) 🎨

Beautiful text user interface with real-time updates:

```bash
uv run python main.py "Start" --tui
```

Features:
- **Status Bar**: Shows working directory, iteration count, and agent status
- **Main Log**: Pretty-formatted output with panels for tools, results, and agent replies
  - Auto-scrolls to latest content
  - Real-time updates as tools execute
- **Todo Panel**: Live view of the todo list on the right side
- **Input Box**: Command input at the bottom
- **Conversation History**: Maintained across commands for context continuity
- **Responsive UI**: Agent runs in background thread, UI stays snappy
- **Keyboard Shortcuts**: 
  - Enter: Submit command
  - Enter (empty): Continue agent execution after text replies
  - Ctrl+R: Reset conversation history
  - Ctrl+X: Interrupt agent execution
  - Ctrl+C: Quit application

### CLI Modes

**Single Command Mode:**
```bash
uv run python main.py "What files are in this directory?"
```

**Interactive Mode:**
```bash
uv run python main.py "Start" --interactive
```
- Prompts for commands via `input()` after each task
- Type `exit`, `quit`, or `q` to exit
- Ctrl+C returns to prompt instead of exiting

## Agent Loop

The agent loop:
1. Takes a user message
2. Calls the BAML `AgentLoop` function
3. Executes any tools the LLM requests
4. Feeds tool results back to the LLM
5. Repeats until the LLM replies to the user (default max: 999 iterations)

## Key Features

### Type-Safe Tool Calling

BAML generates Pydantic models for all tools, ensuring type safety:

```python
class BashTool(BaseModel):
    action: Literal['Bash']
    command: str
    timeout: Optional[int] = None
    description: Optional[str] = None
```

### Rich Tool Descriptions

Each tool includes its full usage documentation in the `@description` annotation, providing the LLM with comprehensive context about when and how to use each tool.

### Modular Tool Handlers

Each tool has its own handler function that can be tested and maintained independently:

```python
def execute_bash(tool: types.BashTool) -> str:
    """Execute a bash command and return the output"""
    try:
        result = subprocess.run(
            tool.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=tool.timeout / 1000 if tool.timeout else 120,
            cwd=os.getcwd()
        )
        return result.stdout
    except Exception as e:
        return f"Error: {str(e)}"
```

## Dependencies

Core dependencies:
- `baml-py` - BAML Python SDK
- `pydantic` - Data validation
- `typing-extensions` - Type hints support
- `python-dotenv` - Environment variable management
- `textual` - Beautiful TUI framework
- `rich` - Rich text formatting

Optional dependencies for specific tools:
- `requests` + `beautifulsoup4` - For WebFetch tool (install with `uv add requests beautifulsoup4`)
- `exa-py` - For WebSearch tool (install with `uv add exa-py`)
- `ripgrep` (system package) - For Grep tool (usually pre-installed)

## In-Memory State

The agent maintains in-memory state for:
- **Todo list** - Stored in `_todo_store` global variable, persists for the lifetime of the process
- **Agent loop** - Supports recursive sub-agent calls with reduced max iterations

## Sub-Agents

The agent can launch sub-agents to handle focused tasks. Sub-agents use a different BAML function (`SubAgentLoop`) that doesn't include the `AgentTool`, preventing infinite recursion.

**Architecture:**
- Main agent uses `AgentLoop` - has access to all tools including `AgentTool`
- Sub-agents use `SubAgentLoop` - has all tools EXCEPT `AgentTool`
- Sub-agents run in isolated message contexts
- Results are returned to the main agent

In the TUI, sub-agents are visualized with indentation and depth indicators:

```
Iteration 1
🔧 Tool: Glob
✅ Result: [files found]

🔄 Launching Sub-agent (Level 1)
  └─ Sub-agent Iteration 1
    └─ 🔧 Read (1/2)
       ✓ File contents...
    └─ 🔧 Grep (2/2)
       ✓ Matches found...
  ✓ Sub-agent L1 Complete

Iteration 2
...
```

**Visualization Features:**
- Indentation shows nesting level
- Tool progress: `(1/3)` shows current tool of total
- Depth indicator: `[Sub-agent L1]` in status bar
- Compact sub-agent output to reduce visual clutter
- Full interrupt support for sub-agents

**Important Note:** Sub-agents cannot spawn additional sub-agents (by design). The main agent uses `AgentLoop` which includes the `AgentTool`, while sub-agents use `SubAgentLoop` which excludes it. This prevents infinite recursion and keeps sub-agents focused on their specific goals.

## Example Usage

### Command Line

```bash
# Find package.json files
uv run python main.py "What directory contains the file 'package.json'?"

# Work in a specific directory
uv run python main.py "List all JavaScript files" --dir ~/my-project

# Interactive mode for multiple tasks
uv run python main.py "List files" --interactive
```

### Programmatic Usage

```python
# Find package.json files
user_query = 'What directory contains the file "package.json"?'
result = asyncio.run(agent_loop(user_query))
```

The agent will:
1. Use GlobTool to find all `package.json` files
2. Analyze the results
3. Reply to the user with the answer

## Command Line Options

```
usage: main.py [-h] [--dir DIR] [--interactive] [--tui] [--verbose] query

positional arguments:
  query                 The query or task for the agent to perform

options:
  -h, --help            show this help message and exit
  --dir DIR, -d DIR     Working directory for the agent (defaults to current directory)
  --interactive, -i     Run in interactive mode (keep asking for commands)
  --tui, -t            Run in TUI mode (beautiful text user interface)
  --verbose, -v         Enable verbose output
```

**Note**: The agent runs with a very high iteration limit (999) by default, allowing it to complete complex tasks. Sub-agents get a limit of 50 iterations.

## TUI Layout

The TUI provides a beautiful interface with:
- Color-coded tool executions (magenta panels)
- Success results in green panels
- User queries in blue panels
- Live todo list updates on the right
- Real-time status bar at the top

See [TUI_LAYOUT.md](TUI_LAYOUT.md) for a detailed visual layout diagram.

## Project Structure

```
2025-10-21-agentic-rag-context-engineering/
├── baml_src/
│   ├── agent-tools.baml      # Tool type definitions (AgentTools, SubAgentTools)
│   ├── agent.baml             # Agent loop functions (AgentLoop, SubAgentLoop)
│   ├── clients.baml           # LLM client configs
│   └── generators.baml        # Code generation config
├── baml_client/               # Auto-generated BAML client
├── agent_runtime.py           # Shared agent state & execution logic
├── main.py                    # Tool handlers & CLI interface
├── tui.py                     # Beautiful TUI interface
├── ARCHITECTURE.md            # Architecture documentation
├── TUI_LAYOUT.md              # Visual TUI documentation
├── pyproject.toml             # Dependencies
└── README.md                  # This file
```

**Key Design:**
- `agent_runtime.py` contains all agent logic (zero duplication)
- Both CLI and TUI use `AgentRuntime` with different callbacks
- Sub-agents use `SubAgentLoop` (no AgentTool access)
- All code is async using `baml_client.async_client`

## Agent Capabilities

BAMMY is a sophisticated AI agent with professional-grade capabilities:

### **Core Features:**
- **File System Operations**: Read, write, edit, and search files
- **Code Analysis**: Understand and manipulate codebases
- **Web Research**: Fetch information and perform web searches
- **Task Management**: Plan, track, and execute complex workflows
- **Bash Execution**: Run system commands and scripts
- **Sub-Agent Delegation**: Delegate complex tasks to focused sub-agents

### **Professional Standards:**
- **Security-First**: Refuses to work on malicious code
- **Convention-Aware**: Follows existing code patterns and standards
- **Efficient Communication**: Concise, direct responses
- **Proactive Task Management**: Uses todo tools extensively
- **Quality Assurance**: Runs lint/typecheck after code changes

### **Technical Details:**
- Uses `gpt-4o-mini` by default (configurable in `agent.baml`)
- Tool handlers include comprehensive error handling
- Supports recursive sub-agent delegation with infinite recursion protection
- Maintains conversation context across iterations
- Some tools (WebSearch, TodoRead/Write) are stubs requiring external services
- The agent loop has a configurable max iteration limit (default: 10)

