/**
 * Types for the AI service aggregator
 */

/**
 * Environment variables interface for the Worker
 */
export interface Env {
	PROVIDER_CONFIG: string;
	// Configuration for model-provider mapping, stored as a JSON string
	MODEL_PROVIDER_CONFIG: string;
	// API key
	SERVICE_API_KEY?: string;
	// KV namespace for storing response data
	RESPONSES_KV: KVNamespace;
}

/**
 * Provider configuration for a specific model
 */
export interface ProviderConfig {
	/** Provider identifier (e.g., 'aliyuncs', 'deepseek', etc.) */
	provider: string;
	/** Base URL for the provider's API */
	base_url: string;
	/** API key for authentication */
	api_key: string;
	api_keys?: string;
	/** The provider's internal model name */
	model: string;
}

/**
 * Model configuration with global settings and provider list
 */
export interface ModelConfig {
	/** List of providers for this model */
	providers: ProviderConfig[];
}

/**
 * Configuration mapping external model names to model configurations
 */
export interface ModelProviderMapping {
	[modelName: string]: ModelConfig;
}

/**
 * OpenAI compatible model object
 */
export interface Model {
	id: string;
	object: string;
	created: number;
	owned_by: string;
}

/**
 * OpenAI compatible models response
 */
export interface ModelsResponse {
	object: string;
	data: Model[];
}

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

/**
	* OpenAI compatible embeddings request
	*/
export interface OpenAIEmbeddingsRequest {
	model: string;
	input: string | string[];
	encoding_format?: 'float' | 'base64';
	dimensions?: number;
	user?: string;
}

/**
	* OpenAI compatible embedding object
	*/
export interface OpenAIEmbedding {
	object: string;
	embedding: number[];
	index: number;
}

/**
	* OpenAI compatible embeddings response
	*/
export interface OpenAIEmbeddingsResponse {
	object: string;
	data: OpenAIEmbedding[];
	model: string;
	usage: {
		prompt_tokens: number;
		total_tokens: number;
	};
}
