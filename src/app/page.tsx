'use client';
import { Col, Layout, Menu, MenuProps, Row, Tabs, TabsProps } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import useImage from "use-image";
import AudioCard from "./comps/AudioCard";
import { MessageBus } from "./comps/MessageBus";
import SideMenu from "./comps/sideMenu";
import { LogData, LogDataMetadataSenderData } from "./contexts/MessageBusContext";
import { ActivityLog } from "./pages/ActivityLog";
import InitiativeTracker from "./pages/InitiativeTracker";
import Sider from "antd/es/layout/Sider";
import { BarsOutlined, GlobalOutlined, PlayCircleOutlined, SoundOutlined } from "@ant-design/icons";

export default function Home() {
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
      children: <></>,
      icon: <GlobalOutlined/>
    }
  ]
  return (
    <>
    <MessageBus>
      <Layout style={{backgroundColor: "white"}}>
        <Content style={{height: 450, overflow: "scroll"}}>
          <Tabs defaultActiveKey="1" items={items}
            tabBarExtraContent={{right: <SideMenu/>}}/>
        </Content>
        <Footer>
          <ActivityLog/>
        </Footer>
      </Layout>
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
