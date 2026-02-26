'use client';

import { Button, Col, Dropdown, InputNumber, MenuProps, Modal, Row, Switch } from "antd";
import { useContext, useMemo, useState } from "react";
import { MapGridState, MessageBusContext } from "../contexts/MessageBusContext";

const DRAG_TYPE_INITIATIVE = "application/x-initiative-combatant";
const DRAG_TYPE_MAP_CELL = "application/x-map-cell";

function buildEmptyGrid(rows: number, cols: number): (string | null)[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function coverKey(r: number, c: number) {
  return `${r},${c}`;
}

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + "…";
}

export default function MapGrid() {
  const { mapGrid, setMapGrid, isHost, initiativeCombatants, setInitiativeCombatants } = useContext(MessageBusContext);
  const [rowsInput, setRowsInput] = useState(mapGrid?.rows ?? 4);
  const [colsInput, setColsInput] = useState(mapGrid?.cols ?? 4);
  const [paintMode, setPaintMode] = useState(false);
  const [coverHp, setCoverHp] = useState<number | null>(null);
  /** Dropdown: which cell (with combatant) is showing the menu */
  const [cellMenu, setCellMenu] = useState<{ r: number; c: number; combatantId: string } | null>(null);
  /** Modal for Dano / Dano à armadura amount */
  const [damageModal, setDamageModal] = useState<{ type: "dano" | "armadura"; combatantId: string; r: number; c: number } | null>(null);
  const [damageAmount, setDamageAmount] = useState<number>(1);

  const handleCreateGrid = () => {
    const rows = Math.max(1, Math.min(24, Math.round(rowsInput)));
    const cols = Math.max(1, Math.min(24, Math.round(colsInput)));
    setRowsInput(rows);
    setColsInput(cols);
    const cells = buildEmptyGrid(rows, cols);
    setMapGrid({ rows, cols, cells, coverCells: {} });
  };

  const gridState = mapGrid ?? { rows: 0, cols: 0, cells: [] as (string | null)[][] };
  const { rows, cols, cells, coverCells: rawCoverCells } = gridState;
  const coverCells = rawCoverCells ?? {};

  const toggleCover = (r: number, c: number) => {
    if (!mapGrid || !isHost) return;
    const key = coverKey(r, c);
    const next = { ...coverCells };
    if (key in next) {
      delete next[key];
    } else {
      next[key] = coverHp != null && coverHp > 0 ? { health: coverHp } : {};
    }
    setMapGrid({ ...mapGrid, coverCells: next });
  };

  const placeOrMoveCombatant = (toR: number, toC: number, combatantId: string, fromR?: number, fromC?: number) => {
    if (!mapGrid || !isHost) return;
    const nextCells = cells.map((row, r) =>
      row.map((val, c) => {
        if (fromR !== undefined && fromC !== undefined && r === fromR && c === fromC) return null;
        if (r === toR && c === toC) return combatantId;
        return val;
      })
    );
    setMapGrid({ ...mapGrid, cells: nextCells });
  };

  const handleCellDrop = (e: React.DragEvent, toR: number, toC: number) => {
    e.preventDefault();
    if (!isHost || !mapGrid) return;
    const initiativeId = e.dataTransfer.getData(DRAG_TYPE_INITIATIVE);
    const cellPayload = e.dataTransfer.getData(DRAG_TYPE_MAP_CELL);
    if (initiativeId) {
      // If this combatant is already on the grid, move from that cell instead of duplicating
      let fromR: number | undefined;
      let fromC: number | undefined;
      for (let r = 0; r < cells.length; r++) {
        for (let c = 0; c < cells[r].length; c++) {
          if (cells[r][c] === initiativeId) {
            fromR = r;
            fromC = c;
            break;
          }
        }
        if (fromR !== undefined) break;
      }
      placeOrMoveCombatant(toR, toC, initiativeId, fromR, fromC);
      return;
    }
    if (cellPayload) {
      try {
        const { fromR, fromC, combatantId } = JSON.parse(cellPayload) as { fromR: number; fromC: number; combatantId: string };
        if (Number.isInteger(fromR) && Number.isInteger(fromC) && combatantId) {
          placeOrMoveCombatant(toR, toC, combatantId, fromR, fromC);
        }
      } catch (_) {}
    }
  };

  const clearCellCombatant = (r: number, c: number, combatantId: string) => {
    if (!mapGrid || !isHost) return;
    const nextCells = cells.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? null : val))
    );
    setMapGrid({ ...mapGrid, cells: nextCells });
    setInitiativeCombatants(initiativeCombatants.filter((x) => x.id !== combatantId));
    setCellMenu(null);
  };

  const applyDamage = (combatantId: string, amount: number) => {
    const next = initiativeCombatants.map((c) =>
      c.id === combatantId
        ? { ...c, currentHealth: Math.max(0, (c.currentHealth ?? 0) - amount) }
        : c
    );
    setInitiativeCombatants(next);
    setDamageModal(null);
    setDamageAmount(1);
  };

  const applyArmorDamage = (combatantId: string, amount: number) => {
    const next = initiativeCombatants.map((c) =>
      c.id === combatantId
        ? { ...c, stoppingPower: Math.max(0, (c.stoppingPower ?? 0) - amount) }
        : c
    );
    setInitiativeCombatants(next);
    setDamageModal(null);
    setDamageAmount(1);
  };

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
            <Col style={{ marginLeft: 16 }}>
              <Switch checked={paintMode} onChange={setPaintMode} />
              <span style={{ marginLeft: 8 }}>Pintar</span>
            </Col>
            {paintMode && (
              <Col>
                <span>Cover HP:</span>
                <InputNumber
                  min={0}
                  placeholder="opcional"
                  value={coverHp ?? undefined}
                  onChange={(v) => setCoverHp(v != null ? Number(v) : null)}
                  style={{ width: 72, marginLeft: 8 }}
                />
              </Col>
            )}
          </Row>
        </Col>
      )}
      <Col span={24}>
        <Row gutter={16} wrap={false}>
          {initiativeCombatants.length > 0 && (
            <Col flex="none">
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Iniciativa</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "50vh", overflowY: "auto" }}>
                {initiativeCombatants.map((comb) => (
                  <li
                    key={comb.id}
                    draggable={isHost}
                    onDragStart={(e) => {
                      if (!isHost) return;
                      e.dataTransfer.setData(DRAG_TYPE_INITIATIVE, comb.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    style={{
                      padding: "6px 10px",
                      marginBottom: 4,
                      background: "#f5f5f5",
                      borderRadius: 4,
                      cursor: isHost ? "grab" : "default",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    {comb.name}
                  </li>
                ))}
              </ul>
            </Col>
          )}
          <Col flex="1" style={{ minWidth: 0 }}>
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
            row.map((combatantId, c) => {
              const key = coverKey(r, c);
              const isCover = key in coverCells;
              const coverInfo = coverCells[key];
              const coverHealth = coverInfo?.health;
              const combatantName = combatantId
                ? (initiativeCombatants.find((x) => x.id === combatantId)?.name ?? combatantId.slice(-6))
                : null;
              const displayText = combatantName
                ? truncateName(combatantName, Math.max(6, Math.floor(cellSize / 7)))
                : null;
              const canDrop = isHost && !paintMode;
              const showCellMenu = isHost && !paintMode && !!combatantId;
              const menuItems: MenuProps["items"] = showCellMenu
                ? [
                    { key: "deletar", label: "Deletar", onClick: () => clearCellCombatant(r, c, combatantId!) },
                    { key: "dano", label: "Dano", onClick: () => setDamageModal({ type: "dano", combatantId: combatantId!, r, c }) },
                    { key: "armadura", label: "Dano à armadura", onClick: () => setDamageModal({ type: "armadura", combatantId: combatantId!, r, c }) },
                  ]
                : [];
              const cellContent = (
                <div
                  key={`${r}-${c}`}
                  role={isHost && paintMode ? "button" : undefined}
                  onClick={isHost && paintMode ? () => toggleCover(r, c) : undefined}
                  draggable={isHost && !paintMode && !!combatantId}
                  onDragStart={
                    isHost && !paintMode && combatantId
                      ? (e) => {
                          e.dataTransfer.setData(DRAG_TYPE_MAP_CELL, JSON.stringify({ fromR: r, fromC: c, combatantId }));
                          e.dataTransfer.effectAllowed = "move";
                        }
                      : undefined
                  }
                  onDragOver={canDrop ? (e) => e.preventDefault() : undefined}
                  onDrop={canDrop ? (e) => handleCellDrop(e, r, c) : undefined}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isCover ? "#8b7355" : "#fff",
                    border: isCover ? "1px solid #5d4e3d" : "1px solid #bfbfbf",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: combatantId ? "#1677ff" : isCover ? "#f0e6d8" : "#bfbfbf",
                    overflow: "hidden",
                    padding: 2,
                    cursor: isHost && paintMode ? "crosshair" : isHost && combatantId ? "grab" : undefined,
                  }}
                  title={
                    isCover
                      ? `Cobertura${coverHealth != null ? ` (HP: ${coverHealth})` : ""}`
                      : combatantId
                        ? (combatantName ? `Iniciativa: ${combatantName}` : combatantId)
                        : "Casa vazia — arraste da lista ou de outra casa"
                  }
                >
                  {displayText ?? (isCover && coverHealth != null ? `HP ${coverHealth}` : isCover ? "🛡" : "—")}
                </div>
              );
              return showCellMenu ? (
                <Dropdown
                  key={`${r}-${c}`}
                  menu={{ items: menuItems, onClick: () => setCellMenu(null) }}
                  trigger={["click"]}
                  open={!!(cellMenu && cellMenu.r === r && cellMenu.c === c)}
                  onOpenChange={(open) => setCellMenu(open ? { r, c, combatantId: combatantId! } : null)}
                >
                  {cellContent}
                </Dropdown>
              ) : (
                cellContent
              );
            })
          )}
        </div>
          </Col>
        </Row>
      </Col>
      <Modal
        title={damageModal?.type === "dano" ? "Dano" : "Dano à armadura"}
        open={!!damageModal}
        onOk={() => {
          if (damageModal) {
            if (damageModal.type === "dano") applyDamage(damageModal.combatantId, damageAmount);
            else applyArmorDamage(damageModal.combatantId, damageAmount);
          }
        }}
        onCancel={() => { setDamageModal(null); setDamageAmount(1); }}
        okText="Aplicar"
        cancelText="Cancelar"
      >
        <div style={{ marginTop: 8 }}>
          <span style={{ marginRight: 8 }}>Quantidade:</span>
          <InputNumber
            min={1}
            value={damageAmount}
            onChange={(v) => setDamageAmount(Number(v) ?? 1)}
          />
        </div>
      </Modal>
    </Row>
  );
}
