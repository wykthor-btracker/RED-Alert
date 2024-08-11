'use client';
import { ArrowRightOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Avatar, Card, Col, Divider, Image, Input, List, message, Row, Tabs, TabsProps, Typography } from "antd";
import type { MessageInstance } from 'antd/es/message/interface';
import Peer, { DataConnection } from "peerjs";
import TweenOne from 'rc-tween-one';
import { createContext, ReactElement, useContext, useEffect, useRef, useState } from "react";
import useImage from "use-image";
import AudioCard from "./comps/AudioCard";
import SideMenu from "./comps/sideMenu";
import DiceRoller from "./pages/DiceRoller";
import InitiativeTracker from "./pages/InitiativeTracker";
import { useSpring, animated, useTransition, useSprings, useTrail } from "@react-spring/web"

interface LogDataMetadataSenderData {
  avatar: string,
  name: string,
}
interface LogDataMetadata {
  sender: LogDataMetadataSenderData,
  data: any
  type: string,
  code: number,
}
interface LogData {
  content: any,
  metadata: LogDataMetadata
}

export const MessageBusContext = createContext({
  messageLog: [] as LogData[],
  send: (data: LogData) => {}, 
  host: () => {},
  node: (ID: string) => {},
  messageApi: null as MessageInstance | null,
  contextHolder: null as ReactElement | null,
  ID: "",
  senderData: null as LogDataMetadataSenderData | null,
  isHost: false
})

function MessageBus (props: any) {
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
  const [conn, setConn]               = useState<DataConnection>()
  const [ID, setID]                   = useState<string>("")
  const [isHost, setIsHost]               = useState(false)
  const [connections, setConnections] = useState<Array<DataConnection>>([])
  const randomKey = Math.floor(Math.random()*100)
  const [senderData, setSenderData]       = useState<LogDataMetadataSenderData>({
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
    
    conn.on("open", (id) => {
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
    if(conn) {
      conn.close()
    }
    const peer = new Peer()
    peer.on("open", (id) => {
      var conn = peer.connect(connID, 
        {metadata: 
          {
            label: senderData?.name,
            avatar: senderData?.avatar
      }})
      conn.on('open', function() {    
          setConn(conn)
          conn.on("data", (data: any) => {
            var newData = messageLog
            newData.push(data as LogData)
            setMessageLog([...newData])
          })
        });
    })
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


export default function Home() {
  const [image] = useImage("map.jpeg")

  const items: TabsProps['items'] = [
    {
      key: "1",
      label: "Audio",
      children:       <Row gutter={16} style={{margin: 10}}>
          <AudioCard title="Calling"          source="/sounds/caller.mp4"/>
          <AudioCard title="Receiving Call"   source="/sounds/call received.mp4"/>
          <AudioCard title="Message sent"     source="/sounds/message sent.mp4"/>
          <AudioCard title="Message received" source="/sounds/message received.mp4"/>
          <AudioCard title="ICE defeated"     source="/sounds/ICE defeated.mp4"/>
    </Row>},
    {
      key: "2",
      label: "Initiative",
      children: <InitiativeTracker/>
    },
    {
      key: "3",
      label: "Map",
      children: <>
      <Row style={{flex: 1}} gutter={[8,8]}>
        <Image />
      </Row>
      </>
    }
  ]
  return (
    <>
    <MessageBus>
      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} 
            tabBarExtraContent={{right: <SideMenu/>}}/>
        </Col>
        <Col span={24}>
          <ActivityLog/>
        </Col>
      </Row>
      
    </MessageBus>
    </>
  );
}

function alertPlayer (target: LogData, sender: LogDataMetadataSenderData | null, send: (data: LogData)=>void) {
  let data = {
    content: {message: "CUIDADO!"},
    metadata: {
      sender,
      data: {target: target.metadata.sender.name},
      code: 3,
      type: "Alert"
    }
  } as LogData
  send(data)
}
function AnimatedList(props: {list: LogData[]}) {
  const trail = useTrail(props.list.length, {
    from: { opacity: 0},
    to: { opacity: 1},
    duration: 2000, // Customize the animation duration
  });
  const filteredList = props.list.filter((item)=>item.metadata.code==2)

  return (
    <div>
      {trail.map((cprops, index) => (
        <animated.div key={index} style={cprops}>
          <Row gutter={[8,8]}>
            <Col>
              <Avatar src={filteredList[index].metadata.sender.avatar}/>
            </Col>
            <Col span={23}>
              <Col>
                <Typography.Text strong>
                  {filteredList[index].metadata.sender.name}
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text type={"secondary"}>
                  {filteredList[index].content.message}
                </Typography.Text>
              </Col>
            </Col>
          </Row>
        </animated.div>
      ))}
    </div>
  );
}
function ActivityLog (props: any) {
  const {messageLog, senderData, 
    send, isHost}                 = useContext(MessageBusContext)
  const [inputText, setInputText] = useState("")
  const ref                       = useRef(null)
  const inputRef                  = useRef<InputRef>(null)
  const springs = useSpring({
    from: {x:0},
    to: {x:100}
  })
  useEffect(()=>{
    if(ref.current) {
      console.log("focusing!")
      ref.current.scrollIntoView({behavior: "smooth"})
    }
  }, [messageLog])
  return <>
  <DiceRoller/>
  <Row>
    <Col span={24} style={{height: 250, overflow: "auto"}}>
        <Divider>Chat</Divider>
        <AnimatedList list={messageLog}/>
        {/* <List
          itemLayout="horizontal"
          dataSource={messageLog}
          renderItem={(item, index)=>{
            if(item.metadata.code == 2) {
            return <animated.div style={{...springs}}>
              <List.Item
                    key={index} 
                    onClick={()=>{
                      if(isHost) {
                        alertPlayer(item, senderData, send)
                      }
                    }}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.metadata.sender.avatar}/>}
                    title={item.metadata.sender.name}
                    description={item.content.message}/>
                  </List.Item>
            </animated.div>
            } else return null
          }}/> */}

          <div ref={ref}/>
          
    </Col>
    <Col span={24}>
        <Input 
          ref={inputRef}
          value={inputText} 
          onChange={(event)=>{setInputText(event.target.value)}} 
          onPressEnter={()=>{
            let data = {
              content: {message: inputText},
              metadata: {
                sender: senderData,
                type: "message",
                code: 2}
            } as LogData
            send(data)
            inputRef.current!.focus({cursor: "all"})
          }} 
          suffix={<ArrowRightOutlined/>}/>
    </Col>
  </Row>
  </>
}