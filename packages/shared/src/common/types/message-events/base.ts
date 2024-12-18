import { LogLevel } from "@/common";

export type BaseClientMessageEvent =
  | {
      type: "log";
      data: {
        channel?: string;
        level: LogLevel;
        rawMessage: any;
      };
    }
  | {
      type: "close-window"; // todo: or window-close ?
    }
  | {
      type: "open-external";
      data: {
        url: string;
      };
    };
export type BaseServerMessageEvent = undefined;
