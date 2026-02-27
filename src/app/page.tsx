'use client';
import { BarsOutlined, GlobalOutlined, PlayCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Flex, Layout, Row, Tabs, TabsProps } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import AudioCard from "./comps/AudioCard";
import { MessageBus } from "./comps/MessageBus";
import SideMenu from "./comps/sideMenu";
import { ThemeProvider, ThemeToggle } from "./contexts/ThemeContext";
import { LogData, LogDataMetadataSenderData } from "./contexts/MessageBusContext";
import { ActivityLog } from "./pages/ActivityLog";
import CharacterData from "./pages/CharacterData";
import InitiativeTracker from "./pages/InitiativeTracker";
import MapGrid from "./pages/MapGrid";

export default function Home() {
  let path
  if(process.env.NODE_ENV == "production") {
    path = "/RED-Alert"
  }
  else {
    path = ""
  }
  const items: TabsProps['items'] = [
    {
      key: "1",
      label: "Audio",
      children:       <Row gutter={16} style={{margin: 10}}>
          <AudioCard title="Ligando"          source={`${path}/sounds/caller.mp4`}/>
          <AudioCard title="Recebendo ligação"          source={`${path}/sounds/call received.mp4`}/>
          <AudioCard title="Mensagem enviada"          source={`${path}/sounds/message sent.mp4`}/>
          <AudioCard title="Mensagem recebida"          source={`${path}/sounds/message received.mp4`}/>
          <AudioCard title="ICE destruído"          source={`${path}/sounds/ICE defeated.mp4`}/>
    </Row>,
      icon: <PlayCircleOutlined/>},
    {
      key: "2",
      label: "Iniciativa",
      children: <InitiativeTracker/>,
      icon: <BarsOutlined/>
    },
    {
      key: "3",
      label: "Mapa",
      children: <MapGrid/>,
      icon: <GlobalOutlined/>
    },
    {
      key: "4",
      label: "Personagem",
      children: <CharacterData/>,
      icon: <UserOutlined/>
    }
  ]
  return (
    <ThemeProvider>
      <MessageBus>
        <Flex>
          <Layout style={{ backgroundColor: "var(--app-bg)", flex: 1, height: "100vh" }}>
            <Content style={{ height: "60vh", overflow: "scroll" }}>
              <Tabs
                defaultActiveKey="1"
                items={items}
                tabBarExtraContent={{
                  right: (
                    <Row gutter={12} align="middle" wrap={false}>
                      <SideMenu />
                      <ThemeToggle />
                    </Row>
                  ),
                }}
              />
            </Content>
            <Footer style={{ flex: "0 0 auto", minHeight: 0, backgroundColor: "var(--app-footer-bg)" }}>
              <ActivityLog />
            </Footer>
          </Layout>
        </Flex>
      </MessageBus>
    </ThemeProvider>
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
