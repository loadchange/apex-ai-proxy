/**
 * Request handlers for the AI service aggregator
 */

import type { ChatCompletionRequest, ErrorResponse, AzureConfig } from './types';
import { formatErrorResponse, urlBuilder, isSupportedUnifiedApiEndpoint } from './utils';

/**
 * Handle /v1/chat/completions request
 */
export async function handleChatCompletionsRequest(
  request: Request,
  logger: Logger,
  endpoint: string,
  api_key: string,
  azureConfig?: AzureConfig,
): Promise<Response> {
  // Parse request body
  let requestBody: ChatCompletionRequest;
  try {
    requestBody = (await request.json()) as ChatCompletionRequest;
  } catch (error) {
    logger.error('[handleChatCompletionsRequest]: Failed to parse request body', { error });
    return formatErrorResponse('Invalid request body', 'invalid_request_error', 400);
  }

  // Validate model parameter
  const modelName = requestBody.model;
  if (!modelName || modelName.indexOf('#') < 0) {
    return formatErrorResponse('Model parameter is required', 'invalid_request_error', 400);
  }

  const [model, provider] = modelName.split('#');

  // requestBody.messages = (requestBody.messages || []).map((message) => {
  //   if (!message.content) {
  //     message.content = [];
  //   }
  //   return message;
  // });

  if (provider === 'mistral' && requestBody?.stream_options?.include_usage) {
    delete requestBody.stream_options.include_usage;
  }

  const url = urlBuilder(endpoint, provider, { ...azureConfig, deployment: model });
  const init: RequestInit<RequestInitCfProperties> = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-aig-authorization': `Bearer ${api_key}`,
    },
    body: JSON.stringify(
      Object.assign({}, requestBody, { model: isSupportedUnifiedApiEndpoint(provider) ? [provider, model].join('/') : model }),
    ),
  };
  const providerResponse = await fetch(url, init);
  if (!providerResponse.ok) {
    const error = (await providerResponse.json()) as ErrorResponse;
    logger.error(`[handleChatCompletionsRequest]: [${provider} error] API request failed, message: ${error.error?.message ?? '-'}`, error);
    return formatErrorResponse(
      `[${provider} error] API request failed, message: ${error.error?.message ?? '-'}, meta: ${{
        url,
        model,
        provider,
      }}`,
      'internal_server_error',
      providerResponse.status,
    );
  }
  return new Response(providerResponse.body, { headers: providerResponse.headers });
}
