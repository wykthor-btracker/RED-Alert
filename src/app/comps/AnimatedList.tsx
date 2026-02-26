import { LogData } from "../contexts/MessageBusContext";
import { Avatar, Col, Row, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";

export function AnimatedList(props: {
  list: LogData[];
  isHost?: boolean;
  onDeleteMessage?: (id: string) => void;
}) {
    const filteredList = props.list.filter((item) => item.metadata?.code === 2);

    return (
      <div>
        {filteredList.map((item, index) => {
          const isDirect = item.metadata?.type === "direct";
          const targetName = item.metadata?.data?.targetName;
          return (
            <div key={item.id ?? index}>
              <Row gutter={[8, 8]} align="middle" style={{ flexWrap: "nowrap" }}>
                <Col flex="none">
                  <Avatar src={item.metadata.sender.avatar} />
                </Col>
                <Col flex="1" style={{ minWidth: 0 }}>
                  <div>
                    <Typography.Text strong>
                      {item.metadata.sender.name}
                      {isDirect && targetName && (
                        <Tag color="blue" style={{ marginLeft: 6 }}>Mensagem para você</Tag>
                      )}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary">
                      {item.content.message}
                    </Typography.Text>
                  </div>
                </Col>
                {props.isHost && props.onDeleteMessage && item.id && (
                  <Col flex="none">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => props.onDeleteMessage!(item.id!)}
                      title="Excluir mensagem"
                    />
                  </Col>
                )}
              </Row>
            </div>
          );
        })}
      </div>
    );
  }