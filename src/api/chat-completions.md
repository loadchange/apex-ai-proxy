# Chat Completions API

The Chat Completions API is the primary interface for text generation and conversational AI. It's fully compatible with OpenAI's API format, allowing you to use existing OpenAI client libraries without any modifications.

## Endpoint

```
POST /v1/chat/completions
```

## Authentication

All requests require authentication using the `Authorization` header:

```http
Authorization: Bearer your-service-api-key
```

## Request Format

### Basic Request

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Hello, world!"
    }
  ]
}
```

### Complete Request Example

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Explain quantum computing in simple terms."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "stop": null,
  "stream": false
}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | ✅ | The model to use for completion |
| `messages` | array | ✅ | Array of message objects |
| `temperature` | number | ❌ | Sampling temperature (0-2) |
| `max_tokens` | number | ❌ | Maximum tokens to generate |
| `top_p` | number | ❌ | Nucleus sampling parameter |
| `frequency_penalty` | number | ❌ | Frequency penalty (-2 to 2) |
| `presence_penalty` | number | ❌ | Presence penalty (-2 to 2) |
| `stop` | string/array | ❌ | Stop sequences |
| `stream` | boolean | ❌ | Enable streaming responses |
| `n` | number | ❌ | Number of completions to generate |
| `user` | string | ❌ | User identifier for tracking |

### Model Parameter

The `model` parameter specifies which model to use. Available models depend on your configured providers:

```javascript
// Examples of model names you can use
"gpt-4o-mini"       // Configured in your proxy
"deepseek-chat"     // DeepSeek's chat model
"claude-3-sonnet"   // Custom alias for Anthropic model
"fast-chat"         // Your custom model alias
```

### Messages Array

The `messages` array contains the conversation history:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user", 
      "content": "Write a Python function to calculate factorial."
    },
    {
      "role": "assistant",
      "content": "Here's a Python function to calculate factorial:\n\n```python\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)\n```"
    },
    {
      "role": "user",
      "content": "Can you make it iterative instead?"
    }
  ]
}
```

#### Message Roles

| Role | Description | Example Use |
|------|-------------|-------------|
| `system` | Sets the behavior and context | "You are a helpful assistant specialized in Python programming." |
| `user` | Human messages/questions | "How do I reverse a string in Python?" |
| `assistant` | AI responses | "You can reverse a string using slicing: `text[::-1]`" |

### Temperature

Controls randomness in the output:

```json
{
  "temperature": 0.1,  // More deterministic, good for code/facts
  "temperature": 0.7,  // Balanced creativity and coherence
  "temperature": 1.5   // More creative and varied
}
```

### Max Tokens

Limits the response length:

```json
{
  "max_tokens": 50,    // Short responses
  "max_tokens": 500,   // Medium responses  
  "max_tokens": 2000   // Long responses
}
```

## Response Format

### Successful Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 7,
    "total_tokens": 20
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the completion |
| `object` | string | Object type, always "chat.completion" |
| `created` | integer | Unix timestamp of creation |
| `model` | string | Model used for the completion |
| `usage` | object | Token usage statistics |
| `choices` | array | Array of completion choices |

### Choice Object

| Field | Type | Description |
|-------|------|-------------|
| `message` | object | The generated message |
| `finish_reason` | string | Reason completion finished |
| `index` | integer | Choice index (for multiple completions) |

### Finish Reasons

| Reason | Description |
|--------|-------------|
| `stop` | Completion finished naturally |
| `length` | Reached max_tokens limit |
| `content_filter` | Content was filtered |
| `function_call` | Model called a function (if supported) |

## Streaming Responses

Enable real-time response streaming by setting `stream: true`:

### Request

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story about a robot."
    }
  ],
  "stream": true
}
```

### Response Format

Streaming responses use Server-Sent Events (SSE):

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1677858242,"model":"gpt-4o-mini","choices":[{"delta":{"role":"assistant","content":""},"index":0,"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1677858242,"model":"gpt-4o-mini","choices":[{"delta":{"content":"Once"},"index":0,"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1677858242,"model":"gpt-4o-mini","choices":[{"delta":{"content":" upon"},"index":0,"finish_reason":null}]}

data: [DONE]
```

## Code Examples

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-service-api-key"
)

# Basic completion
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
    ],
    temperature=0.7,
    max_tokens=100
)

print(response.choices[0].message.content)

# Streaming completion
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Tell me a joke"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### JavaScript/Node.js

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-proxy.workers.dev/v1',
  apiKey: 'your-service-api-key',
});

// Basic completion
const completion = await openai.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain recursion in programming.' }
  ],
  model: 'gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 200
});

console.log(completion.choices[0].message.content);

// Streaming completion
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Write a haiku about coding' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### curl

```bash
# Basic completion
curl -X POST https://your-proxy.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user", 
        "content": "Write a Python function to find prime numbers."
      }
    ],
    "temperature": 0.1,
    "max_tokens": 500
  }'

# Streaming completion
curl -X POST https://your-proxy.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Explain machine learning"}
    ],
    "stream": true
  }'
```

### Fetch API (Browser)

```javascript
async function chatCompletion() {
  const response = await fetch('https://your-proxy.workers.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-service-api-key'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Hello, how are you?' }
      ],
      temperature: 0.7,
      max_tokens: 100
    })
  });

  const data = await response.json();
  console.log(data.choices[0].message.content);
}

// Streaming example
async function streamingChat() {
  const response = await fetch('https://your-proxy.workers.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-service-api-key'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Count from 1 to 10' }],
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            console.log(content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
```

## Error Handling

### Common Error Responses

```json
{
  "error": {
    "message": "The model 'invalid-model' does not exist",
    "type": "invalid_request_error",
    "param": "model",
    "code": "model_not_found"
  }
}
```

### Error Types

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | `invalid_request_error` | Invalid request parameters |
| 401 | `authentication_error` | Invalid API key |
| 404 | `not_found_error` | Model or endpoint not found |
| 429 | `rate_limit_exceeded` | Rate limit exceeded |
| 500 | `internal_server_error` | Server error |
| 502 | `bad_gateway` | Provider error |
| 503 | `service_unavailable` | All providers unavailable |

### Error Handling Examples

```python
from openai import OpenAI, OpenAIError

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-service-api-key"
)

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except OpenAIError as e:
    print(f"Error: {e}")
```

```javascript
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  console.log(completion.choices[0].message.content);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Best Practices

### 1. Model Selection
Choose the right model for your use case:

```javascript
// For general conversation
{ "model": "gpt-4o-mini" }

// For coding tasks
{ "model": "deepseek-coder" }

// For mathematical reasoning
{ "model": "deepseek-math" }
```

### 2. System Messages
Use system messages to set context:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a professional code reviewer. Provide constructive feedback focusing on best practices, security, and performance."
    },
    {
      "role": "user",
      "content": "Review this function: [code]"
    }
  ]
}
```

### 3. Temperature Settings
Adjust temperature based on your needs:

```json
// For factual, deterministic responses
{ "temperature": 0.1 }

// For balanced responses
{ "temperature": 0.7 }

// For creative content
{ "temperature": 1.2 }
```

### 4. Token Management
Optimize token usage:

```json
{
  "max_tokens": 200,  // Limit response length
  "messages": [
    // Keep conversation history concise
    { "role": "user", "content": "Summarize this in 3 sentences: [text]" }
  ]
}
```

### 5. Error Recovery
Implement proper error handling:

```python
import time
from openai import OpenAI, RateLimitError

def chat_with_retry(client, **kwargs):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(**kwargs)
        except RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

## Advanced Usage

### Multiple Completions
Generate multiple responses:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Write a creative story opening."}
  ],
  "n": 3,
  "temperature": 0.9
}
```

### Custom Stop Sequences
Control where generation stops:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "List programming languages:"}
  ],
  "stop": ["\n\n", "10."]
}
```

### Conversation Context
Maintain conversation state:

```javascript
class ChatSession {
  constructor() {
    this.messages = [
      { role: "system", content: "You are a helpful assistant." }
    ];
  }

  async sendMessage(content) {
    this.messages.push({ role: "user", content });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.messages
    });

    const assistantMessage = response.choices[0].message;
    this.messages.push(assistantMessage);
    
    return assistantMessage.content;
  }
}
```

## Performance Optimization

### 1. Use Streaming for Long Responses
```javascript
// Better user experience for long content
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Write a detailed essay' }],
  stream: true
});
```

### 2. Parallel Requests for Multiple Tasks
```javascript
// Process multiple requests concurrently
const promises = questions.map(question => 
  openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: question }]
  })
);

const responses = await Promise.all(promises);
```

### 3. Model-Specific Optimization
```javascript
// Use appropriate models for different tasks
const tasks = [
  { content: 'Write code', model: 'deepseek-coder' },
  { content: 'Solve math', model: 'deepseek-math' },
  { content: 'General chat', model: 'gpt-4o-mini' }
];
```

## Next Steps

- **[Anthropic Messages API](./anthropic/messages)** - Claude-compatible API
- **[Embeddings API](./embeddings)** - Vector embeddings for similarity
- **[Models API](./models)** - List available models
- **[Provider Setup](/providers/)** - Configure AI providers
- **[Integration Guides](/guide/integrations/openai)** - SDK integration examples

## External Resources

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
