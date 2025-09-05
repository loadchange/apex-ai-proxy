/**
 * AI Service Aggregator Worker
 *
 * This Cloudflare Worker acts as an aggregator for multiple AI service providers,
 * distributing requests across them to increase QPM (Queries Per Minute).
 * It provides a unified API endpoint that's compatible with OpenAI's API.
 */
import { AzureConfig } from './types';
import { getEndpoint, verifyApiKey, formatErrorResponse, corsWrapper, createLogger } from './utils';
import { handleChatCompletionsRequest } from './handlers';
import { handleAnthropicMessagesRequest } from './anthropicHandlers';

/**
 * Main request handler for the Worker
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const apiKey = await env.GatewayToken.get();
    // Parse the URL to determine the endpoint
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return corsWrapper(new Response(null, { status: 204 }));
    }

    let response: Response;

    if (request.method !== 'POST') {
      response = formatErrorResponse('Method not allowed', 'method_not_allowed', 405);
    }

    const isValidApiKey = verifyApiKey(request, apiKey);
    if (!isValidApiKey) {
      return formatErrorResponse('Invalid API key', 'unauthorized', 401);
    }

    const logger = createLogger(request);
    const endpoint = getEndpoint(env);
    const azureConfig: AzureConfig = {
      resource: env.AZURE_RESOURCE,
      apiVersion: env.AZURE_API_VERSION,
    };

    try {
      let response: Response;
      if (path.includes('/messages')) {
        // Anthropic Messages
        response = await handleAnthropicMessagesRequest(request, logger, endpoint, apiKey, azureConfig);
      } else if (path.includes('/chat/completions')) {
        // OpenAI Chat Completions
        response = await handleChatCompletionsRequest(request, logger, endpoint, apiKey, azureConfig);
      } else {
        // Return 404 for unknown endpoints
        return formatErrorResponse('Not found', 'not_found', 404);
      }
      return corsWrapper(response);
    } catch (error) {
      console.error('Unhandled error:', error);
      return formatErrorResponse(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`, 'internal_error', 500);
    }
  },
};
