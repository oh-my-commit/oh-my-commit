export type ResultDTO<T> =
  | { code: 0; data: T }
  | { code: Exclude<number, 0>; error: string };
