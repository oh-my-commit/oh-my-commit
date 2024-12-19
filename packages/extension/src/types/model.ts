import { Model as SharedModel } from "@shared"

export interface ModelMetrics {
  accuracy: number
  speed: number
  cost: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
  requiredConfig?: {
    key: string
    description: string
    type: "string" | "boolean" | "number"
    settingPath?: string
  }[]
}

export interface Model extends SharedModel {
  validate?(): Promise<ValidationResult>
}
