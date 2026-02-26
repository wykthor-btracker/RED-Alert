import React, { useEffect, useRef, useState } from "react";
import { InitiativeCombatant, LogData, LogDataMetadataSenderData, MapGridState, MessageBusContext } from "../contexts/MessageBusContext";
import { message } from "antd";
import Peer, { DataConnection } from "peerjs";
import type { CharacterData } from "../types/character";
import { createDefaultCharacterData } from "../types/character";

const CONNECTION_TIMEOUT_MS = 15000;
const KEEPALIVE_INTERVAL_MS = 25_000;
const KEEPALIVE_TYPE = "keepalive";
const SYNC_TYPE = "sync";
const MAP_GRID_SYNC_TYPE = "mapGridSync";
const INITIATIVE_SYNC_TYPE = "initiativeSync";
const REQUEST_INITIAL_SYNC_TYPE = "requestInitialSync";
const USER_DATA_SYNC_TYPE = "userDataSync";
const USER_DATA_UPDATE_TYPE = "userDataUpdate";
const USER_SHEETS_SYNC_TYPE = "userSheetsSync";

const HOST_PERSIST_STORAGE_KEY = "soundboard:hostPersist";

type HostPersistState = {
  savedCharacters: Array<{ ownerName: string; peerId?: string; data: CharacterData }>;
  messageLog: LogData[];
  mapGrid: MapGridState | null;
  initiativeCombatants: InitiativeCombatant[];
  userData: CharacterData | null;
  currentEditedOwnerName: string | null;
};

function loadHostPersist(): Partial<HostPersistState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOST_PERSIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<HostPersistState>;
  } catch {
    return null;
  }
}

function saveHostPersist(state: HostPersistState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOST_PERSIST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy errors
  }
}

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function MessageBus (props: any) {
    const [messageLog, setMessageLog]   = useState<Array<LogData>>([
      { id: nextId(), content: {message: "Teste!"},
      metadata: {
        sender: {
          avatar: `https://api.dicebear.com/9.x/rings/svg?seed=maestro`,
          name: "M.A.E.S.T.R.O"
        },
        code: 2,
        type: "message",
        data: {}
      }}
    ])
    const [messageApi, contextHolder]   = message.useMessage();
    const [conn, setConn]               = useState<DataConnection | null>(null)
    const [ID, setID]                   = useState<string>("")
    const [isHost, setIsHost]           = useState(false)
    const [connections, setConnections] = useState<Array<DataConnection>>([])
    const [peerList, setPeerList] = useState<string[]>([])
    const [connected, setConnected] = useState(false)
    /** Host: display name overrides per connection peer id (set when client sends displayName). */
    const [connectionDisplayNames, setConnectionDisplayNames] = useState<Record<string, string>>({})
    const randomKey                     = Math.floor(Math.random()*100)
    const [senderData, setSenderData]   = useState<LogDataMetadataSenderData>({
      avatar: `https://api.dicebear.com/9.x/rings/svg?seed=${randomKey}`,
        name: `Player ${randomKey}`,
    })
    const [mapGrid, setMapGridState] = useState<MapGridState | null>(null)
    const [initiativeCombatants, setInitiativeCombatantsState] = useState<InitiativeCombatant[]>([])
    const [userData, setUserDataState] = useState<CharacterData | null>(null)
    /** Host: saved characters (owner name + optional peerId for client-owned; data). */
    const [savedCharacters, setSavedCharactersState] = useState<Array<{ ownerName: string; peerId?: string; data: CharacterData }>>([])
    /** Host: which saved character is currently being edited (owner name). */
    const [currentEditedOwnerName, setCurrentEditedOwnerNameState] = useState<string | null>(null)
    /** Client: sheets the host sent for this peer (by name). */
    const [receivedSheets, setReceivedSheetsState] = useState<CharacterData[]>([])

    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Array<DataConnection>>([]);
    const connectionDisplayNamesRef = useRef<Record<string, string>>({});
    const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keepaliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mapGridRef = useRef<MapGridState | null>(null);
    const initiativeCombatantsRef = useRef<InitiativeCombatant[]>([]);
    const userDataRef = useRef<CharacterData | null>(null);
    const currentEditedOwnerNameRef = useRef<string | null>(null);
    const savedCharactersRef = useRef<Array<{ ownerName: string; peerId?: string; data: CharacterData }>>([]);
    currentEditedOwnerNameRef.current = currentEditedOwnerName;
    savedCharactersRef.current = savedCharacters;

    connectionsRef.current = connections;
    connectionDisplayNamesRef.current = connectionDisplayNames;
    mapGridRef.current = mapGrid;
    initiativeCombatantsRef.current = initiativeCombatants;
    userDataRef.current = userData;

    function clearKeepaliveInterval() {
      if (keepaliveIntervalRef.current) {
        clearInterval(keepaliveIntervalRef.current);
        keepaliveIntervalRef.current = null;
      }
    }

    useEffect(() => {
      return () => {
        connectionTimeoutRef.current && clearTimeout(connectionTimeoutRef.current);
        clearKeepaliveInterval();
        peerRef.current?.destroy();
        peerRef.current = null;
        setConn(null);
        setConnections([]);
        setConnected(false);
      };
    }, []);

    useEffect(()=>{
      if(messageLog.length) {
        const lastMessage = messageLog[messageLog.length-1]
        if(lastMessage.metadata.code == 1) {
          messageApi.info(lastMessage.content.message)
        }
        if(lastMessage.metadata.code == 3) {
          if(lastMessage.metadata.data.target == senderData.name) {
            messageApi.error(lastMessage.content.message)
          }
        }
      }
    }, [messageLog])

    // Persist host state to localStorage whenever it changes (so same browser can restore when hosting again)
    useEffect(() => {
      if (!isHost) return;
      saveHostPersist({
        savedCharacters,
        messageLog,
        mapGrid,
        initiativeCombatants,
        userData,
        currentEditedOwnerName,
      });
    }, [isHost, savedCharacters, messageLog, mapGrid, initiativeCombatants, userData, currentEditedOwnerName]);

    function clearConnectionTimeout() {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    }

    function send (data: LogData) {
      if (isHost) {
        const withId = { ...data, id: data.id ?? nextId() };
        if (data.metadata?.type === "direct") {
          setMessageLog(prev => [...prev, withId]);
          const target = connectionsRef.current.find(
            (c) => (connectionDisplayNames[c.peer] ?? c.metadata?.label ?? c.peer) === data.metadata?.data?.targetName
          );
          if (target?.open) target.send(withId);
        } else {
          broadcast(withId);
        }
      } else if (conn?.open) {
        sendToLog(data);
      } else {
        messageApi.error("Não estamos conectados em ninguém, parsa!");
      }
    }

    function sendDirect(targetName: string, messageText: string) {
      if (!senderData) return;
      send({
        content: { message: messageText },
        metadata: {
          sender: senderData,
          type: "direct",
          code: 2,
          data: { targetName },
        },
      } as LogData);
    }

    function clearMessageLog() {
      if (!isHost) return;
      setMessageLog([]);
      const syncPayload = {
        metadata: { type: SYNC_TYPE, code: 0, sender: senderData!, data: { action: "replace", log: [] } },
        content: {},
      };
      connectionsRef.current.forEach((c) => { if (c.open) c.send(syncPayload); });
      // Resend peer list so clients (and host UI) keep the connected-players list visible
      const labels = connectionsRef.current
        .map((c) => connectionDisplayNames[c.peer] ?? (c.metadata?.label as string) ?? c.peer ?? "")
        .filter(Boolean);
      connectionsRef.current.forEach((c) => {
        if (c.open) c.send({ metadata: { type: "peerList", code: 0, sender: senderData!, data: { peers: labels } }, content: {} });
      });
    }

    function deleteMessage(id: string) {
      if (!isHost) return;
      setMessageLog((prev) => prev.filter((m) => m.id !== id));
      const syncPayload = {
        metadata: { type: SYNC_TYPE, code: 0, sender: senderData!, data: { action: "delete", id } },
        content: {},
      };
      connectionsRef.current.forEach((c) => { if (c.open) c.send(syncPayload); });
    }

    function replaceMessageLog(log: LogData[]) {
      if (!isHost) return;
      const withIds = log.map((m) => ({ ...m, id: m.id ?? nextId() }));
      setMessageLog(withIds);
      const syncPayload = {
        metadata: { type: SYNC_TYPE, code: 0, sender: senderData!, data: { action: "replace", log: withIds } },
        content: {},
      };
      connectionsRef.current.forEach((c) => { if (c.open) c.send(syncPayload); });
    }

    function exportLog(): string {
      return JSON.stringify(messageLog, null, 2);
    }

    function importLog(json: string) {
      if (!isHost) return;
      const raw = (json ?? "").replace(/^\uFEFF/, "").trim();
      if (!raw) {
        messageApi?.error("Ficheiro vazio.");
        return;
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        const arr: LogData[] = Array.isArray(parsed)
          ? parsed
          : (parsed && typeof parsed === "object" && Array.isArray((parsed as { log?: LogData[] }).log))
            ? (parsed as { log: LogData[] }).log
            : [];
        if (arr.length === 0 && !Array.isArray(parsed)) {
          messageApi?.error("JSON inválido: esperado um array ou objeto com 'log'.");
          return;
        }
        const normalized = arr.map((m) => ({
          ...m,
          id: m?.id ?? nextId(),
          content: m?.content ?? {},
          metadata: {
            ...(m?.metadata ?? {}),
            code: (m?.metadata as { code?: number })?.code ?? 2,
            type: (m?.metadata as { type?: string })?.type ?? "message",
            sender: (m?.metadata as { sender?: LogDataMetadataSenderData })?.sender ?? { avatar: "", name: "" },
            data: (m?.metadata as { data?: object })?.data ?? {},
          },
        })) as LogData[];
        replaceMessageLog(normalized);
        messageApi?.success(`Log importado: ${normalized.length} mensagem(ns).`);
      } catch (err) {
        messageApi?.error("JSON inválido: " + (err instanceof Error ? err.message : String(err)));
      }
    }

    function host () {
      peerRef.current?.destroy()
      peerRef.current = null
      setConnections([])

      setIsHost(true)

      setSenderData({
        avatar: `https://api.dicebear.com/9.x/rings/svg?seed=maestro`,
        name: "M.A.E.S.T.R.O",
      })

      // Restore last host state from localStorage (same browser hosting again)
      const restored = loadHostPersist();
      if (restored) {
        if (Array.isArray(restored.savedCharacters) && restored.savedCharacters.length > 0) {
          setSavedCharactersState(
            restored.savedCharacters.filter(
              (s) => s && typeof s === "object" && typeof s.ownerName === "string" && s.data && typeof (s.data as CharacterData).stats === "object"
            )
          );
        }
        if (Array.isArray(restored.messageLog) && restored.messageLog.length > 0) {
          const withIds = restored.messageLog.map((m) => ({
            ...m,
            id: (m as LogData).id ?? nextId(),
          })) as LogData[];
          setMessageLog(withIds);
        }
        if (restored.mapGrid && typeof restored.mapGrid === "object" && typeof restored.mapGrid.rows === "number" && typeof restored.mapGrid.cols === "number" && Array.isArray(restored.mapGrid.cells)) {
          setMapGridState(restored.mapGrid);
        }
        if (Array.isArray(restored.initiativeCombatants) && restored.initiativeCombatants.length > 0) {
          setInitiativeCombatantsState(
            restored.initiativeCombatants.filter(
              (c) => c && typeof c === "object" && typeof c.id === "string" && typeof c.name === "string"
            )
          );
        }
        if (restored.userData && typeof restored.userData === "object" && typeof (restored.userData as CharacterData).stats === "object") {
          setUserDataState(restored.userData as CharacterData);
        }
        if (restored.currentEditedOwnerName != null && typeof restored.currentEditedOwnerName === "string") {
          setCurrentEditedOwnerNameState(restored.currentEditedOwnerName);
        }
      }

      const peer = new Peer()
      peerRef.current = peer;
      messageApi.open({
        type: 'loading',
        content: 'Gerando ID...',
        duration: 0,
      });
      peer.on("disconnected", () => {
        setConnected(false)
      })
      peer.on("error", (err) => {
        messageApi.destroy()
        messageApi.error(err?.message ?? "Erro na conexão como host.")
        setConnected(false)
      })
      peer.on("open", (id) => {
        setConnected(true)
        setID(id)
        messageApi.destroy()
        peer.on("connection", (connPeer)=>{
          setConnections(prev => [...prev, connPeer])

          const messageReport = {
            id: nextId(),
            content: { message: "Nova conexão!" },
            metadata: {
              type: "Connection",
              code: 1,
              data: {},
              sender: {
                avatar: connPeer.metadata?.avatar,
                name: connPeer.metadata?.label,
              },
            },
          } as LogData;
          setMessageLog(prev => [...prev, messageReport]);

          function sendPeerListToAll(conns: DataConnection[]) {
            const displayNames = connectionDisplayNamesRef.current;
            const labels = conns
              .map((c) => displayNames[c.peer] ?? (c.metadata?.label as string) ?? c.peer ?? "")
              .filter(Boolean);
            conns.forEach((c) => {
              if (c.open) c.send({ metadata: { type: "peerList", code: 0, sender: senderData, data: { peers: labels } }, content: {} });
            });
          }
          function sendInitialSyncToPeer(peerConn: DataConnection) {
            if (!peerConn.open) return;
            const initiative = initiativeCombatantsRef.current;
            if (initiative.length > 0) {
              const list = initiative.map((c) => ({ ...c }));
              peerConn.send({ metadata: { type: INITIATIVE_SYNC_TYPE, code: 0, sender: senderData, data: list }, content: {} });
            }
            const grid = mapGridRef.current;
            if (grid) peerConn.send({ metadata: { type: MAP_GRID_SYNC_TYPE, code: 0, sender: senderData, data: grid }, content: {} });
            const peerName = connectionDisplayNamesRef.current[peerConn.peer] ?? (peerConn.metadata?.label as string) ?? "";
            const saved = savedCharactersRef.current;
            const matchingSheets = peerName ? saved.filter((s) => s.ownerName === peerName) : [];
            const sheetsData = matchingSheets.map((s) => s.data);
            peerConn.send({
              metadata: { type: USER_SHEETS_SYNC_TYPE, code: 0, sender: senderData, data: { sheets: sheetsData } },
              content: {},
            });
          }

          connPeer.on("open", () => {
            sendPeerListToAll([...connectionsRef.current, connPeer]);
            sendInitialSyncToPeer(connPeer);
          });

          connPeer.on("data", (data) => {
            const payload = data as LogData;
            if (payload.metadata?.type === KEEPALIVE_TYPE) return;
            if (payload.metadata?.type === MAP_GRID_SYNC_TYPE) return;
            if (payload.metadata?.type === INITIATIVE_SYNC_TYPE) return;
            if (payload.metadata?.type === USER_DATA_SYNC_TYPE) return;
            if (payload.metadata?.type === USER_SHEETS_SYNC_TYPE) return;
            if (payload.metadata?.type === REQUEST_INITIAL_SYNC_TYPE) {
              sendInitialSyncToPeer(connPeer);
              return;
            }
            if (payload.metadata?.type === USER_DATA_UPDATE_TYPE) {
              const ud = payload.metadata?.data as CharacterData | null | undefined;
              if (ud && typeof ud === "object") {
                const ownerName = connectionDisplayNamesRef.current[connPeer.peer] ?? (connPeer.metadata?.label as string) ?? connPeer.peer ?? "Unknown";
                setSavedCharactersState((prev) => {
                  // Remove any existing entry for this peer or same owner so we don't duplicate (e.g. host had "Alice" without peerId, then client Alice sends update)
                  const rest = prev.filter((s) => s.peerId !== connPeer.peer && s.ownerName !== ownerName);
                  return [...rest, { ownerName, peerId: connPeer.peer, data: ud }];
                });
                setUserDataState(ud);
                userDataRef.current = ud;
                const syncPayload = {
                  metadata: { type: USER_DATA_SYNC_TYPE, code: 0, sender: senderData, data: ud },
                  content: {},
                } as LogData;
                connectionsRef.current.forEach((c) => { if (c.open) c.send(syncPayload); });
              }
              return;
            }
            if (payload.metadata?.type === "displayName") {
              const name = payload.metadata?.data?.name as string | undefined;
              if (name != null) {
                setConnectionDisplayNames((prev) => {
                  const next = { ...prev, [connPeer.peer]: name };
                  connectionDisplayNamesRef.current = next;
                  return next;
                });
                setSavedCharactersState((prev) =>
                  prev.map((entry) =>
                    entry.peerId === connPeer.peer ? { ...entry, ownerName: name } : entry
                  )
                );
                const saved = savedCharactersRef.current;
                const matchingSheets = saved.filter((s) => s.ownerName === name || s.peerId === connPeer.peer);
                if (matchingSheets.length > 0 && connPeer.open) {
                  const sheetToSend = matchingSheets.find((s) => s.peerId === connPeer.peer) ?? matchingSheets[0];
                  connPeer.send({
                    metadata: { type: USER_DATA_SYNC_TYPE, code: 0, sender: senderData, data: sheetToSend.data },
                    content: {},
                  } as LogData);
                }
                setTimeout(() => sendPeerListToAll(connectionsRef.current), 0);
              }
              return;
            }
            const withId = { ...payload, id: payload.id ?? nextId() };
            if (payload.metadata?.type === "direct") {
              connPeer.send(withId);
              const targetName = payload.metadata?.data?.targetName;
              const displayNames = connectionDisplayNamesRef.current;
              const target = connectionsRef.current.find(
                (c) => (displayNames[c.peer] ?? c.metadata?.label ?? c.peer) === targetName
              );
              if (target?.open && target !== connPeer) target.send(withId);
            } else {
              broadcast(withId);
            }
          });
          connPeer.on("close", () => {
            setConnectionDisplayNames((prev) => {
              const next = { ...prev };
              delete next[connPeer.peer];
              connectionDisplayNamesRef.current = next;
              return next;
            });
            setConnections(prev => {
              const next = prev.filter(c => c !== connPeer);
              setTimeout(() => sendPeerListToAll(next), 0);
              return next;
            });
          });
          connPeer.on("error", () => {
            setConnectionDisplayNames((prev) => {
              const next = { ...prev };
              delete next[connPeer.peer];
              connectionDisplayNamesRef.current = next;
              return next;
            });
            setConnections(prev => {
              const next = prev.filter(c => c !== connPeer);
              setTimeout(() => sendPeerListToAll(next), 0);
              return next;
            });
          });
        })
      })
    }

    function node (connID: string) {
      messageApi.loading("Conectando ao host...", 0)
      peerRef.current?.destroy()
      peerRef.current = null
      if(conn) {
        conn.close()
        setConn(null)
      }
      clearConnectionTimeout();
      const peer = new Peer()
      peerRef.current = peer;
      peer.on("disconnected", () => {
        clearKeepaliveInterval()
        setConnected(false)
      })
      peer.on("error", (err) => {
        clearConnectionTimeout()
        clearKeepaliveInterval()
        messageApi.destroy()
        messageApi.error(err?.message ?? "Erro ao conectar.")
        setConnected(false)
      })
      peer.on("open", () => {
        messageApi.destroy()
        const dataConn = peer.connect(connID,
          {metadata:
            {
              label: senderData?.name,
              avatar: senderData?.avatar
            }});

        connectionTimeoutRef.current = setTimeout(() => {
          if (!dataConn.open) {
            clearConnectionTimeout()
            clearKeepaliveInterval()
            messageApi.destroy()
            messageApi.error("Conexão expirou. O host pode estar offline.")
            setConn(null)
            setConnected(false)
            peer.destroy()
            peerRef.current = null
          }
        }, CONNECTION_TIMEOUT_MS);

        dataConn.on("error", () => {
          clearConnectionTimeout()
          clearKeepaliveInterval()
          messageApi.destroy()
          setConn(null)
          setConnected(false)
        })
        dataConn.on("close", () => {
          clearConnectionTimeout()
          clearKeepaliveInterval()
          setConn(null)
          setConnected(false)
        })
        // Attach data handler immediately so we don't miss initial sync (host may send before "open" fires)
        dataConn.on("data", (data: any) => {
          const payload = data as LogData;
          if (payload.metadata?.type === KEEPALIVE_TYPE) return;
          if (payload.metadata?.type === SYNC_TYPE) {
            const d = payload.metadata?.data;
            if (d?.action === "replace" && Array.isArray(d.log)) setMessageLog(d.log);
            if (d?.action === "delete" && d?.id) setMessageLog((prev) => prev.filter((m) => m.id !== d.id));
            return;
          }
          if (payload.metadata?.type === "peerList") {
            setPeerList(payload.metadata?.data?.peers ?? []);
            return;
          }
          if (payload.metadata?.type === MAP_GRID_SYNC_TYPE) {
            const grid = payload.metadata?.data as MapGridState | null | undefined;
            if (grid && typeof grid.rows === "number" && typeof grid.cols === "number" && Array.isArray(grid.cells))
              setMapGridState(grid);
            else if (grid === null) setMapGridState(null);
            return;
          }
          if (payload.metadata?.type === INITIATIVE_SYNC_TYPE) {
            const list = payload.metadata?.data as InitiativeCombatant[] | undefined;
            if (Array.isArray(list)) {
              const normalized = list.map((c) => ({
                ...c,
                name: typeof c?.name === "string" ? c.name : (c?.id ?? ""),
              }));
              setInitiativeCombatantsState(normalized);
            } else {
              setInitiativeCombatantsState([]);
            }
            return;
          }
          if (payload.metadata?.type === USER_SHEETS_SYNC_TYPE) {
            const payloadData = payload.metadata?.data as { sheets?: CharacterData[] } | undefined;
            const sheets = Array.isArray(payloadData?.sheets) ? payloadData.sheets : [];
            setReceivedSheetsState(sheets.filter((s) => s && typeof s === "object" && typeof (s as CharacterData).stats === "object"));
            setUserDataState(null);
            return;
          }
          if (payload.metadata?.type === USER_DATA_SYNC_TYPE) {
            const ud = payload.metadata?.data as CharacterData | null | undefined;
            if (ud && typeof ud === "object" && typeof ud.stats === "object") {
              setUserDataState(ud);
            } else if (ud === null) {
              setUserDataState(null);
            }
            return;
          }
          setMessageLog((prev) => [...prev, { ...payload, id: payload.id ?? nextId() }]);
        });
        dataConn.on("open", () => {
          if (peerRef.current !== peer) return
          clearConnectionTimeout()
          setConn(dataConn)
          setConnected(true)
          dataConn.send({
            metadata: { type: REQUEST_INITIAL_SYNC_TYPE, code: 0, sender: senderData, data: {} },
            content: {},
          } as LogData);
          clearKeepaliveInterval()
          keepaliveIntervalRef.current = setInterval(() => {
            if (peerRef.current !== peer || !dataConn.open) {
              clearKeepaliveInterval()
              return
            }
            dataConn.send({
              content: {},
              metadata: {
                type: KEEPALIVE_TYPE,
                code: 0,
                sender: senderData,
                data: {},
              },
            } as LogData)
          }, KEEPALIVE_INTERVAL_MS)
        });
      })
    }

    function disconnect () {
      clearConnectionTimeout()
      clearKeepaliveInterval()
      conn?.close()
      peerRef.current?.destroy()
      peerRef.current = null
      setConn(null)
      setConnections([])
      setConnected(false)
      setIsHost(false)
      setID("")
    }

    function broadcast(data: LogData) {
      const withId = { ...data, id: data.id ?? nextId() };
      setMessageLog(prev => [...prev, withId]);
      const currentConnections = connectionsRef.current;
      for (let connIndex = 0; connIndex < currentConnections.length; connIndex++) {
        const element = currentConnections[connIndex];
        if (element.open) element.send(withId);
      }
    }

    function sendToLog(data: LogData) {
      if(conn?.open) {
        conn.send(data)
      }
    }

    const connectionLabels = isHost
      ? connections
          .map((c) => connectionDisplayNames[c.peer] ?? (c.metadata?.label as string) ?? c.peer ?? "")
          .filter(Boolean)
      : peerList;

    const connectionSenders: LogDataMetadataSenderData[] = isHost
      ? connections
          .map((c) => ({
            avatar: (c.metadata?.avatar as string) ?? "",
            name: connectionDisplayNames[c.peer] ?? (c.metadata?.label as string) ?? c.peer ?? "",
          }))
          .filter((p) => p.name)
      : peerList.map((label) => ({ avatar: "", name: label }));

    function updateDisplayName(name: string) {
      const trimmed = (name ?? "").trim();
      if (!trimmed) return;
      setSenderData((prev) => (prev ? { ...prev, name: trimmed } : prev));
      if (!isHost && conn?.open) {
        conn.send({
          metadata: { type: "displayName", code: 0, sender: senderData, data: { name: trimmed } },
          content: {},
        } as LogData);
      }
    }

    function setMapGrid(state: MapGridState | null) {
      if (!isHost) return;
      setMapGridState(state);
      mapGridRef.current = state;
      const payload = {
        metadata: { type: MAP_GRID_SYNC_TYPE, code: 0, sender: senderData!, data: state },
        content: {},
      } as LogData;
      connectionsRef.current.forEach((c) => {
        if (c.open) c.send(payload);
      });
    }

    function setInitiativeCombatants(listOrUpdater: InitiativeCombatant[] | ((prev: InitiativeCombatant[]) => InitiativeCombatant[])) {
      if (!isHost) return;
      const next = typeof listOrUpdater === "function"
        ? listOrUpdater(initiativeCombatantsRef.current)
        : listOrUpdater;
      setInitiativeCombatantsState(next);
      initiativeCombatantsRef.current = next;
      const payload = {
        metadata: { type: INITIATIVE_SYNC_TYPE, code: 0, sender: senderData!, data: next.map((c) => ({ ...c })) },
        content: {},
      } as LogData;
      connectionsRef.current.forEach((c) => {
        if (c.open) c.send(payload);
      });
    }

    function setUserData(dataOrUpdater: CharacterData | null | ((prev: CharacterData | null) => CharacterData | null)) {
      const next = typeof dataOrUpdater === "function"
        ? dataOrUpdater(userDataRef.current)
        : dataOrUpdater;
      if (isHost) {
        setUserDataState(next);
        userDataRef.current = next;
        if (next) {
          const ownerKey = currentEditedOwnerNameRef.current ?? senderData?.name ?? "Host";
          setSavedCharactersState((prev) => {
            const rest = prev.filter((s) => s.ownerName !== ownerKey);
            return [...rest, { ownerName: ownerKey, data: next }];
          });
        }
        const payload = {
          metadata: { type: USER_DATA_SYNC_TYPE, code: 0, sender: senderData!, data: next },
          content: {},
        } as LogData;
        connectionsRef.current.forEach((c) => { if (c.open) c.send(payload); });
      } else if (conn?.open) {
        conn.send({
          metadata: { type: USER_DATA_UPDATE_TYPE, code: 0, sender: senderData!, data: next },
          content: {},
        } as LogData);
      }
    }

    function setSavedCharacter(ownerName: string, data: CharacterData) {
      if (!isHost) return;
      setSavedCharactersState((prev) => {
        const rest = prev.filter((s) => s.ownerName !== ownerName);
        return [...rest, { ownerName, data }];
      });
    }

    function setCurrentEditedOwnerName(name: string | null) {
      if (!isHost) return;
      currentEditedOwnerNameRef.current = name;
      setCurrentEditedOwnerNameState(name);
    }

    function exportUserData(): string {
      const ud = userDataRef.current ?? userData;
      return JSON.stringify(ud ?? createDefaultCharacterData(), null, 2);
    }

    function importUserData(json: string) {
      if (!isHost) return;
      const raw = (json ?? "").replace(/^\uFEFF/, "").trim();
      if (!raw) {
        messageApi?.error("Ficheiro vazio.");
        return;
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object" && parsed !== null && "stats" in parsed) {
          const ud = parsed as CharacterData;
          const ownerKey = senderData?.name ?? "Host";
          setSavedCharactersState((prev) => {
            const rest = prev.filter((s) => s.ownerName !== ownerKey);
            return [...rest, { ownerName: ownerKey, data: ud }];
          });
          setUserDataState(ud);
          userDataRef.current = ud;
          setCurrentEditedOwnerNameState(ownerKey);
          const payload = {
            metadata: { type: USER_DATA_SYNC_TYPE, code: 0, sender: senderData!, data: ud },
            content: {},
          } as LogData;
          connectionsRef.current.forEach((c) => { if (c.open) c.send(payload); });
          messageApi?.success("Dados do personagem importados.");
        } else {
          messageApi?.error("JSON inválido: esperado objeto com 'stats'.");
        }
      } catch (err) {
        messageApi?.error("JSON inválido: " + (err instanceof Error ? err.message : String(err)));
      }
    }

    return <>
      <MessageBusContext.Provider value={{
        messageLog,
        send,
        sendDirect,
        connectionLabels,
        connectionSenders,
        clearMessageLog,
        deleteMessage,
        replaceMessageLog,
        exportLog,
        importLog,
        host,
        node,
        disconnect,
        updateDisplayName,
        connections,
        connected,
        messageApi,
        contextHolder,
        senderData,
        ID,
        isHost,
        mapGrid,
        setMapGrid,
        initiativeCombatants,
        setInitiativeCombatants,
        userData,
        setUserData,
        exportUserData,
        importUserData,
        savedCharacters,
        setSavedCharacter,
        currentEditedOwnerName,
        setCurrentEditedOwnerName,
        receivedSheets,
      }}>
        {contextHolder}
        {props.children}
      </MessageBusContext.Provider>
    </>
  }
