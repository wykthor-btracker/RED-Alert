import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import Peer, { DataConnection } from "peerjs";
import { createContext, ReactElement, useEffect, useState } from "react";

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
  content: any,
  metadata: LogDataMetadata
}

export const MessageBusContext = createContext({
  messageLog: [] as LogData[],
  send: (data: LogData) => {}, 
  host: () => {},
  node: (ID: string) => {},
  disconnect: () => {},
  connected: false,
  connections: [] as DataConnection[],
  messageApi: null as MessageInstance | null,
  contextHolder: null as ReactElement | null,
  ID: "",
  senderData: null as LogDataMetadataSenderData | null,
  isHost: false
})