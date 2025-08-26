/**
 * Utility functions for the AI service aggregator
 */

import { ModelProviderMapping, ErrorResponse, ProviderConfig, ModelConfig } from './types';

/**
 * Parse the model-provider configuration from environment variable
 */
export function parseModelProviderConfig(env: { PROVIDER_CONFIG: string; MODEL_PROVIDER_CONFIG: string }): ModelProviderMapping {
	try {
		const providerConf = JSON.parse(env.PROVIDER_CONFIG);
		const models = JSON.parse(env.MODEL_PROVIDER_CONFIG);
		Object.keys(models).forEach((key) => {
			if (Array.isArray(models[key].providers)) {
				models[key].providers.forEach((provider: any, index: number) => {
					if (!provider.base_url && !provider.api_key) {
						models[key].providers[index] = {
							...models[key].providers[index],
							...providerConf[provider.provider],
						};
					}
				});
			}
		});
		return models;
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

	const authHeader = request.headers.get('Authorization') || request.headers.get('x-api-key');
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

	if (provider && Array.isArray(provider.api_keys)) {
		const apiKeyIndex = Math.floor(Math.random() * provider.api_keys.length);
		provider.api_key = provider.api_keys[apiKeyIndex];
	}

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

export function recordLog(request: Request) {
	const { cf } = request;
	const { city, country } = cf || {};
	const baseInfo = {
		city,
		country,
		method: 'POST',
		dateTime: new Date().toLocaleString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}),
	};
	class Log {
		private baseInfo: any;
		constructor(baseInfo: any) {
			this.baseInfo = baseInfo;
		}

		info(...data: any[]) {
			console.log({ ...this.baseInfo, logs: data });
		}
		error(...data: any[]) {
			console.log({ ...this.baseInfo, logs: data });
		}
	}
	return new Log(baseInfo);
}
