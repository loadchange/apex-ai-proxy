# Anthropic Messages API

Apex AI Proxy provides full compatibility with Anthropic's Messages API, allowing you to use Claude Code, Anthropic SDK, and other Anthropic-compatible tools with any configured provider. The proxy automatically converts between Anthropic and OpenAI formats.

## Endpoint

```
POST /v1/messages
```

## Authentication

All requests require authentication using one of these methods:

```http
# Standard Authorization header
Authorization: Bearer your-service-api-key

# Anthropic-style header (also supported)
x-api-key: your-service-api-key
```

## Request Format

### Basic Request

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 100,
  "messages": [
    {
      "role": "user",
      "content": "Hello, Claude!"
    }
  ]
}
```

### Complete Request Example

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 1000,
  "system": "You are a helpful assistant specialized in Python programming.",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Write a Python function to calculate fibonacci numbers"
        }
      ]
    }
  ],
  "temperature": 0.7,
  "top_p": 0.9,
  "stop_sequences": ["```", "---"],
  "stream": false
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | ✅ | Model to use (configured in your proxy) |
| `max_tokens` | integer | ✅ | Maximum tokens to generate |
| `messages` | array | ✅ | Array of message objects |
| `system` | string/array | ❌ | System message or array of system messages |
| `temperature` | number | ❌ | Sampling temperature (0.0-2.0) |
| `top_p` | number | ❌ | Nucleus sampling parameter |
| `stop_sequences` | array | ❌ | Custom stop sequences |
| `stream` | boolean | ❌ | Enable streaming responses |
| `tools` | array | ❌ | Available tools for function calling |
| `tool_choice` | object | ❌ | Tool selection preference |

### Model Configuration

The proxy maps Anthropic model names to your configured providers:

```javascript
// Example configuration in wrangler-config.js
const modelProviderConfig = {
  'claude-3-sonnet': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
      { provider: 'azure', model: 'gpt-4' },
    ],
  },
  'claude-3-opus': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },
    ],
  },
  'claude-3-haiku': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
  },
};
```

### System Messages

System messages can be provided as a string or array:

```json
{
  "system": "You are a helpful assistant."
}
```

```json
{
  "system": [
    {
      "type": "text",
      "text": "You are a helpful assistant."
    },
    {
      "type": "text", 
      "text": "Always respond in a friendly tone."
    }
  ]
}
```

### Message Content

Messages support both simple text and structured content:

#### Simple Text
```json
{
  "role": "user",
  "content": "What is the capital of France?"
}
```

#### Structured Content
```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "Analyze this code:"
    },
    {
      "type": "text",
      "text": "```python\ndef hello():\n    print('Hello, world!')\n```"
    }
  ]
}
```

## Response Format

### Successful Response

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! I'm Claude, an AI assistant. How can I help you today?"
    }
  ],
  "model": "claude-3-sonnet",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 12,
    "output_tokens": 19
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique message identifier |
| `type` | string | Always "message" |
| `role` | string | Always "assistant" |
| `content` | array | Array of content blocks |
| `model` | string | Model used for generation |
| `stop_reason` | string | Reason completion stopped |
| `stop_sequence` | string | Stop sequence that triggered end |
| `usage` | object | Token usage statistics |

### Stop Reasons

| Reason | Description |
|--------|-------------|
| `end_turn` | Natural end of response |
| `max_tokens` | Reached token limit |
| `stop_sequence` | Hit a stop sequence |
| `tool_use` | Model wants to use a tool |

## Streaming Responses

Enable real-time streaming by setting `stream: true`:

### Request

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 100,
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story"
    }
  ],
  "stream": true
}
```

### Streaming Events

The proxy returns Server-Sent Events following Anthropic's format:

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_abc123","type":"message","role":"assistant","content":[],"model":"claude-3-sonnet","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":12,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Once"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" upon"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_stop
data: {"type":"message_stop"}
```

## Tool Usage (Function Calling)

The proxy supports Anthropic's tool use format with automatic conversion to OpenAI function calling:

### Tool Definition

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 100,
  "tools": [
    {
      "name": "get_weather",
      "description": "Get weather information for a location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City name"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"],
            "description": "Temperature unit"
          }
        },
        "required": ["location"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "What's the weather in Paris?"
    }
  ]
}
```

### Tool Choice Options

```json
{
  "tool_choice": {"type": "auto"}        // Let model decide
}
```

```json
{
  "tool_choice": {"type": "any"}         // Must use a tool
}
```

```json
{
  "tool_choice": {                       // Use specific tool
    "type": "tool",
    "name": "get_weather"
  }
}
```

```json
{
  "tool_choice": {"type": "none"}        // Don't use tools
}
```

### Tool Use Response

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I'll check the weather in Paris for you."
    },
    {
      "type": "tool_use",
      "id": "toolu_abc123",
      "name": "get_weather",
      "input": {
        "location": "Paris",
        "unit": "celsius"
      }
    }
  ],
  "model": "claude-3-sonnet",
  "stop_reason": "tool_use",
  "usage": {
    "input_tokens": 25,
    "output_tokens": 45
  }
}
```

### Tool Result

Provide tool results in follow-up messages:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_abc123",
      "content": "The weather in Paris is 22°C and sunny."
    }
  ]
}
```

## Code Examples

### Python (Anthropic SDK)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://your-proxy.workers.dev",
    api_key="your-service-api-key"
)

# Basic message
message = client.messages.create(
    model="claude-3-sonnet",
    max_tokens=100,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude!"
        }
    ]
)

print(message.content[0].text)

# Streaming message
stream = client.messages.create(
    model="claude-3-sonnet",
    max_tokens=100,
    messages=[
        {
            "role": "user",
            "content": "Tell me a joke"
        }
    ],
    stream=True
)

for event in stream:
    if event.type == "content_block_delta":
        print(event.delta.text, end="")
```

### JavaScript/Node.js

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  baseURL: 'https://your-proxy.workers.dev',
  apiKey: 'your-service-api-key',
});

// Basic message
const message = await anthropic.messages.create({
  model: 'claude-3-sonnet',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: 'Hello, Claude!'
    }
  ]
});

console.log(message.content[0].text);

// Streaming message
const stream = anthropic.messages.stream({
  model: 'claude-3-sonnet',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: 'Count from 1 to 10'
    }
  ]
});

stream.on('text', (text) => {
  process.stdout.write(text);
});
```

### curl

```bash
# Basic message
curl -X POST https://your-proxy.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-service-api-key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet",
    "max_tokens": 100,
    "messages": [
      {
        "role": "user",
        "content": "Hello, Claude!"
      }
    ]
  }'

# Streaming message
curl -X POST https://your-proxy.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-service-api-key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet",
    "max_tokens": 100,
    "stream": true,
    "messages": [
      {
        "role": "user",
        "content": "Tell me about AI"
      }
    ]
  }'
```

## Claude Code Integration

Use with Claude Code (Anthropic's VS Code extension):

### Environment Setup

```bash
# Set environment variables
export ANTHROPIC_BASE_URL=https://your-proxy.workers.dev
export ANTHROPIC_AUTH_TOKEN=your-service-api-key
export API_TIMEOUT_MS=600000
export ANTHROPIC_MODEL=claude-3-sonnet
export ANTHROPIC_SMALL_FAST_MODEL=claude-3-haiku
```

### Usage

```bash
# Navigate to your project
cd /path/to/your/project

# Start Claude Code
claude

# Now you can chat with Claude using your proxy
```

## Advanced Features

### Multi-turn Conversations

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 200,
  "messages": [
    {
      "role": "user",
      "content": "What is Python?"
    },
    {
      "role": "assistant", 
      "content": "Python is a high-level programming language..."
    },
    {
      "role": "user",
      "content": "Show me a simple example"
    }
  ]
}
```

### Complex Tool Usage

```python
# Tool with multiple parameters
tools = [
    {
        "name": "search_database",
        "description": "Search for information in the database",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "table": {"type": "string", "enum": ["users", "products", "orders"]},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100}
            },
            "required": ["query", "table"]
        }
    }
]
```

### Custom Stop Sequences

```json
{
  "model": "claude-3-sonnet",
  "max_tokens": 500,
  "stop_sequences": ["```", "---", "END"],
  "messages": [
    {
      "role": "user",
      "content": "Write code and stop at the first ```"
    }
  ]
}
```

## Error Handling

### Common Errors

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "max_tokens is required"
  }
}
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `invalid_request_error` | Invalid request parameters |
| `authentication_error` | Invalid API key |
| `permission_error` | Insufficient permissions |
| `not_found_error` | Model or resource not found |
| `rate_limit_error` | Rate limit exceeded |
| `api_error` | Internal API error |
| `overloaded_error` | Service temporarily overloaded |

### Error Handling Example

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://your-proxy.workers.dev",
    api_key="your-service-api-key"
)

try:
    message = client.messages.create(
        model="claude-3-sonnet",
        max_tokens=100,
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )
    print(message.content[0].text)
except anthropic.RateLimitError:
    print("Rate limit exceeded")
except anthropic.APIError as e:
    print(f"API error: {e}")
```

## Protocol Conversion

The proxy automatically handles conversion between Anthropic and OpenAI formats:

### Anthropic → OpenAI Conversion

| Anthropic Field | OpenAI Field | Notes |
|-----------------|--------------|-------|
| `max_tokens` | `max_tokens` | Direct mapping |
| `system` | `messages[0]` | Added as system message |
| `stop_sequences` | `stop` | Array converted to OpenAI format |
| `tools` | `functions` | Schema cleaned for compatibility |
| `tool_choice` | `function_call` | Type conversion applied |

### OpenAI → Anthropic Response

| OpenAI Field | Anthropic Field | Notes |
|--------------|-----------------|-------|
| `choices[0].message` | `content` | Converted to content blocks |
| `usage` | `usage` | Token counts mapped |
| `finish_reason` | `stop_reason` | Reason mapping applied |

## Compatibility Matrix

| Feature | Support Status | Notes |
|---------|----------------|-------|
| **Basic Messages** | ✅ Full | Complete message support |
| **System Messages** | ✅ Full | String and array formats |
| **Streaming** | ✅ Full | All event types supported |
| **Tool Use** | ✅ Full | Function calling with conversion |
| **Stop Sequences** | ✅ Full | Custom stop sequences |
| **Temperature** | ✅ Full | Range 0.0-2.0 |
| **Top P** | ✅ Full | Nucleus sampling |
| **Top K** | ❌ Ignored | Not supported by OpenAI providers |
| **Image Content** | ❌ Not Supported | Requires provider-specific implementation |

## Best Practices

### 1. Model Selection
Configure appropriate model mappings:

```javascript
const modelProviderConfig = {
  // Fast model for simple tasks
  'claude-3-haiku': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' }
    ]
  },
  
  // Balanced model for most tasks
  'claude-3-sonnet': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },
      { provider: 'deepseek', model: 'deepseek-chat' }
    ]
  },
  
  // Powerful model for complex tasks
  'claude-3-opus': {
    providers: [
      { provider: 'azure', model: 'gpt-4' }
    ]
  }
};
```

### 2. System Message Usage
Use system messages effectively:

```json
{
  "system": "You are Claude, an AI assistant created by Anthropic. You are helpful, harmless, and honest.",
  "messages": [...]
}
```

### 3. Tool Schema Design
Keep tool schemas simple and clean:

```json
{
  "name": "calculate",
  "description": "Perform mathematical calculations",
  "input_schema": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Mathematical expression to evaluate"
      }
    },
    "required": ["expression"]
  }
}
```

### 4. Error Recovery
Implement proper retry logic:

```python
import time
import anthropic

def send_message_with_retry(client, **kwargs):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise
```

## Next Steps

- **[Chat Completions API](../chat-completions)** - OpenAI-compatible API
- **[Provider Setup](/providers/)** - Configure AI providers  
- **[Claude Code Integration](/guide/integrations/claude-code)** - VS Code extension setup
- **[Tool Usage Guide](./tools)** - Advanced function calling
- **[Streaming Guide](./streaming)** - Real-time responses

## External Resources

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/)
- [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude Code Extension](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-dev)
