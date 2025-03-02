# 🚀 Apex AI Proxy: Your Azure-to-OpenAI Bridge with DeepSeek R1 Superpowers

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-CF%20Workers-%23F38020?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Tired of Azure's API peculiarities cramping your style? 😤 Want to use that blazing-fast ⚡ DeepSeek R1 model through standard OpenAI clients? Our proxy is your genie in a Cloudflare bottle! 🧞♂️

**Why you'll care**: This isn't just another Azure proxy - it's your golden ticket to:
- 🆓 **Free-tier magic**: Runs entirely on Cloudflare's Workers free plan
- 🚀 **DeepSeek R1 optimized**: Cut through Azure's API weirdness like a hot knife through butter
- 🤖 **OpenAI client compatibility**: Works with ANY library that speaks OpenAI

## Features That Don't Suck ✨

- 🔄 **Automatic protocol translation** (Azure-speak → OpenAI-ish)
- 🔥 **DeepSeek R1 first-class support** (Our original raison d'être)
- 🧩 **Multi-deployment management** (Like herding cats, but easier)
- 🛡️ **Error handling** that doesn't make you want to cry

## Get Started in 60 Seconds ⏱️

1. **Clone this bad boy**:
```bash
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy
```

2. **Install the good stuff**:
```bash
pnpm install
```

3. **Configure your Azure secrets** (in `wrangler.jsonc`):
```json
{
  "vars": {
		"SERVICE_API_KEY": "sk-4e5212a130ccb594f68ad050ac43423cacb48e85",
    "AZURE_CONFIGS": "[{
      \"endpoint\": \"your-resource\",
      \"protocol\": \"services.ai\",
      \"apiKey\": \"your-azure-key\",
      \"deploymentNames\": [\"deepseek-r1-8k\", \"gpt-4-turbo\"]
    }]"
  }
}
```

4. **Deploy like a boss**:
```bash
pnpm run deploy
```

## Why You'll Love This ❤️

Perfect for when you:
- 🤯 Need DeepSeek R1's speed but hate Azure's API quirks
- 💸 Want OpenAI compatibility without the OpenAI prices
- 🚫 Can't be bothered setting up yet another proxy server

## Usage Made Stupid Simple

```python
# Works with ANY OpenAI client!
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="sk-4e5212a130ccb594f68ad050ac43423cacb48e85"
)

response = client.chat.completions.create(
    model="DeepSeek-R1",  # Your Azure deployment name
    messages=[{"role": "user", "content": "Why is this proxy awesome?"}]
)
```

## When Things Go Wrong (We've Got Your Back) 🤞

Our errors are almost as helpful as you wish Azure's were:
```json
{
  "error": {
    "message": "Azure says 'nope' 🤷♂️",
    "type": "azure_being_azure",
    "code": 418,  // (We make these numbers up to be more helpful)
    "doc_url": "https://github.com/loadchange/apex-ai-proxy/wiki/Error-418"
  }
}
```

## Contributing

Found a bug? 🐛 Want more magic? PRs welcome!


## Ready to Supercharge Your AI Workflow? 🚀

[![Deploy Button](https://img.shields.io/badge/Deploy%20Now-%E2%86%92-%23FF6A00?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
