'use client';

import { Button, Col, InputNumber, Row } from "antd";
import { useContext, useMemo, useState } from "react";
import { MapGridState, MessageBusContext } from "../contexts/MessageBusContext";

function buildEmptyGrid(rows: number, cols: number): (string | null)[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

export default function MapGrid() {
  const { mapGrid, setMapGrid, isHost } = useContext(MessageBusContext);
  const [rowsInput, setRowsInput] = useState(mapGrid?.rows ?? 4);
  const [colsInput, setColsInput] = useState(mapGrid?.cols ?? 4);

  const handleCreateGrid = () => {
    const rows = Math.max(1, Math.min(24, Math.round(rowsInput)));
    const cols = Math.max(1, Math.min(24, Math.round(colsInput)));
    setRowsInput(rows);
    setColsInput(cols);
    const cells = buildEmptyGrid(rows, cols);
    setMapGrid({ rows, cols, cells });
  };

  const gridState = mapGrid ?? { rows: 0, cols: 0, cells: [] as (string | null)[][] };
  const { rows, cols, cells } = gridState;

  const cellSize = useMemo(() => {
    if (rows <= 0 || cols <= 0) return 48;
    const maxCell = 80;
    const minCell = 40;
    const total = rows * cols;
    if (total <= 16) return maxCell;
    if (total >= 100) return minCell;
    return Math.max(minCell, maxCell - Math.floor((total - 16) / 10));
  }, [rows, cols]);

  if (rows === 0 || cols === 0) {
    return (
      <Row gutter={[16, 16]} style={{ padding: 16 }}>
        {isHost && (
          <Col span={24}>
            <Row align="middle" gutter={8}>
              <Col>
                <span>Linhas:</span>
                <InputNumber
                  min={1}
                  max={24}
                  value={rowsInput}
                  onChange={(v) => setRowsInput(Number(v) ?? 4)}
                  style={{ width: 72, marginLeft: 8 }}
                />
              </Col>
              <Col>
                <span>Colunas:</span>
                <InputNumber
                  min={1}
                  max={24}
                  value={colsInput}
                  onChange={(v) => setColsInput(Number(v) ?? 4)}
                  style={{ width: 72, marginLeft: 8 }}
                />
              </Col>
              <Col>
                <Button type="primary" onClick={handleCreateGrid}>
                  Criar grid
                </Button>
              </Col>
            </Row>
          </Col>
        )}
        {!isHost && (
          <Col span={24}>
            <span style={{ color: "#888" }}>Aguardando o host criar o mapa.</span>
          </Col>
        )}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ padding: 16 }}>
      {isHost && (
        <Col span={24}>
          <Row align="middle" gutter={8}>
            <Col>
              <span>Linhas:</span>
              <InputNumber
                min={1}
                max={24}
                value={rowsInput}
                onChange={(v) => setRowsInput(Number(v) ?? rows)}
                style={{ width: 72, marginLeft: 8 }}
              />
            </Col>
            <Col>
              <span>Colunas:</span>
              <InputNumber
                min={1}
                max={24}
                value={colsInput}
                onChange={(v) => setColsInput(Number(v) ?? cols)}
                style={{ width: 72, marginLeft: 8 }}
              />
            </Col>
            <Col>
              <Button type="primary" onClick={handleCreateGrid}>
                Atualizar grid
              </Button>
            </Col>
          </Row>
        </Col>
      )}
      <Col span={24}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gap: 2,
            width: "fit-content",
            backgroundColor: "#d9d9d9",
            padding: 4,
            borderRadius: 4,
          }}
        >
          {cells.map((row, r) =>
            row.map((combatantId, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: "#fff",
                  border: "1px solid #bfbfbf",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: combatantId ? "#1677ff" : "#bfbfbf",
                  overflow: "hidden",
                  padding: 2,
                }}
                title={combatantId ? `Iniciativa: ${combatantId}` : "Casa vazia — preparado para combatente da iniciativa"}
              >
                {combatantId ? combatantId.slice(-6) : "—"}
              </div>
            ))
          )}
        </div>
      </Col>
    </Row>
  );
}
