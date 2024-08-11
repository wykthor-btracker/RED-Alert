import { FloatButton, Input, InputRef, Row } from "antd";
import { useContext, useRef, useState } from "react";
import { MessageBusContext } from "../page";

export default function DiceRoller (props: any) {
    const {messageApi, send, senderData}          = useContext(MessageBusContext)
    const [toRoll, setToRoll]   = useState(1)
    const inputRef              = useRef<InputRef>(null)

    function nroll (size: number, count: number) {
        let acc = []
        for (let index = 0; index < count; index++) {
            acc.push(Math.ceil((Math.random()*100))%size+1)
        }
        return acc
    }

    function parseRoll(rolls: number[], size: number) {
        let toString;
        let crits = rolls.map((item)=>{
            if(item == size) { return Number(1)}
            else return Number(0)
        }).reduce((acc, curr) => acc+curr)
        if(rolls.length == 1) {
            toString = `${rolls[0]}`
        }
        else {
            toString = rolls.join(" + ") + " = " + rolls.reduce((acc, curr) => acc+curr)
        }
        return [crits, toString]
    }

    function rollDice (size: number) {
        let roll = nroll(size, toRoll)
        let [crits, toString] = parseRoll(roll, size)
        let message = ""
        if(toRoll == 1 && size == 10) {
            if(crits) {
                let critRoll = nroll(10, 1)
                let sum = roll[0] + critRoll[0]
                message = `CRÍTICO PORRA!!! DEU ${roll[0]} + ${critRoll[0]} = ${sum}`
            }
            else {
                message = "1d10 = " + roll[0]
            }
        } else {
            if(toRoll == 1) {
                message = `${toRoll}d${size} = ${toString} ${crits ? ", CRIT!": ""}`
            }
            message = `${toRoll}d${size} = ${toString}, ${crits} críticos! ${crits ? "💥": ""}`
        }
        messageApi?.info(message, 5)
        if(senderData) {
            send({
                content: {message},
                metadata: {
                    sender: senderData,
                    code: 2,
                    type: "message",
                    data: {}
                }
            })
        }
    }
    return (
      <>
      <Row>
        <FloatButton.Group
          trigger="hover"
          onOpenChange={()=>{
              inputRef.current?.focus({cursor: "all"})
          }}
          type="primary"
          style={{insetInlineEnd: 94}}
          icon={<img src={"d10.svg"}></img>}>
          <FloatButton 
            tooltip={`Rolar ${toRoll}d10`} 
            type="primary" 
            icon={<img src={"d10.svg"}></img>}
            onClick={()=>{
                rollDice(10)
            }}/>

          <FloatButton 
            tooltip={`Rolar ${toRoll}d6`} 
            type="primary" 
            icon={<img src={"d6.svg"}></img>}
            onClick={()=>{
                rollDice(6)
            }}/>

            <Input value={toRoll} onChange={(event)=>{setToRoll(Number(event.target.value))}} ref={inputRef}></Input>
        </FloatButton.Group>
      </Row>
      </>
    )
  }