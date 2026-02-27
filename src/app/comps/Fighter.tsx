import { Badge, Button, Col, Input, InputNumber, List, Progress, Row, Tooltip } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { LogData, MessageBusContext } from "../contexts/MessageBusContext";
import { resolveCharacterIcon } from "@/data/characterPresetIcons";

export default function Fighter(props: any) {
    const { send, senderData } = useContext(MessageBusContext)

    function broadcastUpdate(message: string) {
      if (send && senderData) {
        send({
          content: { message },
          metadata: { sender: senderData, type: "message", code: 2, data: {} },
        } as LogData)
      }
    }
    const style: React.CSSProperties = {
      padding: '16px 8px',
      borderRadius: 10,
      border: "1px solid grey",
      flex: 1
    }
    const currentRef = useRef<null | HTMLDivElement>(null);
    const [value, setValue] = useState("0")
    const [shield, setShield] = useState(0)
    const [editingName, setEditingName] = useState(false)
    const [nameEditValue, setNameEditValue] = useState("")
    const [stats, setStats] = useState({
      name: props.item.name,
      stoppingPower: props.item.stoppingPower,
      stoppingPowerHead: (props.item as { stoppingPowerHead?: number }).stoppingPowerHead ?? props.item.stoppingPower,
      stoppingPowerMax: props.item.stoppingPowerMax ?? props.item.stoppingPower,
      stoppingPowerHeadMax: (props.item as { stoppingPowerHeadMax?: number }).stoppingPowerHeadMax ?? props.item.stoppingPowerMax ?? props.item.stoppingPower,
      currentHealth: props.item.currentHealth,
      maxHealth: props.item.maxHealth
    })
    /** Input values for Set SP (body and head), pre-filled with starting/max SP */
    const [setSpBodyValue, setSetSpBodyValue] = useState(stats.stoppingPowerMax)
    const [setSpHeadValue, setSetSpHeadValue] = useState(stats.stoppingPowerHeadMax)
    // Sync from parent when combatant is updated from outside (e.g. damage/armor from Mapa tab)
    useEffect(() => {
      const item = props.item as { stoppingPowerHead?: number; stoppingPowerHeadMax?: number };
      setStats((prev) => ({
        ...prev,
        name: props.item.name,
        currentHealth: props.item.currentHealth,
        maxHealth: props.item.maxHealth,
        stoppingPower: props.item.stoppingPower,
        stoppingPowerMax: props.item.stoppingPowerMax ?? props.item.stoppingPower,
        stoppingPowerHead: item.stoppingPowerHead ?? props.item.stoppingPower,
        stoppingPowerHeadMax: item.stoppingPowerHeadMax ?? props.item.stoppingPowerMax ?? props.item.stoppingPower,
      }))
    }, [props.item.currentHealth, props.item.maxHealth, props.item.stoppingPower, props.item.stoppingPowerMax, (props.item as { stoppingPowerHead?: number }).stoppingPowerHead, (props.item as { stoppingPowerHeadMax?: number }).stoppingPowerHeadMax, props.item.name])
    // Pre-fill Set SP inputs with max when combatant or max changes (not when only current SP changes)
    useEffect(() => {
      const maxBody = props.item.stoppingPowerMax ?? props.item.stoppingPower
      const maxHead = (props.item as { stoppingPowerHeadMax?: number }).stoppingPowerHeadMax ?? props.item.stoppingPowerMax ?? props.item.stoppingPower
      setSetSpBodyValue(maxBody)
      setSetSpHeadValue(maxHead)
    }, [props.item.id, props.item.stoppingPowerMax, (props.item as { stoppingPowerHeadMax?: number }).stoppingPowerHeadMax])
    useEffect(()=>{
      if(props.currentTurn == props.index && currentRef.current) {
        currentRef.current.scrollIntoView({behavior: "smooth"})
      }
    },[props.currentTurn])
  
    function heal () {
      const amount = Number(value)
      const newHp = Math.min(stats.currentHealth + amount, stats.maxHealth)
      setStats({ ...stats, currentHealth: newHp })
      ;(props as { onHealthChange?: (id: string, current: number, max?: number) => void }).onHealthChange?.(props.item.id, newHp, stats.maxHealth)
      broadcastUpdate(`${stats.name} curou ${amount} de HP`)
    }

    function addShield () {
      const amount = Number(value)
      setShield(amount)
      broadcastUpdate(`${stats.name} ganhou ${amount} de escudo`)
    }
    
    function damage () {
      const totalVal = Number(value)
      let msg: string
      if (shield > totalVal) {
        setShield(Math.max(shield - totalVal, 0))
        msg = `${stats.name} tomou ${totalVal} de dano (${totalVal} no escudo)`
      } else if (shield === totalVal) {
        setShield(0)
        msg = `${stats.name} tomou ${totalVal} de dano (${totalVal} no escudo)`
      } else {
        const hpDamage = totalVal - shield
        setShield(0)
        const newHp = Math.max(stats.currentHealth - hpDamage, 0)
        setStats({ ...stats, currentHealth: newHp })
        ;(props as { onHealthChange?: (id: string, current: number, max?: number) => void }).onHealthChange?.(props.item.id, newHp, stats.maxHealth)
        msg = shield > 0
          ? `${stats.name} tomou ${totalVal} de dano (${shield} no escudo, ${hpDamage} na vida)`
          : `${stats.name} tomou ${hpDamage} de dano`
      }
      broadcastUpdate(msg)
    }
  
    function ablate () {
      const newBody = Math.max(stats.stoppingPower - 1, 0)
      setStats({ ...stats, stoppingPower: newBody })
      props.onStoppingPowerChange?.(props.item.id, newBody, stats.stoppingPowerMax)
      broadcastUpdate(`${stats.name}: SP corpo reduzido em 1`)
    }
  
    function setStoppingPowerBody () {
      const val = Math.max(0, Math.round(Number(setSpBodyValue) || 0))
      const newMax = Math.max(stats.stoppingPowerMax, val)
      setStats({ ...stats, stoppingPower: val, stoppingPowerMax: newMax })
      props.onStoppingPowerChange?.(props.item.id, val, newMax)
      broadcastUpdate(`${stats.name}: SP corpo definido para ${val}`)
    }
    function ablateHead () {
      const newHead = Math.max(stats.stoppingPowerHead - 1, 0)
      setStats({ ...stats, stoppingPowerHead: newHead })
      props.onStoppingPowerHeadChange?.(props.item.id, newHead, stats.stoppingPowerHeadMax)
      broadcastUpdate(`${stats.name}: SP cabeça reduzido em 1`)
    }
  
    function setStoppingPowerHead () {
      const val = Math.max(0, Math.round(Number(setSpHeadValue) || 0))
      const newMax = Math.max(stats.stoppingPowerHeadMax, val)
      setStats({ ...stats, stoppingPowerHead: val, stoppingPowerHeadMax: newMax })
      props.onStoppingPowerHeadChange?.(props.item.id, val, newMax)
      broadcastUpdate(`${stats.name}: SP cabeça definido para ${val}`)
    }
    return (
      <Badge.Ribbon color="red" text={props.currentTurn == props.index ? "Sua vez!" : ""}>
        <List.Item ref={currentRef} key={props.index}>
          <Row style={style}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {(props.item as { characterIcon?: string }).characterIcon && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundImage: `url(${resolveCharacterIcon((props.item as { characterIcon?: string }).characterIcon)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                  )}
                  {props.onNameChange ? (
                    editingName ? (
                      <Input
                        size="small"
                        value={nameEditValue}
                        onChange={(e) => setNameEditValue(e.target.value)}
                        onBlur={() => {
                          const s = nameEditValue.trim();
                          if (s) props.onNameChange?.(props.item.id, s);
                          setEditingName(false);
                        }}
                        onPressEnter={() => {
                          const s = nameEditValue.trim();
                          if (s) props.onNameChange?.(props.item.id, s);
                          setEditingName(false);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: 160 }}
                        autoFocus
                      />
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setNameEditValue(stats.name);
                          setEditingName(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setNameEditValue(stats.name);
                            setEditingName(true);
                          }
                        }}
                        style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
                        title="Clique para editar o nome"
                      >
                        {stats.name}
                      </span>
                    )
                  ) : (
                    stats.name
                  )}
                </Col>
                {props.onInitiativeChange != null && (
                  <Col>
                    <span style={{ marginRight: 8 }}>Inic.:</span>
                    <InputNumber
                      min={0}
                      max={99}
                      step={1}
                      value={Math.round(Number(props.item.initiative))}
                      onChange={(v) => props.onInitiativeChange?.(props.item.id, Math.round(Number(v) ?? 0))}
                      parser={(v) => Math.round(Number(v) || 0)}
                      size="small"
                      style={{ width: 56 }}
                    />
                  </Col>
                )}
              </Row>
            </Col>
            <Col span={12} data-testid="fighter-hp">
              <span>
                HP: <span style={{fontWeight: "bold"}}>
                  {stats.currentHealth/stats.maxHealth<=0.5 
                  ? (stats.currentHealth < 1 ? 
                      <Tooltip title="-4 em todas as ações. -6 em MOVE (mín. 1). Teste de morte no início de cada turno (1d10 &lt; CORPO = sucesso). Ferimento crítico ao sofrer dano. Penalidade no teste de morte +1 ao ser atingido.">Ferido mortalmente!</Tooltip> 
                  : "Ferido grave! -2 em todas as ações.") : null}</span>
                <Progress 
                      success={{percent: (stats.currentHealth/(stats.maxHealth+shield))*100, strokeColor: (stats.currentHealth/stats.maxHealth)*100<=50 ? "red" : "green"}}
                      showInfo={false} 
                      strokeColor={"purple"} 
                      percent={shield != 0 ? (stats.currentHealth+shield/stats.maxHealth+shield)*100 : 0}
                      />
              </span>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span>SP Cabeça: {stats.stoppingPowerHead}</span>
                    {(props.item as { headArmorName?: string }).headArmorName && (
                      <span style={{ textAlign: "right", color: "#666", fontSize: 12 }}>{(props.item as { headArmorName?: string }).headArmorName}</span>
                    )}
                  </div>
                  <Progress showInfo={false} strokeColor={"orange"} percent={(stats.stoppingPowerHead/stats.stoppingPowerHeadMax)*100}/>
                </Col>
                <Col span={12}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span>SP Corpo: {stats.stoppingPower}</span>
                    {(props.item as { bodyArmorName?: string }).bodyArmorName && (
                      <span style={{ textAlign: "right", color: "#666", fontSize: 12 }}>{(props.item as { bodyArmorName?: string }).bodyArmorName}</span>
                    )}
                  </div>
                  <Progress showInfo={false} strokeColor={"orange"} percent={(stats.stoppingPower/stats.stoppingPowerMax)*100}/>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={3}>
                  <Button style={{width: 100}} onClick={damage}>Dano</Button>
                </Col>
                <Col span={3}>
                  <Button style={{width: 100}} onClick={heal}>Curar</Button>
                </Col>
                <Col span={3}>
                  <Button style={{width: 100}} onClick={addShield}>Escudo</Button>
                </Col>
                <Col span={3}>
                  <Input data-testid="fighter-damage-input" onChange={(event)=>setValue(event.target.value)} value={value}></Input>
                </Col>
                <Col span={12}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Button onClick={ablateHead}>Ablação</Button>
                        <InputNumber
                          min={0}
                          value={setSpHeadValue}
                          onChange={(v) => setSetSpHeadValue(v != null ? Number(v) : stats.stoppingPowerHeadMax)}
                          style={{ width: 56 }}
                          controls={false}
                        />
                        <Button onClick={setStoppingPowerHead} style={{ marginLeft: "auto" }}>Definir SP</Button>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Button onClick={ablate}>Ablação</Button>
                        <InputNumber
                          min={0}
                          value={setSpBodyValue}
                          onChange={(v) => setSetSpBodyValue(v != null ? Number(v) : stats.stoppingPowerMax)}
                          style={{ width: 56 }}
                          controls={false}
                        />
                        <Button onClick={setStoppingPowerBody} style={{ marginLeft: "auto" }}>Definir SP</Button>
                      </div>
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