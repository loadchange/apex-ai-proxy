# Apex AI Proxy - Memory Bank

## 1. 项目概述

`apex-ai-proxy` 是一个使用 TypeScript 编写的 Cloudflare Worker 项目。其核心功能是作为一个 AI 服务聚合器和代理，提供一个统一的、与 OpenAI API 兼容的接口（`/v1/models`, `/v1/chat/completions`）。它根据配置将收到的请求路由到不同的后端 AI 服务提供商（如 Azure, DeepSeek, AliyunCS 等），旨在整合多个服务并可能提高 QPM（每分钟查询数）。

## 2. 核心架构与流程

### 请求处理流程

1.  **接收请求:** Cloudflare Worker 接收来自客户端的 HTTP 请求。
2.  **API 密钥验证 (可选):** 如果配置了 `SERVICE_API_KEY` 环境变量，Worker 会验证请求头中的 `Authorization: Bearer <token>`。验证失败则返回 401 Unauthorized。
3.  **路由:** 根据请求路径 (`/v1/models` 或 `/v1/chat/completions`) 和 HTTP 方法 (GET 或 POST) 将请求分发给 `src/handlers.ts` 中的相应处理函数。
4.  **处理 `/v1/chat/completions` (POST):**
    *   解析请求体 (JSON)。
    *   从请求体中获取 `model` 名称。
    *   解析环境变量 `PROVIDER_CONFIG` 和 `MODEL_PROVIDER_CONFIG` 获取模型和提供商配置。
    *   查找与请求的 `model` 对应的 `ModelConfig`。支持动态指定提供商（格式：`model_name#provider_name`）。
    *   如果找不到模型或模型没有可用提供商，返回 404 或 500 错误。
    *   使用 `selectProvider` 辅助函数从可用提供商列表中随机选择一个（实现基础负载均衡）。如果提供商配置了多个 API 密钥，也会随机选择一个。
    *   构建转发给目标 AI 提供商的请求，包括设置正确的 URL、`Authorization` 头（使用提供商的 API 密钥）以及可能修改的请求体（例如，替换为提供商特定的模型名称）。处理特定提供商的逻辑（如 Azure 的 `api-version`）。
    *   记录请求相关信息（来源地、提供商、模型、时间）。
    *   使用 `fetch` API 将请求发送给选定的 AI 提供商。
    *   处理提供商的响应：如果失败，格式化并返回错误；如果成功，将提供商的响应（包括 Headers 和 Body，支持流式响应）直接透传给客户端。
5.  **处理 `/v1/models` (GET):**
    *   从 `MODEL_PROVIDER_CONFIG` 解析出的配置中提取所有可用的模型名称。
    *   构建一个符合 OpenAI `/v1/models` 响应格式的模型列表。
    *   返回包含模型列表的 JSON 响应。
6.  **CORS 处理:** Worker 会响应 OPTIONS 请求，允许跨域访问。
7.  **错误处理:** 捕获处理过程中的错误，并使用 `formatErrorResponse` 返回 OpenAI 兼容格式的错误信息。

### 序列图 (Mermaid)

```mermaid
sequenceDiagram
    participant Client
    participant ApexAIProxy (CF Worker)
    participant AIProvider (e.g., Azure, DeepSeek)

    Client->>+ApexAIProxy: POST /v1/chat/completions (ReqBody, AuthHeader)
    ApexAIProxy->>ApexAIProxy: Verify API Key (SERVICE_API_KEY)
    alt Invalid API Key
        ApexAIProxy-->>-Client: 401 Unauthorized Error
    end
    ApexAIProxy->>ApexAIProxy: Parse Request Body (model, messages, etc.)
    ApexAIProxy->>ApexAIProxy: Parse Model/Provider Config (from Env Vars)
    ApexAIProxy->>ApexAIProxy: Find ModelConfig for requested model
    alt Model Not Found
        ApexAIProxy-->>-Client: 404/500 Error
    end
    ApexAIProxy->>ApexAIProxy: Select Provider (Random Load Balancing)
    ApexAIProxy->>+AIProvider: Forward Request (Provider URL, Provider Key, Modified Body)
    AIProvider-->>-ApexAIProxy: Provider Response (Success or Error)
    alt Provider Error
        ApexAIProxy->>ApexAIProxy: Format Error Response
        ApexAIProxy-->>-Client: Provider Status Code Error
    else Provider Success
        ApexAIProxy-->>-Client: Stream Provider Response Body & Headers
    end
```

## 3. 配置详解

项目的核心配置通过 Cloudflare Worker 的环境变量完成：

*   **`PROVIDER_CONFIG` (必需):** JSON 字符串，定义了各个 AI 提供商的基础信息。
    *   结构: `{ "provider_identifier": { "base_url": "...", "api_keys": ["key1", "key2", ...] } }`
    *   示例:
        ```json
        {
          "deepseek": {
            "base_url": "https://api.deepseek.com/v1",
            "api_keys": ["ds_key_abc", "ds_key_def"]
          },
          "azure_openai": {
            "base_url": "https://your-azure-resource.openai.azure.com/openai/deployments/your-deployment",
            "api_keys": ["azure_key_123"]
          }
        }
        ```
*   **`MODEL_PROVIDER_CONFIG` (必需):** JSON 字符串，将用户请求的模型名称映射到一个或多个提供商及其对应的内部模型名称。
    *   结构: `{ "user_facing_model_name": { "providers": [ { "provider": "provider_identifier", "model": "provider_internal_model_name", "base_url": "(optional_override)", "api_key": "(optional_override)" }, ... ] } }`
    *   说明: 如果 `providers` 数组中的对象没有指定 `base_url` 或 `api_key`，则会从 `PROVIDER_CONFIG` 中继承。
    *   示例:
        ```json
        {
          "gpt-4-turbo": {
            "providers": [
              { "provider": "azure_openai", "model": "gpt-4-1106-preview" }
            ]
          },
          "deepseek-chat": {
            "providers": [
              { "provider": "deepseek", "model": "deepseek-chat" }
            ]
          },
          "mixed-model": {
             "providers": [
               { "provider": "azure_openai", "model": "gpt-35-turbo" },
               { "provider": "deepseek", "model": "deepseek-coder" }
             ]
          }
        }
        ```
*   **`SERVICE_API_KEY` (可选):** 字符串。如果设置，所有对 `/v1/chat/completions` 的 POST 请求都需要在 `Authorization` 头中提供匹配的 Bearer Token (`Bearer ${SERVICE_API_KEY}`)。

*   **`wrangler-config.js.example`:** 提供了 Cloudflare Wrangler 配置文件的示例，用于定义 Worker 名称、兼容性日期、环境变量绑定等。实际部署时应参考此文件创建 `wrangler.jsonc` 或 `wrangler.js`。

## 4. 关键代码模块

*   **`src/index.ts`:** Worker 入口文件。处理请求路由、API 密钥验证（如果配置）、CORS OPTIONS 请求，并将请求分发给相应的处理程序。
*   **`src/handlers.ts`:** 包含核心业务逻辑。
    *   `handleModelsRequest`: 处理 `/v1/models` 请求，返回配置的模型列表。
    *   `handleChatCompletionsRequest`: 处理 `/v1/chat/completions` 请求，负责解析请求、选择提供商、转发请求到后端 AI 服务并返回响应。
*   **`src/utils.ts`:** 提供辅助函数。
    *   `parseModelProviderConfig`: 解析环境变量中的 JSON 配置。
    *   `verifyApiKey`: 验证服务 API 密钥。
    *   `selectProvider`: 根据配置随机选择一个提供商和 API 密钥。
    *   `formatErrorResponse`: 创建 OpenAI 兼容的错误响应。
*   **`src/types.ts`:** 定义项目使用的 TypeScript 类型和接口，包括环境变量、配置结构以及 OpenAI 兼容的请求/响应体。

## 5. API 端点

*   **`GET /v1/models`:** 返回一个符合 OpenAI 格式的模型列表，列出所有在 `MODEL_PROVIDER_CONFIG` 中配置的模型名称。
*   **`POST /v1/chat/completions`:** 接收 OpenAI 兼容的聊天完成请求。根据请求中的 `model` 参数和配置，将请求转发给一个或多个后端 AI 提供商中的一个，并返回其响应。支持流式响应。

## 6. 技术栈与依赖

*   **核心技术:** Cloudflare Workers, TypeScript
*   **主要依赖:**
    *   `wrangler`: Cloudflare Workers 的命令行工具，用于开发、测试和部署。
    *   `@cloudflare/workers-types`: Cloudflare Workers 的 TypeScript 类型定义。
    *   `vitest`: 用于单元测试。
    *   `@cloudflare/vitest-pool-workers`: Vitest 的 Worker 环境模拟器。

## 7. 部署与运行

*   **开发:** 使用 `npm run dev` 或 `pnpm dev` (或 `yarn dev`) 启动本地开发服务器 (`wrangler dev`)。
*   **部署:** 使用 `npm run deploy` 或 `pnpm deploy` (或 `yarn deploy`)。此脚本会先运行 `update-wrangler-config.js` (可能用于动态更新配置)，然后执行 `wrangler deploy` 将 Worker 部署到 Cloudflare。
*   **类型生成:** `npm run cf-typegen` 用于根据 `wrangler` 配置生成 `worker-configuration.d.ts`。
