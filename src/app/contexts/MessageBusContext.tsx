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

/** Grid dimensions and per-cell combatant id (from iniciativa). Synced from host to all clients. */
export interface MapGridState {
  rows: number;
  cols: number;
  /** cells[row][col] = initiative combatant id or null when battle is underway */
  cells: (string | null)[][];
  /** Host-painted cover cells: key "row,col" => optional health for destructible cover. */
  coverCells?: Record<string, { health?: number }>;
}

/** Combatant from Iniciativa; synced from host for map and damage/armor actions. */
export interface InitiativeCombatant {
  id: string;
  name: string;
  currentHealth?: number;
  maxHealth?: number;
  stoppingPower?: number;
  stoppingPowerMax?: number;
  initiative?: number;
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
  /** Update display name (client sends to host; host updates own senderData). */
  updateDisplayName: (name: string) => void;
  connected: boolean;
  connections: DataConnection[];
  messageApi: MessageInstance | null;
  contextHolder: ReactElement | null;
  ID: string;
  senderData: LogDataMetadataSenderData | null;
  isHost: boolean;
  /** Customizable map grid; host sets dimensions, all nodes receive same state. */
  mapGrid: MapGridState | null;
  /** Host only: set grid dimensions/cells and broadcast to all connected nodes. */
  setMapGrid: (state: MapGridState | null) => void;
  /** Combatants from Iniciativa tab (id + name); host syncs to clients for map display. */
  initiativeCombatants: InitiativeCombatant[];
  /** Host only: set initiative list and broadcast to clients. */
  setInitiativeCombatants: (list: InitiativeCombatant[]) => void;
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
  updateDisplayName: () => {},
  connected: false,
  connections: [],
  messageApi: null,
  contextHolder: null,
  ID: "",
  senderData: null,
  isHost: false,
  mapGrid: null,
  setMapGrid: () => {},
  initiativeCombatants: [],
  setInitiativeCombatants: () => {},
};

export const MessageBusContext = createContext<MessageBusContextValue>(defaultContextValue);