import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index';
import { ModelsResponse, ErrorResponse, Model, OpenAIEmbeddingsResponse, ChatCompletionRequest } from '../src/types';

// Define ChatCompletionResponse interface for testing
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create a mock for fetch
const mockFetch = vi.fn();
// Replace the global fetch with our mock
vi.stubGlobal('fetch', mockFetch);

// Mock environment variables
const mockEnv = {
	PROVIDER_CONFIG: JSON.stringify({
		aliyuncs: {
			base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
			api_keys: ['test_key_1'],
		},
		deepseek: {
			base_url: 'https://api.deepseek.com',
			api_keys: ['test_key_2'],
		},
		openai: {
			base_url: 'https://api.openai.com/v1',
			api_keys: ['test_key_4'],
		},
		'text-embedding-ada-002': {
			providers: [
				{
					provider: 'openai',
					model: 'text-embedding-ada-002',
				},
			],
		},
	}),
	MODEL_PROVIDER_CONFIG: JSON.stringify({
		'DeepSeek-R1': {
			providers: [
				{
					provider: 'aliyuncs',
					model: 'deepseek-r1',
				},
				{
					provider: 'deepseek',
					base_url: 'https://api.deepseek.com',
					api_key: 'test_key_2',
					model: 'deepseek-reasoner',
				},
			],
		},
		'Qwen-Max': {
			providers: [
				{
					provider: 'aliyuncs',
					base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
					api_key: 'test_key_3',
					model: 'qwen-max',
				},
			],
		},
		'GPT-4': {
			providers: [
				{
					provider: 'openai',
					base_url: 'https://api.openai.com/v1',
					api_key: 'test_key_4',
					model: 'gpt-4-turbo',
				},
			],
		},
	}),
	TAVILY_API_KEY: 'test_tavily_key',
	DEFAULT_FUNCTION_CALLING_MODEL: 'Qwen-Max',
};

// Mock execution context
const mockCtx = {
	waitUntil: vi.fn(),
	passThroughOnException: vi.fn(),
};

describe('AI Service Aggregator Worker', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('/v1/models endpoint', () => {
		it('should return a list of available models', async () => {
			// Create a request to the /v1/models endpoint
			const request = new Request('https://example.com/v1/models', {
				method: 'GET',
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(200);

			// Parse the response body
			const responseBody = (await response.json()) as ModelsResponse;

			// Check the response structure
			expect(responseBody.object).toBe('list');
			expect(Array.isArray(responseBody.data)).toBe(true);

			// Check that the models are correct
			expect(responseBody.data.length).toBe(2);
			expect(responseBody.data.map((model: Model) => model.id)).toContain('DeepSeek-R1');
			expect(responseBody.data.map((model: Model) => model.id)).toContain('Qwen-Max');

			// Check model properties
			responseBody.data.forEach((model: Model) => {
				expect(model.object).toBe('model');
				expect(typeof model.created).toBe('number');
				expect(model.owned_by).toBe('apex-ai-proxy');
			});
		});
	});

	describe('/v1/chat/completions endpoint', () => {
		// Reset mock fetch before each test
		beforeEach(() => {
			mockFetch.mockReset();
		});

		it('should add search tool for providers with function calling support', async () => {
			// Mock fetch implementation for a provider that supports function calling
			mockFetch.mockImplementationOnce(async () => {
				return {
					ok: true,
					json: async () => ({
						id: 'chatcmpl-123',
						object: 'chat.completion',
						created: 1677858242,
						model: 'gpt-4-turbo',
						choices: [
							{
								index: 0,
								message: {
									role: 'assistant',
									content: null,
									tool_calls: [
										{
											id: 'call_123',
											type: 'function',
											function: {
												name: 'search',
												arguments: '{"query":"latest news about AI"}',
											},
										},
									],
								},
								finish_reason: 'tool_calls',
							},
						],
						usage: {
							prompt_tokens: 10,
							completion_tokens: 20,
							total_tokens: 30,
						},
					}),
				};
			});

			// Mock second fetch for the follow-up request with tool results
			mockFetch.mockImplementationOnce(async () => {
				return {
					ok: true,
					json: async () => ({
						id: 'chatcmpl-456',
						object: 'chat.completion',
						created: 1677858242,
						model: 'gpt-4-turbo',
						choices: [
							{
								index: 0,
								message: {
									role: 'assistant',
									content: 'Here are the latest AI news based on my search.',
								},
								finish_reason: 'stop',
							},
						],
						usage: {
							prompt_tokens: 50,
							completion_tokens: 20,
							total_tokens: 70,
						},
					}),
				};
			});

			// Create a request to the /v1/chat/completions endpoint
			const request = new Request('https://example.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'GPT-4',
					messages: [{ role: 'user', content: 'What are the latest news about AI?' }],
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(200);

			// Parse the response body
			const responseBody = (await response.json()) as ChatCompletionResponse;

			// Check that the model name was replaced
			expect(responseBody.model).toBe('GPT-4');

			// Check the response content
			expect(responseBody.choices[0].message.content).toBe('Here are the latest AI news based on my search.');

			// Verify that fetch was called twice (initial request + follow-up with tool results)
			expect(mockFetch).toHaveBeenCalledTimes(2);

			// Check that the first request included the search tool
			const firstCallArgs = mockFetch.mock.calls[0][1];
			const firstRequestBody = JSON.parse(firstCallArgs.body);
			expect(firstRequestBody.tools).toBeDefined();
			expect(firstRequestBody.tools.length).toBeGreaterThan(0);
			expect(firstRequestBody.tools[0].function.name).toBe('search');
		});

		it('should return a 400 error for invalid request body', async () => {
			// Create a request to the /v1/chat/completions endpoint with invalid body
			const request = new Request('https://example.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: 'invalid json',
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(400);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Invalid request body');
			expect(responseBody.error.type).toBe('invalid_request_error');
		});

		it('should return a 400 error when model parameter is missing', async () => {
			// Create a request to the /v1/chat/completions endpoint with missing model
			const request = new Request('https://example.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [{ role: 'user', content: 'Hello' }],
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(400);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Model parameter is required');
			expect(responseBody.error.type).toBe('invalid_request_error');
		});

		it('should return a 404 error when model is not found', async () => {
			// Create a request to the /v1/chat/completions endpoint with non-existent model
			const request = new Request('https://example.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'non-existent-model',
					messages: [{ role: 'user', content: 'Hello' }],
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(404);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe("Model 'non-existent-model' not found");
			expect(responseBody.error.type).toBe('model_not_found');
		});

		it('should use default function calling model when original model does not support it', async () => {
			// Mock fetch implementation for the default function calling model (Qwen-Max)
			mockFetch.mockImplementationOnce(async () => {
				return {
					ok: true,
					json: async () => ({
						id: 'chatcmpl-123',
						object: 'chat.completion',
						created: 1677858242,
						model: 'qwen-max',
						choices: [
							{
								index: 0,
								message: {
									role: 'assistant',
									content: null,
									tool_calls: [
										{
											id: 'call_123',
											type: 'function',
											function: {
												name: 'search',
												arguments: '{"query":"latest news about AI"}',
											},
										},
									],
								},
								finish_reason: 'tool_calls',
							},
						],
						usage: {
							prompt_tokens: 10,
							completion_tokens: 20,
							total_tokens: 30,
						},
					}),
				};
			});

			// Mock second fetch for the original model with tool results
			mockFetch.mockImplementationOnce(async () => {
				return {
					ok: true,
					json: async () => ({
						id: 'chatcmpl-456',
						object: 'chat.completion',
						created: 1677858242,
						model: 'deepseek-r1',
						choices: [
							{
								index: 0,
								message: {
									role: 'assistant',
									content: 'Here are the latest AI news based on my search.',
								},
								finish_reason: 'stop',
							},
						],
						usage: {
							prompt_tokens: 50,
							completion_tokens: 20,
							total_tokens: 70,
						},
					}),
				};
			});

			// Create a request to the /v1/chat/completions endpoint with a model that doesn't support function calling
			const request = new Request('https://example.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'DeepSeek-R1',
					messages: [{ role: 'user', content: 'What are the latest news about AI?' }],
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(200);

			// Parse the response body
			const responseBody = (await response.json()) as ChatCompletionResponse;

			// Check that the model name was replaced with the original model
			expect(responseBody.model).toBe('DeepSeek-R1');

			// Check the response content
			expect(responseBody.choices[0].message.content).toBe('Here are the latest AI news based on my search.');

			// Verify that fetch was called twice (default model request + original model with tool results)
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		// Note: Testing the actual API call would require mocking the fetch function,
		// which is beyond the scope of this basic test suite.
	});

	describe('Unknown endpoints', () => {
		it('should return a 404 error for unknown endpoints', async () => {
			// Create a request to an unknown endpoint
			const request = new Request('https://example.com/unknown', {
				method: 'GET',
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(404);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Not found');
			expect(responseBody.error.type).toBe('not_found');
		});
	});

	describe('/v1/embeddings endpoint', () => {
		// Reset mock fetch before each test
		beforeEach(() => {
			mockFetch.mockReset();
		});

		it('should handle embeddings request successfully', async () => {
			// Mock fetch implementation for embeddings
			mockFetch.mockImplementationOnce(async () => {
				return {
					ok: true,
					headers: new Headers({ 'Content-Type': 'application/json' }),
					json: async () => ({
						object: 'list',
						data: [
							{
								object: 'embedding',
								embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
								index: 0,
							},
						],
						model: 'text-embedding-ada-002',
						usage: {
							prompt_tokens: 5,
							total_tokens: 5,
						},
					}),
				};
			});

			// Create a request to the /v1/embeddings endpoint
			const request = new Request('https://example.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'text-embedding-ada-002',
					input: 'Hello world',
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(200);

			// Parse the response body
			const responseBody = (await response.json()) as OpenAIEmbeddingsResponse;

			// Check the response structure
			expect(responseBody.object).toBe('list');
			expect(Array.isArray(responseBody.data)).toBe(true);
			expect(responseBody.data.length).toBe(1);
			expect(responseBody.data[0].object).toBe('embedding');
			expect(Array.isArray(responseBody.data[0].embedding)).toBe(true);
			expect(responseBody.data[0].embedding.length).toBe(5);
			expect(responseBody.model).toBe('text-embedding-ada-002');
			expect(responseBody.usage).toBeDefined();
			expect(responseBody.usage.prompt_tokens).toBe(5);
			expect(responseBody.usage.total_tokens).toBe(5);

			// Verify that fetch was called once
			expect(mockFetch).toHaveBeenCalledTimes(1);

			// Check that the request was properly formatted
			const fetchArgs = mockFetch.mock.calls[0];
			expect(fetchArgs[0]).toContain('/embeddings');

			const requestBody = JSON.parse(fetchArgs[1].body);
			expect(requestBody.model).toBe('text-embedding-ada-002');
			expect(requestBody.input).toBe('Hello world');
		});

		it('should return a 400 error for invalid request body', async () => {
			// Create a request to the /v1/embeddings endpoint with invalid body
			const request = new Request('https://example.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: 'invalid json',
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(400);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Invalid request body');
			expect(responseBody.error.type).toBe('invalid_request_error');
		});

		it('should return a 400 error when model parameter is missing', async () => {
			// Create a request to the /v1/embeddings endpoint with missing model
			const request = new Request('https://example.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					input: 'Hello world',
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(400);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Model parameter is required');
			expect(responseBody.error.type).toBe('invalid_request_error');
		});

		it('should return a 400 error when input parameter is missing', async () => {
			// Create a request to the /v1/embeddings endpoint with missing input
			const request = new Request('https://example.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'text-embedding-ada-002',
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(400);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe('Input parameter is required and must be a string or array of strings');
			expect(responseBody.error.type).toBe('invalid_request_error');
		});

		it('should return a 404 error when model is not found', async () => {
			// Create a request to the /v1/embeddings endpoint with non-existent model
			const request = new Request('https://example.com/v1/embeddings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'non-existent-model',
					input: 'Hello world',
				}),
			});

			// Call the worker's fetch handler
			const response = await worker.fetch(request, mockEnv, mockCtx as any);

			// Check the response status
			expect(response.status).toBe(404);

			// Parse the response body
			const responseBody = (await response.json()) as ErrorResponse;

			// Check the error structure
			expect(responseBody.error).toBeDefined();
			expect(responseBody.error.message).toBe("Model 'non-existent-model' not found");
			expect(responseBody.error.type).toBe('model_not_found');
		});
	});
});
