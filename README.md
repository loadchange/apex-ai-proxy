# Apex AI Proxy

A powerful Cloudflare Workers-based AI service aggregator that provides unified API endpoints compatible with both OpenAI and Anthropic formats. Built on top of Cloudflare AI Gateway for enhanced reliability, monitoring, and cost optimization.

## Features

- **Unified API Interface**: Single endpoint supporting both OpenAI and Anthropic API formats
- **Multi-Provider Support**: Seamlessly integrate with multiple AI providers through Cloudflare AI Gateway
- **Streaming Support**: Real-time streaming responses for both API formats
- **CORS Enabled**: Ready for web applications with proper CORS handling
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Tool/Function Calling**: Support for function calling in both OpenAI and Anthropic formats
- **Azure OpenAI Integration**: Native support for Azure OpenAI deployments
- **Request Validation**: Robust input validation and error handling
- **Image Support**: Full support for vision models and image analysis
- **BYOK Integration**: Secure API key storage using Cloudflare's BYOK feature

## Supported Providers

Via Cloudflare AI Gateway:
- OpenAI (GPT-4, GPT-3.5, GPT-4V)
- Anthropic (Claude 3.5, Claude 3 Haiku/Sonnet/Opus)
- Google AI Studio (Gemini Pro, Gemini Flash)
- Groq (Mixtral, Llama models)
- Mistral (Mistral Large, Codestral)
- Grok (xAI models)
- DeepSeek (DeepSeek Coder, DeepSeek Chat)
- Cerebras (Llama models)
- Perplexity AI (Sonar models)
- Azure OpenAI
- Cohere
- Workers AI

## Quick Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/loadchange/apex-ai-proxy)

## Prerequisites

1. **Cloudflare Account**: Sign up at [Cloudflare](https://cloudflare.com)
2. **AI Gateway Setup**: Follow the [AI Gateway Getting Started Guide](https://developers.cloudflare.com/ai-gateway/get-started/)
3. **Provider API Keys**: Obtain API keys from your chosen AI providers
4. **Node.js**: Version 16 or higher
5. **pnpm**: Package manager (or npm/yarn)

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy
pnpm install
```

### 2. Configure Cloudflare AI Gateway

#### Step 1: Create AI Gateway
1. Navigate to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **AI** → **AI Gateway**
3. Select **Create Gateway**
4. Enter your **Gateway name** (e.g., `apex-ai-proxy`)
5. Select **Create**
6. Note your **Account ID** and **Gateway ID** from the gateway settings

#### Step 2: Enable Authentication (Recommended)
1. In your AI Gateway dashboard, go to **Settings**
2. Enable **Authentication** to secure your gateway
3. Generate a **Gateway Token** for API access
4. Store this token securely - you'll need it for deployment

### 3. Configure Provider API Keys

You have three options for provider authentication:

#### Option A: BYOK (Bring Your Own Keys) - Recommended
Store your API keys securely in Cloudflare:

1. In your AI Gateway dashboard, go to **Provider Keys** section
2. Click **Add API Key**
3. Select your AI provider from the dropdown
4. Enter your API key and optionally provide a description
5. Click **Save**
6. Repeat for all providers you want to use

**Benefits of BYOK**:
- Secure storage with Cloudflare Secrets Store
- Easy key rotation without code changes
- Enhanced security - keys never exposed in requests
- Rate limiting and budget controls per provider

#### Option B: Request Headers
Include provider API keys in request headers (traditional approach):
```bash
curl -H "Authorization: Bearer YOUR_PROVIDER_API_KEY" \
     -H "cf-aig-authorization: Bearer YOUR_GATEWAY_TOKEN"
```

#### Option C: Unified Billing
Use Cloudflare's billing system (where available) without managing individual provider keys.

### 4. Update Configuration

Edit [`wrangler.jsonc`](wrangler.jsonc):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "apex-ai-proxy",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-01",
  "vars": {
    "ACCOUNT_ID": "your-cloudflare-account-id",
    "GATEWAY_ID": "your-gateway-id",
    "AZURE_RESOURCE": "your-azure-resource-name", // Optional: for Azure OpenAI
    "AZURE_API_VERSION": "2024-02-01"              // Optional: for Azure OpenAI
  }
}
```

**How to find your IDs**:
- **Account ID**: Available in the right sidebar of any Cloudflare dashboard page
- **Gateway ID**: Found in your AI Gateway settings page URL or dashboard

### 5. Set Up Authentication

Create a secret for your gateway token:

```bash
# Set your gateway authentication token
wrangler secret put GatewayToken
# Enter your Gateway Token when prompted (from step 2)
```

### 6. Deploy

```bash
# Deploy to Cloudflare Workers
pnpm run deploy
```

After deployment, your worker will be available at:
`https://your-worker-name.your-subdomain.workers.dev`

## API Usage

### Model Specification Format

**Important**: This proxy uses the format `model#provider` (note the `#` separator):

- **OpenAI**: `gpt-4#openai`, `gpt-3.5-turbo#openai`
- **Anthropic**: `claude-3-5-haiku-20241022#anthropic`, `claude-3-5-sonnet-20241022#anthropic`
- **Google**: `gemini-2.0-flash#google-ai-studio`
- **Groq**: `mixtral-8x7b-32768#groq`
- **Mistral**: `mistral-large-latest#mistral`
- **Azure OpenAI**: `gpt-4#azure-openai`

### OpenAI Compatible Endpoint

```bash
curl -X POST "https://your-worker.your-subdomain.workers.dev/v1/chat/completions" \
  -H "Authorization: Bearer your-gateway-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-haiku-20241022#anthropic",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ],
    "stream": true
  }'
```

### Anthropic Compatible Endpoint

```bash
curl -X POST "https://your-worker.your-subdomain.workers.dev/v1/messages" \
  -H "Authorization: Bearer your-gateway-token" \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-5-sonnet-20241022#anthropic",
    "max_tokens": 1000,
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ],
    "stream": true
  }'
```

### Image Analysis Support

Both endpoints support vision models for image analysis:

```bash
curl -X POST "https://your-worker.your-subdomain.workers.dev/v1/chat/completions" \
  -H "Authorization: Bearer your-gateway-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-vision-preview#openai",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What do you see in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
            }
          }
        ]
      }
    ]
  }'
```

## Client Integration Examples

### OpenAI Python Client

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-gateway-token",
    base_url="https://your-worker.your-subdomain.workers.dev/v1"
)

# Use Claude via OpenAI client
response = client.chat.completions.create(
    model="claude-3-5-haiku-20241022#anthropic",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
```

### Anthropic Python Client

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="your-gateway-token",
    base_url="https://your-worker.your-subdomain.workers.dev"
)

response = client.messages.create(
    model="claude-3-5-sonnet-20241022#anthropic",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
```

### Cursor/VS Code Integration

Configure your IDE to use the adapter:

**Cursor Settings** (Settings → Cursor Settings):
```json
{
  "cursor.general.apiKey": "your-gateway-token",
  "cursor.general.baseURL": "https://your-worker.your-subdomain.workers.dev/v1",
  "cursor.general.model": "claude-3-5-haiku-20241022#anthropic"
}
```

**VS Code with Continue Extension**:
```json
{
  "models": [
    {
      "title": "Claude 3.5 Haiku",
      "provider": "openai",
      "model": "claude-3-5-haiku-20241022#anthropic",
      "apiKey": "your-gateway-token",
      "apiBase": "https://your-worker.your-subdomain.workers.dev/v1"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ACCOUNT_ID` | Your Cloudflare Account ID | ✅ | `1234567890abcdef1234567890abcdef` |
| `GATEWAY_ID` | Your AI Gateway ID | ✅ | `my-gateway` |
| `AZURE_RESOURCE` | Azure OpenAI resource name | ❌ | `my-azure-openai` |
| `AZURE_API_VERSION` | Azure OpenAI API version | ❌ | `2024-02-01` |

## Secrets

| Secret | Description | Required | How to Set |
|--------|-------------|----------|------------|
| `GatewayToken` | Authentication token for API access | ✅ | `wrangler secret put GatewayToken` |

## Development

### Local Development

```bash
# Start local development server
pnpm run dev

# Your proxy will be available at http://localhost:8787
```

### Testing

```bash
# Run tests
pnpm run test

# Test with specific provider
curl -X POST "http://localhost:8787/v1/chat/completions" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-3.5-turbo#openai", "messages": [{"role": "user", "content": "test"}]}'
```

### Type Generation

```bash
# Generate Cloudflare Workers types
pnpm run cf-typegen
```

## Architecture

```
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Clients    │───▶│ AI Gateway       │───▶│ Cloudflare AI   │
│                 │    │ Adapter          │    │ Gateway         │
│ • Codex         │    │ (Workers)        │    │                 │
│ • Claude Code   │    │                  │    │ • Rate Limiting │
│                 │    │ • Protocol Conv. │    │ • Monitoring    │
│                 │    │ • Validation     │    │ • Cost Control  │
│                 │    │ • Error Handling │    │ • BYOK Storage  │
│                 │    │ • Image Support  │    │ • Caching       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  AI Providers   │
                                                │                 │
                                                │ • OpenAI        │
                                                │ • Anthropic     │
                                                │ • Google        │
                                                │ • Groq          │
                                                │ • Mistral       │
                                                │ • Others        │
                                                └─────────────────┘
```

## Key Features

### Format Conversion

The proxy automatically converts between OpenAI and Anthropic message formats:

- **System Messages**: Properly handled for each provider's requirements
- **Tool Calls**: Function calling support across both formats
- **Streaming**: Real-time streaming with proper Server-Sent Events formatting
- **Error Handling**: Consistent error responses across providers
- **Image Content**: Full support for vision models and multi-modal inputs

### Request Validation

- Input validation for both API formats
- Model name validation with `model#provider` format
- Authentication verification via Gateway Token
- CORS handling for web applications
- Content-type validation and parsing

### Provider Integration

- Dynamic provider routing based on model specification
- Support for Cloudflare AI Gateway's unified endpoints
- Azure OpenAI integration with deployment management
- Automatic error handling and fallback responses
- Special handling for provider-specific features (e.g., Mistral streaming options)

## Monitoring and Analytics

Leverage Cloudflare AI Gateway's built-in monitoring:

1. **Request Analytics**: Track usage patterns, costs, and performance metrics
2. **Rate Limiting**: Configure per-provider and per-user limits
3. **Caching**: Reduce costs with intelligent response caching
4. **Logs**: Detailed request and response logging with full audit trail
5. **Cost Tracking**: Monitor spending across all providers
6. **Error Analytics**: Track error rates and failure patterns

Access analytics at: `https://dash.cloudflare.com/[account-id]/ai/ai-gateway/[gateway-id]`

## Security Best Practices

1. **Use BYOK**: Store API keys securely in Cloudflare rather than in code
2. **Enable Gateway Authentication**: Protect your proxy with authentication tokens
3. **Set Rate Limits**: Configure appropriate rate limits to prevent abuse
4. **Monitor Usage**: Regularly review analytics for unusual patterns
5. **Rotate Keys**: Periodically rotate both gateway tokens and provider API keys
6. **Use HTTPS**: Always use HTTPS endpoints in production

## Troubleshooting

### Common Issues

1. **Invalid Model Format**: Ensure you're using `model#provider` format (not `provider/model`)
2. **Authentication Errors**: Verify your Gateway Token is set correctly as a secret
3. **Provider Errors**: Check that your provider API keys are valid and have sufficient credits
4. **CORS Issues**: Ensure your client is sending proper headers for cross-origin requests

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
wrangler secret put DEBUG
# Enter "true" when prompted
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Cloudflare AI Gateway Docs](https://developers.cloudflare.com/ai-gateway/)
- **Issues**: [GitHub Issues](https://github.com/loadchange/apex-ai-proxy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/loadchange/apex-ai-proxy/discussions)

## Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) for the serverless platform
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) for AI provider management
- All the AI providers for their excellent APIs
