// 网站翻译文件
const translations = {
    en: {
        // 导航
        "nav_features": "Features",
        "nav_how_it_works": "How It Works",
        "nav_getting_started": "Getting Started",
        "nav_config_tool": "Config Tool",
        "nav_github": "GitHub",

        // 英雄区域
        "hero_title": "🚀 Your Free Personal AI Gateway",
        "hero_subtitle": "Aggregate multiple AI service providers, overcome rate limits, and maximize free quotas",
        "hero_btn_start": "Get Started",
        "hero_btn_star": "Star Us ⭐",
        "hero_stars": "Stars",
        "hero_forks": "Forks",
        "hero_loading": "Loading...",

        // 特性部分
        "features_title": "Why Choose Apex AI Proxy?",
        "feature_free_title": "Completely Free",
        "feature_free_desc": "Runs entirely on Cloudflare Workers' free plan, no cost involved",
        "feature_balance_title": "Load Balancing",
        "feature_balance_desc": "Intelligently distributes requests across multiple providers to overcome rate limits",
        "feature_quota_title": "Maximize Free Quotas",
        "feature_quota_desc": "Take advantage of free tiers from different AI providers, saving costs",
        "feature_keys_title": "Multiple API Keys",
        "feature_keys_desc": "Register multiple keys for the same service provider to further increase limits",
        "feature_compat_title": "OpenAI Client Compatible",
        "feature_compat_desc": "Works with any library that speaks OpenAI's API format, no code changes needed",
        "feature_providers_title": "Multi-Provider Support",
        "feature_providers_desc": "Aggregate Azure, DeepSeek, Aliyun, and more behind one unified API",

        // 工作原理部分
        "how_title": "How It Works",
        "how_step1_title": "Configure Providers",
        "how_step1_desc": "Configure your AI service providers and API keys in wrangler-config.js",
        "how_step2_title": "Deploy to Cloudflare",
        "how_step2_desc": "Deploy your proxy to Cloudflare Workers with a simple command",
        "how_step3_title": "Use Unified API",
        "how_step3_desc": "Send requests through the OpenAI-compatible API, the proxy automatically routes to available providers",
        "how_step4_title": "Break Limits",
        "how_step4_desc": "Enjoy higher request limits and lower costs while maintaining API consistency",

        // 快速开始部分
        "start_title": "Get Started in 60 Seconds",
        "start_step1": "1. Clone Repository",
        "start_step2": "2. Install Dependencies",
        "start_step3": "3. Configure Providers",
        "start_step3_desc": "Configure your providers and API keys in <code>wrangler-config.js</code>, or use our <a href='#config-tool'>visual configuration tool</a>",
        "start_step4": "4. Deploy to Cloudflare Workers",
        "start_deploy": "Deploy to Cloudflare Now",

        // 使用示例部分
        "usage_title": "Usage Examples",

        // 配置工具部分
        "config_title": "Visual Configuration Tool",
        "config_desc": "Easily create your wrangler-config.js file with our visual tool",
        "config_providers": "Provider Configuration",
        "config_provider_name": "Provider Name",
        "config_provider_name_placeholder": "e.g., openai, azure, aliyuncs",
        "config_base_url": "Base URL",
        "config_base_url_placeholder": "e.g., https://api.openai.com/v1",
        "config_api_keys": "API Keys (one per line)",
        "config_api_keys_placeholder": "Enter your API keys, one per line",
        "config_models": "Model Configuration",
        "config_model_name": "Model Name",
        "config_model_name_placeholder": "e.g., gpt-4, DeepSeek-R1",
        "config_model_provider": "Provider",
        "config_select_provider": "Select Provider",
        "config_provider_model": "Provider Model Name",
        "config_provider_model_placeholder": "Model name used by the provider",
        "config_service_key": "Service API Key",
        "config_service_key_placeholder": "Set an API key for accessing your proxy",
        "config_generate_key": "Generate Random Key",
        "config_generate": "Generate Configuration",
        "config_preview": "Configuration Preview",
        "config_preview_placeholder": "// Your configuration will appear here\n// Fill out the form and click \"Generate Configuration\"",
        "config_download": "Download Config File",
        "config_reset": "Reset Form",
        "btn_add": "Add",
        "btn_remove": "Remove",
        "btn_add_provider": "Add Provider",
        "btn_add_model": "Add Model",
        "btn_add_model_provider": "Add Provider",
        "btn_collapse_all": "Collapse All",
        "btn_expand_all": "Expand All",

        // Star 项目部分
        "star_title": "Like This Project?",
        "star_desc": "If Apex AI Proxy has helped you, please consider giving our GitHub repository a Star ⭐<br>It's crucial for our project's growth and continuous improvement!",
        "star_benefit1": "Help more people discover this project",
        "star_benefit2": "Support open source development",
        "star_benefit3": "Get notified of project updates",

        // 页脚部分
        "footer_project": "Project",
        "footer_repo": "GitHub Repository",
        "footer_issues": "Issue Feedback",
        "footer_license": "MIT License",
        "footer_resources": "Resources",
        "footer_links": "Related Links",
        "footer_cf_workers": "Cloudflare Workers",
        "footer_openai_docs": "OpenAI API Docs",
        "footer_copyright": "© 2024 Apex AI Proxy. Based on",

        // 其他
        "language": "Language",
        "loading_failed": "Failed to load",
        "min_provider": "At least one provider is required",
        "min_model": "At least one model is required",
        "min_model_provider": "Each model needs at least one provider",
        "copied": "Copied!",
        "toggle_details": "Toggle Details"
    },
    zh: {
        // 导航
        "nav_features": "特性",
        "nav_how_it_works": "工作原理",
        "nav_getting_started": "快速开始",
        "nav_config_tool": "配置工具",
        "nav_github": "GitHub",

        // 英雄区域
        "hero_title": "🚀 您的免费个人 AI 网关",
        "hero_subtitle": "聚合多个 AI 服务提供商，突破调用频率限制，最大化免费配额",
        "hero_btn_start": "快速开始",
        "hero_btn_star": "给我们 Star ⭐",
        "hero_stars": "Stars",
        "hero_forks": "Forks",
        "hero_loading": "加载中...",

        // 特性部分
        "features_title": "为什么选择 Apex AI Proxy?",
        "feature_free_title": "完全免费",
        "feature_free_desc": "完全运行在 Cloudflare Workers 的免费计划上，无需支付任何费用",
        "feature_balance_title": "负载均衡",
        "feature_balance_desc": "在多个提供商之间智能分配请求，突破单一服务的频率限制",
        "feature_quota_title": "最大化免费配额",
        "feature_quota_desc": "充分利用不同 AI 提供商的免费额度，节省成本",
        "feature_keys_title": "多 API 密钥支持",
        "feature_keys_desc": "为同一服务提供商注册多个密钥，进一步提高使用限制",
        "feature_compat_title": "OpenAI 客户端兼容",
        "feature_compat_desc": "适用于任何使用 OpenAI API 格式的库，无需修改现有代码",
        "feature_providers_title": "多提供商支持",
        "feature_providers_desc": "将 Azure、DeepSeek、阿里云等多家服务聚合在一个 API 后面",

        // 工作原理部分
        "how_title": "工作原理",
        "how_step1_title": "配置提供商",
        "how_step1_desc": "在 wrangler-config.js 中配置您的 AI 服务提供商和 API 密钥",
        "how_step2_title": "部署到 Cloudflare",
        "how_step2_desc": "使用简单的命令将您的代理部署到 Cloudflare Workers",
        "how_step3_title": "使用统一 API",
        "how_step3_desc": "通过 OpenAI 兼容的 API 发送请求，代理会自动路由到可用的提供商",
        "how_step4_title": "突破限制",
        "how_step4_desc": "享受更高的请求限制和更低的成本，同时保持 API 的一致性",

        // 快速开始部分
        "start_title": "60 秒快速开始",
        "start_step1": "1. 克隆仓库",
        "start_step2": "2. 安装依赖",
        "start_step3": "3. 配置提供商",
        "start_step3_desc": "在 <code>wrangler-config.js</code> 中配置您的提供商和 API 密钥，或使用我们的<a href='#config-tool'>可视化配置工具</a>",
        "start_step4": "4. 部署到 Cloudflare Workers",
        "start_deploy": "立即部署到 Cloudflare",

        // 使用示例部分
        "usage_title": "使用示例",

        // 配置工具部分
        "config_title": "可视化配置工具",
        "config_desc": "使用我们的可视化工具轻松创建您的 wrangler-config.js 文件",
        "config_providers": "提供商配置",
        "config_provider_name": "提供商名称",
        "config_provider_name_placeholder": "例如: openai, azure, aliyuncs",
        "config_base_url": "基础 URL",
        "config_base_url_placeholder": "例如: https://api.openai.com/v1",
        "config_api_keys": "API 密钥 (每行一个)",
        "config_api_keys_placeholder": "输入您的 API 密钥，每行一个",
        "config_models": "模型配置",
        "config_model_name": "模型名称",
        "config_model_name_placeholder": "例如: gpt-4, DeepSeek-R1",
        "config_model_provider": "提供商",
        "config_select_provider": "选择提供商",
        "config_provider_model": "提供商模型名称",
        "config_provider_model_placeholder": "提供商使用的模型名称",
        "config_service_key": "服务 API 密钥",
        "config_service_key_placeholder": "设置一个用于访问您的代理的 API 密钥",
        "config_generate_key": "生成随机密钥",
        "config_generate": "生成配置",
        "config_preview": "配置预览",
        "config_preview_placeholder": "// 您的配置将在这里显示\n// 填写表单并点击\"生成配置\"按钮",
        "config_download": "下载配置文件",
        "config_reset": "重置表单",
        "btn_add": "添加",
        "btn_remove": "删除",
        "btn_add_provider": "添加提供商",
        "btn_add_model": "添加模型",
        "btn_add_model_provider": "添加提供商",
        "btn_collapse_all": "全部折叠",
        "btn_expand_all": "全部展开",

        // Star 项目部分
        "star_title": "喜欢这个项目吗？",
        "star_desc": "如果 Apex AI Proxy 对您有所帮助，请考虑给我们的 GitHub 仓库点个 Star ⭐<br>这对我们的项目发展和持续改进非常重要！",
        "star_benefit1": "帮助更多人发现这个项目",
        "star_benefit2": "支持开源开发",
        "star_benefit3": "获取项目更新通知",

        // 页脚部分
        "footer_project": "项目",
        "footer_repo": "GitHub 仓库",
        "footer_issues": "问题反馈",
        "footer_license": "MIT 许可证",
        "footer_resources": "资源",
        "footer_links": "相关链接",
        "footer_cf_workers": "Cloudflare Workers",
        "footer_openai_docs": "OpenAI API 文档",
        "footer_copyright": "© 2024 Apex AI Proxy. 基于",

        // 其他
        "language": "语言",
        "loading_failed": "获取失败",
        "min_provider": "至少需要一个提供商",
        "min_model": "至少需要一个模型",
        "min_model_provider": "每个模型至少需要一个提供商",
        "copied": "已复制！",
        "toggle_details": "切换详情"
    }
};
