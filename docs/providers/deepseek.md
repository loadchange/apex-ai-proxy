# DeepSeek

DeepSeek is a high-performance AI company offering competitive language models with excellent reasoning capabilities and cost-effective pricing. It's one of the most popular choices for developers due to its generous free tier and simple setup.

## Overview

- **Provider Type**: High-performance language models
- **Free Tier**: ✅ Generous free tier available
- **Setup Complexity**: Low (simple API key setup)
- **Best For**: General purpose, cost-effective solutions
- **Documentation**: [DeepSeek API Documentation](https://platform.deepseek.com/api-docs/)

## Supported Models

| Model Name | Capabilities | Context Length | Use Cases |
|------------|-------------|----------------|-----------|
| **deepseek-chat** | General conversation, reasoning | 32K tokens | Chat, Q&A, general tasks |
| **deepseek-coder** | Code generation, debugging | 16K tokens | Programming, code review |
| **deepseek-math** | Mathematical reasoning | 32K tokens | Math problems, calculations |

## Key Features

### 🆓 Generous Free Tier
- Free API credits for new users
- No credit card required for signup
- Reasonable rate limits for development

### 🚀 High Performance
- Fast inference times
- Competitive quality with GPT-4
- Efficient token usage

### 💰 Cost-Effective
- Competitive pricing
- Transparent pricing model
- No hidden fees

### 🔧 Developer Friendly
- OpenAI-compatible API
- Simple authentication
- Good documentation

## Setup Guide

### Step 1: Create DeepSeek Account

1. **Visit DeepSeek Platform**
   ```
   https://platform.deepseek.com
   ```

2. **Sign Up**
   - Click "Sign Up"
   - Use email or third-party login
   - Verify your email address

3. **Complete Profile**
   - Add basic information
   - Accept terms of service

### Step 2: Get API Key

1. **Access API Keys**
   - Go to [API Keys page](https://platform.deepseek.com/api_keys)
   - Click "Create API Key"

2. **Create New Key**
   - Enter a descriptive name
   - Set permissions (usually "All" for general use)
   - Click "Create"

3. **Copy and Secure Key**
   - Copy the API key immediately
   - Store it securely (you won't see it again)
   - Keep it confidential

### Step 3: Test Connection

```bash
# Test your API key
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-deepseek-api-key" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ]
  }'
```

## Configuration

### Basic Configuration

```javascript
// wrangler-config.js
const providerConfig = {
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: ['your-deepseek-api-key'],
  },
};

const modelProviderConfig = {
  'deepseek-chat': {
    providers: [
      {
        provider: 'deepseek',
        model: 'deepseek-chat',
      },
    ],
  },
};
```

### Multiple API Keys for Higher Limits

```javascript
const providerConfig = {
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: [
      'your-deepseek-key-1',
      'your-deepseek-key-2',
      'your-deepseek-key-3',
    ],
  },
};
```

### Model Aliases

```javascript
const modelProviderConfig = {
  // Standard model names
  'deepseek-chat': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
  },
  
  // Custom aliases
  'gpt-4-alternative': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
  },
  
  'coding-assistant': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-coder' },
    ],
  },
  
  'math-solver': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-math' },
    ],
  },
};
```

## Rate Limits and Pricing

### Free Tier Limits
- **Requests**: Varies by model
- **Tokens**: Limited monthly allocation
- **Rate**: Requests per minute limits

### Paid Tier Benefits
- Higher rate limits
- More monthly tokens
- Priority processing
- Better SLA

### Cost Comparison
| Model | Input Price | Output Price | Context |
|-------|-------------|--------------|---------|
| deepseek-chat | $0.14/1M tokens | $0.28/1M tokens | 32K |
| deepseek-coder | $0.14/1M tokens | $0.28/1M tokens | 16K |
| deepseek-math | $0.14/1M tokens | $0.28/1M tokens | 32K |

*Prices subject to change - check [DeepSeek Pricing](https://platform.deepseek.com/pricing) for current rates*

## Model Comparison

### DeepSeek-Chat
**Best for**: General conversation, reasoning, creative writing

```javascript
// Example usage
const response = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain quantum computing in simple terms." }
  ],
  temperature: 0.7,
  max_tokens: 1000
});
```

**Strengths**:
- Excellent reasoning capabilities
- Good at following instructions
- Competitive with GPT-4 on many tasks
- Supports long conversations

### DeepSeek-Coder
**Best for**: Code generation, debugging, code review

```javascript
// Example usage
const response = await client.chat.completions.create({
  model: "deepseek-coder",
  messages: [
    { role: "user", content: "Write a Python function to calculate fibonacci numbers." }
  ],
  temperature: 0.1,  // Lower temperature for more deterministic code
  max_tokens: 500
});
```

**Strengths**:
- Excellent code generation
- Supports multiple programming languages
- Good at explaining code
- Debugging and optimization suggestions

### DeepSeek-Math
**Best for**: Mathematical problems, calculations, proofs

```javascript
// Example usage
const response = await client.chat.completions.create({
  model: "deepseek-math",
  messages: [
    { role: "user", content: "Solve this equation: 2x^2 + 5x - 3 = 0" }
  ],
  temperature: 0.1,
  max_tokens: 800
});
```

**Strengths**:
- Strong mathematical reasoning
- Step-by-step problem solving
- Supports complex calculations
- Good at explaining mathematical concepts

## Optimization Tips

### Performance Optimization

1. **Choose the Right Model**
   ```javascript
   // Use specific models for specific tasks
   'general-chat': { providers: [{ provider: 'deepseek', model: 'deepseek-chat' }] },
   'code-help': { providers: [{ provider: 'deepseek', model: 'deepseek-coder' }] },
   'math-help': { providers: [{ provider: 'deepseek', model: 'deepseek-math' }] },
   ```

2. **Optimize Parameters**
   ```javascript
   // For deterministic outputs (code, math)
   temperature: 0.1
   
   // For creative outputs
   temperature: 0.7-0.9
   
   // For faster responses
   max_tokens: 500  // Limit response length
   ```

### Cost Optimization

1. **Efficient Prompting**
   ```javascript
   // Be specific and concise
   const messages = [
     { role: "user", content: "Summarize this in 3 bullet points: [text]" }
   ];
   ```

2. **System Messages**
   ```javascript
   // Use system messages to set context once
   const messages = [
     { role: "system", content: "You are a code reviewer. Be concise." },
     { role: "user", content: "Review this function: [code]" }
   ];
   ```

## Integration Examples

### Python Example

```python
import openai

# Configure client to use your proxy
client = openai.OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-service-api-key"
)

# Use DeepSeek models
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "user", "content": "Write a Python class for a simple calculator"}
    ],
    temperature=0.1,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### JavaScript Example

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-proxy.workers.dev/v1',
  apiKey: 'your-service-api-key',
});

// Streaming response
const stream = await openai.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Explain machine learning' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### curl Example

```bash
# Basic request
curl -X POST https://your-proxy.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "deepseek-coder",
    "messages": [
      {
        "role": "user",
        "content": "Write a function to reverse a string in JavaScript"
      }
    ],
    "temperature": 0.1,
    "max_tokens": 300
  }'
```

## Best Practices

### Model Selection
- **General tasks**: Use `deepseek-chat`
- **Programming**: Use `deepseek-coder`
- **Mathematics**: Use `deepseek-math`
- **Mixed tasks**: Configure multiple model aliases

### Parameter Tuning
- **Creative writing**: temperature 0.7-0.9
- **Code generation**: temperature 0.1-0.3
- **Factual responses**: temperature 0.1-0.5

### Rate Limit Management
```javascript
// Use multiple keys to increase limits
const providerConfig = {
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: [
      'key-1-for-general-use',
      'key-2-for-burst-traffic',
      'key-3-for-backup',
    ],
  },
};
```

## Troubleshooting

### Common Issues

**❌ "Invalid API key" error**
```
Solution: Check your API key in DeepSeek platform
1. Go to https://platform.deepseek.com/api_keys
2. Verify the key exists and is active
3. Check for typos in your configuration
```

**❌ "Rate limit exceeded" error**
```
Solution: Add multiple API keys or wait for reset
1. Create additional API keys in DeepSeek platform
2. Add them to your configuration
3. Consider upgrading to paid tier
```

**❌ "Model not found" error**
```
Solution: Check model name spelling
Correct names: "deepseek-chat", "deepseek-coder", "deepseek-math"
```

**❌ Slow responses**
```
Solution: Optimize your requests
1. Reduce max_tokens for faster responses
2. Use more specific prompts
3. Consider using multiple providers for load balancing
```

## Monitoring Usage

### Track Your Usage
1. Visit [DeepSeek Usage Dashboard](https://platform.deepseek.com/usage)
2. Monitor token consumption
3. Set up usage alerts
4. Review billing information

### Usage Optimization
```javascript
// Log requests for analysis
const providerConfig = {
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: ['your-key'],
    headers: {
      'X-Request-ID': 'unique-request-id', // For tracking
    },
  },
};
```

## Comparison with Other Providers

| Feature | DeepSeek | Azure OpenAI | OpenAI |
|---------|----------|--------------|--------|
| Free Tier | ✅ Yes | ❌ No | ✅ Limited |
| Setup Complexity | 🟢 Low | 🔴 High | 🟡 Medium |
| Performance | 🟢 High | 🟢 High | 🟢 High |
| Cost | 🟢 Low | 🟡 Medium | 🔴 High |
| Reliability | 🟡 Good | 🟢 Excellent | 🟢 Excellent |

## Next Steps

- **[Multi-Provider Setup](/guide/multiple-keys)** - Combine DeepSeek with other providers
- **[Load Balancing](/guide/load-balancing)** - Optimize performance across providers
- **[Azure OpenAI](./azure)** - Add enterprise-grade backup
- **[Configuration Guide](/guide/configuration)** - Advanced configuration options

## External Resources

- [DeepSeek Platform](https://platform.deepseek.com)
- [DeepSeek API Documentation](https://platform.deepseek.com/api-docs/)
- [DeepSeek Pricing](https://platform.deepseek.com/pricing)
- [DeepSeek Model Cards](https://platform.deepseek.com/models)
