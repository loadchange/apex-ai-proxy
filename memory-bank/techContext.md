# 技术背景 (Tech Context)

## 使用的技术

### 核心技术

1. **TypeScript**
   - 版本：根据package.json，使用TypeScript 5.5.2
   - 用途：提供类型安全和更好的开发体验
   - 优势：减少运行时错误，提高代码可维护性

2. **Cloudflare Workers**
   - 版本：使用最新的Cloudflare Workers运行时
   - 用途：提供无服务器执行环境
   - 优势：全球分布式部署，低延迟，免费计划足够大多数用例

3. **Wrangler**
   - 版本：根据package.json，使用Wrangler 3.109.2
   - 用途：Cloudflare Workers的命令行工具，用于开发、测试和部署
   - 优势：简化开发和部署流程

### 测试工具

1. **Vitest**
   - 版本：根据package.json，使用Vitest 2.1.9
   - 用途：单元测试和集成测试
   - 优势：快速、现代的测试框架，与Vite生态系统兼容

2. **@cloudflare/vitest-pool-workers**
   - 版本：根据package.json，使用0.6.4
   - 用途：在模拟的Workers环境中运行测试
   - 优势：更准确地模拟生产环境

### 类型定义

1. **@cloudflare/workers-types**
   - 版本：根据package.json，使用4.20250214.0
   - 用途：提供Cloudflare Workers的TypeScript类型定义
   - 优势：提高类型安全性和开发体验

## 开发设置

### 项目结构

```
apex-ai-proxy/
├── src/                  # 源代码目录
│   ├── index.ts          # 主入口点
│   ├── handlers.ts       # 请求处理器
│   ├── types.ts          # 类型定义
│   └── utils.ts          # 工具函数
├── test/                 # 测试目录
│   ├── index.spec.ts     # 测试文件
│   └── tsconfig.json     # 测试专用TypeScript配置
├── package.json          # 项目依赖和脚本
├── tsconfig.json         # TypeScript配置
├── wrangler-config.js.example # Wrangler配置示例
├── update-wrangler-config.js  # 更新Wrangler配置的脚本
└── vitest.config.mts     # Vitest配置
```

### 开发工作流

1. **本地开发**
   - 使用`pnpm run dev`或`wrangler dev`启动本地开发服务器
   - 实时编辑和测试代码

2. **测试**
   - 使用`pnpm run test`运行测试套件
   - 测试在模拟的Workers环境中执行

3. **部署**
   - 配置`wrangler-config.js`文件
   - 使用`pnpm run deploy`部署到Cloudflare Workers
   - 部署脚本会自动更新wrangler.jsonc并在部署后恢复它

### 配置管理

1. **环境变量**
   - `PROVIDER_CONFIG`：提供商配置，包含基本URL和API密钥
   - `MODEL_PROVIDER_CONFIG`：模型到提供商的映射
   - `SERVICE_API_KEY`：可选的API密钥，用于验证客户端请求

2. **配置文件**
   - `wrangler-config.js`：定义Worker配置和环境变量
   - 使用`update-wrangler-config.js`脚本更新实际的wrangler.jsonc文件

## 技术约束

1. **Cloudflare Workers限制**
   - CPU时间：每次请求最多50ms（免费计划）
   - 内存：最多128MB
   - 环境变量大小：有限制，大型配置需要注意
   - 请求体大小：最大100MB

2. **API提供商限制**
   - 不同提供商有不同的API格式和认证方法
   - 响应格式可能略有不同，需要适配
   - 速率限制和配额因提供商而异

3. **安全考虑**
   - API密钥存储在环境变量中，需要妥善保护
   - 客户端API密钥验证是可选的，但建议启用

## 依赖关系

### 直接依赖

项目没有直接的运行时依赖，这是有意为之的设计决策，以保持Worker的轻量级和高性能。

### 开发依赖

1. **TypeScript**: 类型安全的JavaScript超集
2. **Wrangler**: Cloudflare Workers的CLI工具
3. **Vitest**: 现代测试框架
4. **@cloudflare/vitest-pool-workers**: 在模拟Workers环境中运行测试
5. **@cloudflare/workers-types**: Workers的TypeScript类型定义

## 工具使用模式

1. **TypeScript类型系统**
   - 广泛使用接口定义数据结构
   - 使用类型推断减少冗余类型注释
   - 使用类型守卫确保类型安全

2. **错误处理**
   - 使用try-catch块捕获异常
   - 使用formatErrorResponse函数统一错误响应格式
   - 记录错误到控制台以便调试

3. **配置解析**
   - 使用JSON.parse解析环境变量中的配置
   - 验证配置有效性
   - 提供合理的默认值和错误处理

4. **请求处理**
   - 使用URL对象解析请求URL
   - 根据路径和方法路由请求
   - 使用fetch API转发请求到提供商

5. **响应处理**
   - 直接流式传输提供商响应体
   - 保留原始响应头
   - 格式化错误响应为OpenAI兼容格式
