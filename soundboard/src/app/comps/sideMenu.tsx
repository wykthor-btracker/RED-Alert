import { useContext, useState } from "react"
import { MessageBusContext } from "../page"
import { Button, Col, Input, message, Row } from "antd"
import { CopyOutlined } from "@ant-design/icons"

export default function SideMenu (props: any) {
    const {messageApi, ID, host, node} = useContext(MessageBusContext)
    const [connectionInput, setConnectionInput] = useState("")
    return <>
        {ID == "" ? 
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
            :
        <Row>
            <Col><Button onClick={()=>{
                navigator.clipboard.writeText(ID)
                messageApi?.info(`ID copiado para área de transferência: ${ID}`)
            }}>ID: {ID}</Button></Col> 
        </Row>
        }
    </>
}