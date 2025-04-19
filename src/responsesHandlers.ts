/**
 * Request handlers for the OpenAI Responses API
 */

import { ModelProviderMapping, Env } from './types';
import { formatErrorResponse, selectProvider, recordLog } from './utils';

/**
 * Save response information to KV storage
 * @param responseId Response ID
 * @param provider Provider information
 * @param env Environment variables
 * @param log Log function
 */
async function saveResponseToKV(responseId: string, provider: any, env: Env, log: any): Promise<void> {
	// Set TTL to 24 hours (86400 seconds)
	const ttl = 60 * 60 * 24;
	// Save response data to KV, using response_id as the key
	try {
		await env.RESPONSES_KV.put(
			responseId,
			JSON.stringify({
				provider,
				timestamp: Date.now(),
			}),
			{ expirationTtl: ttl }
		);

		log.info({
			action: 'save_response_to_kv',
			response_id: responseId,
			success: true,
		});
	} catch (error) {
		log.error({
			action: 'save_response_to_kv',
			response_id: responseId,
			error: error instanceof Error ? error.message : String(error),
			success: false,
		});
	}
}

/**
 * Handle /v1/responses request - list or create responses
 */
export async function handleResponsesRequest(request: Request, modelProviderConfig: ModelProviderMapping, env: Env): Promise<Response> {
	if (request.method !== 'POST') {
		return formatErrorResponse('Method not allowed', 'method_not_allowed', 405);
	}
	const log = recordLog(request);
	let requestBody;
	let requestText;
	try {
		requestText = await request.text();
		requestBody = JSON.parse(requestText);
	} catch (error) {
		return formatErrorResponse('Invalid request body', 'invalid_request_error', 400);
	}

	const modelName = requestBody.model;
	if (!modelName) {
		return formatErrorResponse('Model parameter is required', 'invalid_request_error', 400);
	}

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

	const selectedProviderInfo = selectProvider(modelConfig);
	if (!selectedProviderInfo) {
		return formatErrorResponse(`No provider available for model '${modelName}'`, 'internal_error', 500);
	}

	const { provider: selectedProvider } = selectedProviderInfo;

	let input = selectedProvider.base_url;
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${selectedProvider.api_key}`,
	};

	if (selectedProvider.provider === 'azure') {
		input += `/openai/responses?api-version=2025-03-01-preview`;
		headers['api-key'] = selectedProvider.api_key;
		delete headers.Authorization;
	} else {
		input += `/responses`;
	}

	const modifiedRequestBody = {
		...requestBody,
		model: selectedProvider.model,
	};

	const init: RequestInit<RequestInitCfProperties> = {
		method: 'POST',
		headers,
		body: JSON.stringify(modifiedRequestBody),
	};

	log.info({ requestBody, provider: selectedProvider.provider, model: selectedProvider.model, endpoint: 'responses', input });

	const providerResponse = await fetch(input, init);

	if (!providerResponse.ok) {
		let error: any;
		try {
			error = await providerResponse.json();
		} catch (e) {
			return formatErrorResponse(
				`[${selectedProvider.provider}] API request failed with status ${providerResponse.status}`,
				'internal_server_error',
				providerResponse.status
			);
		}

		return formatErrorResponse(
			`[${selectedProvider.provider}] API request failed, message: ${error?.error?.message ?? '-'}`,
			'internal_server_error',
			providerResponse.status
		);
	}
	const contentType = providerResponse.headers.get('Content-Type') ?? '';
	if (contentType.includes('text/event-stream')) {
		 // Handle streaming response
		// No longer clone the response, use the original response body directly
		const decoder = new TextDecoder();
		let responseId: string | null = null;

		// Create a transform stream to process and analyze SSE data
		const transformStream = new TransformStream({
			transform: async (chunk, controller) => {
				// Send the original chunk
				controller.enqueue(chunk);

				// Parse data and find response.id
				if (!responseId) {
					const text = decoder.decode(chunk, { stream: true });
					const lines = text.split('\n');

					for (const line of lines) {
						if (line.startsWith('data:')) {
							try {
								const eventData = JSON.parse(line.slice(5));
								if (
									(eventData.type === 'response.created' || eventData.type === 'response.in_progress') &&
									eventData.response?.id
								) {
									responseId = eventData.response.id;
									 // Once ID is found, save to KV immediately
									await saveResponseToKV(responseId!, selectedProvider, env, log);
									break;
								}
							} catch (e) {
								 // Parsing error, continue to the next line
							}
						}
					}
				}
			}
		});

		// Set up the streaming response, using the original response body directly
		return new Response(providerResponse.body?.pipeThrough(transformStream), {
			headers: providerResponse.headers
		});
	}

	if (contentType.includes('application/json')) {
		// Clone the response before reading the body
		const responseClone = providerResponse.clone();

		// Log the response body without disturbing the original stream
		const responseData: any = await responseClone.json();
		// .then((responseData) => {
		log.info({
			endpoint: '/v1/responses',
			responseData,
		});
		// response_id =>  cloudflare KV
		if (responseData.id) {
			await saveResponseToKV(responseData.id, selectedProvider, env, log);
		}
	}

	return new Response(providerResponse.body, {
		headers: providerResponse.headers,
	});
}

/**
 * Handle /v1/responses/{response_id} request - get, modify or delete a specific response
 */
export async function handleResponseByIdRequest(request: Request, responseId: string, env: Env): Promise<Response> {
	if (!['GET', 'DELETE'].includes(request.method)) {
		return formatErrorResponse('Method not allowed', 'method_not_allowed', 405);
	}
	const log = recordLog(request);
	// KV -> response_id
	const kvProviderInfo = await env.RESPONSES_KV.getWithMetadata(responseId, 'json');
	if (!kvProviderInfo) {
		return formatErrorResponse(`Response ID '${responseId}' not found`, 'response_not_found', 404);
	}
	log.info({
		action: 'get_response_from_kv',
		response_id: responseId,
		success: true,
		body: kvProviderInfo,
	});
	const selectedProvider = (kvProviderInfo?.value as any)?.provider ?? null;
	if (!selectedProvider) {
		return formatErrorResponse(`Response ID '${responseId}' not found`, 'response_not_found', 404);
	}

	let input = selectedProvider.base_url;
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${selectedProvider.api_key}`,
	};

	if (selectedProvider.provider === 'azure') {
		input += `/openai/responses/${responseId}?api-version=2025-03-01-preview`;
		headers['api-key'] = selectedProvider.api_key;
		delete headers.Authorization;
	} else {
		input += `/responses/${responseId}`;
	}

	const init: RequestInit<RequestInitCfProperties> = {
		method: request.method,
		headers,
	};

	log.info({ provider: selectedProvider.provider, model: selectedProvider.model, endpoint: `responses/${responseId}`, input });

	const providerResponse = await fetch(input, init);

	if (!providerResponse.ok) {
		let error: any;
		try {
			error = await providerResponse.json();
		} catch (e) {
			return formatErrorResponse(
				`[${selectedProvider.provider}] API request failed with status ${providerResponse.status}`,
				'internal_server_error',
				providerResponse.status
			);
		}

		return formatErrorResponse(
			`[${selectedProvider.provider}] API request failed, message: ${error?.error?.message ?? '-'}`,
			'internal_server_error',
			providerResponse.status
		);
	}

	return new Response(providerResponse.body, {
		headers: providerResponse.headers,
	});
}

/**
 * Handle /v1/responses/{response_id}/input_items request - get the input items of a specific response
 */
export async function handleResponseInputItemsRequest(request: Request, responseId: string, env: Env): Promise<Response> {
	if (request.method !== 'GET') {
		return formatErrorResponse('Method not allowed', 'method_not_allowed', 405);
	}
	const log = recordLog(request);
	// KV -> response_id
	const kvProviderInfo = await env.RESPONSES_KV.getWithMetadata(responseId, 'json');
	if (!kvProviderInfo) {
		return formatErrorResponse(`Response ID '${responseId}' not found`, 'response_not_found', 404);
	}
	log.info({
		action: 'get_response_from_kv',
		response_id: responseId,
		success: true,
		body: kvProviderInfo,
	});
	const selectedProvider = (kvProviderInfo?.value as any)?.provider ?? null;
	if (!selectedProvider) {
		return formatErrorResponse(`Response ID '${responseId}' not found`, 'response_not_found', 404);
	}

	let input = selectedProvider.base_url;
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${selectedProvider.api_key}`,
	};

	if (selectedProvider.provider === 'azure') {
		input += `/openai/responses/${responseId}/input_items?api-version=2025-03-01-preview`;
		headers['api-key'] = selectedProvider.api_key;
		delete headers.Authorization;
	} else {
		input += `/responses/${responseId}/input_items`;
	}

	const init: RequestInit<RequestInitCfProperties> = {
		method: 'GET',
		headers,
	};

	log.info({ provider: selectedProvider.provider, model: selectedProvider.model, endpoint: `responses/${responseId}/input_items`, input });

	const providerResponse = await fetch(input, init);

	if (!providerResponse.ok) {
		let error: any;
		try {
			error = await providerResponse.json();
		} catch (e) {
			return formatErrorResponse(
				`[${selectedProvider.provider}] API request failed with status ${providerResponse.status}`,
				'internal_server_error',
				providerResponse.status
			);
		}

		return formatErrorResponse(
			`[${selectedProvider.provider}] API request failed, message: ${error?.error?.message ?? '-'}`,
			'internal_server_error',
			providerResponse.status
		);
	}

	return new Response(providerResponse.body, {
		headers: providerResponse.headers,
	});
}
