import { animated, useTrail } from "@react-spring/web";
import { LogData } from "../contexts/MessageBusContext";
import { Avatar, Col, Row, Typography } from "antd";

export function AnimatedList(props: {list: LogData[]}) {
    const filteredList = props.list.filter((item)=>item.metadata.code==2)
    const trail = useTrail(filteredList.length, {
      from: { opacity: 0},
      to: { opacity: 1},
      duration: 2000, // Customize the animation duration
    });
  
    return (
      <div>
        {trail.map((cprops, index) => (
          <animated.div key={index} style={cprops}>
            <Row gutter={[8,8]}>
              <Col>
                <Avatar src={filteredList[index].metadata.sender.avatar}/>
              </Col>
              <Col span={23}>
                <Col>
                  <Typography.Text strong>
                    {filteredList[index].metadata.sender.name}
                  </Typography.Text>
                </Col>
                <Col>
                  <Typography.Text type={"secondary"}>
                    {filteredList[index].content.message}
                  </Typography.Text>
                </Col>
              </Col>
            </Row>
          </animated.div>
        ))}
      </div>
    );
  }