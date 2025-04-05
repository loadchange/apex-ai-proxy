# Apex AI Proxy 内存库 (Memory Bank)

这个内存库包含了Apex AI Proxy项目的所有关键信息，作为项目的知识库和文档中心。

## 核心文件

内存库由以下核心文件组成，它们共同构成了项目的完整知识体系：

1. [**项目简介 (Project Brief)**](./projectbrief.md)
   - 项目的基础文档
   - 定义核心需求和目标
   - 项目范围的真实来源

2. [**产品背景 (Product Context)**](./productContext.md)
   - 项目存在的原因
   - 解决的问题
   - 用户体验目标
   - 使用场景

3. [**系统模式 (System Patterns)**](./systemPatterns.md)
   - 系统架构
   - 关键技术决策
   - 设计模式
   - 组件关系
   - 关键实现路径

4. [**技术背景 (Tech Context)**](./techContext.md)
   - 使用的技术
   - 开发设置
   - 技术约束
   - 依赖关系
   - 工具使用模式

5. [**活动上下文 (Active Context)**](./activeContext.md)
   - 当前工作重点
   - 最近变更
   - 下一步计划
   - 活动决策和考虑
   - 重要模式和偏好
   - 学习和项目见解

6. [**项目进度 (Progress)**](./progress.md)
   - 当前状态
   - 已完成工作
   - 待完成工作
   - 项目决策演变
   - 已知问题
   - 下一步重点

## 内存库使用指南

这个内存库是项目的知识中心，应该在以下情况下更新：

1. 发现新的项目模式
2. 实施重大变更后
3. 当用户请求更新内存库时
4. 当上下文需要澄清时

更新过程应该包括：

1. 审查所有文件
2. 记录当前状态
3. 澄清下一步
4. 记录见解和模式

## 项目概述

Apex AI Proxy是一个运行在Cloudflare Workers上的免费个人AI网关。它将多个AI服务提供商聚合在一个统一的OpenAI兼容API后面，让用户突破调用频率限制并享受各家服务商的免费配额。

### 核心功能

- 多提供商支持
- 智能请求分发
- 多API密钥管理
- 协议转换
- 错误处理
- CORS支持

### 技术栈

- TypeScript
- Cloudflare Workers
- Wrangler (Cloudflare Workers CLI工具)
