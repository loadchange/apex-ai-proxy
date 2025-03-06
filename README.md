# 🚀 Apex AI Proxy: Your Free Personal AI Gateway

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-CF%20Workers-%23F38020?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[中文文档](README.zh-CN.md)

Apex AI Proxy is a free, personal AI Gateway that runs on Cloudflare Workers. It aggregates multiple AI service providers behind a unified OpenAI-compatible API, allowing you to overcome rate limits and take advantage of free quotas from different providers.

**Why you'll care**:
- 🆓 **Completely Free**: Runs entirely on Cloudflare Workers' free plan
- 🔄 **Load Balancing**: Distributes requests across multiple providers to overcome rate limits
- 💰 **Maximize Free Quotas**: Take advantage of free tiers from different AI providers
- 🔑 **Multiple API Keys**: Register multiple keys for the same service provider
- 🤖 **OpenAI Client Compatible**: Works with any library that speaks OpenAI's API format

## Features ✨

- 🌐 **Multi-Provider Support**: Aggregate Azure, DeepSeek, Aliyun, and more behind one API
- 🔀 **Smart Request Distribution**: Automatically routes requests to available providers
- 🔑 **Multiple API Key Management**: Register multiple keys for the same provider to further increase limits
- 🔄 **Protocol Translation**: Handles different provider authentication methods and API formats
- 🛡️ **Robust Error Handling**: Gracefully handles provider errors and failover

## Get Started in 60 Seconds ⏱️

1. **Clone the repository**:
```bash
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure your providers** (in `wrangler-config.js`):
```javascript
const modelProviderConfig = {
  'gpt-4o-mini': {
    providers: [
      {
        provider: 'azure',
        base_url: 'https://your-azure-endpoint.com/openai/deployments/gpt-4o-mini',
        api_key: 'your-azure-key',
        model: 'gpt-4o-mini',
      },
      // Add more providers for the same model
    ],
  },
  'DeepSeek-R1': {
    providers: [
      {
        provider: 'aliyuncs',
        base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        api_key: 'your-aliyun-key',
        model: 'deepseek-r1',
      },
      // Multiple keys for the same provider
      {
        provider: 'deepinfra',
        base_url: 'https://api.deepinfra.com/v1/openai',
        api_key: 'your-deepinfra-key',
        model: 'deepseek-ai/DeepSeek-R1',
      },
    ],
  },
};
```

4. **Deploy to Cloudflare Workers**:
```bash
pnpm run deploy
```

## Why This Solves Your Problems

- **Rate Limit Issues**: By distributing requests across multiple providers, you can overcome rate limits imposed by individual services
- **Cost Optimization**: Take advantage of free tiers from different providers
- **API Consistency**: Use a single, consistent API format (OpenAI-compatible) regardless of the underlying provider
- **Simplified Integration**: No need to modify your existing code that uses OpenAI clients

## Usage Example

```python
# Works with ANY OpenAI client!
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-configured-api-key"
)

# Use any model you've configured in your proxy
response = client.chat.completions.create(
    model="DeepSeek-R1",  # This will be routed to one of your configured providers
    messages=[{"role": "user", "content": "Why is this proxy awesome?"}]
)
```

## Multiple API Keys Configuration

You can configure multiple API keys for the same provider to further increase your rate limits:

```javascript
{
  provider: 'aliyuncs',
  base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  api_keys: [
    'your-first-aliyun-key',
    'your-second-aliyun-key',
    'your-third-aliyun-key'
  ],
  model: 'deepseek-r1',
}
```

## Contributing

Found a bug or want to add support for more providers? PRs are welcome!

## Ready to Break Free from Rate Limits? 🚀

[![Deploy Button](https://img.shields.io/badge/Deploy%20Now-%E2%86%92-%23FF6A00?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
