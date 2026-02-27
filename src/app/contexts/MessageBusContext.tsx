import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import Peer, { DataConnection } from "peerjs";
import { createContext, ReactElement } from "react";
import type { CharacterData } from "../types/character";

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
  /** Optional background image for the grid (data URL). Stored per map, synced with state. */
  backgroundImage?: string;
  /** Background position as percentage (0–100). Default 50,50 = center. Used for drag-to-position. */
  backgroundPositionX?: number;
  backgroundPositionY?: number;
}

/** Saved map: id, display name, and full grid state. Persisted and synced by host. */
export interface SavedMap {
  id: string;
  name: string;
  state: MapGridState;
}

/** Combatant from Iniciativa; synced from host for map and damage/armor actions. */
export interface InitiativeCombatant {
  id: string;
  name: string;
  currentHealth?: number;
  maxHealth?: number;
  stoppingPower?: number;
  stoppingPowerMax?: number;
  stoppingPowerHead?: number;
  stoppingPowerHeadMax?: number;
  initiative?: number;
  /** IDs from CPR_CRITICAL_INJURIES (e.g. "broken-ribs") — synced with host. */
  criticalInjuries?: string[];
  /** When added from a saved sheet: owner name so SP can be refreshed when sheet's equip changes. */
  sourceOwnerName?: string;
  /** When added from a saved sheet: sheet name (or owner) for matching. */
  sourceSheetName?: string;
  /** Name of the equipped body armor providing SP (for display in iniciativa). */
  bodyArmorName?: string;
  /** Name of the equipped helm providing head SP (for display in iniciativa). */
  headArmorName?: string;
  /** Character portrait/icon (data URL or preset id); used in initiative list and map cell background. */
  characterIcon?: string;
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
  /** Saved maps (id, name, state). Host persists and syncs; only host can add/change/delete. */
  savedMaps: SavedMap[];
  /** Which map is currently shown (id or null). Only host can change; synced to clients. */
  currentMapId: string | null;
  /** Host only: switch which map is displayed and broadcast. */
  setCurrentMapId: (id: string | null) => void;
  /** Host only: create a new map, add to list, switch to it and broadcast. */
  createMap: (name?: string) => void;
  /** Host only: rename the map with given id. */
  renameMap: (id: string, name: string) => void;
  /** Host only: remove map by id; if it was current, switch to another or null. */
  deleteMap: (id: string) => void;
  /** Host only: set or clear the background image for the current map (data URL). */
  setMapBackgroundImage: (dataUrl: string | null) => void;
  /** Host only: set background position for the current map (x,y as percentage 0–100). */
  setMapBackgroundPosition: (x: number, y: number) => void;
  /** Combatants from Iniciativa tab (id + name); host syncs to clients for map display. */
  initiativeCombatants: InitiativeCombatant[];
  /** Host only: set initiative list and broadcast to clients. Accepts new list or updater (prev => next). */
  setInitiativeCombatants: (listOrUpdater: InitiativeCombatant[] | ((prev: InitiativeCombatant[]) => InitiativeCombatant[])) => void;
  /** Character/user data; host is source of truth, synced to peers. */
  userData: CharacterData | null;
  /** Host: set and broadcast. Client: send userDataUpdate to host. */
  setUserData: (dataOrUpdater: CharacterData | null | ((prev: CharacterData | null) => CharacterData | null)) => void;
  /** Export current userData as JSON string. */
  exportUserData: () => string;
  /** Host only: import and broadcast new userData. */
  importUserData: (json: string) => void;
  /** Host only: list of saved characters (owner name + optional peerId for client-owned; data). Updated when clients send userData or host saves. Owner name updates when client changes display name. */
  savedCharacters: { ownerName: string; peerId?: string; data: CharacterData }[];
  /** Host only: upsert a saved character by owner name. */
  setSavedCharacter: (ownerName: string, data: CharacterData) => void;
  /** Host only: remove a saved character by owner name and close it if open. */
  removeSavedCharacter: (ownerName: string) => void;
  /** Host only: which saved character is currently being edited (owner name). Null = not editing from list. */
  currentEditedOwnerName: string | null;
  /** Host only: set which character is being edited (for syncing saves back to list). */
  setCurrentEditedOwnerName: (name: string | null) => void;
  /** Client only: list of sheets the host sent for this peer (by name match). Show list first, then open one. */
  receivedSheets: CharacterData[];
  /** Host only: when true, InitiativeTracker should skip one sheet→combatant sync (avoids overwriting damage after combatant→sheet push). */
  skipNextSheetToCombatantSync: boolean;
  /** Host only: set skip flag. */
  setSkipNextSheetToCombatantSync: (v: boolean) => void;
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
  savedMaps: [],
  currentMapId: null,
  setCurrentMapId: () => {},
  createMap: () => {},
  renameMap: () => {},
  deleteMap: () => {},
  setMapBackgroundImage: () => {},
  setMapBackgroundPosition: () => {},
  initiativeCombatants: [],
  setInitiativeCombatants: () => {},
  userData: null,
  setUserData: () => {},
  exportUserData: () => "",
  importUserData: () => {},
  savedCharacters: [],
  setSavedCharacter: () => {},
  removeSavedCharacter: () => {},
  currentEditedOwnerName: null,
  setCurrentEditedOwnerName: () => {},
  receivedSheets: [],
  skipNextSheetToCombatantSync: false,
  setSkipNextSheetToCombatantSync: () => {},
};

export const MessageBusContext = createContext<MessageBusContextValue>(defaultContextValue);