import { PauseCircleOutlined, PlayCircleOutlined, RedoOutlined, SoundOutlined } from "@ant-design/icons";
import { Col, Row, Slider } from "antd";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "react-use-audio-player";

export default function AudioCard(props: any) {
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