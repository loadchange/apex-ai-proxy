/**
 * Request handlers for the AI service aggregator
 */

import { ModelProviderMapping, ModelsResponse, ChatCompletionRequest, ErrorResponse, Env, OpenAIEmbeddingsRequest } from './types';
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
	let modelConfig = modelProviderConfig[modelName];

	if (!modelConfig && modelName.indexOf('#') > 0) {
		const [model, providerName] = modelName.split('#');
		const providerConfig = JSON.parse(env.PROVIDER_CONFIG)[providerName];
		if (providerConfig && Array.isArray(providerConfig.api_keys)) {
			modelConfig = {
				providers: [
					{
						provider: providerName,
						base_url: providerConfig.base_url,
						api_key: providerConfig.api_keys[0],
						api_keys: providerConfig.api_keys,
						model,
					},
				],
			};
		}
	}

	if (!modelConfig || !modelConfig.providers || modelConfig.providers.length === 0) {
		return formatErrorResponse(`Model '${modelName}' not found`, 'model_not_found', 404);
	}

	// Select a provider using random selection
	const selectedProviderInfo = selectProvider(modelConfig);
	if (!selectedProviderInfo) {
		return formatErrorResponse(`No provider available for model '${modelName}'`, 'internal_error', 500);
	}

	const { provider: selectedProvider } = selectedProviderInfo;

	requestBody.messages = (requestBody.messages || []).filter((message) => {
		return message.content;
	});

	let input = selectedProvider.base_url;
	const init: RequestInit<RequestInitCfProperties> = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${selectedProvider.api_key}`,
		},
		body: JSON.stringify(Object.assign({ temperature: 0 }, requestBody, { model: selectedProvider.model })),
	};
	if (selectedProvider.provider === 'azure') {
		input += `/openai/deployments/${selectedProvider.model}/chat/completions?api-version=2025-01-01-preview`;
		(init.headers as any)['api-key'] = selectedProvider.api_key;
	} else {
		input += '/chat/completions';
	}
	const { cf } = request;
	const { city, country } = cf || {};
	console.log({
		city,
		country,
		provider: selectedProvider.provider,
		model: selectedProvider.model,
		dateTime: new Date().toLocaleString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}),
	});

	const providerResponse = await fetch(input, init);

	if (!providerResponse.ok) {
		const error = (await providerResponse.json()) as ErrorResponse;
		return formatErrorResponse(
			`[${selectedProvider.provider} error] API request failed, message: ${error.error?.message ?? '-'}, meta: ${JSON.stringify(
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

/**
 * Handle /v1/embeddings request
 */
export async function handleEmbeddingsRequest(request: Request, modelProviderConfig: ModelProviderMapping, env: Env): Promise<Response> {
	// Parse request body
	let requestBody: OpenAIEmbeddingsRequest;
	try {
		requestBody = (await request.json()) as OpenAIEmbeddingsRequest;
	} catch (error) {
		return formatErrorResponse('Invalid request body', 'invalid_request_error', 400);
	}

	// Validate model parameter
	const modelName = requestBody.model;
	if (!modelName) {
		return formatErrorResponse('Model parameter is required', 'invalid_request_error', 400);
	}

	// Validate input parameter
	if (!requestBody.input || (typeof requestBody.input !== 'string' && !Array.isArray(requestBody.input))) {
		return formatErrorResponse('Input parameter is required and must be a string or array of strings', 'invalid_request_error', 400);
	}

	// Check if the requested model exists in our configuration
	let modelConfig = modelProviderConfig[modelName];

	if (!modelConfig && modelName.indexOf('#') > 0) {
		const [model, providerName] = modelName.split('#');
		const providerConfig = JSON.parse(env.PROVIDER_CONFIG)[providerName];
		if (providerConfig && Array.isArray(providerConfig.api_keys)) {
			modelConfig = {
				providers: [
					{
						provider: providerName,
						base_url: providerConfig.base_url,
						api_key: providerConfig.api_keys[0],
						api_keys: providerConfig.api_keys,
						model,
					},
				],
			};
		}
	}

	if (!modelConfig || !modelConfig.providers || modelConfig.providers.length === 0) {
		return formatErrorResponse(`Model '${modelName}' not found`, 'model_not_found', 404);
	}

	// Select a provider using random selection
	const selectedProviderInfo = selectProvider(modelConfig);
	if (!selectedProviderInfo) {
		return formatErrorResponse(`No provider available for model '${modelName}'`, 'internal_error', 500);
	}

	const { provider: selectedProvider } = selectedProviderInfo;

	// Construct the embeddings endpoint URL based on the provider
	let input = selectedProvider.base_url;
	const init: RequestInit<RequestInitCfProperties> = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${selectedProvider.api_key}`,
		},
		body: JSON.stringify(Object.assign({}, requestBody, { model: selectedProvider.model })),
	};

	// Handle Azure-specific endpoint format
	if (selectedProvider.provider === 'azure') {
		input += `/openai/deployments/${selectedProvider.model}/embeddings?api-version=2023-05-15`;
		(init.headers as any)['api-key'] = selectedProvider.api_key;
	} else {
		input += '/embeddings';
	}

	// Log request information
	const { cf } = request;
	const { city, country } = cf || {};
	console.log({
		city,
		country,
		provider: selectedProvider.provider,
		model: selectedProvider.model,
		endpoint: 'embeddings',
		dateTime: new Date().toLocaleString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}),
	});

	// Forward the request to the selected provider
	const providerResponse = await fetch(input, init);

	// Handle error responses
	if (!providerResponse.ok) {
		let error: ErrorResponse;
		try {
			error = (await providerResponse.json()) as ErrorResponse;
		} catch (e) {
			// If we can't parse the error response, create a generic one
			return formatErrorResponse(
				`[${selectedProvider.provider}] API request failed with status ${providerResponse.status}`,
				'internal_server_error',
				providerResponse.status
			);
		}

		return formatErrorResponse(
			`[${selectedProvider.provider}] API request failed, message: ${error.error?.message ?? '-'}, meta: ${JSON.stringify(
				selectedProvider
			)}`,
			'internal_server_error',
			providerResponse.status
		);
	}

	// Return the provider's response
	return new Response(providerResponse.body, {
		headers: providerResponse.headers,
	});
}
