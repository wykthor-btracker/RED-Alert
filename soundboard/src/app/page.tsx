'use client';
import { PauseCircleOutlined, PlayCircleOutlined, RedoOutlined, SoundOutlined } from "@ant-design/icons";
import { Badge, Button, Checkbox, Col, Form, FormProps, Image, Input, List, message, Modal, Progress, Row, Slider, Switch, Tabs, TabsProps } from "antd";
import React, { useEffect, useState } from "react";
import { useAudioPlayer } from "react-use-audio-player";
// @ts-ignore

function AudioCard(props: any) {
  const song = useAudioPlayer()
  const [value, setValue] = useState(50);
  const style: React.CSSProperties = { 
    padding: '16px 8px', 
    borderRadius: 10, 
    textAlign: "center", 
    justifyContent:"space-between" };

  useEffect(()=>{
    song.load(props.source, { autoplay: false })
  }, [])

  useEffect(()=>{
    song.setVolume(value/100)
  }, [value])
  return (
    <Col style={{borderColor: "black", border: "solid 1px black", borderRadius: 10, margin: "16px 8px"}} span={6}>
      <Row style={style} gutter={[16,16]}>
        <Col span={24}>
          <Row>
            <Col>
              {props.title}
            </Col>
            <Col span={24}>
              <Row>
                <Col span={20}>
                <Slider max={100} min={0} value={value} onChange={setValue}/>
                </Col>
                <SoundOutlined/>
              </Row>
              <Col>
              </Col>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row style={{flex: 1}} gutter={[8,8]}>
            <Col onClick={song.togglePlayPause} style={{border: "solid 1px grey", borderRadius: 10, padding: "5px 0px"}} span={12}>
              {!song.playing ? 
                <PlayCircleOutlined style={{fontSize: 25}}/>:
                <PauseCircleOutlined style={{fontSize: 25, color:"red"}}/>
              }
            </Col>
            <Col onClick={song.stop} style={{border: "solid 1px grey", borderRadius: 10, padding: "5px 0px"}} span={12}>
              <RedoOutlined style={{fontSize: 25, color: !song.stopped ? "red" : "black"}}/>
            </Col>
          </Row>
        </Col>
        </Row>
    </Col>
  )
}
function Fighter(props: any) {
  const style: React.CSSProperties = {
    padding: '16px 8px',
    borderRadius: 10,
    border: "1px solid grey",
    flex: 1
  }
  const [value, setValue] = useState("0")
  const [stats, setStats] = useState({
    name: props.item.name,
    stoppingPower: props.item.stoppingPower,
    stoppingPowerMax: props.item.stoppingPower,
    currentHealth: props.item.currentHealth,
    maxHealth: props.item.maxHealth
  })

  function heal () {
    setStats({...stats,
      currentHealth: Math.min(stats.currentHealth+Number(value),stats.maxHealth)})
    }
    
  function damage () {
    setStats({...stats,
      currentHealth: Math.max(stats.currentHealth-Number(value),0)})
    }

  function ablate () {
    setStats({...stats,
      stoppingPower: Math.max(stats.stoppingPower-1, 0)})
  }

  function resetShield () {
    setStats({...stats,
      stoppingPower: stats.stoppingPowerMax})
  }
  return (
    <Badge.Ribbon color="red" text={props.currentTurn == props.index ? "Sua vez!" : ""}>
      <List.Item>
        <Row style={style}>
          <Col span={24}>
            {stats.name}
          </Col>
          <Col span={12}>
            <span>
              HP: <Progress 
                    showInfo={false} 
                    strokeColor={(stats.currentHealth/stats.maxHealth)*100<=25 ? "red" : "green"} 
                    percent={(stats.currentHealth/stats.maxHealth)*100}/>
            </span>
          </Col>
          <Col span={12}>
            SP: {stats.stoppingPower}<Progress showInfo={false} strokeColor={"blue"} percent={(stats.stoppingPower/stats.stoppingPowerMax)*100}/>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={3}>
                <Button style={{width: 100}} onClick={damage}>Damage</Button>
              </Col>
              <Col span={3}>
                <Button style={{width: 100}} onClick={heal}>Heal</Button>
              </Col>
              <Col span={3}>
                <Input onChange={(event)=>setValue(event.target.value)} value={value}></Input>
              </Col>
              <Col style={{justifyContent: "center"}} span={3}>
                <Checkbox>Critically Injured?</Checkbox>
              </Col>
              <Col span={12} style={{textAlign: "end"}}>
                <Row justify={"end"}>
                  <Col span={12}>
                    <Button onClick={ablate}>Ablate</Button>
                    <Button onClick={resetShield}>Reset SP</Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </List.Item>
    </Badge.Ribbon>
  )
}
function InitiativeTracker(props: any) {
  interface Idata {
    name: string;
    currentHealth: Number;
    maxHealth: Number;
    stoppingPower: Number;
    stoppingPowerMax: Number;
  }
  const [data, setData] = useState<Array<Idata>>([])
  const [toggleForm, setToggleForm] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  type FieldType = {
    name: string;
    SP: string;
    health: string;
  };
  function nextTurn () {
    if(currentTurn==data.length-1) {
      setCurrentTurn(0)
    }
    else {
      setCurrentTurn(currentTurn+1)
    }
  }
  function previousTurn () {
    if(currentTurn==0) {
      setCurrentTurn(data.length-1)
    } else {
      setCurrentTurn(currentTurn-1)
    }

  }
  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    setData([...data, {
      name: values.name,
    currentHealth: Number(values.health),
    maxHealth: Number(values.health),
    stoppingPower: Number(values.SP),
    stoppingPowerMax: Number(values.SP)
    }])
    console.log('Success:', values);
  };
  function addNPC (values: any) {
    setData([...data, {
      name: values.name,
    currentHealth: Number(values.health),
    maxHealth: Number(values.health),
    stoppingPower: Number(values.SP),
    stoppingPowerMax: Number(values.SP)
    }])
  }
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  
  return (
    <>
    <Row>
      <span>Add mook</span>
      <Button onClick={
        ()=>{addNPC({
        name: "boosterganger",
        health: "20",
        SP: "4"
      })}}>
        boosterganger
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "bodyguard",
        health: "35",
        SP: "7"
      })}}>
        bodyguard
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "road ganger",
        health: "25",
        SP: "4"
      })}}>
        road ganger
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "security operative",
        health: "30",
        SP: "7"
      })}}>
        security operative
      </Button>
    </Row>
    <Row>
      <span>Add lieutenant</span>
      <Button onClick={
        ()=>{addNPC({
        name: "netrunner",
        health: "30",
        SP: "11"
      })}}>
        netrunner
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "reclaimer chief",
        health: "40",
        SP: "11"
      })}}>
        reclaimer chief
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "security officer",
        health: "40",
        SP: "13"
      })}}>
        security officer
      </Button>
    </Row>
    <Row>
      <span>Add mini-boss</span>
      <Button onClick={
        ()=>{addNPC({
        name: "outrider",
        health: "40",
        SP: "11"
      })}}>
        security officer
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "pyro",
        health: "40",
        SP: "11"
      })}}>
        pyro
      </Button>
    </Row>
    <Row>
      <span>Add boss</span>
      <Button onClick={
        ()=>{addNPC({
        name: "cyberpsycho",
        health: "55",
        SP: "11"
      })}}>
        cyberpsycho
      </Button>
    </Row>
    <Row>
      <span>Add players</span>
      <Button onClick={
        ()=>{addNPC({
        name: "Glamour",
        health: "35",
        SP: "11"
      })}}>
        Glamour
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "Kiwi",
        health: "35",
        SP: "11"
      })}}>
        Kiwi
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "Loverruk",
        health: "45",
        SP: "11"
      })}}>
        Loverruk
      </Button>
      <Button onClick={
        ()=>{addNPC({
        name: "Paniki",
        health: "50",
        SP: "11"
      })}}>
        Paniki
      </Button>
    </Row>
      <List dataSource={data} renderItem={(item, index)=>(
        <Fighter item={item} index={index} currentTurn={currentTurn}/>
        )}
        footer={
          <>
          <Row align={"middle"} gutter={[16,16]}>
            <Col><Button onClick={()=>{setData([])}}>Clear battle</Button></Col>
            <Col>
              <Switch onChange={setToggleForm}/>
            </Col>
            <Col>Add new combatant</Col>
            <Col><Button onClick={previousTurn}>Previous Turn</Button></Col>
            <Col><Button onClick={nextTurn}>Next Turn</Button></Col>
          </Row>
          {toggleForm ? 
          <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, border: "solid 1px grey", padding: "8px 16px", borderRadius: 20}}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Name"
            name="name"
          >
            <Input />
          </Form.Item>
      
          <Form.Item<FieldType>
            label="Stopping Power"
            name="SP"
          >
            <Input />
          </Form.Item>
      
          <Form.Item<FieldType>
            label="Health"
            name="health"
          >
            <Input />
          </Form.Item>
      
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          </Form>: null
          }
          </>
        }/>
    </>
  )
}

function DiceRoller (props: any) {
  const [result, setResult] = useState<any>(null)
  const [crit, setCrit] = useState(0);
  function roll () {
    var acc = []
    var calc = 0;
    var crit = 0;
    if(props.number > 1) {
      for (let index = 0; index < props.number; index++) {
        var roll = Math.ceil((Math.random()*100))%props.size+1
        if(index==0) {
          acc.push(<span style={{color: roll==props.size ? "red" : "black"}}>{roll}</span>)
        }
        else {
          acc.push(<span>+<span style={{color: roll==props.size ? "red" : "black"}}>{roll}</span></span>)
        }
        if(roll==props.size) {
          crit+=1
        }
        calc += roll
      }
      setCrit(crit)
      setResult(<span>{acc} = {calc}</span>)
    } else {
      var roll = Math.ceil((Math.random()*100))%props.size+1
      setResult(<span>{roll}</span>)
    }
  }
  return (
    <>
    <Row>
      <Button onClick={roll}>Roll {props.number}d{props.size}</Button>
      <Col style={{border: "1px solid grey", textAlign: "center", marginLeft: 20, padding: "8px 8px", borderRadius: 5}}>
        {result ?
        <span>
          {result} {crit>=props.threshold ? <span style={{fontSize: 30, color:"red"}}>CRIT!!!!</span> : null}
        </span> : null}
      </Col>
    </Row>
    </>
  )
}
export default function Home() {
  const [messageApi, contextHolder] = message.useMessage();
  function handleImageClick (x: number, y: number) {
    if(x>=300 && x<= 350 && y>=480 && y<=520) {
      messageApi.success("Túnel abandonado encontrado nas redondezas das coordenadas 326x500.", 10)
    }
    else {
      messageApi.info(`coordenadas: ${x}, ${y}`)
    }
  }
  const items: TabsProps['items'] = [
    {
      key: "1",
      label: "Audio",
      children:       <Row gutter={16} style={{margin: 10}}>
      <AudioCard title="Calling" source="/sounds/caller.mp4"/>
      <AudioCard title="Receiving Call" source="/sounds/call received.mp4"/>
      <AudioCard title="Message sent" source="/sounds/message sent.mp4"/>
      <AudioCard title="Message received" source="/sounds/message received.mp4"/>
      <AudioCard title="ICE defeated" source="/sounds/ICE defeated.mp4"/>
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
        <Image 
          onClick={(event)=>{handleImageClick(event.pageX, event.pageY)}}
          src="map.jpeg" 
          preview={false}/>
      </>
    },
    {
      key: "4",
      label: "Dice",
      children: <>
      <Row>
        <Col>
        <DiceRoller number={1} size={6} threshold={2}/>
        <DiceRoller number={2} size={6} threshold={2}/>
        <DiceRoller number={3} size={6} threshold={2}/>
        <DiceRoller number={4} size={6} threshold={2}/>
        <DiceRoller number={1} size={10} threshold={1}/>
        <DiceRoller number={2} size={10} threshold={1}/>
        <DiceRoller number={1} size={100} threshold={1}/>
        </Col>
      </Row>
      </>
    }
  ]
  return (
    <>
    {contextHolder}
    <Tabs defaultActiveKey="1" items={items}/>

    </>
  );
}