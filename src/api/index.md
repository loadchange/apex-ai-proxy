# API Reference

Apex AI Proxy provides a comprehensive API that's fully compatible with OpenAI's format, plus additional features for Anthropic's Messages API and the next-generation `/v1/responses` API.

## Base URL

All API requests should be made to your deployed Cloudflare Worker:

```
https://your-proxy.workers.dev
```

## Authentication

All requests require authentication using the `Authorization` header with your service API key:

```http
Authorization: Bearer your-service-api-key
```

## Supported APIs

### OpenAI-Compatible APIs

| Endpoint | Description | Status |
|----------|-------------|---------|
| [`/v1/chat/completions`](./chat-completions) | Text generation and chat | ✅ Full Support |
| [`/v1/embeddings`](./embeddings) | Text embeddings | ✅ Full Support |
| [`/v1/models`](./models) | List available models | ✅ Full Support |

### Anthropic-Compatible APIs

| Endpoint | Description | Status |
|----------|-------------|---------|
| [`/v1/messages`](./anthropic/messages) | Anthropic Messages API | ✅ Full Support |

### Next-Generation APIs

| Endpoint | Description | Status |
|----------|-------------|---------|
| [`/v1/responses`](./responses) | OpenAI Responses API | ✅ Full Support |
| [`/v1/responses/{id}`](./responses) | Get response by ID | ✅ Full Support |
| [`/v1/responses/{id}/input_items`](./responses) | Response input items | ✅ Full Support |

## Quick Examples

### Chat Completions (OpenAI Format)

```bash
curl -X POST https://your-proxy.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'
```

### Anthropic Messages API

```bash
curl -X POST https://your-proxy.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet",
    "max_tokens": 150,
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ]
  }'
```

### Embeddings

```bash
curl -X POST https://your-proxy.workers.dev/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "Your text to embed"
  }'
```

## SDK Examples

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-service-api-key"
)

# Chat completion
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Hello, world!"}
    ]
)

print(response.choices[0].message.content)

# Embeddings
embedding_response = client.embeddings.create(
    model="text-embedding-ada-002",
    input="Text to embed"
)

print(embedding_response.data[0].embedding)
```

### Python (Anthropic SDK)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://your-proxy.workers.dev",
    api_key="your-service-api-key"
)

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

print(message.content)
```

### JavaScript/Node.js

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-proxy.workers.dev/v1',
  apiKey: 'your-service-api-key',
});

// Chat completion
const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'gpt-4o-mini',
});

console.log(completion.choices[0].message.content);

// Streaming
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Streaming Support

All endpoints support streaming responses using Server-Sent Events (SSE):

### OpenAI Streaming

```javascript
const response = await fetch('https://your-proxy.workers.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-service-api-key',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Tell me a joke' }],
    stream: true,
  }),
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
        console.log(parsed.choices[0]?.delta?.content || '');
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}
```

## Error Handling

The API returns standard HTTP status codes and structured error responses:

### Success Responses
- `200 OK` - Request successful
- `201 Created` - Resource created (for responses API)

### Error Responses
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Invalid or missing API key
- `404 Not Found` - Endpoint or resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - Provider error
- `503 Service Unavailable` - All providers unavailable

### Error Response Format

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

## Rate Limiting

Rate limits depend on your configured providers. The proxy automatically:

- Distributes requests across multiple providers
- Implements exponential backoff on rate limit errors
- Fails over to alternative providers when limits are hit

## Model Mapping

The proxy maps model names to configured providers. You can use:

- **Standard model names**: `gpt-4o-mini`, `claude-3-sonnet`, etc.
- **Custom aliases**: Configure your own model names in `modelProviderConfig`

Example model configuration:

```javascript
const modelProviderConfig = {
  // Standard mapping
  'gpt-4o-mini': {
    providers: [
      { provider: 'azure', model: 'gpt-4o-mini' },
      { provider: 'openai', model: 'gpt-4o-mini' },
    ],
  },
  
  // Custom alias
  'fast-chat': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
  },
  
  // Multi-provider fallback
  'reliable-gpt4': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'anthropic', model: 'claude-3-opus' },
    ],
  },
};
```

## Provider-Specific Features

### Azure OpenAI
- Full OpenAI API compatibility
- Enterprise security and compliance
- Custom deployment names supported

### DeepSeek
- High-performance language models
- Competitive pricing
- Fast inference times

### Anthropic (via proxy)
- Tool use support
- System message handling
- Streaming responses with proper event formatting

### Aliyun DashScope
- Multi-modal capabilities
- Regional optimization
- Comprehensive model selection

## Best Practices

### 🎯 Model Selection
- Use appropriate models for your use case
- Configure fallbacks for critical applications
- Test different providers for optimal performance

### 🔐 Security
- Never expose your service API key in client-side code
- Use environment variables for API keys
- Implement proper authentication in your applications

### 📊 Monitoring
- Log requests for debugging and analytics
- Monitor provider response times
- Track usage across different models

### 💰 Cost Optimization
- Use cheaper models for development and testing
- Implement caching for repeated requests
- Monitor usage to avoid unexpected charges

## Next Steps

- **[Chat Completions API](./chat-completions)** - Detailed text generation documentation
- **[Anthropic Messages API](./anthropic/messages)** - Claude integration guide
- **[Embeddings API](./embeddings)** - Vector embeddings reference
- **[Responses API](./responses)** - Next-generation response handling

Need help? Check out our [troubleshooting guide](/guide/error-handling) or [join the community discussions](https://github.com/loadchange/apex-ai-proxy/discussions).
