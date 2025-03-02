/**
 * Utility functions for the AI service aggregator
 */

import { ModelProviderMapping, ErrorResponse, ProviderConfig, ModelConfig } from './types';

/**
 * Parse the model-provider configuration from environment variable
 */
export function parseModelProviderConfig(configStr: string): ModelProviderMapping {
	try {
		return JSON.parse(configStr);
	} catch (error) {
		console.error('Failed to parse MODEL_PROVIDER_CONFIG:', error);
		return {};
	}
}

/**
 * Verify API key from the Authorization header
 */
export function verifyApiKey(request: Request, apiKey?: string): boolean {
	// If no API key are configured, skip authentication
	if (!apiKey) return true;

	const authHeader = request.headers.get('Authorization');
	if (!authHeader) return false;

	const match = authHeader.match(/^Bearer\s+(.+)$/i);
	if (!match) return false;

	return apiKey === match[1];
}

/**
 * Select a provider from the available providers using random selection
 */
export function selectProvider(modelConfig: ModelConfig): { provider: ProviderConfig } | null {
	const providers = modelConfig.providers;
	if (!providers || !providers.length) {
		return null;
	}

	// Random selection to better distribute load across providers
	// In a production environment, you might want to use a more sophisticated strategy
	// that takes into account provider health, response times, rate limits, etc.
	const index = Math.floor(Math.random() * providers.length);
	const provider = providers[index];

	return { provider };
}

/**
 * Format error response in OpenAI compatible format
 */
export function formatErrorResponse(message: string, type: string = 'internal_error', status: number = 500): Response {
	const errorResponse: ErrorResponse = {
		error: { message, type },
	};

	return new Response(JSON.stringify(errorResponse), {
		status,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
