import { Button, Col, FloatButton, Form, FormProps, Input, List, Row, Switch, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import { useState } from "react";
import Fighter from "../comps/Fighter";
const { Title } = Typography;

function DraggableFighter(props: {
  item: { id: string; name: string; currentHealth: number; maxHealth: number; stoppingPower: number; stoppingPowerMax: number; initiative: number };
  index: number;
  currentTurn: number;
  onInitiativeChange: (id: string, value: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  totalCount: number;
}) {
  const [dragOver, setDragOver] = useState(false);
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", String(props.index));
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(from) || from === props.index) return;
    props.onMove(from, props.index);
  };
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        cursor: "grab",
        opacity: dragOver ? 0.6 : 1,
        border: dragOver ? "2px dashed #1677ff" : "2px solid transparent",
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <Fighter
        item={props.item}
        index={props.index}
        currentTurn={props.currentTurn}
        onInitiativeChange={props.onInitiativeChange}
      />
    </div>
  );
}
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


function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function InitiativeTracker(props: any) {
    interface Idata {
      id: string;
      name: string;
      currentHealth: number;
      maxHealth: number;
      stoppingPower: number;
      stoppingPowerMax: number;
      initiative: number;
    }
    const [data, setData]               = useState<Array<Idata>>([])
    const [toggleForm, setToggleForm]   = useState(false)
    const [currentTurnId, setCurrentTurnId] = useState<string | null>(null)
    const [tracking, setTracking]       = useState(false)
    const [addFighters, setAddFighters] = useState(false)

    const currentTurnIndex = currentTurnId != null
      ? data.findIndex((d) => d.id === currentTurnId)
      : -1
    type FieldType = {
      name: string;
      SP: string;
      health: string;
    };
    function nextTurn () {
      setTracking(true)
      if (data.length === 0) return
      if (currentTurnId == null) {
        setCurrentTurnId(data[0].id)
        return
      }
      const idx = data.findIndex((d) => d.id === currentTurnId)
      if (idx === data.length - 1) {
        setCurrentTurnId(data[0].id)
      } else {
        setCurrentTurnId(data[idx + 1].id)
      }
    }
    function previousTurn () {
      if (data.length === 0) return
      if (currentTurnId == null) {
        setCurrentTurnId(data[data.length - 1].id)
        return
      }
      const idx = data.findIndex((d) => d.id === currentTurnId)
      if (idx <= 0) {
        setCurrentTurnId(data[data.length - 1].id)
      } else {
        setCurrentTurnId(data[idx - 1].id)
      }
    }
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
      setData((prev) => {
        const next = [...prev, {
          id: nextId(),
          name: values.name,
          currentHealth: Number(values.health),
          maxHealth: Number(values.health),
          stoppingPower: Number(values.SP),
          stoppingPowerMax: Number(values.SP),
          initiative: 0,
        }]
        return next.sort((a, b) => b.initiative - a.initiative)
      })
    };
    function addNPC (values: any) {
        const initRoll = Math.floor(Math.random() * 10) + 1
        setData((prev) => {
          const next = [...prev, {
            id: nextId(),
            name: values.name,
            currentHealth: Number(values.health),
            maxHealth: Number(values.health),
            stoppingPower: Number(values.SP),
            stoppingPowerMax: Number(values.SP),
            initiative: initRoll,
          }]
          return next.sort((a, b) => b.initiative - a.initiative)
        })
    }
    function onInitiativeChange(id: string, value: number) {
      const intValue = Math.round(Number(value)) || 0
      setData((prev) => {
        const next = prev.map((d) =>
          d.id === id ? { ...d, initiative: intValue } : d
        )
        return next.sort((a, b) => b.initiative - a.initiative)
      })
    }
    function moveCombatant(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= data.length) return
      setData((prev) => {
        const next = [...prev]
        const [removed] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, removed)
        return next
      })
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
                    setCurrentTurnId(null)
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
        <Col span={24} style={{overflowY: "scroll", height: "60vh"}}>
            <List 
              locale={{emptyText: "."}}
              dataSource={data} 
              renderItem={(item, index)=>(
                <QueueAnim delay={150} key={item.id}>
                  <DraggableFighter
                    item={item}
                    index={index}
                    currentTurn={tracking ? currentTurnIndex : -1}
                    onInitiativeChange={onInitiativeChange}
                    onMove={moveCombatant}
                    totalCount={data.length}
                  />
                </QueueAnim>
              )}/>
        </Col>
        {data.length > 0 && (
          <FloatButton.Group
            shape="square"
            style={{ bottom: 100, insetInlineEnd: 24 }}
            trigger="hover"
          >
            <FloatButton
              tooltip="Previous Turn"
              icon={<LeftOutlined />}
              onClick={previousTurn}
            />
            <FloatButton
              tooltip="Next Turn"
              icon={<RightOutlined />}
              onClick={nextTurn}
            />
          </FloatButton.Group>
        )}
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