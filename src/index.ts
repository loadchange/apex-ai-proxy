import { AzureConfig, AzureErrorResponse, ChatCompletionRequest, Env, ModelInfo, ModelsResponse } from './types';

class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

async function handleModels(configs: AzureConfig[]): Promise<Response> {
	const models: ModelInfo[] = [];
	const currentTime = Math.floor(Date.now() / 1000);

	configs.forEach((config) => {
		config.deploymentNames.forEach((name) => {
			models.push({
				id: name,
				object: 'model',
				created: currentTime,
				owned_by: 'azure',
			});
		});
	});

	const response: ModelsResponse = {
		object: 'list',
		data: models,
	};

	return new Response(JSON.stringify(response), {
		headers: { 'Content-Type': 'application/json' },
	});
}

async function handleChatCompletions(requestBody: ChatCompletionRequest, config: AzureConfig, modelName: string): Promise<Response> {
	const azureEndpoint = `https://${config.endpoint}.${config.protocol}.azure.com/${
		{
			openai: `openai/deployments/${modelName}`,
			'services.ai': `models`,
		}[config.protocol]
	}/chat/completions?api-version=2024-05-01-preview`;

	const headers = new Headers({
		'Content-Type': 'application/json',
		'api-key': config.apiKey,
	});

	const response = await fetch(azureEndpoint, {
		method: 'POST',
		headers,
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		const error = (await response.json()) as AzureErrorResponse;
		throw new ApiError(response.status, error.error?.message || 'Azure API request failed');
	}

	return new Response(response.body, {
		headers: response.headers,
	});
}

function findConfigForDeployment(configs: AzureConfig[], deploymentName: string): AzureConfig | undefined {
	return configs.find((config) => config.deploymentNames.includes(deploymentName));
}

function parseConfigs(env: Env): AzureConfig[] {
	try {
		const configs = JSON.parse(env.AZURE_CONFIGS);
		if (!Array.isArray(configs)) {
			throw new Error('AZURE_CONFIGS must be an array');
		}
		return configs;
	} catch (error) {
		throw new ApiError(500, 'Invalid AZURE_CONFIGS configuration');
	}
}

function validateApiKey(request: Request, env: Env) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		throw new ApiError(401, 'Missing Authorization header');
	}

	const clientApiKey = authHeader.split(' ')[1];
	if ((clientApiKey ?? '').trim() !== env.SERVICE_API_KEY) {
		throw new ApiError(401, 'Invalid API key');
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			validateApiKey(request, env);
			const url = new URL(request.url);
			const configs = parseConfigs(env);

			// Handle /models endpoint
			if (url.pathname === '/v1/models' && request.method === 'GET') {
				return handleModels(configs);
			}

			// Handle chat completions
			if (url.pathname.startsWith('/v1/chat/completions') && request.method === 'POST') {
				const body = (await request.json()) as ChatCompletionRequest;
				const model = body.model;

				if (!model) {
					throw new ApiError(400, 'model is required');
				}

				const config = findConfigForDeployment(configs, model);
				if (!config) {
					throw new ApiError(404, `Model ${model} not found`);
				}

				return handleChatCompletions(body, config, model);
			}

			throw new ApiError(404, 'Not found');
		} catch (error) {
			if (error instanceof ApiError) {
				return new Response(
					JSON.stringify({
						error: {
							message: error.message,
							type: 'invalid_request_error',
							code: error.status,
						},
					}),
					{
						status: error.status,
						headers: { 'Content-Type': 'application/json' },
					}
				);
			}

			return new Response(
				JSON.stringify({
					error: {
						message: 'Internal server error',
						type: 'internal_server_error',
						code: 500,
					},
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;
