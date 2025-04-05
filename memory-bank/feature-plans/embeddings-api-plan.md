**技术方案：实现 `/v1/embeddings` 接口**

**1. 目标**

为 Apex AI Proxy 添加 `/v1/embeddings` API 端点，使其能够接收符合 OpenAI embeddings API 规范的请求，并将这些请求智能地路由到配置中支持该功能的后端 AI 服务提供商。

**2. 核心原则**

*   **OpenAI 兼容性**: 严格遵循 OpenAI `/v1/embeddings` 的请求和响应格式规范。
*   **复用现有模式**: 最大程度地复用现有的请求处理、配置管理、提供商选择和错误处理逻辑。
*   **灵活性**: 设计应允许未来轻松添加更多支持 embeddings 的供应商。
*   **明确性**: 在配置中清晰地映射 embeddings 模型到支持它们的供应商。

**3. 计划步骤**

```mermaid
graph TD
    A[1. 调研与分析] --> B(2. 方案细化与设计);
    B --> C[3. 编码实现];
    C --> D[4. 配置更新];
    D --> E[5. 测试];
    E --> F[6. 文档更新];

    subgraph 调研与分析
        A1[分析 OpenAI Embeddings API 规范]
        A2[调研供应商 Embeddings API 兼容性]
    end

    subgraph 方案细化与设计
        B1[定义接口与数据结构]
        B2[设计 Embeddings 处理器逻辑]
        B3[规划配置结构变更]
        B4[设计适配层 (如果需要)]
    end

    subgraph 编码实现
        C1[实现 Embeddings 处理器函数]
        C2[添加路由逻辑]
        C3[实现必要的类型定义]
        C4[实现适配逻辑 (如果需要)]
    end

    subgraph 配置更新
        D1[更新 MODEL_PROVIDER_CONFIG]
        D2[更新 PROVIDER_CONFIG (如果需要)]
        D3[更新 wrangler-config.js.example]
    end

    subgraph 测试
        E1[编写单元测试]
        E2[模拟供应商响应]
        E3[集成测试 (本地)]
    end

     subgraph 文档更新
        F1[更新 README.md]
        F2[更新 Memory Bank 文件]
    end

    A1 --> A2;
    A2 --> B1 & B2 & B3 & B4;
    B1 & B2 & B3 & B4 --> C1 & C2 & C3 & C4;
    C1 & C2 & C3 & C4 --> D1 & D2 & D3;
    D1 & D2 & D3 --> E1 & E2 & E3;
    E1 & E2 & E3 --> F1 & F2;
```

**详细步骤说明:**

**Step 1: 调研与分析 (Information Gathering & Analysis)**

*   **1.1 分析 OpenAI Embeddings API 规范**:
    *   仔细研究 OpenAI 官方文档中 `/v1/embeddings` 的请求参数（`input`, `model`, `encoding_format`, `dimensions` 等）和响应结构（`object`, `data`, `model`, `usage`）。
    *   记录下标准的 HTTP 方法 (POST)、路径 (`/v1/embeddings`)、请求头和响应状态码。
*   **1.2 调研供应商 Embeddings API 兼容性**:
    *   **目标**: 确定当前 `PROVIDER_CONFIG` 中配置的哪些供应商（例如 Azure OpenAI Service, DeepSeek, 阿里云等）提供了 embeddings API。
    *   **方法**: 查阅每个潜在供应商的官方 API 文档。
    *   **关注点**:
        *   **端点 URL**: 是否有专门的 embeddings 端点？路径是什么？
        *   **认证方式**: 与 chat completions 接口是否相同？
        *   **请求格式**: 是否接受与 OpenAI 相同的 JSON 结构和参数？是否存在差异？
        *   **响应格式**: 返回的 JSON 结构是否与 OpenAI 兼容？字段名、数据类型是否一致？
    *   **产出**: 记录每个供应商 embeddings API 的兼容性情况，明确存在的差异点。这将决定是否需要以及如何实现适配逻辑。

**Step 2: 方案细化与设计 (Design)**

*   **2.1 定义接口与数据结构**:
    *   在 `src/types.ts` 中，根据 OpenAI 规范定义 `OpenAIEmbeddingsRequest` 和 `OpenAIEmbeddingsResponse` 接口（如果它们与现有的 Chat 类型显著不同）。
*   **2.2 设计 Embeddings 处理器逻辑**:
    *   规划一个新的异步函数 `handleEmbeddingsRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>` 在 `src/handlers.ts` 中。
    *   **核心流程**:
        1.  验证请求方法是否为 POST。
        2.  验证 `Authorization` 头（如果 `SERVICE_API_KEY` 已配置）。
        3.  解析请求体 (`request.json()`) 并验证其是否符合 `OpenAIEmbeddingsRequest` 结构。
        4.  从请求体中获取 `model` ID。
        5.  使用 `getConfig` 从 `env.MODEL_PROVIDER_CONFIG` 中查找支持该 `model` 的供应商列表。
        6.  如果找不到或列表为空，返回错误。
        7.  使用现有的 `selectProvider` 函数从列表中选择一个供应商（及其对应的 API 密钥和基础 URL）。
        8.  **适配与转发**:
            *   根据 **Step 1.2** 的调研结果，判断是否需要为选定的供应商进行适配。
            *   **如果完全兼容**: 直接构造转发请求（目标 URL 通常是 `providerBaseUrl + "/openai/deployments/YOUR_DEPLOYMENT_NAME/embeddings?api-version=YYYY-MM-DD"` 对于 Azure，或其他供应商的相应路径），使用 `fetch` 发送。
            *   **如果存在差异**: 调用一个特定于供应商的适配函数来转换请求体或调整目标 URL/Headers，然后再 `fetch`。
        9.  **响应处理**:
            *   获取供应商的响应。
            *   **如果需要适配**: 调用适配函数将供应商的响应转换为标准的 `OpenAIEmbeddingsResponse` 格式。
            *   **如果兼容**: 直接将供应商的响应流式传输回客户端，注意保留必要的响应头（如 `Content-Type`）。
        10. **错误处理**: 使用 `try...catch` 包裹整个流程，并调用 `formatErrorResponse` 返回 OpenAI 兼容的错误。
*   **2.3 规划配置结构变更**:
    *   确认如何在 `MODEL_PROVIDER_CONFIG` 中表示 embeddings 模型。例如: `"text-embedding-ada-002": ["azure-provider-1", "deepseek-provider-2"]`。
    *   确认是否需要在 `PROVIDER_CONFIG` 中为支持 embeddings 的供应商添加额外信息（如特定的 embeddings 端点路径或 API 版本）。例如，Azure 可能需要区分 chat 和 embeddings 的部署名称或 API 版本。
*   **2.4 设计适配层 (如果需要)**:
    *   如果调研发现供应商 API 不完全兼容，设计适配器函数。
    *   可以考虑在 `src/utils.ts` 或创建一个新的 `src/adapters.ts` 文件中实现这些函数。
    *   每个适配函数应接收原始请求/响应和供应商信息，并返回转换后的请求/响应。

**Step 3: 编码实现 (Implementation)**

*   **3.1 实现 `handleEmbeddingsRequest` 函数**: 根据 **Step 2.2** 的设计在 `src/handlers.ts` 中编写代码。
*   **3.2 添加路由逻辑**: 在 `src/index.ts` 的 `fetch` 函数中，添加对 `/v1/embeddings` 路径和 POST 方法的判断，调用 `handleEmbeddingsRequest`。
*   **3.3 实现必要的类型定义**: 在 `src/types.ts` 中添加 **Step 2.1** 定义的接口。
*   **3.4 实现适配逻辑 (如果需要)**: 根据 **Step 2.4** 的设计编写适配器函数。

**Step 4: 配置更新 (Configuration)**

*   **4.1 更新 `MODEL_PROVIDER_CONFIG`**: 在 `wrangler-config.js` 的 `vars` 或对应的环境变量中，添加 embeddings 模型及其支持的供应商标识符。
*   **4.2 更新 `PROVIDER_CONFIG`**: 如果需要，为相关供应商添加 embeddings 特定的配置信息。
*   **4.3 更新 `wrangler-config.js.example`**: 同步更新示例配置文件，方便用户理解如何配置 embeddings。

**Step 5: 测试 (Testing)**

*   **5.1 编写单元测试**: 在 `test/index.spec.ts` 中为 `handleEmbeddingsRequest` 添加测试用例。
    *   测试有效请求的成功转发和响应。
    *   测试无效请求（错误方法、无效 JSON、缺少模型等）的错误处理。
    *   测试模型未找到或没有可用供应商的情况。
    *   测试 `SERVICE_API_KEY` 验证逻辑。
*   **5.2 模拟供应商响应**: 使用 `msw` 或类似工具模拟后端供应商的成功响应和错误响应，包括需要适配和不需要适配的场景。
*   **5.3 集成测试 (本地)**: 使用 `wrangler dev` 启动本地服务，并使用 `curl` 或 Postman 发送实际的 embeddings 请求，验证端到端流程。

**Step 6: 文档更新 (Documentation)**

*   **6.1 更新 `README.md` / `README.zh-CN.md`**:
    *   添加 `/v1/embeddings` 端点的说明。
    *   解释如何在配置中添加 embeddings 模型和供应商。
    *   提供使用示例。
*   **6.2 更新 Memory Bank 文件**:
    *   `systemPatterns.md`: 添加 Embeddings 处理器组件，更新架构图和组件关系图。
    *   `techContext.md`: 更新支持的 API 端点列表。
    *   `progress.md`: 将 embeddings 功能从未完成移至已完成，更新待办事项列表。
    *   `activeContext.md`: 记录 embeddings 功能的实现。

**4. 预期交付物**

*   包含 `/v1/embeddings` 端点处理逻辑的代码更新。
*   更新后的配置文件示例。
*   针对新功能的单元测试。
*   更新后的项目文档和 Memory Bank 文件。
