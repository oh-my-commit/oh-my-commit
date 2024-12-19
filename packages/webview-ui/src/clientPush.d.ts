import type { ClientMessageEvent } from "@shared";
export declare const clientPush: (message: ClientMessageEvent & {
    channel?: string;
}) => void;
