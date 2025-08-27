# Supported Providers

Apex AI Proxy supports multiple AI service providers, allowing you to aggregate their APIs behind a single unified interface. This page provides an overview of all supported providers and their capabilities.

## Provider Overview

| Provider | Models | Free Tier | Rate Limits | Special Features |
|----------|---------|-----------|-------------|-----------------|
| **[Azure OpenAI](./azure)** | GPT-4, GPT-3.5, Embeddings | ❌ | High | Enterprise security, Custom deployments |
| **[DeepSeek](./deepseek)** | DeepSeek-Chat, DeepSeek-Coder | ✅ | Medium | High performance, Competitive pricing |
| **[Aliyun DashScope](./aliyun)** | Qwen, DeepSeek, GLM | ✅ | Medium | Multi-modal, Regional optimization |
| **[DeepInfra](./deepinfra)** | Open source models | ✅ | Medium | Wide model selection, Fast inference |

## Quick Setup Comparison

### Configuration Complexity
- **Easiest**: DeepInfra, DeepSeek
- **Moderate**: Aliyun DashScope
- **Advanced**: Azure OpenAI (requires Azure setup)

### Best For Beginners
1. **DeepSeek** - Simple API, good free tier
2. **DeepInfra** - Many model options, straightforward setup
3. **Aliyun DashScope** - Good documentation, reliable service

### Best For Production
1. **Azure OpenAI** - Enterprise features, high reliability
2. **DeepSeek** - Good performance and cost balance
3. **Multi-provider setup** - Maximum reliability through failover

## Provider Selection Guide

### 🆓 Maximize Free Usage
If you want to take full advantage of free tiers:

```javascript
const modelProviderConfig = {
  'general-chat': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },      // Free tier
      { provider: 'deepinfra', model: 'meta-llama/Llama-2-7b-chat-hf' }, // Free tier
      { provider: 'aliyuncs', model: 'qwen-plus' },          // Free tier
    ],
  },
};
```

### 🏢 Enterprise Setup
For production environments with reliability requirements:

```javascript
const modelProviderConfig = {
  'production-gpt4': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },                 // Primary
      { provider: 'azure-backup', model: 'gpt-4' },          // Backup Azure
      { provider: 'deepseek', model: 'deepseek-chat' },      // Fallback
    ],
  },
};
```

### 🚀 High Performance
For applications requiring fast response times:

```javascript
const modelProviderConfig = {
  'fast-chat': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },      // Fast inference
      { provider: 'deepinfra', model: 'microsoft/DialoGPT-medium' }, // Fast model
    ],
  },
};
```

## Detailed Provider Information

### Azure OpenAI
- **Best for**: Enterprise applications, compliance requirements
- **Strengths**: High reliability, security features, dedicated resources
- **Setup complexity**: High (requires Azure account and resource setup)
- **Cost**: Pay-per-use, no free tier
- **[Detailed setup guide →](./azure)**

### DeepSeek
- **Best for**: General purpose, cost-effective solutions
- **Strengths**: Good performance, reasonable pricing, simple API
- **Setup complexity**: Low (just need API key)
- **Cost**: Free tier available, competitive paid rates
- **[Detailed setup guide →](./deepseek)**

### Aliyun DashScope
- **Best for**: Users in Asia-Pacific, multi-modal applications
- **Strengths**: Good regional performance, variety of models
- **Setup complexity**: Medium (requires Aliyun account)
- **Cost**: Free tier available, regional pricing
- **[Detailed setup guide →](./aliyun)**

### DeepInfra
- **Best for**: Experimenting with open-source models
- **Strengths**: Wide model selection, good free tier
- **Setup complexity**: Low (simple API key setup)
- **Cost**: Generous free tier, pay-per-use
- **[Detailed setup guide →](./deepinfra)**

## Multi-Provider Configuration Example

Here's a comprehensive example showing how to configure multiple providers:

```javascript
// wrangler-config.js
const providerConfig = {
  // Azure OpenAI
  azure: {
    base_url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
    api_keys: ['your-azure-api-key'],
  },
  
  // DeepSeek
  deepseek: {
    base_url: 'https://api.deepseek.com/v1',
    api_keys: [
      'your-deepseek-key-1',
      'your-deepseek-key-2',  // Multiple keys for higher limits
    ],
  },
  
  // Aliyun DashScope
  aliyuncs: {
    base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    api_keys: ['your-aliyun-api-key'],
  },
  
  // DeepInfra
  deepinfra: {
    base_url: 'https://api.deepinfra.com/v1/openai',
    api_keys: ['your-deepinfra-api-key'],
  },
};

const modelProviderConfig = {
  // High-reliability GPT-4 equivalent
  'gpt-4': {
    providers: [
      { provider: 'azure', model: 'gpt-4' },
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
  },
  
  // Cost-optimized chat model
  'chat-model': {
    providers: [
      { provider: 'deepseek', model: 'deepseek-chat' },
      { provider: 'deepinfra', model: 'meta-llama/Llama-2-13b-chat-hf' },
      { provider: 'aliyuncs', model: 'qwen-plus' },
    ],
  },
  
  // Embeddings
  'text-embedding-ada-002': {
    providers: [
      { provider: 'azure', model: 'text-embedding-ada-002' },
      { provider: 'deepinfra', model: 'sentence-transformers/all-MiniLM-L6-v2' },
    ],
  },
};

module.exports = {
  providerConfig,
  modelProviderConfig,
  SERVICE_API_KEY: 'your-service-api-key',
};
```

## Load Balancing Strategies

### Round Robin (Default)
Requests are distributed evenly across all configured providers:

```javascript
'balanced-model': {
  providers: [
    { provider: 'deepseek', model: 'deepseek-chat' },
    { provider: 'deepinfra', model: 'meta-llama/Llama-2-7b-chat-hf' },
    { provider: 'aliyuncs', model: 'qwen-plus' },
  ],
}
```

### Priority-based Failover
Try providers in order, only use fallbacks when primary fails:

```javascript
'reliable-model': {
  providers: [
    { provider: 'azure', model: 'gpt-4' },           // Primary
    { provider: 'deepseek', model: 'deepseek-chat' }, // Fallback 1
    { provider: 'deepinfra', model: 'meta-llama/Llama-2-13b-chat-hf' }, // Fallback 2
  ],
}
```

## Monitoring and Optimization

### Provider Performance Tracking
Monitor your providers to optimize configuration:

1. **Response Time**: Track which providers are fastest for your use case
2. **Error Rates**: Identify providers with reliability issues
3. **Cost Analysis**: Compare actual costs across providers
4. **Rate Limit Usage**: Monitor how close you are to limits

### Optimization Tips

1. **Use Multiple API Keys**: Add multiple keys for the same provider to increase rate limits
2. **Regional Selection**: Choose providers with good performance in your region
3. **Model Matching**: Use similar capability models across providers for consistent failover
4. **Cost Monitoring**: Set up alerts for unexpected usage spikes

## Getting Started

### Quick Start (Recommended)
1. Start with **DeepSeek** for its simplicity and free tier
2. Add **DeepInfra** for additional free quota
3. Configure **Azure OpenAI** when you need enterprise features

### For Production
1. Set up **Azure OpenAI** as your primary provider
2. Add **DeepSeek** as a high-quality fallback
3. Include **Aliyun DashScope** for additional redundancy

## Next Steps

- **[Azure OpenAI Setup](./azure)** - Enterprise-grade OpenAI service
- **[DeepSeek Setup](./deepseek)** - High-performance models with free tier
- **[Aliyun DashScope Setup](./aliyun)** - Alibaba Cloud AI platform
- **[DeepInfra Setup](./deepinfra)** - Open-source model inference
- **[Custom Provider Setup](./custom)** - Add your own providers

Need help choosing? Check our **[Configuration Guide](/guide/configuration)** for more detailed recommendations based on your specific use case.
