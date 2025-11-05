/**
 * Model configuration with provider information
 * Free models are marked and set as default
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'groq' | 'openai' | 'google' | 'anthropic';
  isFree: boolean;
  description?: string;
}

export const models: ModelConfig[] = [
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Groq)',
    provider: 'groq',
    isFree: true,
    description: 'Free - Fast and lightweight (Recommended)',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    isFree: true,
    description: 'Free - Fast inference via Groq',
  },
  {
    id: 'llama-3.2-90b-versatile',
    name: 'Llama 3.2 90B (Groq)',
    provider: 'groq',
    isFree: true,
    description: 'Free - High capacity model',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (Groq)',
    provider: 'groq',
    isFree: true,
    description: 'Free - High performance',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
    provider: 'openai',
    isFree: false,
    description: 'Paid - Cost-effective OpenAI model',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (OpenAI)',
    provider: 'openai',
    isFree: false,
    description: 'Paid - Latest OpenAI model',
  },
];

// Default free model
export const defaultModel = models.find(m => m.isFree) || models[0];

// Get model config by ID
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return models.find(m => m.id === modelId);
}

