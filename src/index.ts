/**
 * AI Service Aggregator Worker
 *
 * This Cloudflare Worker acts as an aggregator for multiple AI service providers,
 * distributing requests across them to increase QPM (Queries Per Minute).
 * It provides a unified API endpoint that's compatible with OpenAI's API.
 */

import { Env } from './types';
import { parseModelProviderConfig, verifyApiKey, formatErrorResponse } from './utils';
import { handleModelsRequest, handleChatCompletionsRequest } from './handlers';

/**
 * Main request handler for the Worker
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Parse the URL to determine the endpoint
		const url = new URL(request.url);
		const path = url.pathname;

		// Parse the model-provider configuration
		const modelProviderConfig = parseModelProviderConfig(env);

		// Check if we have any models configured
		if (Object.keys(modelProviderConfig).length === 0) {
			return formatErrorResponse('No models configured', 'configuration_error', 500);
		}

		if (request.method === 'POST') {
			const isValidApiKey = verifyApiKey(request, env.SERVICE_API_KEY);
			if (!isValidApiKey) {
				return formatErrorResponse('Invalid API key', 'unauthorized', 401);
			}
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Authorization, Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		try {
			// Route the request to the appropriate handler
			if (path === '/v1/models' && request.method === 'GET') {
				return await handleModelsRequest(modelProviderConfig);
			} else if (path === '/v1/chat/completions' && request.method === 'POST') {
				return await handleChatCompletionsRequest(request, modelProviderConfig, env);
			} else {
				// Return 404 for unknown endpoints
				return formatErrorResponse('Not found', 'not_found', 404);
			}
		} catch (error) {
			console.error('Unhandled error:', error);
			return formatErrorResponse(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`, 'internal_error', 500);
		}
	},
};
