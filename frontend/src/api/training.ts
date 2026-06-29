import apiClient from './client'

export interface RadarScores {
  clarity: number
  specificity: number
  creativity: number
  feasibility: number
  completeness: number
  conciseness: number
  model_fit: number
  token_efficiency: number
}

export interface TokenDiagnosis {
  total_tokens: number
  redundant_tokens: number
  redundant_ratio: number
  redundant_details: string[]
  suggestions: string[]
}

export interface OptimizedVersion {
  title: string
  content: string
  focus: string
}

export interface TrainingAdvice {
  summary: string
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  model_specific_tips: string
  scenario_tips: string
}

export interface TrainingTask {
  title: string
  description: string
  difficulty: string
  hint: string
  expected_improvement: string
}

export interface Mistake {
  mistake: string
  why_it_matters: string
  how_to_fix: string
}

export interface NextPractice {
  task: string
  instruction: string
  model_suggestion: string
}

export interface TrainingFeedback {
  user_level: string
  main_mistakes: Mistake[]
  learning_formula: string
  next_practice: NextPractice
  short_feedback: string
}

export interface TrainingResponse {
  radar_scores: RadarScores
  token_diagnosis: TokenDiagnosis
  optimized_versions: OptimizedVersion[]
  training_advice: TrainingAdvice
  training_tasks: TrainingTask[]
  training_feedback: TrainingFeedback
  original_prompt: string
  selected_model: string
  scenario: string
}

export interface TrainingRequest {
  prompt_content: string
  model: string
  scenario: string
}

export interface ModelOption {
  value: string
  label: string
  description: string
}

export interface ScenarioOption {
  value: string
  label: string
  description: string
}

export const trainingAPI = {
  analyze: async (data: TrainingRequest): Promise<TrainingResponse> => {
    const response = await apiClient.post<TrainingResponse>('/training/analyze', data)
    return response.data
  },

  getModels: async (): Promise<ModelOption[]> => {
    const response = await apiClient.get<{ models: ModelOption[] }>('/training/models')
    return response.data.models
  },

  getScenarios: async (): Promise<ScenarioOption[]> => {
    const response = await apiClient.get<{ scenarios: ScenarioOption[] }>('/training/scenarios')
    return response.data.scenarios
  },
}
