/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { Disposable } from "vscode"

export interface IService extends Disposable {
  initialize?(): Promise<void>
}

export interface IEventEmitter<T> {
  on(event: string, listener: (data: T) => void): void
  off(event: string, listener: (data: T) => void): void
  emit(event: string, data: T): void
}

export class EventEmitter<T> implements IEventEmitter<T> {
  private listeners: Map<string, Set<(data: T) => void>> = new Map()

  on(event: string, listener: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off(event: string, listener: (data: T) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit(event: string, data: T): void {
    this.listeners.get(event)?.forEach((listener) => listener(data))
  }
}

export interface ServiceEvent<T = any> {
  type: string
  data: T
}
