import { ElementRef, Ref, RefObject, useContext, useEffect, useRef, useState } from "react"
import { LogData, LogDataMetadataSenderData, MessageBusContext } from "../contexts/MessageBusContext"
import { Avatar, Button, Col, Divider, Dropdown, Flex, Input, InputRef, List, MenuProps, Row, Typography } from "antd"
import DiceRoller from "./DiceRoller"
import { ArrowRightOutlined } from "@ant-design/icons"
import { AnimatedList } from "../comps/AnimatedList"

function alertPlayer (
    target: LogDataMetadataSenderData, 
    sender: LogDataMetadataSenderData | null, 
    send: (data: LogData)=>void,
    title: string) {
  let data = {
    content: {message: title},
    metadata: {
      sender,
      data: {target: target.name},
      code: 10,
      type: "Sound Alert"
    }
  } as LogData
  send(data)
}

function PlayerAlertMenu (props: any) {
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Audio",
      children: [
        {
          key: "1-1",
          label: "Ligando",
          onClick: ()=>{alertPlayer(
            props.target,
            props.sender,
            props.send,
            "Ligando"
          )}
        },
        {
          key: "1-2",
          label: "Recebendo ligação",
          onClick: ()=>{alertPlayer(
            props.target,
            props.sender,
            props.send,
            "Recebendo ligação"
          )}
        },
        {
          key: "1-3",
          label: "Mensagem enviada",
          onClick: ()=>{alertPlayer(
            props.target,
            props.sender,
            props.send,
            "Mensagem enviada"
          )}
        },
        {
          key: "1-4",
          label: "Mensagem recebida",
          onClick: ()=>{alertPlayer(
            props.target,
            props.sender,
            props.send,
            "Mensagem recebida"
          )}
        },
        {
          key: "1-5",
          label: "ICE destruído",
          onClick: ()=>{alertPlayer(
            props.target,
            props.sender,
            props.send,
            "ICE destruído"
          )}
        },
      ]
    }
  ]
  const menuProps = {
    items
  }
  return <Dropdown menu={menuProps}>
    <Button>
      <Avatar src={props.target.avatar}/>
      {props.target.name}
    </Button>
  </Dropdown>
}

export function ActivityLog (props: any) {
    const {messageLog, senderData, 
      send, isHost, connections}    = useContext(MessageBusContext)
    const [inputText, setInputText] = useState("")
    const ref                       = useRef<HTMLDivElement>(null)
    const inputRef                  = useRef<InputRef>(null)
    useEffect(()=>{
      if(ref.current) {
        ref.current.scrollIntoView({behavior: "smooth"})
      }
    }, [messageLog])
    return <>
    <DiceRoller/>
    <Row style={{justifyItems: "space-between"}} gutter={[16,16]}>
      <Divider>Chat</Divider>
      <Col span={24} style={{height: 250, overflow: "auto"}}>
        {isHost ? 
          <Flex>
            <Col span={20}>
              <AnimatedList list={messageLog}/>
            </Col>
            <Col span={4}>
              <List
                dataSource={messageLog}
                renderItem={(item)=>{
                  if(item.metadata.code == 1)
                  return <List.Item>
                    <PlayerAlertMenu 
                      target={item.metadata.sender}
                      sender={senderData}
                      send={send}/>
                  </List.Item>
                }}/>
            </Col>
          </Flex> :
          <Col span={24}>
            <AnimatedList list={messageLog}/>
          </Col>
        }
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