/**
 * OpenAI compatible chat message
 */
export interface ChatMessage {
  role: string;
  content: string | Array<any> | null;
  name?: string;
  tool_call_id?: string;
}

/**
 * OpenAI compatible function definition
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * OpenAI compatible tool definition
 */
export interface ToolDefinition {
  type: string;
  function: FunctionDefinition;
}

/**
 * OpenAI compatible tool choice
 */
export type ToolChoice = 'auto' | 'none' | { type: string; function: { name: string } };

/**
 * OpenAI compatible chat completion request
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  tools?: ToolDefinition[];
  tool_choice?: ToolChoice;
  stream_options?: any;
}

/**
 * OpenAI compatible error response
 */
export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

export interface AzureConfig {
  resource?: string;
  deployment?: string;
  apiVersion?: string;
}

/**
 * Anthropic API compatible message content
 */
export interface AnthropicContentBlock {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

/**
 * Anthropic API compatible message
 */
export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

/**
 * Anthropic API compatible messages request
 */
export interface AnthropicMessagesRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string | AnthropicContentBlock[];
  metadata?: {
    user_id?: string;
  };
}

/**
 * Anthropic API compatible tool definition
 */
export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

// Extended interfaces for tool support
export interface ExtendedAnthropicContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
  id?: string;
  name?: string;
  input?: any;
  tool_use_id?: string;
  content?: string | any;
  is_error?: boolean;
}

export interface ExtendedChatMessage extends ChatMessage {
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ExtendedAnthropicMessagesRequest extends AnthropicMessagesRequest {
  tools?: AnthropicTool[];
  tool_choice?: { type: 'auto' | 'any' | 'tool'; name?: string } | 'auto' | 'any';
}
