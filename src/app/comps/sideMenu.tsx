import { Button, Col, Input, Row } from "antd"
import React, { useContext, useEffect, useState } from "react"
import { MessageBusContext } from "../contexts/MessageBusContext"

export default function SideMenu (props: any) {
    const { messageApi, ID, host, node, isHost, connected, disconnect, updateDisplayName, senderData } = useContext(MessageBusContext)
    const [connectionInput, setConnectionInput] = useState("")
    const [displayNameInput, setDisplayNameInput] = useState(senderData?.name ?? "")
    useEffect(() => {
      setDisplayNameInput(senderData?.name ?? "")
    }, [senderData?.name])
    return (
        <Row gutter={8} align="middle" wrap={false}>
          {!connected ? (
            <>
              <Col flex="1" style={{ minWidth: 0 }}>
                <Input
                  value={connectionInput}
                  onChange={(e) => setConnectionInput(e.target.value)}
                  placeholder="ID do host"
                />
              </Col>
              <Col flex="none">
                <Button onClick={() => host()}>Host</Button>
              </Col>
              <Col flex="none">
                <Button onClick={() => node(connectionInput)}>Node</Button>
              </Col>
            </>
          ) : isHost ? (
            <>
              <Col flex="1" style={{ minWidth: 0 }}>
                <Input
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  onBlur={() => updateDisplayName(displayNameInput)}
                  onPressEnter={() => updateDisplayName(displayNameInput)}
                  placeholder="Seu nome (ao enviar DM)"
                />
              </Col>
              <Col flex="none">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(ID)
                    messageApi?.info(`ID copiado para área de transferência: ${ID}`)
                  }}
                >
                  ID: {ID}
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col flex="1" style={{ minWidth: 0 }}>
                <Input
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  onBlur={() => updateDisplayName(displayNameInput)}
                  onPressEnter={() => updateDisplayName(displayNameInput)}
                  placeholder="Seu nome"
                />
              </Col>
              <Col flex="none">
                <Button onClick={() => disconnect()}>Desconectar</Button>
              </Col>
            </>
          )}
        </Row>
    )
}