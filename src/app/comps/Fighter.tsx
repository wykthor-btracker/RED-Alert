import { Badge, Button, Col, Input, InputNumber, List, Progress, Row, Tooltip } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { LogData, MessageBusContext } from "../contexts/MessageBusContext";

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
    useEffect(()=>{
      if(props.currentTurn == props.index && currentRef.current) {
        currentRef.current.scrollIntoView({behavior: "smooth"})
      }
    },[props.currentTurn])
  
    function heal () {
      const amount = Number(value)
      setStats({...stats,
        currentHealth: Math.min(stats.currentHealth+amount,stats.maxHealth)})
      broadcastUpdate(`${stats.name} curou ${amount} de HP`)
      }
    
    function addShield () {
      const amount = Number(value)
      setShield(amount)
      broadcastUpdate(`${stats.name} ganhou ${amount} de escudo`)
    }
    
    function damage () {
      var val = Number(value)
      let msg: string
      if(shield > val) {
        setShield(Math.max(shield-Number(value),0))
        msg = `${stats.name} tomou ${val} de dano (${val} no escudo)`
      } else if(shield==val) {
        setShield(0)
        msg = `${stats.name} tomou ${val} de dano (${val} no escudo)`
      }
      else {
        val = val-shield
        setShield(0)
        setStats({...stats,
          currentHealth: Math.max(stats.currentHealth-(val),0)})
        msg = shield > 0
          ? `${stats.name} tomou ${Number(value)} de dano (${shield} no escudo, ${val} na vida)`
          : `${stats.name} tomou ${val} de dano`
      }
      broadcastUpdate(msg)
    }
  
    function ablate () {
      setStats({...stats,
        stoppingPower: Math.max(stats.stoppingPower-1, 0)})
      broadcastUpdate(`${stats.name}: SP corpo reduzido em 1`)
    }
  
    function resetStoppingPower () {
      setStats({...stats,
        stoppingPower: stats.stoppingPowerMax})
      broadcastUpdate(`${stats.name}: SP corpo resetado para ${stats.stoppingPowerMax}`)
    }
    function ablateHead () {
      setStats({...stats,
        stoppingPowerHead: Math.max(stats.stoppingPowerHead-1, 0)})
      broadcastUpdate(`${stats.name}: SP cabeça reduzido em 1`)
    }
  
    function resetStoppingPowerHead () {
      setStats({...stats,
        stoppingPowerHead: stats.stoppingPowerHeadMax})
      broadcastUpdate(`${stats.name}: SP cabeça resetado para ${stats.stoppingPowerHeadMax}`)
    }
    return (
      <Badge.Ribbon color="red" text={props.currentTurn == props.index ? "Sua vez!" : ""}>
        <List.Item ref={currentRef} key={props.index}>
          <Row style={style}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
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
            <Col span={12}>
              <span>
                HP: <span style={{fontWeight: "bold"}}>
                  {stats.currentHealth/stats.maxHealth<=0.5 
                  ? (stats.currentHealth < 1 ? 
                      <Tooltip title=" -4 to all Actions. -6 to MOVE(Min. 1) Death save at start of each turn (Roll 1d10<BODY = success) Critical Injury when damaged. Death Save Penalty +! on hit.">Mortally Wounded!</Tooltip> 
                  : "Seriously Wounded! -2 to all Actions.") : null}</span>
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
                  SP Head: {stats.stoppingPowerHead}<Progress showInfo={false} strokeColor={"orange"} percent={(stats.stoppingPowerHead/stats.stoppingPowerHeadMax)*100}/>
                </Col>
                <Col span={12}>
                  SP Body: {stats.stoppingPower}<Progress showInfo={false} strokeColor={"orange"} percent={(stats.stoppingPower/stats.stoppingPowerMax)*100}/>
                </Col>
              </Row>
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
                  <Button style={{width: 100}} onClick={addShield}>Shield</Button>
                </Col>
                <Col span={3}>
                  <Input onChange={(event)=>setValue(event.target.value)} value={value}></Input>
                </Col>
                <Col span={12} style={{textAlign: "end"}}>
                  <Row justify={"end"}>
                    <Col span={12}>
                      <Button onClick={ablateHead}>Ablate</Button>
                      <Button onClick={resetStoppingPowerHead}>Reset SP</Button>
                    </Col>
                    <Col span={12}>
                      <Button onClick={ablate}>Ablate</Button>
                      <Button onClick={resetStoppingPower}>Reset SP</Button>
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