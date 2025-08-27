# Quick Start

Get your Apex AI Proxy up and running in under 60 seconds! This guide will walk you through the fastest way to deploy your personal AI gateway.

## Prerequisites

- Node.js 18+ and pnpm
- A Cloudflare account (free tier is sufficient)
- API keys from at least one AI provider

## 60-Second Deployment

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy

# Install dependencies
pnpm install
```

### Step 2: Configure Your Providers

Create your configuration by copying the example:

```bash
cp wrangler-config.js.example wrangler-config.js
```

Edit `wrangler-config.js` with your provider settings:

```javascript
// Example configuration
const providerConfig = {
  // Azure OpenAI
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
    api_keys: ['your-azure-api-key'],
  },
  
  // DeepSeek
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: ['your-deepseek-api-key'],
  },
  
  // Aliyun DashScope
  aliyuncs: {
    base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    api_keys: ['your-aliyun-api-key'],
  },
};

// Map models to providers
const modelProviderConfig = {
  'gpt-4o-mini': {
    providers: [
      {
        provider: 'azure',
        model: 'gpt-4o-mini',
      },
      {
        provider: 'deepseek',
        model: 'deepseek-chat',
      },
    ],
  },
  'deepseek-r1': {
    providers: [
      {
        provider: 'aliyuncs',
        model: 'deepseek-r1',
      },
    ],
  },
};

module.exports = {
  providerConfig,
  modelProviderConfig,
  // Your service API key (clients will use this to authenticate)
  SERVICE_API_KEY: 'your-service-api-key',
};
```

### Step 3: Deploy to Cloudflare Workers

```bash
# Deploy to Cloudflare Workers
pnpm run deploy
```

That's it! Your proxy is now live and ready to handle requests.

## Test Your Deployment

### Using curl

```bash
curl -X POST https://your-proxy.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-api-key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ]
  }'
```

### Using Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-service-api-key"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Hello, world!"}
    ]
)

print(response.choices[0].message.content)
```

### Using JavaScript/Node.js

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-proxy.workers.dev/v1',
  apiKey: 'your-service-api-key',
});

const completion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello, world!' }],
  model: 'gpt-4o-mini',
});

console.log(completion.choices[0].message.content);
```

## Common Configuration Patterns

### Multiple API Keys for Load Balancing

```javascript
const providerConfig = {
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: [
      'your-first-deepseek-key',
      'your-second-deepseek-key',
      'your-third-deepseek-key'
    ],
  },
};
```

### Model Aliases

```javascript
const modelProviderConfig = {
  // Use a simple name for a complex model
  'fast-chat': {
    providers: [
      {
        provider: 'deepseek',
        model: 'deepseek-chat',
      },
    ],
  },
  
  // Fallback configuration
  'gpt-4': {
    providers: [
      {
        provider: 'azure',
        model: 'gpt-4',
      },
      {
        provider: 'openai-compatible-fallback',
        model: 'gpt-4',
      },
    ],
  },
};
```

### Custom Provider Configuration

```javascript
const providerConfig = {
  'my-custom-provider': {
    base_url: 'https://api.my-provider.com/v1',
    api_keys: ['my-api-key'],
    // Optional: Custom headers
    headers: {
      'X-Custom-Header': 'value',
    },
  },
};
```

## Next Steps

### 🔧 Advanced Configuration
Learn about advanced features like custom error handling, monitoring, and optimization.

[→ Read the Configuration Guide](/guide/configuration)

### 🤖 Anthropic Integration
Set up compatibility with Claude Code and other Anthropic tools.

[→ Anthropic Integration Guide](/guide/integrations/anthropic)

### 📊 API Reference
Explore all available endpoints and parameters.

[→ API Documentation](/api/)

### 🔑 Provider Setup
Get detailed setup instructions for each supported provider.

[→ Provider Documentation](/providers/)

## Troubleshooting

### Common Issues

**❌ "Invalid API key" error**
- Verify your API keys are correct and active
- Check that you're using the right `SERVICE_API_KEY` in your requests

**❌ "Model not found" error**
- Ensure the model is configured in `modelProviderConfig`
- Verify the provider supports the requested model

**❌ "Rate limit exceeded" error**
- Add more API keys for the same provider
- Configure additional providers as fallbacks

**❌ Deployment fails**
- Make sure you're logged into Cloudflare Workers with `wrangler login`
- Check that your `wrangler.toml` configuration is correct

### Getting Help

- 📖 [Read the full documentation](/guide/)
- 💬 [Join GitHub Discussions](https://github.com/loadchange/apex-ai-proxy/discussions)
- 🐛 [Report issues on GitHub](https://github.com/loadchange/apex-ai-proxy/issues)

---

## What's Next?

Now that your proxy is running, you can:

1. **Add more providers** to increase reliability and reduce costs
2. **Configure multiple API keys** for the same provider to scale beyond rate limits
3. **Set up monitoring** to track usage and performance
4. **Integrate with your applications** using the OpenAI-compatible API

Ready to dive deeper? Check out our [comprehensive guide](/guide/) for advanced usage patterns and best practices.
