# 🚀 Apex AI Proxy: 您的免费个人 AI 网关

[![部署到 Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-CF%20Workers-%23F38020?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Apex AI Proxy 是一个运行在 Cloudflare Workers 上的免费个人 AI 网关。它将多个 AI 服务提供商聚合在一个统一的 OpenAI 兼容 API 后面，让您突破调用频率限制并享受各家服务商的免费配额。

**为什么选择我们**:
- 🆓 **完全免费**: 完全运行在 Cloudflare Workers 的免费计划上
- 🔄 **负载均衡**: 在多个提供商之间分配请求，突破单一服务的频率限制
- 💰 **最大化免费配额**: 充分利用不同 AI 提供商的免费额度
- 🔑 **多 API 密钥支持**: 为同一服务提供商注册多个密钥
- 🤖 **OpenAI 客户端兼容**: 适用于任何使用 OpenAI API 格式的库

---

## 🚨 重要更新：支持 OpenAI 新一代 `/v1/responses` 风格 API

**2025-04 更新**

Apex AI Proxy 现已支持 OpenAI 新一代 `/v1/responses` 风格 API，这一更新对生态兼容性和未来适配至关重要：

- **生态兼容性提升**：可无缝对接 Codex 等最新 OpenAI 工具及所有需要 `/v1/responses` API 的客户端。
- **面向未来**：确保代理服务持续兼容 OpenAI 标准的演进。

### 本次更新内容
- **/v1/responses API 支持**：现已支持基于 response 的新一代端点，解锁对新一代 OpenAI 客户端和工具的兼容。
- **基于 response_id 的接口**：部分接口需基于 `response_id` 操作。为此，配置项中新增了 `kv_namespaces` 字段，用于缓存和管理响应数据。
- **配置变更**：请在配置文件中添加 `kv_namespaces` 字段（见下方示例），以支持响应的缓存与检索。

#### `wrangler-config.js` 配置示例
```js
module.exports = {
  // ...原有配置...
  kv_namespaces: [
    { binding: 'RESPONSE_KV', id: 'your-kv-namespace-id' }
  ],
};
```

> **注意：** 未配置该项时，部分 `/v1/responses` 相关接口将无法正常工作。

### 为什么重要？
- **解锁 OpenAI 生态新工具**（如 Codex）
- **对齐最新 API 标准**
- **支持高级特性**，如 response ID 跟踪

更多细节请参见下方的用法和配置说明。

---

## 特性 ✨

- 🌐 **多提供商支持**: 将 Azure、DeepSeek、阿里云等聚合在一个 API 后面
- 🔀 **智能请求分发**: 自动将请求路由到可用的提供商
- 🔑 **多 API 密钥管理**: 为同一提供商注册多个密钥，进一步提高限制
- 🔄 **协议转换**: 处理不同提供商的认证方法和 API 格式
- 🛡️ **强大的错误处理**: 优雅地处理提供商错误和故障转移

## 60 秒快速开始 ⏱️

1. **克隆仓库**:
```bash
git clone https://github.com/loadchange/apex-ai-proxy.git
cd apex-ai-proxy
```

2. **安装依赖**:
```bash
pnpm install
```

3. **配置您的提供商** (在 `wrangler-config.js` 中):
```javascript
// 首先，定义您的提供商及其基本URL和API密钥
const providerConfig = {
  aliyuncs: {
    base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    api_keys: ['your-aliyun-key'],
  },
  deepinfra: {
    base_url: 'https://api.deepinfra.com/v1/openai',
    api_keys: ['your-deepinfra-key'],
  },
  azure: {
    base_url: 'https://:name.azure.com/openai/deployments/:model',
    api_keys: ['your-azure-key'],
  },
  // 根据需要添加更多提供商
};

// 然后，配置您的模型并为它们分配提供商
const modelProviderConfig = {
  'gpt-4o-mini': {
    providers: [
      {
        provider: 'azure',
        model: 'gpt-4o-mini',
      },
      // 为同一模型添加更多提供商
    ],
  },
  'DeepSeek-R1': {
    providers: [
      {
        provider: 'aliyuncs',
        model: 'deepseek-r1',
      },
      {
        provider: 'deepinfra',
        model: 'deepseek-ai/DeepSeek-R1',
      },
      // 您仍然可以为特定模型覆盖提供商设置（如有需要）
      {
        provider: 'azure',
        base_url: 'https://your-custom-endpoint.azure.com/openai/deployments/DeepSeek-R1',
        api_key: 'your-custom-azure-key',
        model: 'DeepSeek-R1',
      },
    ],
  },
};
```

4. **部署到 Cloudflare Workers**:
```bash
pnpm run deploy
```

## 为什么这能解决您的问题

- **频率限制问题**: 通过在多个提供商之间分配请求，您可以突破单个服务施加的频率限制
- **成本优化**: 利用不同提供商的免费额度
- **API 一致性**: 无论底层提供商如何，都使用单一、一致的 API 格式（OpenAI 兼容）
- **简化集成**: 无需修改使用 OpenAI 客户端的现有代码

## 使用示例

```python
# 适用于任何 OpenAI 客户端！
from openai import OpenAI

client = OpenAI(
    base_url="https://your-proxy.workers.dev/v1",
    api_key="your-configured-api-key"
)

# 使用您在代理中配置的任何模型
response = client.chat.completions.create(
    model="DeepSeek-R1",  # 这将被路由到您配置的提供商之一
    messages=[{"role": "user", "content": "为什么这个代理很棒？"}]
)
```

## 多 API 密钥配置

您可以为同一提供商配置多个 API 密钥，进一步提高您的频率限制：

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

## 贡献

发现了 bug 或想要添加对更多提供商的支持？欢迎提交 PR！

## 准备好了吗？ 🚀

[![立即部署](https://img.shields.io/badge/Deploy%20Now-%E2%86%92-%23FF6A00?style=for-the-badge&logo=cloudflare)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
