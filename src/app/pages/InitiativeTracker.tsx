import { Button, Col, Form, FormProps, Input, List, Row, Switch, Typography } from "antd";
import QueueAnim  from "rc-queue-anim"
import { useState } from "react";
import Fighter from "../comps/Fighter";
const { Title } = Typography
const mobs = {
    mooks: [
        {
            name: "Boosterganger",
            health: "20",
            stoppingPower: "4",
            initiativeBonus: "6"
        },
        {
            name: "Bodyguard",
            health: "35",
            stoppingPower: "7",
            initiativeBonus: "6"
        },
        {
            name: "Road ganger",
            health: "25",
            stoppingPower: "4",
            initiativeBonus: "6"
        },
        {
            name: "Security operative",
            health: "30",
            stoppingPower: "7",
            initiativeBonus: "7"
        },
    ],
    lieutenant: [
        {
            name: "Netrunner",
            health: "30",
            stoppingPower: "11",
            initiativeBonus: "5"
        },
        {
            name: "Reclaimer chief",
            health: "40",
            stoppingPower: "11",
            initiativeBonus: "6"

        },
        {
            name: "Security officer",
            health: "40",
            stoppingPower: "13",
            initiativeBonus: "8"
        },
    ],
    miniboss: [
        {
            name: "Outrider",
            health: "40",
            stoppingPower: "11",
            initiativeBonus: "8"
        },
        {
            name: "Pyro",
            health: "40",
            stoppingPower: "11",
            initiativeBonus: "8"
        },
    ],
    boss: [
        {
            name: "Cyberpsycho",
            health: "55",
            stoppingPower: "11",
            initiativeBonus: "8"
        },
    ],
    players: [
        {
            name: "Glamour",
            health: "35",
            stoppingPower: "11"
        },
        {
            name: "Kiwi",
            health: "35",
            stoppingPower: "11"
        },
        {
            name: "Cobra",
            health: "40",
            stoppingPower: "11"
        },
        {
            name: "MSN",
            health: "40",
            stoppingPower: "11"
        },
        {
            name: "Paniki",
            health: "50",
            stoppingPower: "11"
        },
        {
            name: "Loverruk",
            health: "45",
            stoppingPower: "11"
        },
    ]
}


export default function InitiativeTracker(props: any) {
    interface Idata {
      name: string;
      currentHealth: number;
      maxHealth: number;
      stoppingPower: number;
      stoppingPowerMax: number;
      initiative: number;
    }
    const [data, setData]               = useState<Array<Idata>>([])
    const [toggleForm, setToggleForm]   = useState(false)
    const [currentTurn, setCurrentTurn] = useState(0)
    const [tracking, setTracking]       = useState(false)
    const [addFighters, setAddFighters] = useState(false)
    type FieldType = {
      name: string;
      SP: string;
      health: string;
    };
    function nextTurn () {
      setTracking(true)
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
      stoppingPowerMax: Number(values.SP),
      initiative: 0
      }])
      console.log('Success:', values);
    };
    function addNPC (values: any) {
        let dataCopy = data
        let initRoll = ((Math.random()*100)%10)+1
        dataCopy.push({
            name: values.name,
            currentHealth:    Number(values.health),
            maxHealth:        Number(values.health),
            stoppingPower:    Number(values.SP),
            stoppingPowerMax: Number(values.SP),
            initiative:       Number(initRoll)
        })
        setData([...dataCopy])
    }
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    return (
      <Row style={{flexDirection: "column"}}>
        <Col span={24} flex={1}>
          <>
            <Row align={"middle"} gutter={[16,16]}>
              <Col>
                <Button 
                  onClick={()=>{
                    setData([])
                    setCurrentTurn(0)
                  }}
                    >Clear battle</Button>
              </Col>
              <Col>
                <Switch onChange={setToggleForm}/>
              </Col>
              <Col>Add new combatant</Col>
              <Col>
                <Switch onChange={setAddFighters}/>
              </Col>
              <Col>Add preset combatant</Col>
              <Col><Button onClick={previousTurn}>Previous Turn</Button></Col>
              <Col><Button onClick={nextTurn}>Next Turn</Button></Col>
            </Row>
            {toggleForm ?
            <Form
            name="basic"
            layout="vertical"
            labelCol={{ span: 10 }}
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
        </Col>
        <Col span={24} flex={1}>
          {addFighters ? <>
          <Row gutter={[16,16]}>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.mooks}
                    title="Mooks"
                    delay={100}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.lieutenant}
                    title="Lieutenants"
                    delay={500}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.miniboss}
                    title="Mini-Bosses"
                    delay={900}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.boss}
                    title="BOSS"
                    delay={1300}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.players}
                    title="Players"
                    delay={1700}
                    addNPC={addNPC}/>
              </Col>
          </Row>
          </> : null}
        </Col>
        <Col span={24} style={{overflowY: "scroll", height: 300}}>
            <List 
              style={{height: 400}}
              locale={{emptyText: "."}}
              dataSource={data} 
              renderItem={(item, index)=>(
                <QueueAnim delay={150}>
                  <div key={index}>
                    <Fighter 
                      item={item} 
                      index={index} 
                      currentTurn={tracking ? currentTurn : -1}/>
                  </div>
                </QueueAnim>
              )}/>
        </Col>
      </Row>
    )
  }

  function NpcCategory (props: any) {
    return <Col span={24} style={{textAlign: "center"}}>
        <QueueAnim delay={props.delay} leaveReverse={true}>
          <Title level={2} key={"mook-title"}>{props.title}™</Title>
          {props.mobs.map((mob: {name: string, health: string, stoppingPower: string})=>{
              return <div key={mob.name}>
              <Button
                block
                onClick={()=>{
                    props.addNPC({
                        name: mob.name,
                        health: mob.health,
                        SP: mob.stoppingPower
                    })
                }}>
                    {mob.name}
            </Button>
          </div> 
          })}
        </QueueAnim>
      </Col>
  }