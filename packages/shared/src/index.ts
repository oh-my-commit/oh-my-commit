// Core exports
export * from "./core/commit-manager";

// Utils
export * from "./utils/BaseLogger";
export * from "./utils/ConsoleLogger";

// Type exports
export * from "./types/model";
export * from "./types/provider";
export * from "./types/git";
export * from "./types/commit";
export * from "./types/tree";

// Provider exports
export { OmcProvider } from "./providers/oh-my-commits";

// Result type re-export from neverthrow
export { Result, ok, err } from "neverthrow";

export * from "./constants";
