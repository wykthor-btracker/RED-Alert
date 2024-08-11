import { ElementRef, Ref, RefObject, useContext, useEffect, useRef, useState } from "react"
import { LogData, LogDataMetadataSenderData, MessageBusContext } from "../contexts/MessageBusContext"
import { Col, Divider, Input, InputRef, Row } from "antd"
import DiceRoller from "./DiceRoller"
import { ArrowRightOutlined } from "@ant-design/icons"
import { AnimatedList } from "../comps/AnimatedList"

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

export function ActivityLog (props: any) {
    const {messageLog, senderData, 
      send, isHost}                 = useContext(MessageBusContext)
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
    <Row>
      <Col span={24} style={{height: 250, overflow: "auto"}}>
          <Divider>Chat</Divider>
          <AnimatedList list={messageLog}/>
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