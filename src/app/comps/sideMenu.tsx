import { Button, Col, Input, Row } from "antd"
import { useContext, useState } from "react"
import { MessageBusContext } from "../contexts/MessageBusContext"

export default function SideMenu (props: any) {
    const {messageApi, ID, host, node, isHost, connected} = useContext(MessageBusContext)
    const [connectionInput, setConnectionInput] = useState("")
    return <>
        {!connected ? 
            <>
              <Input value={connectionInput} onChange={(event)=>{setConnectionInput(event.target.value)}}></Input>
              <Button onClick={()=>{
                  host()
              }}>Host</Button>
              <Button onClick={()=>{
                  node(connectionInput)
                }}>Node
              </Button> 
            </>
            : <Row>
                <Col>
                {isHost ? 
                  <Button onClick={()=>{
                      navigator.clipboard.writeText(ID)
                      messageApi?.info(`ID copiado para área de transferência: ${ID}`)
                      }}>ID: {ID}
                  </Button> 
                : <Button
                    onClick={()=>{}}>Desconectar</Button>}
                </Col> 
              </Row>
        }
    </>
}