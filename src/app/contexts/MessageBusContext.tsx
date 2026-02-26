import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import Peer, { DataConnection } from "peerjs";
import { createContext, ReactElement } from "react";

export interface LogDataMetadataSenderData {
  avatar: string,
  name: string,
}
export interface LogDataMetadata {
  sender: LogDataMetadataSenderData,
  data: any
  type: string,
  code: number,
}
export interface LogData {
  id?: string,
  content: any,
  metadata: LogDataMetadata
}

export interface MessageBusContextValue {
  messageLog: LogData[];
  send: (data: LogData) => void;
  sendDirect: (targetName: string, messageText: string) => void;
  connectionLabels: string[];
  /** For host: peers with avatar+name from connections. For client: names from peerList with empty avatar. */
  connectionSenders: LogDataMetadataSenderData[];
  clearMessageLog: () => void;
  deleteMessage: (id: string) => void;
  replaceMessageLog: (log: LogData[]) => void;
  exportLog: () => string;
  importLog: (json: string) => void;
  host: () => void;
  node: (ID: string) => void;
  disconnect: () => void;
  connected: boolean;
  connections: DataConnection[];
  messageApi: MessageInstance | null;
  contextHolder: ReactElement | null;
  ID: string;
  senderData: LogDataMetadataSenderData | null;
  isHost: boolean;
}

const defaultContextValue: MessageBusContextValue = {
  messageLog: [],
  send: () => {},
  sendDirect: () => {},
  connectionLabels: [],
  connectionSenders: [],
  clearMessageLog: () => {},
  deleteMessage: () => {},
  replaceMessageLog: () => {},
  exportLog: () => "",
  importLog: () => {},
  host: () => {},
  node: () => {},
  disconnect: () => {},
  connected: false,
  connections: [],
  messageApi: null,
  contextHolder: null,
  ID: "",
  senderData: null,
  isHost: false,
};

export const MessageBusContext = createContext<MessageBusContextValue>(defaultContextValue);