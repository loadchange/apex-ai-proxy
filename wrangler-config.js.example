const modelProviderConfig = {
	'DeepSeek-R1': {
		providers: [
			{
				provider: 'aliyuncs',
				base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
				api_key: 'sk-xxx',
				model: 'deepseek-r1',
			},
			{
				provider: 'deepinfra',
				base_url: 'https://api.deepinfra.com/v1/openai',
				api_key: 'xxx',
				model: 'deepseek-ai/DeepSeek-R1',
			},
			{
				provider: 'azure',
				base_url: 'https://minjpe3817342715.services.ai.azure.com/models',
				api_key: 'xxx',
				model: 'DeepSeek-R1',
			},
		],
	},
	'Qwen-Max': {
		providers: [
			{
				provider: 'aliyuncs',
				base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
				api_key: 'sk-xxx',
				model: 'qwen-max',
			},
			{
				provider: 'alibabacloud',
				base_url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
				api_key: 'sk-xxx',
				model: 'qwen-max',
			},
		],
	},
	'gpt-4o-mini': {
		providers: [
			{
				provider: 'azure',
				base_url: 'https://min-us-east2.openai.azure.com/openai/deployments/gpt-4o-mini',
				api_key: 'xxx',
				model: 'gpt-4o-mini',
			},
		],
	},
	// Embeddings models
	'text-embedding-ada-002': {
		providers: [
			{
				provider: 'openai',
				base_url: 'https://api.openai.com/v1',
				api_key: 'sk-xxx',
				model: 'text-embedding-ada-002',
			},
			{
				provider: 'azure',
				base_url: 'https://your-azure-endpoint.openai.azure.com/openai/deployments/text-embedding-ada-002',
				api_key: 'xxx',
				model: 'text-embedding-ada-002',
			},
		],
	},
	'text-embedding-3-small': {
		providers: [
			{
				provider: 'openai',
				base_url: 'https://api.openai.com/v1',
				api_key: 'sk-xxx',
				model: 'text-embedding-3-small',
			},
		],
	},
};

// API keys
const serviceApiKey = 'sk-4e5212a130ccb594f68ad050ac43423cacb48e85';

// Main configuration object
// ========================
const config = {
	$schema: 'node_modules/wrangler/config-schema.json',
	name: 'apex-ai-proxy',
	main: 'src/index.ts',
	compatibility_date: '2025-02-14',
	observability: {
		enabled: true,
	},
	vars: {
		// Convert complex objects to JSON strings
		MODEL_PROVIDER_CONFIG: JSON.stringify(modelProviderConfig),
		SERVICE_API_KEY: serviceApiKey,
	},
};

// Convert the config to a JSON string with proper formatting
const configJson = JSON.stringify(config, null, 2);

// Export the config objects and JSON string
module.exports = {
	// Original JavaScript objects
	modelProviderConfig,
	config,
	// JSON string for wrangler.jsonc
	configJson,
	serviceApiKey,
};

// Usage:
// 1. Edit this file to define your configuration
// 2. Run the update-wrangler-config.js script to update wrangler.jsonc:
//    node update-wrangler-config.js
