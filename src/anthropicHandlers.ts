import type {
  AnthropicMessagesRequest,
  AnthropicMessage,
  ChatCompletionRequest,
  AnthropicTool,
  ToolDefinition,
  AzureConfig,
  ExtendedChatMessage,
  ExtendedAnthropicContentBlock,
  ExtendedAnthropicMessagesRequest,
} from './types';

import { urlBuilder, isSupportedUnifiedApiEndpoint } from './utils';

/**
 * Format error response in Anthropic compatible format
 */
function formatAnthropicErrorResponse(message: string, type: string = 'invalid_request_error', status: number = 400): Response {
  const errorResponse = {
    type: 'error',
    error: {
      type,
      message,
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Generate random ID in Anthropic format
 */
function generateId(): string {
  return `msg_${Math.random().toString(36).substring(2, 24)}`;
}
/**
 * Clean JSON schema by removing unsupported fields
 */
function cleanJsonSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const cleaned = { ...schema };

  for (const key in cleaned) {
    if (key === '$schema' || key === 'additionalProperties' || key === 'title' || key === 'examples') {
      delete cleaned[key];
    } else if (key === 'format' && cleaned.type === 'string') {
      delete cleaned[key];
    } else if (key === 'properties' && typeof cleaned[key] === 'object') {
      cleaned[key] = cleanJsonSchema(cleaned[key]);
    } else if (key === 'items' && typeof cleaned[key] === 'object') {
      cleaned[key] = cleanJsonSchema(cleaned[key]);
    } else if (typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key])) {
      cleaned[key] = cleanJsonSchema(cleaned[key]);
    }
  }

  return cleaned;
}

/**
 * Validate incoming request
 */
async function validateRequest(request: Request): Promise<Response | null> {
  try {
    const requestBody = (await request.clone().json()) as AnthropicMessagesRequest;

    // Validate model parameter
    if (!requestBody.model) {
      return formatAnthropicErrorResponse('Model parameter is required', 'invalid_request_error', 400);
    }

    // Validate max_tokens parameter
    if (!requestBody.max_tokens || requestBody.max_tokens <= 0) {
      return formatAnthropicErrorResponse('max_tokens parameter is required and must be positive', 'invalid_request_error', 400);
    }

    // Validate messages parameter
    if (!requestBody.messages || !Array.isArray(requestBody.messages) || requestBody.messages.length === 0) {
      return formatAnthropicErrorResponse('Messages parameter is required and must be a non-empty array', 'invalid_request_error', 400);
    }

    // Validate message format
    for (const message of requestBody.messages) {
      if (!message.role || (message.role !== 'user' && message.role !== 'assistant')) {
        return formatAnthropicErrorResponse('Each message must have a valid role (user or assistant)', 'invalid_request_error', 400);
      }
      if (!message.content) {
        return formatAnthropicErrorResponse('Each message must have content', 'invalid_request_error', 400);
      }
    }

    return null; // No validation errors
  } catch (error) {
    return formatAnthropicErrorResponse('Invalid request body JSON', 'invalid_request_error', 400);
  }
}

/**
 * Convert request to provider-specific format
 */
async function convertToProviderRequest(
  request: Request,
  requestBody: AnthropicMessagesRequest,
  api_key: string,
  endpoint: string,
  provider: string,
  model: string,
  azureConfig?: AzureConfig,
): Promise<Request> {
  const convertedRequest = convertAnthropicToOpenAI(
    requestBody,
    isSupportedUnifiedApiEndpoint(provider) ? [provider, model].join('/') : model,
  );
  const finalUrl: string = urlBuilder(endpoint, provider, { ...azureConfig, deployment: model });

  // Set up headers
  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('cf-aig-authorization', `Bearer ${api_key}`);
  headers.delete('x-api-key');
  headers.delete('Authorization');

  return new Request(finalUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(convertedRequest),
  });
}

/**
 * Convert Anthropic tools to OpenAI tools format
 */
function convertAnthropicToolsToOpenAI(anthropicTools: AnthropicTool[]): ToolDefinition[] {
  return anthropicTools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: cleanJsonSchema(tool.input_schema),
    },
  }));
}

/**
 * Convert Anthropic messages format to OpenAI chat completions format
 */
function convertAnthropicToOpenAI(anthropicRequest: ExtendedAnthropicMessagesRequest, model: string): ChatCompletionRequest {
  const openAIRequest: ChatCompletionRequest = {
    model,
    messages: convertMessages(anthropicRequest.messages),
    stream: anthropicRequest.stream,
  };

  // Add system message if present
  if (anthropicRequest.system) {
    let systemContent: string;
    if (typeof anthropicRequest.system === 'string') {
      systemContent = anthropicRequest.system;
    } else if (Array.isArray(anthropicRequest.system)) {
      // Handle array format - extract text content
      systemContent = anthropicRequest.system
        .filter((block) => block.type === 'text')
        .map((block) => block.text || '')
        .join('\n');
    } else {
      systemContent = String(anthropicRequest.system);
    }

    if (systemContent.trim()) {
      openAIRequest.messages.unshift({
        role: 'system',
        content: systemContent,
      });
    }
  }

  // Add tools if present
  if (anthropicRequest.tools && anthropicRequest.tools.length > 0) {
    openAIRequest.tools = convertAnthropicToolsToOpenAI(anthropicRequest.tools);

    // Convert tool_choice
    if (anthropicRequest.tool_choice) {
      if (typeof anthropicRequest.tool_choice === 'string') {
        if (anthropicRequest.tool_choice === 'auto') {
          openAIRequest.tool_choice = 'auto';
        } else if (anthropicRequest.tool_choice === 'any') {
          openAIRequest.tool_choice = 'auto'; // Use 'auto' instead of 'required'
        }
      } else if (anthropicRequest.tool_choice.type === 'tool' && anthropicRequest.tool_choice.name) {
        openAIRequest.tool_choice = {
          type: 'function',
          function: { name: anthropicRequest.tool_choice.name },
        };
      }
    }
  }

  // Add optional parameters
  if (anthropicRequest.temperature !== undefined) {
    openAIRequest.temperature = anthropicRequest.temperature;
  }

  if (anthropicRequest.max_tokens !== undefined) {
    openAIRequest.max_tokens = anthropicRequest.max_tokens;
  }

  if (anthropicRequest.top_p !== undefined) {
    openAIRequest.top_p = anthropicRequest.top_p;
  }

  if (anthropicRequest.stop_sequences !== undefined) {
    openAIRequest.stop = anthropicRequest.stop_sequences;
  }

  return openAIRequest;
}

/**
 * Convert Anthropic messages to OpenAI messages format
 */
function convertMessages(anthropicMessages: AnthropicMessage[]): ExtendedChatMessage[] {
  const openAIMessages: ExtendedChatMessage[] = [];
  const toolCallMap = new Map<string, string>();

  for (const message of anthropicMessages) {
    if (typeof message.content === 'string') {
      openAIMessages.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      });
      continue;
    }

    const textContents: string[] = [];
    const toolCalls: any[] = [];
    const toolResults: Array<{ tool_call_id: string; content: string }> = [];

    for (const content of message.content as ExtendedAnthropicContentBlock[]) {
      switch (content.type) {
        case 'text':
          if (content.text) {
            textContents.push(content.text);
          }
          break;
        case 'tool_use':
          if (content.id && content.name && content.input) {
            toolCallMap.set(content.id, content.id);
            toolCalls.push({
              id: content.id,
              type: 'function',
              function: {
                name: content.name,
                arguments: JSON.stringify(content.input),
              },
            });
          }
          break;
        case 'tool_result':
          if (content.tool_use_id && content.content) {
            toolResults.push({
              tool_call_id: content.tool_use_id,
              content: typeof content.content === 'string' ? content.content : JSON.stringify(content.content),
            });
          }
          break;
      }
    }

    if (textContents.length > 0 || toolCalls.length > 0) {
      const openAIMessage: ExtendedChatMessage = {
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: textContents.length > 0 ? textContents.join('\n') : '',
      };

      if (toolCalls.length > 0) {
        openAIMessage.tool_calls = toolCalls;
      }

      openAIMessages.push(openAIMessage);
    }

    for (const toolResult of toolResults) {
      openAIMessages.push({
        role: 'tool',
        tool_call_id: toolResult.tool_call_id,
        content: toolResult.content,
      });
    }
  }

  return openAIMessages;
}

/**
 * Handle provider error responses
 */
async function handleProviderError(providerResponse: Response, provider: string): Promise<Response> {
  try {
    const error: any = await providerResponse.json();
    return formatAnthropicErrorResponse(
      `[${provider}] ${error.error?.message || error.message || 'API request failed'}`,
      'api_error',
      providerResponse.status,
    );
  } catch (e) {
    return formatAnthropicErrorResponse(
      `[${provider}] API request failed with status ${providerResponse.status}`,
      'api_error',
      providerResponse.status,
    );
  }
}

/**
 * Convert response to Anthropic format
 */
async function convertToAnthropicResponse(providerResponse: Response): Promise<Response> {
  // Convert OpenAI response to Anthropic format
  const contentType = providerResponse.headers.get('content-type') || '';
  const isStream = contentType.includes('text/event-stream');

  if (isStream) {
    return convertStreamResponse(providerResponse);
  } else {
    return convertNormalResponse(providerResponse);
  }
}

/**
 * Convert normal (non-streaming) OpenAI response to Anthropic format
 */
async function convertNormalResponse(openAIResponse: Response): Promise<Response> {
  const openAIData: any = await openAIResponse.json();

  const anthropicResponse: any = {
    id: generateId(),
    type: 'message',
    role: 'assistant',
    content: [],
  };

  if (openAIData.choices && openAIData.choices.length > 0) {
    const choice = openAIData.choices[0];
    const message = choice.message;

    if (message.content) {
      anthropicResponse.content.push({
        type: 'text',
        text: message.content,
      });
    }

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        anthropicResponse.content.push({
          type: 'tool_use',
          id: toolCall.id,
          name: toolCall.function.name,
          input: JSON.parse(toolCall.function.arguments),
        });
      }
      anthropicResponse.stop_reason = 'tool_use';
    } else if (choice.finish_reason === 'length') {
      anthropicResponse.stop_reason = 'max_tokens';
    } else {
      anthropicResponse.stop_reason = 'end_turn';
    }
  }

  if (openAIData.usage) {
    anthropicResponse.usage = {
      input_tokens: openAIData.usage.prompt_tokens,
      output_tokens: openAIData.usage.completion_tokens,
    };
  }

  return new Response(JSON.stringify(anthropicResponse), {
    status: openAIResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Convert streaming OpenAI response to Anthropic format
 */
async function convertStreamResponse(openAIResponse: Response): Promise<Response> {
  const toolCallsBuffer = new Map<number, { id?: string; name?: string; arguments?: string }>();

  return processProviderStream(openAIResponse, (jsonStr, textIndex, toolIndex) => {
    try {
      const openAIData: any = JSON.parse(jsonStr);
      if (!openAIData.choices || openAIData.choices.length === 0) {
        return null;
      }

      const choice = openAIData.choices[0];
      const delta = choice.delta;
      const events: string[] = [];
      let currentTextIndex = textIndex;
      let currentToolIndex = toolIndex;

      // 处理文本内容
      if (delta.content) {
        // 对于第一个内容块，发送content_block_start事件
        if (currentTextIndex === 0) {
          events.push(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: 0,
              content_block: {
                type: 'text',
                text: '',
              },
            })}\n\n`,
          );
        }

        // 发送内容增量
        events.push(
          `event: content_block_delta\ndata: ${JSON.stringify({
            type: 'content_block_delta',
            index: 0,
            delta: {
              type: 'text_delta',
              text: delta.content,
            },
          })}\n\n`,
        );
        currentTextIndex = 1; // 标记已经开始内容块
      }

      // 处理工具调用 - 支持增量式构建
      if (delta.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          const index = toolCall.index || 0;

          // 初始化或更新工具调用缓冲区
          if (!toolCallsBuffer.has(index)) {
            toolCallsBuffer.set(index, {});
          }
          const bufferedCall = toolCallsBuffer.get(index)!;

          // 更新工具调用信息
          if (toolCall.id) {
            bufferedCall.id = toolCall.id;
          }
          if (toolCall.function?.name) {
            bufferedCall.name = toolCall.function.name;
          }
          if (toolCall.function?.arguments) {
            bufferedCall.arguments = (bufferedCall.arguments || '') + toolCall.function.arguments;
          }

          // 如果工具调用信息完整，生成事件
          if (bufferedCall.id && bufferedCall.name && bufferedCall.arguments) {
            try {
              const args = JSON.parse(bufferedCall.arguments);
              const blockIndex = currentTextIndex > 0 ? 1 + index : index;

              events.push(
                `event: content_block_start\ndata: ${JSON.stringify({
                  type: 'content_block_start',
                  index: blockIndex,
                  content_block: {
                    type: 'tool_use',
                    id: bufferedCall.id,
                    name: bufferedCall.name,
                    input: {},
                  },
                })}\n\n`,
              );

              events.push(
                `event: content_block_delta\ndata: ${JSON.stringify({
                  type: 'content_block_delta',
                  index: blockIndex,
                  delta: {
                    type: 'input_json_delta',
                    partial_json: JSON.stringify(args),
                  },
                })}\n\n`,
              );

              events.push(
                `event: content_block_stop\ndata: ${JSON.stringify({
                  type: 'content_block_stop',
                  index: blockIndex,
                })}\n\n`,
              );

              currentToolIndex = Math.max(currentToolIndex, index + 1);
              // 清除已处理的工具调用
              toolCallsBuffer.delete(index);
            } catch (e) {
              // JSON 还不完整，继续等待
            }
          }
        }
      }

      // 处理结束信号
      if (choice.finish_reason) {
        // 发送content_block_stop事件
        if (currentTextIndex > 0) {
          events.push(
            `event: content_block_stop\ndata: ${JSON.stringify({
              type: 'content_block_stop',
              index: 0,
            })}\n\n`,
          );
        }
      }

      return {
        events,
        textBlockIndex: currentTextIndex,
        toolUseBlockIndex: currentToolIndex,
      };
    } catch (error) {
      console.error('Error processing stream chunk:', error);
      return null;
    }
  });
}

/**
 * Send message start event
 */
function sendMessageStart(controller: ReadableStreamDefaultController): void {
  const event = `event: message_start\ndata: ${JSON.stringify({
    type: 'message_start',
    message: {
      id: generateId(),
      type: 'message',
      role: 'assistant',
      content: [],
    },
  })}\n\n`;
  controller.enqueue(new TextEncoder().encode(event));
}

/**
 * Send message stop event
 */
function sendMessageStop(controller: ReadableStreamDefaultController): void {
  const event = `event: message_stop\ndata: ${JSON.stringify({
    type: 'message_stop',
  })}\n\n`;
  controller.enqueue(new TextEncoder().encode(event));
}

/**
 * Process provider stream and convert to Anthropic format
 */
async function processProviderStream(
  providerResponse: Response,
  processLine: (
    jsonStr: string,
    textIndex: number,
    toolIndex: number,
  ) => { events: string[]; textBlockIndex: number; toolUseBlockIndex: number } | null,
): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      const reader = providerResponse.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let textBlockIndex = 0;
      let toolUseBlockIndex = 0;
      let hasStartedContent = false;

      sendMessageStart(controller);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = buffer + decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          // 保留最后一行作为缓冲区（可能不完整）
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') {
              // 处理流结束信号
              if (hasStartedContent) {
                // 发送content_block_stop事件
                controller.enqueue(
                  new TextEncoder().encode(
                    `event: content_block_stop\ndata: ${JSON.stringify({
                      type: 'content_block_stop',
                      index: 0,
                    })}\n\n`,
                  ),
                );
              }
              continue;
            }

            if (!jsonStr) continue;

            const result = processLine(jsonStr, hasStartedContent ? 1 : 0, toolUseBlockIndex);
            if (result) {
              if (result.textBlockIndex > 0) {
                hasStartedContent = true;
              }
              toolUseBlockIndex = result.toolUseBlockIndex;

              for (const event of result.events) {
                controller.enqueue(new TextEncoder().encode(event));
              }
            }
          }
        }
      } finally {
        // 处理缓冲区中的剩余数据
        if (buffer.trim()) {
          console.log('[DEBUG] Processing final buffer:', buffer.substring(0, 100));

          // 判断是否以data:开头
          if (buffer.trim().startsWith('data: ')) {
            const finalJsonStr = buffer.slice(6).trim();
            if (finalJsonStr && finalJsonStr !== '[DONE]') {
              const result = processLine(finalJsonStr, hasStartedContent ? 1 : 0, toolUseBlockIndex);
              if (result) {
                if (result.textBlockIndex > 0) {
                  hasStartedContent = true;
                }

                for (const event of result.events) {
                  controller.enqueue(new TextEncoder().encode(event));
                }
              }
            }
          } else {
            // 如果不以data:开头，可能是纯 JSON数据
            try {
              JSON.parse(buffer.trim()); // 验证是否为有效JSON
              const result = processLine(buffer.trim(), hasStartedContent ? 1 : 0, toolUseBlockIndex);
              if (result) {
                if (result.textBlockIndex > 0) {
                  hasStartedContent = true;
                }

                for (const event of result.events) {
                  controller.enqueue(new TextEncoder().encode(event));
                }
              }
            } catch (e) {
              console.warn('[DEBUG] Final buffer is not valid JSON, skipping:', buffer.substring(0, 50));
            }
          }
        }

        // 确保发送content_block_stop事件
        if (hasStartedContent) {
          controller.enqueue(
            new TextEncoder().encode(
              `event: content_block_stop\ndata: ${JSON.stringify({
                type: 'content_block_stop',
                index: 0,
              })}\n\n`,
            ),
          );
        }

        reader.releaseLock();
        sendMessageStop(controller);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: providerResponse.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Handle /v1/messages request (Anthropic API compatible)
 */
export async function handleAnthropicMessagesRequest(
  request: Request,
  logger: Logger,
  endpoint: string,
  api_key: string,
  azureConfig?: AzureConfig,
): Promise<Response> {
  // Validate request
  const validationResult = await validateRequest(request);
  if (validationResult !== null) {
    return validationResult;
  }

  // Parse request body
  const requestBody = (await request.json()) as AnthropicMessagesRequest;

  const modelName = requestBody.model;
  if (!modelName || modelName.indexOf('#') < 0) {
    return formatAnthropicErrorResponse(`Model '${requestBody.model}' not found`, 'model_not_found', 404);
  }

  const [model, provider] = modelName.split('#');

  requestBody.messages = (requestBody.messages || []).map((message) => {
    if (!message.content) {
      message.content = [];
    }
    return message;
  });

  // Convert request to provider format
  const providerRequest = await convertToProviderRequest(request, requestBody, api_key, endpoint, provider, model, azureConfig);

  // Forward request to provider
  logger.info(`[DEBUG] Making request to provider: ${provider}, model: ${model}`, { providerRequest });

  let providerResponse: Response;
  try {
    providerResponse = await fetch(providerRequest);
  } catch (fetchError) {
    logger.error(`[ERROR] Fetch failed for provider ${provider}:`, {
      error: fetchError,
      url: providerRequest.url,
      provider,
      model,
    });

    // Return a more detailed error response
    return formatAnthropicErrorResponse(
      `Connection failed to provider ${provider}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      'connection_error',
      503,
    );
  }

  // Handle provider errors
  if (!providerResponse.ok) {
    logger.error(`[ERROR] Provider response not OK:`, {
      status: providerResponse.status,
      statusText: providerResponse.statusText,
      provider,
      url: providerRequest.url,
    });
    return handleProviderError(providerResponse, provider);
  }

  // Convert response to Anthropic format
  return convertToAnthropicResponse(providerResponse);
}
