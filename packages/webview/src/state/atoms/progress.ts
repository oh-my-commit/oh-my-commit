import { atom } from "jotai"

export interface ProgressState {
  isVisible: boolean
  message?: string
  percentage: number
}

export const progressAtom = atom<ProgressState>({
  isVisible: false,
  percentage: 0,
})
