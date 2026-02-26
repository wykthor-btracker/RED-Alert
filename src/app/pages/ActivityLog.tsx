import { useContext, useEffect, useRef, useState } from "react"
import { LogData, LogDataMetadataSenderData, MessageBusContext } from "../contexts/MessageBusContext"
import { Avatar, Badge, Button, Col, Divider, Dropdown, Flex, Input, InputRef, List, MenuProps, Row, Select } from "antd"
import DiceRoller from "./DiceRoller"
import { ArrowRightOutlined, DeleteOutlined, DownOutlined, ExportOutlined, ImportOutlined, UpOutlined } from "@ant-design/icons"
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
    const {
      messageLog,
      senderData,
      send,
      sendDirect,
      connectionLabels,
      connectionSenders,
      clearMessageLog,
      deleteMessage,
      exportLog,
      importLog,
      isHost,
      connected,
      connections,
    } = useContext(MessageBusContext)
    const [inputText, setInputText] = useState("")
    const [chatCollapsed, setChatCollapsed] = useState(false)
    const [lastSeenCount, setLastSeenCount] = useState(0)
    const [dmTarget, setDmTarget] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<InputRef>(null)
    const importInputRef = useRef<HTMLInputElement>(null)

    useEffect(()=>{
      if(ref.current) {
        ref.current.scrollIntoView({behavior: "smooth"})
      }
    }, [messageLog])

    const unreadCount = chatCollapsed
      ? Math.max(0, messageLog.length - lastSeenCount)
      : 0

    const handleToggleChat = () => {
      if (chatCollapsed) {
        setChatCollapsed(false)
        setLastSeenCount(messageLog.length)
      } else {
        setLastSeenCount(messageLog.length)
        setChatCollapsed(true)
      }
    }

    const handleSend = () => {
      if (!inputText.trim()) return
      if (dmTarget) {
        sendDirect(dmTarget, inputText.trim())
      } else {
        send({
          content: { message: inputText.trim() },
          metadata: { sender: senderData!, type: "message", code: 2, data: {} },
        } as LogData)
      }
      setInputText("")
      inputRef.current?.focus({ cursor: "all" })
    }

    const handleExport = () => {
      const blob = new Blob([exportLog()], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-log-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        if (text != null && text.length > 0) importLog(text)
      }
      reader.readAsText(file, "UTF-8")
      e.target.value = ""
    }

    return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <DiceRoller dmTarget={dmTarget} />
      <Row style={{ justifyItems: "space-between", flex: chatCollapsed ? "0 0 auto" : "1 1 auto", minHeight: 0 }} gutter={[16, 16]}>
        <Col span={24} style={{ flexShrink: 0 }}>
          <Row align="middle" justify="space-between" wrap style={{ marginBottom: 4 }}>
            <Col>
              <Divider style={{ margin: "12px 0", cursor: "pointer" }} onClick={handleToggleChat}>
                <Badge count={unreadCount} size="small" overflowCount={99} offset={[4, 0]}>
                  <span style={{ userSelect: "none" }}>
                    Chat {chatCollapsed ? <DownOutlined /> : <UpOutlined />}
                  </span>
                </Badge>
              </Divider>
            </Col>
            {!chatCollapsed && (
              <Col>
                {isHost && (
                  <>
                    <Button size="small" icon={<DeleteOutlined />} onClick={clearMessageLog} title="Limpar log">
                      Limpar
                    </Button>
                    <Button size="small" icon={<ImportOutlined />} onClick={() => importInputRef.current?.click()} title="Importar log">
                      Importar
                    </Button>
                    <input type="file" accept=".json" ref={importInputRef} style={{ display: "none" }} onChange={handleImport} />
                  </>
                )}
                <Button size="small" icon={<ExportOutlined />} onClick={handleExport} title="Exportar log">
                  Exportar
                </Button>
              </Col>
            )}
          </Row>
        </Col>
        <Col
          span={24}
          style={{
            height: chatCollapsed ? 0 : 250,
            minHeight: chatCollapsed ? 0 : undefined,
            overflow: "hidden",
            transition: "height 0.2s ease-out",
            padding: chatCollapsed ? 0 : undefined,
          }}
        >
          <div style={{ height: 250, overflow: "auto" }}>
            {isHost ? (
              <Flex>
                <Col span={20}>
                  <AnimatedList key={`chat-${messageLog.length}-${messageLog[0]?.id ?? ""}-${messageLog[messageLog.length - 1]?.id ?? ""}`} list={messageLog} isHost={isHost} onDeleteMessage={deleteMessage} />
                </Col>
                <Col span={4}>
                  <List
                    rowKey="name"
                    dataSource={connectionSenders}
                    renderItem={(peer) => (
                      <List.Item>
                        <PlayerAlertMenu
                          target={{ avatar: peer.avatar, name: peer.name }}
                          sender={senderData}
                          send={send}
                        />
                      </List.Item>
                    )}
                  />
                </Col>
              </Flex>
            ) : (
              <Col span={24}>
                <AnimatedList key={`chat-${messageLog.length}-${messageLog[0]?.id ?? ""}-${messageLog[messageLog.length - 1]?.id ?? ""}`} list={messageLog} isHost={false} onDeleteMessage={deleteMessage} />
              </Col>
            )}
            <div ref={ref}/>
          </div>
        </Col>
        <Col
          span={24}
          style={{
            overflow: "hidden",
            height: chatCollapsed ? 0 : "auto",
            minHeight: chatCollapsed ? 0 : undefined,
            transition: "height 0.2s ease-out",
            padding: chatCollapsed ? 0 : undefined,
          }}
        >
          <Row gutter={8} align="middle">
            {connected && connectionLabels.length > 0 && (
              <Col flex="none">
                <Select
                  size="small"
                  style={{ width: 160 }}
                  value={dmTarget ?? "__all__"}
                  onChange={(v) => setDmTarget(v === "__all__" ? null : v)}
                  options={[{ value: "__all__", label: "Para todos" }, ...connectionLabels.map((l) => ({ value: l, label: `DM: ${l}` }))]}
                />
              </Col>
            )}
            <Col flex="1">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPressEnter={handleSend}
                placeholder={dmTarget ? `Mensagem direta para ${dmTarget}` : "Mensagem..."}
                suffix={<ArrowRightOutlined onClick={handleSend} style={{ cursor: "pointer" }} />}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
    )
  }