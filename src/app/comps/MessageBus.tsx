import React, { useEffect, useRef, useState } from "react";
import { LogData, LogDataMetadataSenderData, MessageBusContext } from "../contexts/MessageBusContext";
import { message } from "antd";
import Peer, { DataConnection } from "peerjs";

const CONNECTION_TIMEOUT_MS = 15000;
const KEEPALIVE_INTERVAL_MS = 25_000;
const KEEPALIVE_TYPE = "keepalive";

export function MessageBus (props: any) {
    const [messageLog, setMessageLog]   = useState<Array<LogData>>([
      {content: {message: "Teste!"},
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
    const [connected, setConnected]     = useState(false)
    const randomKey                     = Math.floor(Math.random()*100)
    const [senderData, setSenderData]   = useState<LogDataMetadataSenderData>({
      avatar: `https://api.dicebear.com/9.x/rings/svg?seed=${randomKey}`,
        name: `Player ${randomKey}`,
    })

    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Array<DataConnection>>([]);
    const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keepaliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    connectionsRef.current = connections;

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

    function clearConnectionTimeout() {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    }

    function send (data: LogData) {
      if (isHost) {
        setMessageLog(prev => [...prev, data]);
        const currentConnections = connectionsRef.current;
        for (let i = 0; i < currentConnections.length; i++) {
          const c = currentConnections[i];
          if (c.open) c.send(data);
        }
      } else if (conn?.open) {
        sendToLog(data)
      } else {
        messageApi.error("Não estamos conectados em ninguém, parsa!")
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
            content: {message: "New connection!"},
            metadata: {
              type: "Connection",
              code: 1,
              data: {},
              sender: {
                avatar: connPeer.metadata?.avatar,
                name: connPeer.metadata?.label,
              }
            }
          } as LogData
          setMessageLog(prev => [...prev, messageReport])

          connPeer.on("data", (data) => {
            const payload = data as LogData;
            if (payload.metadata?.type === KEEPALIVE_TYPE) return;
            broadcast(payload);
          })
          connPeer.on("close", () => {
            setConnections(prev => prev.filter(c => c !== connPeer));
          })
          connPeer.on("error", () => {
            setConnections(prev => prev.filter(c => c !== connPeer));
          })
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
        dataConn.on('open', () => {
          if (peerRef.current !== peer) return
          clearConnectionTimeout()
          setConn(dataConn)
          setConnected(true)
          dataConn.on("data", (data: any) => {
            const payload = data as LogData
            if (payload.metadata?.type === KEEPALIVE_TYPE) return
            setMessageLog(prev => [...prev, payload])
          })
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
      setMessageLog(prev => [...prev, data]);
      const currentConnections = connectionsRef.current;
      for (let connIndex = 0; connIndex < currentConnections.length; connIndex++) {
        const element = currentConnections[connIndex];
        if (element.open) {
          element.send(data);
        }
      }
    }

    function sendToLog(data: LogData) {
      if(conn?.open) {
        conn.send(data)
      }
    }

    return <>
      <MessageBusContext.Provider value={{
        messageLog,
        send,
        host,
        node,
        disconnect,
        connections,
        connected,
        messageApi,
        contextHolder,
        senderData,
        ID,
        isHost
      }}>
        {contextHolder}
        {props.children}
      </MessageBusContext.Provider>
    </>
  }
