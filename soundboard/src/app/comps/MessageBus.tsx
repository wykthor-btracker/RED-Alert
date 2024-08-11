import { useEffect, useState } from "react";
import { LogData, LogDataMetadataSenderData, MessageBusContext } from "../contexts/MessageBusContext";
import { message } from "antd";
import Peer, { DataConnection } from "peerjs";

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
    const [conn, setConn]               = useState<DataConnection | null>()
    const [ID, setID]                   = useState<string>("")
    const [isHost, setIsHost]           = useState(false)
    const [connections, setConnections] = useState<Array<DataConnection>>([])
    const [connected, setConnected]     = useState(false)
    const randomKey                     = Math.floor(Math.random()*100)
    const [senderData, setSenderData]   = useState<LogDataMetadataSenderData>({
      avatar: `https://api.dicebear.com/9.x/rings/svg?seed=${randomKey}`,
        name: `Player ${randomKey}`,
    })
  
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
  
    function send (data: LogData) {
      if(isHost && connections) {
        broadcast(data)
      }
      else if(conn) {
        sendToLog(data)
      } else {
        messageApi.error("Não estamos conectados em ninguém, parsa!")
      }
    }
  
    function host () {
  
      setIsHost(true)
      
      setSenderData({
        avatar: `https://api.dicebear.com/9.x/rings/svg?seed=maestro`,
        name: "M.A.E.S.T.R.O",
      })
  
      const conn = new Peer()
      messageApi.open({
        type: 'loading',
        content: 'Gerando ID...',
        duration: 0,
      });
      conn.on("disconnected", (id) => {
        setConnected(false)
      })
      conn.on("open", (id) => {
        setConnected(true)
        setID(id)
        messageApi.destroy()
        conn.on("connection", (connPeer)=>{
          const oldList = connections
          oldList.push(connPeer)
          setConnections([...oldList])
          
          const messageReport = {
            content: {message: "New connection!"},
            metadata: {
              type: "Connection",
              code: 1,
              data: {},
              sender: {
                avatar: connPeer.metadata.avatar,
                name: connPeer.metadata.label,
              }
            }
          } as LogData
          const oldMessageLog = messageLog
          oldMessageLog.push(messageReport)
          setMessageLog([...oldMessageLog])
  
          connPeer.on("data", (data) => {
            broadcast(data as LogData);
          })
        })
      })
    }
  
    function node (connID: string) {
      messageApi.loading("Conectando ao host...")
      if(conn) {
        conn.close()
      }
      const peer = new Peer()
      peer.on("disconnected", (id) => {
        setConnected(false)
      })
      peer.on("open", (id) => {
        messageApi.destroy()
        var conn = peer.connect(connID, 
          {metadata: 
            {
              label: senderData?.name,
              avatar: senderData?.avatar
        }})
        conn.on('open', function() {    
            setConn(conn)
            setConnected(true)
            conn.on("data", (data: any) => {
              var newData = messageLog
              newData.push(data as LogData)
              setMessageLog([...newData])
            })
          });
      })
    }

    function disconnect () {
      conn?.close()
    }
    function broadcast(data: LogData) {
      var newData = messageLog;
      newData.push(data);
      setMessageLog([...newData]);
      for (let connIndex = 0; connIndex < connections.length; connIndex++) {
  
        const element = connections[connIndex];
        console.log(element);
        element.send(data);
      }
    }
  
    function sendToLog(data: LogData) {
      if(conn) {
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