import { getVSCodeAPI } from "./storage";

type LogLevel = "debug" | "info" | "warn" | "error" | "trace";

class Logger {
  private vscode = getVSCodeAPI();
  private channel = "default";

  private formatMessage(...args: any[]): string {
    return args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
  }

  private getCallerInfo(): { file: string; line: number; column: number } {
    try {
      // 获取完整的错误堆栈
      const error = new Error();
      Error.captureStackTrace(error, this.getCallerInfo);
      const stack = error.stack;
      console.log('Debug - Full stack:', stack);

      if (!stack) {
        console.log('Debug - No stack trace available');
        return { file: "unknown", line: 0, column: 0 };
      }

      // 分析堆栈信息
      const stackLines = stack.split('\n');
      console.log('Debug - Stack lines:', stackLines);

      // 查找调用者的行
      let callerLine = '';
      for (const line of stackLines) {
        // 跳过内部帧
        if (!line.includes('logger.ts') && !line.includes('node_modules')) {
          callerLine = line;
          console.log('Debug - Found caller line:', callerLine);
          break;
        }
      }

      if (!callerLine) {
        console.log('Debug - No suitable caller line found');
        return { file: "unknown", line: 0, column: 0 };
      }

      // 尝试从 eval 注释中获取源文件信息
      const evalMatch = callerLine.match(/eval.*?\/\/ (.+?):(\d+):(\d+)/);
      if (evalMatch) {
        console.log('Debug - Found eval source map:', evalMatch);
        const [, sourcePath, line, column] = evalMatch;
        // 从源路径中提取文件名
        const fileName = sourcePath.split('/').pop() || "unknown";
        return {
          file: fileName,
          line: parseInt(line, 10),
          column: parseInt(column, 10)
        };
      }

      // 尝试从 at 语句中获取信息
      const atMatch = callerLine.match(/at\s+(?:\w+\s)?\(?([^)]+):(\d+):(\d+)/);
      if (atMatch) {
        console.log('Debug - Found "at" location:', atMatch);
        const [, filePath, line, column] = atMatch;
        // 尝试从路径中提取源文件名
        let fileName = filePath.split('/').pop() || "unknown";
        // 如果文件名包含 src 目录，尝试获取实际的源文件名
        const srcMatch = filePath.match(/\/src\/([^/]+)/);
        if (srcMatch) {
          fileName = srcMatch[1];
          if (!fileName.endsWith('.ts') && !fileName.endsWith('.tsx')) {
            fileName += '.tsx';
          }
        }
        return {
          file: fileName,
          line: parseInt(line, 10),
          column: parseInt(column, 10)
        };
      }

      console.log('Debug - No location information found');
      return { file: "unknown", line: 0, column: 0 };
    } catch (error) {
      console.error('Debug - Error in getCallerInfo:', error);
      return { file: "unknown", line: 0, column: 0 };
    }
  }

  private log(level: LogLevel, ...args: any[]) {
    const { file, line, column } = this.getCallerInfo();
    const rawMessage = this.formatMessage(...args);
    const messageWithLocation = `[${file}:${line}:${column}] ${rawMessage}`;

    // 同时输出到控制台，方便调试
    console.log(`[${level}] ${messageWithLocation}`);

    this.vscode.postMessage({
      command: "log",
      payload: {
        channel: this.channel,
        level,
        rawMessage: messageWithLocation,
        sourceInfo: {
          file,
          line,
          column,
          isDevelopment: process.env.NODE_ENV === 'development'
        }
      },
    });
  }

  debug(...args: any[]) {
    this.log("debug", ...args);
  }

  info(...args: any[]) {
    this.log("info", ...args);
  }

  warn(...args: any[]) {
    this.log("warn", ...args);
  }

  error(...args: any[]) {
    this.log("error", ...args);
  }

  trace(...args: any[]) {
    this.log("trace", ...args);
  }

  setChannel(channel: string) {
    this.channel = channel;
    this.info(`Logger channel set to: ${channel}`);
  }
}

export const logger = new Logger();
