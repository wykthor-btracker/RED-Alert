import { Button, Col, FloatButton, Form, FormProps, Input, List, Row, Switch, Typography } from "antd";
import { LeftOutlined, RightOutlined, UserOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import { useContext, useEffect, useMemo, useState } from "react";
import Fighter from "../comps/Fighter";
import { InitiativeCombatant, LogData, MessageBusContext } from "../contexts/MessageBusContext";
import { getSheetStoppingPower } from "../types/character";
import { referenceWearables } from "@/data/reference/wearables";
const { Title } = Typography;

/** Base name without a leading (N) prefix, for duplicate counting. */
function baseName(name: string): string {
  return name.replace(/^\(\d+\)\s*/, "").trim() || name;
}

/** If the list already has combatants with the same base name, return "(2)Name" etc. */
function nameForNewCombatant(existing: InitiativeCombatant[], name: string): string {
  const base = baseName(name);
  const count = existing.filter((c) => baseName(c.name) === base).length;
  if (count === 0) return name;
  return `(${count + 1})${base}`;
}

function toIdata(c: InitiativeCombatant): { id: string; name: string; currentHealth: number; maxHealth: number; stoppingPower: number; stoppingPowerMax: number; stoppingPowerHead: number; stoppingPowerHeadMax: number; initiative: number } {
  return {
    id: c.id,
    name: c.name,
    currentHealth: c.currentHealth ?? 0,
    maxHealth: c.maxHealth ?? 0,
    stoppingPower: c.stoppingPower ?? 0,
    stoppingPowerMax: c.stoppingPowerMax ?? 0,
    stoppingPowerHead: c.stoppingPowerHead ?? c.stoppingPower ?? 0,
    stoppingPowerHeadMax: c.stoppingPowerHeadMax ?? c.stoppingPowerMax ?? 0,
    initiative: c.initiative ?? 0,
  };
}

function DraggableFighter(props: {
  item: { id: string; name: string; currentHealth: number; maxHealth: number; stoppingPower: number; stoppingPowerMax: number; stoppingPowerHead: number; stoppingPowerHeadMax: number; initiative: number };
  index: number;
  currentTurn: number;
  onInitiativeChange: (id: string, value: number) => void;
  onNameChange?: (id: string, newName: string) => void;
  onStoppingPowerChange?: (id: string, body: number, bodyMax?: number) => void;
  onStoppingPowerHeadChange?: (id: string, head: number, headMax?: number) => void;
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
        onNameChange={props.onNameChange}
        onStoppingPowerChange={props.onStoppingPowerChange}
        onStoppingPowerHeadChange={props.onStoppingPowerHeadChange}
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
    const { send, senderData, isHost, initiativeCombatants, setInitiativeCombatants, savedCharacters } = useContext(MessageBusContext)
    const data = useMemo(() => initiativeCombatants.map(toIdata), [initiativeCombatants])
    const [toggleForm, setToggleForm]   = useState(false)
    const [currentTurnId, setCurrentTurnId] = useState<string | null>(null)

    // Clear current turn if that combatant was removed (e.g. via Deletar on map)
    useEffect(() => {
      if (currentTurnId != null && !data.some((d) => d.id === currentTurnId)) {
        setCurrentTurnId(null);
      }
    }, [data, currentTurnId])
    const [tracking, setTracking]       = useState(false)
    const [addFighters, setAddFighters] = useState(false)
    const [addSheets, setAddSheets] = useState(false)

    const currentTurnIndex = currentTurnId != null
      ? data.findIndex((d) => d.id === currentTurnId)
      : -1
    type FieldType = {
      name: string;
      SP: string;
      health: string;
    };

    function broadcastUpdate(message: string) {
      if (send && senderData) {
        send({
          content: { message },
          metadata: { sender: senderData, type: "message", code: 2, data: {} },
        } as LogData)
      }
    }

    function nextTurn () {
      setTracking(true)
      if (data.length === 0) return
      if (currentTurnId == null) {
        setCurrentTurnId(data[0].id)
        broadcastUpdate(`Iniciativa: agora é a vez de ${data[0].name}`)
        return
      }
      const idx = data.findIndex((d) => d.id === currentTurnId)
      const nextIdx = idx === data.length - 1 ? 0 : idx + 1
      setCurrentTurnId(data[nextIdx].id)
      broadcastUpdate(`Iniciativa: agora é a vez de ${data[nextIdx].name}`)
    }
    function previousTurn () {
      if (data.length === 0) return
      if (currentTurnId == null) {
        setCurrentTurnId(data[data.length - 1].id)
        broadcastUpdate(`Iniciativa: voltou para ${data[data.length - 1].name}`)
        return
      }
      const idx = data.findIndex((d) => d.id === currentTurnId)
      const prevIdx = idx <= 0 ? data.length - 1 : idx - 1
      setCurrentTurnId(data[prevIdx].id)
      broadcastUpdate(`Iniciativa: voltou para ${data[prevIdx].name}`)
    }
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
      const sp = Number(values.SP);
      const displayName = nameForNewCombatant(initiativeCombatants, values.name);
      const next: InitiativeCombatant[] = [...initiativeCombatants, {
        id: nextId(),
        name: displayName,
        currentHealth: Number(values.health),
        maxHealth: Number(values.health),
        stoppingPower: sp,
        stoppingPowerMax: sp,
        stoppingPowerHead: sp,
        stoppingPowerHeadMax: sp,
        initiative: 0,
      }].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
      setInitiativeCombatants(next)
      broadcastUpdate(`Iniciativa: combatente adicionado — ${displayName}`)
    };
    function addNPC (values: any) {
        const initRoll = Math.floor(Math.random() * 10) + 1
        const sp = Number(values.SP)
        const displayName = nameForNewCombatant(initiativeCombatants, values.name)
        const next: InitiativeCombatant[] = [...initiativeCombatants, {
          id: nextId(),
          name: displayName,
          currentHealth: Number(values.health),
          maxHealth: Number(values.health),
          stoppingPower: sp,
          stoppingPowerMax: sp,
          stoppingPowerHead: sp,
          stoppingPowerHeadMax: sp,
          initiative: initRoll,
        }].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
        setInitiativeCombatants(next)
        broadcastUpdate(`Iniciativa: combatente adicionado — ${displayName}`)
    }

    function addSheetToBattle(entry: { ownerName: string; data: { sheetName?: string; currentHealth?: number; maxHealth?: number; wearables?: unknown[] } }) {
      const sheet = entry.data;
      const displayName = nameForNewCombatant(initiativeCombatants, sheet.sheetName?.trim() || entry.ownerName);
      const sp = getSheetStoppingPower(sheet as import("../types/character").CharacterData, referenceWearables);
      const hp = Math.max(0, Number(sheet.currentHealth ?? sheet.maxHealth ?? 0)) || 1;
      const next: InitiativeCombatant[] = [...initiativeCombatants, {
        id: nextId(),
        name: displayName,
        currentHealth: hp,
        maxHealth: Math.max(hp, Math.max(0, Number((sheet as { maxHealth?: number }).maxHealth ?? 0)) || hp),
        stoppingPower: sp.body,
        stoppingPowerMax: Math.max(sp.bodyMax, 1),
        stoppingPowerHead: sp.head,
        stoppingPowerHeadMax: Math.max(sp.headMax, 1),
        initiative: 0,
      }].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
      setInitiativeCombatants(next);
      broadcastUpdate(`Iniciativa: ficha adicionada — ${displayName}`);
    }
    function onInitiativeChange(id: string, value: number) {
      const intValue = Math.round(Number(value)) || 0
      const next = initiativeCombatants.map((d) =>
        d.id === id ? { ...d, initiative: intValue } : d
      ).sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
      setInitiativeCombatants(next)
    }
    function onNameChange(id: string, newName: string) {
      const trimmed = newName.trim()
      if (!trimmed) return
      setInitiativeCombatants((prev) =>
        prev.map((d) => (d.id === id ? { ...d, name: trimmed } : d))
      )
      broadcastUpdate(`Iniciativa: nome alterado para "${trimmed}"`)
    }
    function onStoppingPowerChange(id: string, body: number, bodyMax?: number) {
      setInitiativeCombatants((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, stoppingPower: body, ...(bodyMax != null && { stoppingPowerMax: bodyMax }) }
            : d
        )
      )
    }
    function onStoppingPowerHeadChange(id: string, head: number, headMax?: number) {
      setInitiativeCombatants((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, stoppingPowerHead: head, ...(headMax != null && { stoppingPowerHeadMax: headMax }) }
            : d
        )
      )
    }
    function moveCombatant(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= data.length) return
      const next = [...initiativeCombatants]
      const [removed] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, removed)
      setInitiativeCombatants(next)
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
                    setInitiativeCombatants([])
                    setCurrentTurnId(null)
                    broadcastUpdate("Iniciativa: batalha limpa")
                  }}
                    >Limpar batalha</Button>
              </Col>
              <Col>
                <Switch onChange={setToggleForm}/>
              </Col>
              <Col>Adicionar novo combatente</Col>
              <Col>
                <Switch onChange={setAddFighters}/>
              </Col>
              <Col>Adicionar combatente pré-definido</Col>
              {isHost && (
                <>
                  <Col>
                    <Switch onChange={setAddSheets}/>
                  </Col>
                  <Col>Adicionar ficha (personagem)</Col>
                </>
              )}
              <Col><Button onClick={previousTurn}>Turno anterior</Button></Col>
              <Col><Button onClick={nextTurn}>Próximo turno</Button></Col>
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
              label="Nome"
              name="name"
            >
              <Input />
            </Form.Item>
        
            <Form.Item<FieldType>
              label="Poder de parada (SP)"
              name="SP"
            >
              <Input />
            </Form.Item>
        
            <Form.Item<FieldType>
              label="Vida (HP)"
              name="health"
            >
              <Input />
            </Form.Item>
        
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Adicionar
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
                    title="Capangas"
                    delay={100}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.lieutenant}
                    title="Tenentes"
                    delay={500}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.miniboss}
                    title="Sub-chefes"
                    delay={900}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.boss}
                    title="Chefe"
                    delay={1300}
                    addNPC={addNPC}/>
              </Col>
              <Col span={4}>
                  <NpcCategory 
                    mobs={mobs.players}
                    title="Jogadores"
                    delay={1700}
                    addNPC={addNPC}/>
              </Col>
          </Row>
          </> : null}
        </Col>
        {isHost && addSheets && savedCharacters.length > 0 && (
          <Col span={24} flex={1}>
            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}><UserOutlined /> Fichas guardadas</Title>
            <Row gutter={[8, 8]}>
              {savedCharacters.map((entry) => (
                <Col key={entry.ownerName + (entry.peerId ?? "")} span={24} md={12} lg={8}>
                  <Button
                    block
                    onClick={() => addSheetToBattle(entry)}
                  >
                    {entry.data.sheetName?.trim() || entry.ownerName}
                    {entry.data.sheetName?.trim() && entry.ownerName ? ` (por ${entry.ownerName})` : ""}
                  </Button>
                </Col>
              ))}
            </Row>
          </Col>
        )}
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
                    onNameChange={onNameChange}
                    onStoppingPowerChange={onStoppingPowerChange}
                    onStoppingPowerHeadChange={onStoppingPowerHeadChange}
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
              tooltip="Turno anterior"
              icon={<LeftOutlined />}
              onClick={previousTurn}
            />
            <FloatButton
              tooltip="Próximo turno"
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
          <Title level={2} key={"mook-title"} style={{ whiteSpace: "nowrap", lineHeight: 1.2, marginBottom: 8 }}>{props.title}™</Title>
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