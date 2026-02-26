'use client';

import { Button, Col, Dropdown, InputNumber, MenuProps, message, Modal, Row, Switch } from "antd";
import { useContext, useMemo, useState } from "react";
import { LogData, MapGridState, MessageBusContext } from "../contexts/MessageBusContext";

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

/** Cells that the line from (r1,c1) to (r2,c2) passes through (Bresenham, including endpoints). */
function getCellsOnLine(r1: number, c1: number, r2: number, c2: number): { r: number; c: number }[] {
  const out: { r: number; c: number }[] = [];
  const dr = Math.abs(r2 - r1);
  const dc = Math.abs(c2 - c1);
  const sr = r1 < r2 ? 1 : -1;
  const sc = c1 < c2 ? 1 : -1;
  let r = r1;
  let c = c1;
  out.push({ r, c });
  if (dr >= dc) {
    let err = 2 * dc - dr;
    for (let i = 0; i < dr; i++) {
      if (err > 0) {
        c += sc;
        err -= 2 * dr;
      }
      r += sr;
      err += 2 * dc;
      out.push({ r, c });
    }
  } else {
    let err = 2 * dr - dc;
    for (let i = 0; i < dc; i++) {
      if (err > 0) {
        r += sr;
        err -= 2 * dc;
      }
      c += sc;
      err += 2 * dr;
      out.push({ r, c });
    }
  }
  return out;
}

function hasLineOfSight(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  coverCells: Record<string, unknown>
): boolean {
  const cells = getCellsOnLine(r1, c1, r2, c2);
  for (let i = 1; i < cells.length - 1; i++) {
    const { r, c } = cells[i];
    if (coverKey(r, c) in coverCells) return false;
  }
  return true;
}

/** Floating bars shown on hover: health (red), body SP (yellow), head SP (orange). Responsive to cell size. */
function CombatantHoverBars(props: {
  currentHealth: number;
  maxHealth: number;
  stoppingPower: number;
  stoppingPowerMax: number;
  stoppingPowerHead: number;
  stoppingPowerHeadMax: number;
  cellSize: number;
}) {
  const maxH = Math.max(1, props.maxHealth);
  const maxSP = Math.max(1, props.stoppingPowerMax);
  const maxSPHead = Math.max(1, props.stoppingPowerHeadMax);
  const hp = Math.min(1, Math.max(0, props.currentHealth / maxH));
  const bodySP = Math.min(1, Math.max(0, props.stoppingPower / maxSP));
  const headSP = Math.min(1, Math.max(0, props.stoppingPowerHead / maxSPHead));
  // Responsive size: scale with cell, with sensible min/max for readability
  const scale = Math.max(1, Math.min(3, props.cellSize / 24));
  const w = Math.round(Math.max(100, Math.min(220, props.cellSize * 2.2)));
  const barH = Math.max(6, Math.round(8 * scale));
  const gap = Math.max(4, Math.round(5 * scale));
  const padding = Math.max(6, Math.round(8 * scale));
  const fontSize = Math.max(10, Math.min(13, Math.round(11 * scale)));
  const labelStyle: React.CSSProperties = {
    fontSize,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 2,
    fontWeight: 600,
  };
  const barTrackStyle: React.CSSProperties = {
    width: "100%",
    height: barH,
    background: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 6,
        minWidth: w,
        padding: `${padding}px ${padding + 4}px`,
        background: "rgba(0,0,0,0.85)",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div style={{ marginBottom: gap }}>
        <div style={labelStyle}>HP</div>
        <div style={barTrackStyle}>
          <div style={{ width: `${hp * 100}%`, height: "100%", background: "#c0392b", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ marginBottom: gap }}>
        <div style={labelStyle}>Corpo</div>
        <div style={barTrackStyle}>
          <div style={{ width: `${bodySP * 100}%`, height: "100%", background: "#f1c40f", borderRadius: 3 }} />
        </div>
      </div>
      <div>
        <div style={labelStyle}>Cabeça</div>
        <div style={barTrackStyle}>
          <div style={{ width: `${headSP * 100}%`, height: "100%", background: "#e67e22", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

export default function MapGrid() {
  const { mapGrid, setMapGrid, isHost, initiativeCombatants, setInitiativeCombatants, send, senderData } = useContext(MessageBusContext);

  const broadcastUpdate = (message: string) => {
    if (send && senderData) {
      send({
        content: { message },
        metadata: { sender: senderData, type: "message", code: 2, data: {} },
      } as LogData);
    }
  };
  const [rowsInput, setRowsInput] = useState(mapGrid?.rows ?? 4);
  const [colsInput, setColsInput] = useState(mapGrid?.cols ?? 4);
  const [paintMode, setPaintMode] = useState(false);
  const [coverHp, setCoverHp] = useState<number | null>(null);
  /** Dropdown: which cell (with combatant) is showing the menu */
  const [cellMenu, setCellMenu] = useState<{ r: number; c: number; combatantId: string } | null>(null);
  /** Dropdown: which cover cell is showing the menu */
  const [coverMenu, setCoverMenu] = useState<{ r: number; c: number } | null>(null);
  /** Modal for Dano / Dano à armadura amount (combatant) */
  const [damageModal, setDamageModal] = useState<{ type: "dano" | "armadura" | "armaduraHead"; combatantId: string; r: number; c: number } | null>(null);
  /** Modal for cover/wall damage */
  const [coverDamageModal, setCoverDamageModal] = useState<{ r: number; c: number } | null>(null);
  const [damageAmount, setDamageAmount] = useState<number>(1);
  /** Combatant cell being hovered (for floating bars) */
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  /** Mirar (line of sight): when true, first click = origin, second = target */
  const [mirarMode, setMirarMode] = useState(false);
  const [mirarFrom, setMirarFrom] = useState<{ r: number; c: number } | null>(null);
  /** Cell hovered while awaiting second click (to show Bresenham line preview) */
  const [mirarHoveredCell, setMirarHoveredCell] = useState<{ r: number; c: number } | null>(null);

  const handleCreateGrid = () => {
    const rows = Math.max(1, Math.min(24, Math.round(rowsInput)));
    const cols = Math.max(1, Math.min(24, Math.round(colsInput)));
    setRowsInput(rows);
    setColsInput(cols);
    const cells = buildEmptyGrid(rows, cols);
    setMapGrid({ rows, cols, cells, coverCells: {} });
  };

  const handleClearMap = () => {
    if (!mapGrid || !isHost) return;
    const cells = buildEmptyGrid(rows, cols);
    setMapGrid({ ...mapGrid, cells, coverCells: {} });
    broadcastUpdate("Mapa: grid limpo (iniciativa mantida)");
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

  const applyCoverDamage = (r: number, c: number, amount: number) => {
    if (!mapGrid || !isHost) return;
    const key = coverKey(r, c);
    const current = coverCells[key]?.health ?? 0;
    const newHealth = Math.max(0, current - amount);
    const next = { ...coverCells };
    if (newHealth <= 0) {
      delete next[key];
      broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) destruída`);
    } else {
      next[key] = { health: newHealth };
      broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) tomou ${amount} de dano (HP: ${newHealth})`);
    }
    setMapGrid({ ...mapGrid, coverCells: next });
    setCoverDamageModal(null);
    setDamageAmount(1);
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
    if (coverKey(toR, toC) in coverCells) return;
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
    const combatant = initiativeCombatants.find((x) => x.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    const nextCells = cells.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? null : val))
    );
    setMapGrid({ ...mapGrid, cells: nextCells });
    setInitiativeCombatants((prev) => prev.filter((x) => x.id !== combatantId));
    broadcastUpdate(`Mapa: ${name} removido do mapa e da iniciativa`);
    setCellMenu(null);
  };

  const applyDamage = (combatantId: string, amount: number) => {
    const combatant = initiativeCombatants.find((c) => c.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    setInitiativeCombatants((prev) =>
      prev.map((c) =>
        c.id === combatantId
          ? { ...c, currentHealth: Math.max(0, (c.currentHealth ?? 0) - amount) }
          : c
      )
    );
    broadcastUpdate(`${name} tomou ${amount} de dano`);
    setDamageModal(null);
    setDamageAmount(1);
  };

  const applyArmorDamage = (combatantId: string, amount: number) => {
    const combatant = initiativeCombatants.find((c) => c.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    setInitiativeCombatants((prev) =>
      prev.map((c) =>
        c.id === combatantId
          ? { ...c, stoppingPower: Math.max(0, (c.stoppingPower ?? 0) - amount) }
          : c
      )
    );
    broadcastUpdate(`${name}: SP reduzido em ${amount}`);
    setDamageModal(null);
    setDamageAmount(1);
  };

  const handleMirarClick = (r: number, c: number) => {
    if (!mirarMode) return;
    if (mirarFrom === null) {
      setMirarFrom({ r, c });
      message.info(`Origem: (${r + 1}, ${c + 1}). Clique na célula alvo.`);
      return;
    }
    const from = mirarFrom;
    if (from.r === r && from.c === c) {
      message.warning("Selecione outra célula como alvo.");
      return;
    }
    const distance = Math.floor(Math.sqrt((r - from.r) ** 2 + (c - from.c) ** 2));
    const los = hasLineOfSight(from.r, from.c, r, c, coverCells);
    if (los) {
      message.success(`Linha de visão livre. Distância: ${distance} (${from.r + 1},${from.c + 1}) → (${r + 1},${c + 1}).`);
    } else {
      message.error(`Sem linha de visão (cobertura no caminho). Distância: ${distance}.`);
    }
    setMirarFrom(null);
    setMirarMode(false);
    setMirarHoveredCell(null);
  };

  const applyArmorHeadDamage = (combatantId: string, amount: number) => {
    const combatant = initiativeCombatants.find((c) => c.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    setInitiativeCombatants((prev) =>
      prev.map((c) =>
        c.id === combatantId
          ? { ...c, stoppingPowerHead: Math.max(0, (c.stoppingPowerHead ?? c.stoppingPower ?? 0) - amount) }
          : c
      )
    );
    broadcastUpdate(`${name}: SP cabeça reduzido em ${amount}`);
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

  /** Cells on the Bresenham line from origin to hovered cell (for reddish tint preview) */
  const mirarLineCellSet = useMemo(() => {
    if (!mirarFrom || !mirarHoveredCell) return new Set<string>();
    const lineCells = getCellsOnLine(mirarFrom.r, mirarFrom.c, mirarHoveredCell.r, mirarHoveredCell.c);
    return new Set(lineCells.map(({ r, c }) => `${r},${c}`));
  }, [mirarFrom, mirarHoveredCell]);

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
            <Col>
              <Button onClick={handleClearMap}>
                Limpar mapa
              </Button>
            </Col>
            <Col style={{ marginLeft: 16 }}>
              <Switch checked={paintMode} onChange={setPaintMode} disabled={mirarMode} />
              <span style={{ marginLeft: 8 }}>Pintar</span>
            </Col>
            <Col>
              <Button
                type={mirarMode ? "primary" : "default"}
                onClick={() => {
                  setMirarMode((m) => !m);
                  setMirarFrom(null);
                  setMirarHoveredCell(null);
                  if (mirarMode) message.info("Mirar cancelado.");
                  else message.info("Clique na célula de origem, depois na célula alvo.");
                }}
              >
                Mirar
              </Button>
              {mirarMode && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
                  {mirarFrom ? `Alvo? (origem: ${mirarFrom.r + 1},${mirarFrom.c + 1})` : "Clique na origem"}
                </span>
              )}
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
              const combatant = combatantId ? initiativeCombatants.find((x) => x.id === combatantId) : null;
              const combatantName = combatant?.name ?? (combatantId ? combatantId.slice(-6) : null);
              const displayText = combatantName
                ? truncateName(combatantName, Math.max(6, Math.floor(cellSize / 7)))
                : null;
              const canDrop = isHost && !paintMode && !mirarMode && !isCover;
              const showCellMenu = isHost && !paintMode && !mirarMode && !!combatantId;
              const showCoverMenu = isHost && !paintMode && !mirarMode && isCover;
              const menuItems: MenuProps["items"] = showCellMenu
                ? [
                    { key: "deletar", label: "Deletar", onClick: () => clearCellCombatant(r, c, combatantId!) },
                    { key: "dano", label: "Dano", onClick: () => setDamageModal({ type: "dano", combatantId: combatantId!, r, c }) },
                    { key: "armadura", label: "Dano à armadura", onClick: () => setDamageModal({ type: "armadura", combatantId: combatantId!, r, c }) },
                    { key: "armaduraHead", label: "Dano à armadura (cabeça)", onClick: () => setDamageModal({ type: "armaduraHead", combatantId: combatantId!, r, c }) },
                  ]
                : [];
              const coverMenuItems: MenuProps["items"] = showCoverMenu
                ? [{ key: "dano", label: "Dano", onClick: () => { setCoverDamageModal({ r, c }); setCoverMenu(null); } }]
                : [];
              const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
              const isMirarOrigin = mirarFrom?.r === r && mirarFrom?.c === c;
              const isOnMirarLine = mirarFrom && mirarHoveredCell && mirarLineCellSet.has(coverKey(r, c));
              const cellContent = (
                <div
                  key={`${r}-${c}`}
                  role={isHost && (paintMode || mirarMode) ? "button" : undefined}
                  onClick={
                    isHost && paintMode
                      ? () => toggleCover(r, c)
                      : isHost && mirarMode
                        ? () => handleMirarClick(r, c)
                        : undefined
                  }
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
                  onMouseEnter={() => {
                    if (combatantId && combatant) setHoveredCell({ r, c });
                    if (mirarMode && mirarFrom) setMirarHoveredCell({ r, c });
                  }}
                  onMouseLeave={() => {
                    setHoveredCell(null);
                    if (mirarMode && mirarFrom) setMirarHoveredCell(null);
                  }}
                  style={{
                    position: "relative",
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isMirarOrigin
                      ? "#e6f7ff"
                      : isOnMirarLine
                        ? "rgba(220, 100, 100, 0.5)"
                        : isCover
                          ? "#8b7355"
                          : "#fff",
                    border:
                      isMirarOrigin
                        ? "2px solid #1890ff"
                        : isCover
                          ? "1px solid #5d4e3d"
                          : "1px solid #bfbfbf",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: combatantId ? "#1677ff" : isCover ? "#f0e6d8" : "#bfbfbf",
                    overflow: "visible",
                    padding: 2,
                    cursor:
                      isHost && paintMode
                        ? "crosshair"
                        : isHost && mirarMode
                          ? "crosshair"
                          : isHost && (combatantId || isCover)
                            ? "pointer"
                            : undefined,
                  }}
                  title={
                    mirarMode
                      ? mirarFrom === null
                        ? "Clique para definir origem"
                        : isMirarOrigin
                          ? "Origem selecionada — clique no alvo"
                          : "Clique para definir alvo"
                      : isCover
                        ? `Cobertura${coverHealth != null ? ` (HP: ${coverHealth})` : ""}`
                        : combatantId
                          ? (combatantName ? `Iniciativa: ${combatantName}` : combatantId)
                          : "Casa vazia — arraste da lista ou de outra casa"
                  }
                >
                  {combatantId && combatant ? (
                    <>
                      {isHovered && (
                        <CombatantHoverBars
                          currentHealth={combatant.currentHealth ?? 0}
                          maxHealth={combatant.maxHealth ?? 1}
                          stoppingPower={combatant.stoppingPower ?? 0}
                          stoppingPowerMax={combatant.stoppingPowerMax ?? 1}
                          stoppingPowerHead={combatant.stoppingPowerHead ?? combatant.stoppingPower ?? 0}
                          stoppingPowerHeadMax={combatant.stoppingPowerHeadMax ?? combatant.stoppingPowerMax ?? 1}
                          cellSize={cellSize}
                        />
                      )}
                      <span
                        style={{
                          fontSize: Math.max(8, Math.floor(cellSize / 6)),
                          fontWeight: 600,
                          textAlign: "center",
                          lineHeight: 1.1,
                          maxWidth: cellSize - 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {displayText ?? combatantName ?? ""}
                      </span>
                    </>
                  ) : (
                    displayText ?? (isCover && coverHealth != null ? `HP ${coverHealth}` : isCover ? "🛡" : "—")
                  )}
                </div>
              );
              if (showCellMenu) {
                return (
                  <Dropdown
                    key={`${r}-${c}`}
                    menu={{ items: menuItems, onClick: () => setCellMenu(null) }}
                    trigger={["click"]}
                    open={!!(cellMenu && cellMenu.r === r && cellMenu.c === c)}
                    onOpenChange={(open) => setCellMenu(open ? { r, c, combatantId: combatantId! } : null)}
                  >
                    {cellContent}
                  </Dropdown>
                );
              }
              if (showCoverMenu) {
                return (
                  <Dropdown
                    key={`${r}-${c}`}
                    menu={{ items: coverMenuItems, onClick: () => setCoverMenu(null) }}
                    trigger={["click"]}
                    open={!!(coverMenu && coverMenu.r === r && coverMenu.c === c)}
                    onOpenChange={(open) => setCoverMenu(open ? { r, c } : null)}
                  >
                    {cellContent}
                  </Dropdown>
                );
              }
              return cellContent;
            })
          )}
        </div>
          </Col>
        </Row>
      </Col>
      <Modal
        title={damageModal?.type === "dano" ? "Dano" : damageModal?.type === "armaduraHead" ? "Dano à armadura (cabeça)" : "Dano à armadura"}
        open={!!damageModal}
        onOk={() => {
          if (damageModal) {
            if (damageModal.type === "dano") applyDamage(damageModal.combatantId, damageAmount);
            else if (damageModal.type === "armadura") applyArmorDamage(damageModal.combatantId, damageAmount);
            else applyArmorHeadDamage(damageModal.combatantId, damageAmount);
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
      <Modal
        title="Dano na cobertura"
        open={!!coverDamageModal}
        onOk={() => {
          if (coverDamageModal) applyCoverDamage(coverDamageModal.r, coverDamageModal.c, damageAmount);
        }}
        onCancel={() => { setCoverDamageModal(null); setDamageAmount(1); }}
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
