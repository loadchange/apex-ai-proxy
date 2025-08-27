---
layout: home

hero:
  name: "Apex AI Proxy"
  text: "Your Free Personal AI Gateway"
  tagline: "Aggregate multiple AI service providers behind a unified OpenAI-compatible API. Overcome rate limits, maximize free quotas, and simplify your AI integrations."
  image:
    src: /hero-logo.svg
    alt: Apex AI Proxy
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/loadchange/apex-ai-proxy

features:
  - icon: 🆓
    title: Completely Free
    details: Runs entirely on Cloudflare Workers' free plan. No hidden costs, no subscriptions.
  - icon: 🔄
    title: Smart Load Balancing
    details: Distributes requests across multiple providers to overcome rate limits and increase availability.
  - icon: 💰
    title: Maximize Free Quotas
    details: Take advantage of free tiers from different AI providers to minimize costs.
  - icon: 🔑
    title: Multiple API Keys
    details: Register multiple keys for the same service provider to further increase your limits.
  - icon: 🤖
    title: OpenAI Compatible
    details: Works with any library that speaks OpenAI's API format. Drop-in replacement for existing code.
  - icon: 🛡️
    title: Robust & Reliable
    details: Comprehensive error handling, automatic failover, and graceful degradation.
  - icon: 🌐
    title: Multi-Provider Support
    details: Supports Azure OpenAI, DeepSeek, Aliyun DashScope, DeepInfra, and custom providers.
  - icon: 🔧
    title: Easy Configuration
    details: Simple JavaScript configuration file. Deploy in 60 seconds with minimal setup.
  - icon: 📊
    title: Anthropic API Support
    details: Full compatibility with Anthropic's Messages API, including Claude Code integration.
---

## Why Choose Apex AI Proxy?

### 🚀 Quick Deployment
Deploy to Cloudflare Workers in under 60 seconds. No complex infrastructure setup required.

```bash
# Clone and deploy
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy
pnpm install
pnpm run deploy
```

### 🔄 Smart Request Distribution
Automatically routes requests to available providers, ensuring maximum uptime and performance.

```javascript
// Configure multiple providers for the same model
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
      }
    ],
  },
};
```

### 💻 Drop-in Replacement
Works seamlessly with existing OpenAI client code. No changes required.

```python
from openai import OpenAI

# Just change the base_url - everything else stays the same
client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-configured-api-key"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Supported Providers

<div class="provider-grid">
  <div class="provider-card">
    <h3>🌊 Azure OpenAI</h3>
    <p>Enterprise-grade OpenAI models with enhanced security and compliance.</p>
  </div>
  
  <div class="provider-card">
    <h3>🧠 DeepSeek</h3>
    <p>High-performance language models with competitive pricing and capabilities.</p>
  </div>
  
  <div class="provider-card">
    <h3>☁️ Aliyun DashScope</h3>
    <p>Alibaba Cloud's comprehensive AI model platform with global reach.</p>
  </div>
  
  <div class="provider-card">
    <h3>🚀 DeepInfra</h3>
    <p>Fast and reliable inference for popular open-source AI models.</p>
  </div>
</div>

## Latest Updates

### 🆕 OpenAI Next-Gen `/v1/responses` API Support
We now support the latest OpenAI `/v1/responses`-style API, ensuring compatibility with next-generation OpenAI tools and clients.

- **Enhanced Compatibility**: Seamless integration with the latest OpenAI ecosystem tools
- **Future-Proofing**: Stays aligned with evolving OpenAI standards
- **Response ID Tracking**: Advanced features enabled through response caching

### 🤖 Full Anthropic API Compatibility
Complete support for Anthropic's Messages API with automatic protocol conversion.

- **Claude Code Integration**: Works seamlessly with Claude Code and other Anthropic tools
- **Tool Usage Support**: Full support for function calling and tool interactions
- **Streaming Responses**: Real-time streaming with proper event formatting

## Community & Support

<div class="community-section">
  <div class="community-card">
    <h3>📖 Documentation</h3>
    <p>Comprehensive guides and API references to get you started quickly.</p>
    <a href="/guide/">Read the Docs →</a>
  </div>
  
  <div class="community-card">
    <h3>💬 GitHub Discussions</h3>
    <p>Join the community to ask questions, share ideas, and get help.</p>
    <a href="https://github.com/loadchange/apex-ai-proxy/discussions">Join Discussion →</a>
  </div>
  
  <div class="community-card">
    <h3>🐛 Issue Tracking</h3>
    <p>Report bugs, request features, and track development progress.</p>
    <a href="https://github.com/loadchange/apex-ai-proxy/issues">Report Issues →</a>
  </div>
</div>

---

<div class="getting-started-cta">
  <h2>Ready to Break Free from Rate Limits?</h2>
  <p>Deploy your personal AI gateway in under 60 seconds and start aggregating multiple AI providers today.</p>
  <div class="cta-buttons">
    <a href="/quick-start" class="cta-primary">Get Started Now</a>
    <a href="https://github.com/loadchange/apex-ai-proxy" class="cta-secondary">View Source Code</a>
  </div>
</div>

<style>
.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.provider-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.provider-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.provider-card h3 {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-brand-1);
}

.provider-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.community-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.community-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.community-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
}

.community-card p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.community-card a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.community-card a:hover {
  text-decoration: underline;
}

.getting-started-cta {
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
  color: white;
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 12px;
  margin: 3rem 0;
}

.getting-started-cta h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.getting-started-cta p {
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary, .cta-secondary {
  padding: 0.75rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cta-primary {
  background: white;
  color: var(--vp-c-brand-1);
}

.cta-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-secondary:hover {
  background: white;
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .provider-grid,
  .community-section {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-primary, .cta-secondary {
    width: 200px;
  }
}
</style>
