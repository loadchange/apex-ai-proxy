/**
 * Anthropic API handlers for the AI service aggregator
 */

import { ModelProviderMapping, ErrorResponse, Env, AnthropicMessagesRequest, AnthropicMessage, AnthropicContentBlock, ChatMessage, ChatCompletionRequest } from './types';
import { formatErrorResponse, selectProvider } from './utils';

/**
 * Handle /v1/messages request (Anthropic API compatible)
 */
export async function handleAnthropicMessagesRequest(
	request: Request,
	modelProviderConfig: ModelProviderMapping,
	env: Env
): Promise<Response> {
	// Parse request body
	let requestBody: AnthropicMessagesRequest;
	try {
		requestBody = (await request.json()) as AnthropicMessagesRequest;
	} catch (error) {
		return formatErrorResponse('Invalid request body', 'invalid_request_error', 400);
	}

	// Validate required parameters
	const modelName = requestBody.model;
	if (!modelName) {
		return formatErrorResponse('Model parameter is required', 'invalid_request_error', 400);
	}

	if (!requestBody.max_tokens) {
		return formatErrorResponse('max_tokens parameter is required', 'invalid_request_error', 400);
	}

	if (!requestBody.messages || !Array.isArray(requestBody.messages) || requestBody.messages.length === 0) {
		return formatErrorResponse('Messages parameter is required and must be a non-empty array', 'invalid_request_error', 400);
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

	// Convert request based on provider type
	let convertedRequest: any;
	let endpoint: string;

	if (selectedProvider.provider === 'anthropic') {
		// Direct Anthropic API call - no conversion needed
		convertedRequest = {
			...requestBody,
			model: selectedProvider.model,
		};
		endpoint = '/v1/messages';
	} else {
		// Convert Anthropic format to OpenAI format for other providers
		convertedRequest = convertAnthropicToOpenAI(requestBody, selectedProvider.model);
		endpoint = '/chat/completions';
	}

	// Construct the API URL
	let apiUrl = selectedProvider.base_url;
	const init: RequestInit<RequestInitCfProperties> = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(convertedRequest),
	};

	// Handle provider-specific authentication and URL construction
	if (selectedProvider.provider === 'azure') {
		apiUrl += /\/models$/.test(apiUrl)
			? `/chat/completions?api-version=2024-05-01-preview`
			: `/openai/deployments/${selectedProvider.model}/chat/completions?api-version=2025-01-01-preview`;
		(init.headers as any)['api-key'] = selectedProvider.api_key;
	} else if (selectedProvider.provider === 'anthropic') {
		apiUrl += endpoint;
		(init.headers as any)['x-api-key'] = selectedProvider.api_key;
		(init.headers as any)['anthropic-version'] = '2023-06-01';
	} else {
		// Default to OpenAI-compatible providers
		apiUrl += endpoint;
		(init.headers as any)['Authorization'] = `Bearer ${selectedProvider.api_key}`;
	}

	// Log request information
	const { cf } = request;
	const { city, country } = cf || {};
	console.log({
		city,
		country,
		provider: selectedProvider.provider,
		model: selectedProvider.model,
		endpoint: '/v1/messages',
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
	const providerResponse = await fetch(apiUrl, init);

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

	// For non-Anthropic providers, we need to convert the OpenAI response back to Anthropic format
	if (selectedProvider.provider !== 'anthropic') {
		if (requestBody.stream) {
			// Handle streaming response conversion from OpenAI to Anthropic format
			return handleStreamingResponse(providerResponse, requestBody);
		} else {
			// Handle non-streaming response
			const openAIResponse = await providerResponse.json();
			const anthropicResponse = convertOpenAIToAnthropic(openAIResponse, false);
			return new Response(JSON.stringify(anthropicResponse), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	}

	// Return the provider's response for Anthropic, but ensure proper JSON formatting
	if (requestBody.stream) {
		// For streaming responses, pass through the response body directly
		return new Response(providerResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Access-Control-Allow-Origin': '*',
			},
		});
	} else {
		// For non-streaming responses, parse and return JSON
		const anthropicResponse = await providerResponse.json();
		return new Response(JSON.stringify(anthropicResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

/**
 * Convert Anthropic messages format to OpenAI chat completions format
 */
function convertAnthropicToOpenAI(anthropicRequest: AnthropicMessagesRequest, model: string): ChatCompletionRequest {
	// Convert messages
	const messages: ChatMessage[] = [];

	// Add system message if present
	if (anthropicRequest.system) {
		let systemContent: string;
		if (typeof anthropicRequest.system === 'string') {
			systemContent = anthropicRequest.system;
		} else if (Array.isArray(anthropicRequest.system)) {
			// Handle array format - extract text content
			systemContent = anthropicRequest.system
				.filter(block => block.type === 'text')
				.map(block => block.text)
				.join('\n');
		} else {
			// Fallback to string conversion
			systemContent = String(anthropicRequest.system);
		}

		messages.push({
			role: 'system',
			content: systemContent,
		});
	}

	// Convert Anthropic messages to OpenAI format
	for (const msg: AnthropicMessage of anthropicRequest.messages) {
		if (typeof msg.content === 'string') {
			messages.push({
				role: msg.role,
				content: msg.content,
			});
		} else if (Array.isArray(msg.content)) {
			// Handle content blocks (text, image, etc.)
			const contentParts: any[] = [];
			for (const block: AnthropicContentBlock of msg.content) {
				if (block.type === 'text') {
					contentParts.push({
						type: 'text',
						text: block.text,
					});
				} else if (block.type === 'image' && block.source) {
					contentParts.push({
						type: 'image_url',
						image_url: {
							url: `data:${block.source.media_type};base64,${block.source.data}`,
						},
					});
				}
			}
			messages.push({
				role: msg.role,
				content: contentParts.length === 1 && contentParts[0].type === 'text'
					? contentParts[0].text
					: contentParts,
			});
		}
	}

	return {
		model,
		messages,
		max_tokens: anthropicRequest.max_tokens,
		temperature: anthropicRequest.temperature,
		top_p: anthropicRequest.top_p,
		stop: anthropicRequest.stop_sequences,
		stream: anthropicRequest.stream,
	};
}

/**
 * Convert OpenAI response format to Anthropic messages format
 */
function convertOpenAIToAnthropic(openAIResponse: any, isStream?: boolean): any {
	if (isStream) {
		// Handle streaming response - this would need more complex implementation
		// For now, return the response as-is
		return openAIResponse;
	}

	const choice = openAIResponse.choices?.[0];
	if (!choice) {
		throw new Error('No choices in OpenAI response');
	}

	const content = choice.message?.content || '';

	// Generate proper Anthropic message ID format
	const messageId = openAIResponse.id ?
		`msg_${openAIResponse.id.replace(/^chatcmpl-/, '').substring(0, 22)}` :
		`msg_${Math.random().toString(36).substring(2, 24)}`;

	// Map OpenAI finish_reason to Anthropic stop_reason
	let stopReason: string;
	switch (choice.finish_reason) {
		case 'stop':
			stopReason = 'end_turn';
			break;
		case 'length':
			stopReason = 'max_tokens';
			break;
		case 'content_filter':
			stopReason = 'stop_sequence';
			break;
		case 'tool_calls':
			stopReason = 'tool_use';
			break;
		default:
			stopReason = 'end_turn';
	}

	return {
		id: messageId,
		type: 'message',
		role: 'assistant',
		content: [
			{
				type: 'text',
				text: content,
			},
		],
		model: openAIResponse.model,
		stop_reason: stopReason,
		stop_sequence: null,
		usage: {
			input_tokens: openAIResponse.usage?.prompt_tokens || 0,
			output_tokens: openAIResponse.usage?.completion_tokens || 0,
		},
	};
}

/**
 * Handle streaming response conversion from OpenAI to Anthropic format
 */
async function handleStreamingResponse(providerResponse: Response, requestBody: AnthropicMessagesRequest): Promise<Response> {
	// Create a readable stream to transform OpenAI SSE to Anthropic SSE format
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const reader = providerResponse.body?.getReader();
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();

	// Generate message ID for Anthropic format
	const messageId = `msg_${Math.random().toString(36).substring(2, 24)}`;

	// Process the stream
	(async () => {
		try {
			if (!reader) throw new Error('No response body reader');

			// Send initial message start event
			await writer.write(encoder.encode(`event: message_start\ndata: ${JSON.stringify({
				type: 'message_start',
				message: {
					id: messageId,
					type: 'message',
					role: 'assistant',
					content: [],
					model: requestBody.model,
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 0, output_tokens: 0 }
				}
			})}\n\n`));

			// Send content block start
			await writer.write(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify({
				type: 'content_block_start',
				index: 0,
				content_block: { type: 'text', text: '' }
			})}\n\n`));

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') {
							// Send content block stop and message stop events
							await writer.write(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify({
								type: 'content_block_stop',
								index: 0
							})}\n\n`));
							await writer.write(encoder.encode(`event: message_stop\ndata: ${JSON.stringify({
								type: 'message_stop'
							})}\n\n`));
							continue;
						}

						try {
							const openAIChunk = JSON.parse(data);
							const delta = openAIChunk.choices?.[0]?.delta;
							if (delta?.content) {
								// Send content block delta
								await writer.write(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify({
									type: 'content_block_delta',
									index: 0,
									delta: { type: 'text_delta', text: delta.content }
								})}\n\n`));
							}
						} catch (parseError) {
							// Skip invalid JSON
						}
					}
				}
			}
		} catch (error) {
			console.error('Streaming conversion error:', error);
		} finally {
			await writer.close();
		}
	})();

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
