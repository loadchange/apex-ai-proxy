export interface AzureConfig {
  endpoint: string;
  protocol: string;
  apiKey: string;
  deploymentNames: string[];
}

export interface Env {
  SERVICE_API_KEY: string;
  AZURE_CONFIGS: string; // JSON string of AzureConfig[]
}

export interface ModelInfo {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: "list";
  data: ModelInfo[];
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface AzureErrorResponse {
  error?: {
    message: string;
    type?: string;
    code?: string | number;
  };
}
