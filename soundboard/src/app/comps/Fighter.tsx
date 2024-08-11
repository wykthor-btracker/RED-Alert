import { Badge, Button, Col, Input, List, Progress, Row, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

export default function Fighter(props: any) {
    const style: React.CSSProperties = {
      padding: '16px 8px',
      borderRadius: 10,
      border: "1px solid grey",
      flex: 1
    }
    const currentRef = useRef<null | HTMLDivElement>(null);
    const [value, setValue] = useState("0")
    const [shield, setShield] = useState(0)
    const [stats, setStats] = useState({
      name: props.item.name,
      stoppingPower: props.item.stoppingPower,
      stoppingPowerHead: props.item.stoppingPower,
      stoppingPowerMax: props.item.stoppingPower,
      stoppingPowerHeadMax: props.item.stoppingPower,
      currentHealth: props.item.currentHealth,
      maxHealth: props.item.maxHealth
    })
    useEffect(()=>{
      if(props.currentTurn == props.index && currentRef.current) {
        currentRef.current.scrollIntoView({behavior: "smooth"})
      }
    },[props.currentTurn])
  
    function heal () {
      setStats({...stats,
        currentHealth: Math.min(stats.currentHealth+Number(value),stats.maxHealth)})
      }
    
    function addShield () {
      setShield(Number(value))
    }
    
    function damage () {
      var val = Number(value)
      if(shield > val) {
        setShield(Math.max(shield-Number(value),0))
      } else if(shield==val) {
        setShield(0)
      }
      else {
        val = val-shield
        setShield(0)
        setStats({...stats,
          currentHealth: Math.max(stats.currentHealth-(val),0)})
      }}
  
    function ablate () {
      setStats({...stats,
        stoppingPower: Math.max(stats.stoppingPower-1, 0)})
    }
  
    function resetStoppingPower () {
      setStats({...stats,
        stoppingPower: stats.stoppingPowerMax})
    }
    function ablateHead () {
      setStats({...stats,
        stoppingPowerHead: Math.max(stats.stoppingPowerHead-1, 0)})
    }
  
    function resetStoppingPowerHead () {
      setStats({...stats,
        stoppingPowerHead: stats.stoppingPowerHeadMax})
    }
    return (
      <Badge.Ribbon color="red" text={props.currentTurn == props.index ? "Sua vez!" : ""}>
        <List.Item ref={currentRef} key={props.index}>
          <Row style={style}>
            <Col span={24}>
              {stats.name}
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