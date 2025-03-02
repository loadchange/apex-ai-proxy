/**
 * Request handlers for the AI service aggregator
 */

import { ModelProviderMapping, ModelsResponse, ChatCompletionRequest, ErrorResponse, Env } from './types';
import { formatErrorResponse, selectProvider } from './utils';

/**
 * Handle /v1/models request
 */
export async function handleModelsRequest(modelProviderConfig: ModelProviderMapping): Promise<Response> {
	const models = Object.keys(modelProviderConfig).map((modelName) => ({
		id: modelName,
		object: 'model',
		created: Math.floor(Date.now() / 1000),
		owned_by: 'apex-ai-proxy',
	}));

	const response: ModelsResponse = {
		object: 'list',
		data: models,
	};

	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

/**
 * Handle /v1/chat/completions request
 */
export async function handleChatCompletionsRequest(
	request: Request,
	modelProviderConfig: ModelProviderMapping,
	env: Env
): Promise<Response> {
	// Parse request body
	let requestBody: ChatCompletionRequest;
	try {
		requestBody = (await request.json()) as ChatCompletionRequest;
	} catch (error) {
		return formatErrorResponse('Invalid request body', 'invalid_request_error', 400);
	}

	// Validate model parameter
	const modelName = requestBody.model;
	if (!modelName) {
		return formatErrorResponse('Model parameter is required', 'invalid_request_error', 400);
	}

	// Check if the requested model exists in our configuration
	const modelConfig = modelProviderConfig[modelName];
	if (!modelConfig || !modelConfig.providers || modelConfig.providers.length === 0) {
		return formatErrorResponse(`Model '${modelName}' not found`, 'model_not_found', 404);
	}

	// Select a provider using random selection
	const selectedProviderInfo = selectProvider(modelConfig);
	if (!selectedProviderInfo) {
		return formatErrorResponse(`No provider available for model '${modelName}'`, 'internal_error', 500);
	}

	const { provider: selectedProvider } = selectedProviderInfo;

	let input = `${selectedProvider.base_url}/chat/completions`;
	const init: RequestInit<RequestInitCfProperties> = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${selectedProvider.api_key}`,
		},
		body: JSON.stringify(Object.assign({}, requestBody, { model: selectedProvider.model })),
	};
	if (selectedProvider.provider === 'azure') {
		input += `?api-version=2024-05-01-preview`;
		(init.headers as any)['api-key'] = selectedProvider.api_key;
	}

	const providerResponse = await fetch(input, init);

	if (!providerResponse.ok) {
		const error = (await providerResponse.json()) as ErrorResponse;
		return formatErrorResponse(
			`[${selectedProvider.provider}] API request failed, message: ${error.error?.message ?? '-'}, meta: ${JSON.stringify(
				selectedProvider
			)}`,
			'internal_server_error',
			providerResponse.status
		);
	}

	return new Response(providerResponse.body, {
		headers: providerResponse.headers,
	});
}
