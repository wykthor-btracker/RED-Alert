'use client';

import {
  ApiOutlined,
  ColumnHeightOutlined,
  DisconnectOutlined,
  EyeOutlined,
  FireOutlined,
  HeartOutlined,
  MessageOutlined,
  PushpinOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Col, Dropdown, Input, InputNumber, MenuProps, message, Modal, Row, Select, Switch, Tooltip } from "antd";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { InitiativeCombatant, LogData, MapGridState, MessageBusContext } from "../contexts/MessageBusContext";
import { resolveCharacterIcon } from "@/data/characterPresetIcons";

const DRAG_TYPE_INITIATIVE = "application/x-initiative-combatant";
const DRAG_TYPE_MAP_CELL = "application/x-map-cell";

/** Map scale: 1 cell = 2m (each cell is a 2×2m space). Used for distance display (Mirar) and AoE. */
export const CELL_SCALE_METERS = 2;

/** CPR grenade: 10m×10m (book: 5×5 squares at 2m). With 2m/cell, radius 2 cells → 5×5 cells = 10m. */
const GRENADE_RADIUS_CELLS = 2;

/** CPR shotgun: 3×3 square in front of shooter (3 cells deep, 3 cells wide). */
const SHOTGUN_RANGE_CELLS = 3;

/** 8 directions: E, SE, S, SW, W, NW, N, NE. Each is [dr, dc]. */
const SHOTGUN_DIRECTIONS: [number, number][] = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];

/** Single critical injury; category for Head vs Body matrix. */
export type CPRCriticalInjury = { id: string; name: string; description: string; icon: ReactNode; category: "head" | "body" };

/** Cyberpunk RED critical injuries from official table only. id used for combatant.criticalInjuries[]. */
export const CPR_CRITICAL_INJURIES: CPRCriticalInjury[] = [
  // Body (table order 2–12)
  { id: "arm-dismembered", name: "Desmembramento de Braço", description: "O Braço Desmembrado se foi. Você deixa cair qualquer item na mão desse braço desmembrado imediatamente. O Death Save Base é aumentada em 1.", icon: <ApiOutlined />, category: "body" },
  { id: "hand-dismembered", name: "Desmembramento de Mão", description: "A Mão Desmembrada se foi. Você deixa cair qualquer item na mão desmembrada imediatamente. O Death Save Base é aumentada em 1.", icon: <ScissorOutlined />, category: "body" },
  { id: "collapsed-lung", name: "Pulmão Colapsado", description: "-2 no MOVE (mínimo 1). O Death Save Base é aumentada em 1.", icon: <HeartOutlined />, category: "body" },
  { id: "broken-ribs", name: "Costelas Quebradas", description: "No final de cada turno, onde você se move mais do que 4m/yds a pé, você sofre novamente o dano bônus desta lesão crítica diretamente nos seus Pontos de Vida.", icon: <ThunderboltOutlined />, category: "body" },
  { id: "broken-arm", name: "Braço Quebrado", description: "O Braço Quebrado não pode ser usado. Você deixa cair quaisquer itens na mão desse braço imediatamente.", icon: <ApiOutlined />, category: "body" },
  { id: "lodged-object", name: "Objeto Alojado", description: "No final de cada turno, onde você se move mais do que 4m/yds a pé, você sofre novamente o dano bônus desta Lesão Crítica diretamente nos seus Pontos de Vida.", icon: <PushpinOutlined />, category: "body" },
  { id: "broken-leg", name: "Perna Quebrada", description: "-4 no MOVE (mínimo 1).", icon: <DisconnectOutlined />, category: "body" },
  { id: "torn-muscle", name: "Rompimento no Músculo", description: "-2 nos Ataques corpo a corpo.", icon: <FireOutlined />, category: "body" },
  { id: "spinal-injury", name: "Lesão Espinhal", description: "No próximo Turno, você não pode fazer uma Ação, mas ainda pode fazer uma Ação de Movimento. O Death Save Base é aumentada em 1.", icon: <ColumnHeightOutlined />, category: "body" },
  { id: "crushed-fingers", name: "Dedos Triturados/Esmagados", description: "-4 para todas as ações envolvendo esta mão.", icon: <ScissorOutlined />, category: "body" },
  { id: "leg-dismembered", name: "Perna Desmembrada", description: "A Perna Desmembrada se foi. -6 no MOVE (mínimo 1). Você não pode desviar de ataques. O Death Save Base é aumentada em 1.", icon: <DisconnectOutlined />, category: "body" },
  // Head (table order 2–6)
  { id: "lost-eye", name: "Olho Perdido", description: "O Olho Perdido se foi. -4 para Ataques a Distância e Testes de Percepção envolvendo visão. O Death Save Base é aumentada em 1.", icon: <EyeOutlined />, category: "head" },
  { id: "brain-injury", name: "Dano Cerebral", description: "-2 para todas as Ações. O Death Save Base é aumentada em 1.", icon: <WarningOutlined />, category: "head" },
  { id: "gouged-eye", name: "Olho danificado", description: "-2 para Ataques a Distância e Teste de Percepção envolvendo visão.", icon: <EyeOutlined />, category: "head" },
  { id: "concussion", name: "Contusão", description: "-2 para todas as Ações.", icon: <WarningOutlined />, category: "head" },
  { id: "broken-jaw", name: "Maxilar Quebrado", description: "-4 para todas as Ações envolvendo fala.", icon: <MessageOutlined />, category: "head" },
];

const CPR_HEAD_INJURIES = CPR_CRITICAL_INJURIES.filter((i) => i.category === "head");
const CPR_BODY_INJURIES = CPR_CRITICAL_INJURIES.filter((i) => i.category === "body");

/** Cells in a 3×3 square in front of (sr, sc). Cardinal: near edge centered on direction; diagonal: near corner is the cell one step along the diagonal. */
function getCellsInCone(
  sr: number,
  sc: number,
  directionIndex: number,
  _range: number,
  rows: number,
  cols: number
): { r: number; c: number }[] {
  const out: { r: number; c: number }[] = [];
  const [dr, dc] = SHOTGUN_DIRECTIONS[directionIndex % 8];
  const isDiagonal = directionIndex % 2 === 1;

  if (isDiagonal) {
    // 3×3 square with corner (sr+dr, sc+dc) closest to shooter; square extends along diagonal and perpendicular
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        const r = sr + dr * i;
        const c = sc + dc * j;
        if (r >= 0 && r < rows && c >= 0 && c < cols) out.push({ r, c });
      }
    }
    return out;
  }

  // Cardinal: 3 steps in direction, 3 cells wide perpendicular (edge of square toward shooter)
  const perpR = -dc;
  const perpC = dr;
  for (let step = 1; step <= 3; step++) {
    for (const offset of [-1, 0, 1]) {
      const r = sr + dr * step + perpR * offset;
      const c = sc + dc * step + perpC * offset;
      if (r >= 0 && r < rows && c >= 0 && c < cols) out.push({ r, c });
    }
  }
  return out;
}

/** 3×3 square cells that have line of sight from shooter; damage stops at first cover. */
function getShotgunAffectedCells(
  shooterR: number,
  shooterC: number,
  directionIndex: number,
  range: number,
  rows: number,
  cols: number,
  coverCells: Record<string, unknown>
): { r: number; c: number }[] {
  const square = getCellsInCone(shooterR, shooterC, directionIndex, range, rows, cols);
  return square.filter(({ r, c }) => hasLineOfSight(shooterR, shooterC, r, c, coverCells));
}

/** Direction index 0..7 from shooter to target cell (Bresenham line → octant). */
function getDirectionFromLine(shooterR: number, shooterC: number, targetR: number, targetC: number): number | null {
  const dr = targetR - shooterR;
  const dc = targetC - shooterC;
  if (dr === 0 && dc === 0) return null;
  let angle = Math.atan2(dr, dc);
  if (angle < 0) angle += 2 * Math.PI;
  return Math.round(angle / (Math.PI / 4)) % 8;
}

/** Cells in a square blast centered at (centerR, centerC) with given radius, clamped to grid [0,rows)x[0,cols). */
function getCellsInBlast(
  centerR: number,
  centerC: number,
  radiusCells: number,
  rows: number,
  cols: number
): { r: number; c: number }[] {
  const out: { r: number; c: number }[] = [];
  for (let r = centerR - radiusCells; r <= centerR + radiusCells; r++) {
    for (let c = centerC - radiusCells; c <= centerC + radiusCells; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) out.push({ r, c });
    }
  }
  return out;
}

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

/** Floating bars and critical-injury matrix shown when combatant cell (or this panel) is hovered. Panel is hoverable so the matrix stays visible. Rendered in a portal when cellEl is set so it is not clipped by ancestor overflow. */
function CombatantHoverBars(props: {
  cellEl: HTMLDivElement | null;
  cellR: number;
  cellC: number;
  onPanelEnter: () => void;
  onPanelLeave: () => void;
  combatantId: string;
  currentHealth: number;
  maxHealth: number;
  stoppingPower: number;
  stoppingPowerMax: number;
  stoppingPowerHead: number;
  stoppingPowerHeadMax: number;
  cellSize: number;
  criticalInjuries: string[];
  onToggleCriticalInjury: (injuryId: string) => void;
  isHost: boolean;
}) {
  const [position, setPosition] = useState<{ left: number; bottom: number } | null>(null);
  useEffect(() => {
    if (!props.cellEl) {
      setPosition(null);
      return;
    }
    const update = () => {
      const rect = props.cellEl!.getBoundingClientRect();
      setPosition({
        left: rect.left + rect.width / 2,
        bottom: window.innerHeight - rect.top,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [props.cellEl]);
  const maxH = Math.max(1, props.maxHealth);
  const maxSP = Math.max(1, props.stoppingPowerMax);
  const maxSPHead = Math.max(1, props.stoppingPowerHeadMax);
  const hp = Math.min(1, Math.max(0, props.currentHealth / maxH));
  const bodySP = Math.min(1, Math.max(0, props.stoppingPower / maxSP));
  const headSP = Math.min(1, Math.max(0, props.stoppingPowerHead / maxSPHead));
  const scale = Math.max(1, Math.min(3, props.cellSize / 24));
  const barH = Math.max(6, Math.round(8 * scale));
  const gap = Math.max(4, Math.round(5 * scale));
  const padding = Math.max(6, Math.round(8 * scale));
  const fontSize = Math.max(10, Math.min(13, Math.round(11 * scale)));
  const iconSize = Math.max(14, Math.min(20, Math.round(16 * scale)));
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
  const hasInjury = (id: string) => (props.criticalInjuries ?? []).includes(id);
  const barGroupHeight = fontSize + 2 + barH;
  const barsSectionHeight = 3 * barGroupHeight + 2 * gap;
  const barBaseWidth = Math.round(Math.max(80, Math.min(140, props.cellSize * 1.5)));
  const barSectionWidth = 2 * barBaseWidth;
  const iconRowHeight = iconSize + 8;
  const iconGap = 4;
  const iconMatrixRows = 2;
  const headCount = CPR_HEAD_INJURIES.length;
  const bodyCount = CPR_BODY_INJURIES.length;
  const headCols = Math.ceil(headCount / iconMatrixRows);
  const bodyCols = Math.ceil(bodyCount / iconMatrixRows);
  const headGridWidth = headCols * (iconSize + 8) + (headCols - 1) * iconGap;
  const bodyGridWidth = bodyCols * (iconSize + 8) + (bodyCols - 1) * iconGap;
  const iconGridHeight = iconMatrixRows * iconRowHeight + (iconMatrixRows - 1) * iconGap;
  const labelBlockHeight = fontSize + 4;
  const injuriesBlockGap = 8;
  const rightColWidth = Math.max(headGridWidth, bodyGridWidth);
  const rightSectionHeight = 2 * (labelBlockHeight + iconGridHeight) + injuriesBlockGap;
  const sectionHeight = Math.max(barsSectionHeight, rightSectionHeight);
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const panelContent = (
    <div
      role="presentation"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseEnter={props.onPanelEnter}
      onMouseLeave={props.onPanelLeave}
      style={{
        marginBottom: 4,
        width: "max-content",
        padding: `${padding}px ${padding + 4}px`,
        background: "rgba(0,0,0,0.85)",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        zIndex: 10001,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "row",
        gap: padding,
        alignItems: "stretch",
        boxSizing: "border-box",
        overflow: "visible",
        flexWrap: "nowrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: barSectionWidth, flexShrink: 0, minWidth: 0, minHeight: sectionHeight }}>
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
            <div style={{ width: `${headSP * 100}%`, height: "100%", background: "#f1c40f", borderRadius: 3 }} />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: sectionHeight,
          width: rightColWidth,
          minWidth: rightColWidth,
          flexShrink: 0,
          gap: injuriesBlockGap,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div style={{ ...labelStyle, marginBottom: 4 }}>Ferimentos críticos (cabeça)</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: iconGap,
              alignContent: "flex-start",
              height: iconGridHeight,
              width: headGridWidth,
            }}
          >
            {CPR_HEAD_INJURIES.map((inj) => {
              const active = hasInjury(inj.id);
              return (
                <Tooltip key={inj.id} title={`${inj.name}: ${inj.description}`} overlayStyle={{ zIndex: 10002 }}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (props.isHost) props.onToggleCriticalInjury(inj.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (props.isHost && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        props.onToggleCriticalInjury(inj.id);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: iconSize + 8,
                      height: iconSize + 8,
                      borderRadius: 4,
                      background: active ? "rgba(192, 57, 43, 0.7)" : "rgba(255,255,255,0.15)",
                      color: active ? "#fff" : "rgba(255,255,255,0.7)",
                      fontSize: iconSize,
                      cursor: props.isHost ? "pointer" : "default",
                    }}
                    aria-label={inj.name}
                  >
                    {inj.icon}
                  </span>
                </Tooltip>
              );
            })}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ ...labelStyle, marginBottom: 4 }}>Ferimentos críticos (corpo)</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: iconGap,
              alignContent: "flex-start",
              height: iconGridHeight,
              width: bodyGridWidth,
            }}
          >
            {CPR_BODY_INJURIES.map((inj) => {
              const active = hasInjury(inj.id);
              return (
                <Tooltip key={inj.id} title={`${inj.name}: ${inj.description}`} overlayStyle={{ zIndex: 10002 }}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (props.isHost) props.onToggleCriticalInjury(inj.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (props.isHost && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        props.onToggleCriticalInjury(inj.id);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: iconSize + 8,
                      height: iconSize + 8,
                      borderRadius: 4,
                      background: active ? "rgba(192, 57, 43, 0.7)" : "rgba(255,255,255,0.15)",
                      color: active ? "#fff" : "rgba(255,255,255,0.7)",
                      fontSize: iconSize,
                      cursor: props.isHost ? "pointer" : "default",
                    }}
                    aria-label={inj.name}
                  >
                    {inj.icon}
                  </span>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
  if (!position || typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        left: position.left,
        bottom: position.bottom,
        width: "max-content",
        transform: "translateX(-50%)",
        zIndex: 10000,
        pointerEvents: "none",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ pointerEvents: "auto", overflow: "visible" }}>{panelContent}</div>
    </div>,
    document.body
  );
}

export default function MapGrid() {
  const { mapGrid, setMapGrid, isHost, battles, mapBattleId, setMapBattleId, getBattleCombatants, setBattleCombatants, send, senderData, savedMaps, currentMapId, setCurrentMapId, createMap, renameMap, setMapBackgroundImage, setMapBackgroundPosition } = useContext(MessageBusContext);
  const mapBattle = currentMapId ? mapBattleId[currentMapId] ?? null : null;
  const initiativeCombatants = getBattleCombatants(mapBattle);

  const broadcastUpdate = (message: string) => {
    if (send && senderData) {
      send({
        content: { message },
        metadata: { sender: senderData, type: "message", code: 2, data: {} },
      } as LogData);
    }
  };
  const [rowsInput, setRowsInput] = useState(mapGrid?.rows ?? 16);
  const [colsInput, setColsInput] = useState(mapGrid?.cols ?? 16);
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
  /** When mouse is over the hover panel (panel is above cell, so we keep it visible) */
  const [hoveredPanelCell, setHoveredPanelCell] = useState<{ r: number; c: number } | null>(null);
  /** Map cell key `${r}-${c}` → DOM element (refs run on mount so we have elements for hovered cell) */
  const cellRefsMap = useRef<Record<string, HTMLDivElement>>({});
  /** DOM element of the hovered cell (synced from ref map so panel can position via portal) */
  const [hoveredCellEl, setHoveredCellEl] = useState<HTMLDivElement | null>(null);
  const hoveredRC = hoveredCell ?? hoveredPanelCell;
  useLayoutEffect(() => {
    if (!hoveredRC) {
      setHoveredCellEl(null);
      return;
    }
    const key = `${hoveredRC.r}-${hoveredRC.c}`;
    const syncEl = () => {
      const el = cellRefsMap.current[key] ?? null;
      setHoveredCellEl(el);
    };
    syncEl();
    if (!cellRefsMap.current[key]) {
      const id = requestAnimationFrame(() => {
        syncEl();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hoveredRC?.r, hoveredRC?.c]);
  /** Mirar (line of sight): when true, first click = origin, second = target */
  const [mirarMode, setMirarMode] = useState(false);
  const [mirarFrom, setMirarFrom] = useState<{ r: number; c: number } | null>(null);
  /** Cell hovered while awaiting second click (to show Bresenham line preview) */
  const [mirarHoveredCell, setMirarHoveredCell] = useState<{ r: number; c: number } | null>(null);
  /** Granada (CPR grenade): when true, click sets blast center; center set shows 10m template and allows Apply AoE damage */
  const [granadaMode, setGranadaMode] = useState(false);
  const [granadaCenter, setGranadaCenter] = useState<{ r: number; c: number } | null>(null);
  /** Modal: apply damage to all combatants (and optionally cover) in the current granada blast */
  const [granadaDamageModalOpen, setGranadaDamageModalOpen] = useState(false);
  const [granadaDamageAmount, setGranadaDamageAmount] = useState(6);
  const [granadaDamageCover, setGranadaDamageCover] = useState(true);

  /** Shotgun: shooter set from menu; direction from hover (Bresenham line); click cell to open damage modal. */
  const [shotgunShooter, setShotgunShooter] = useState<{ r: number; c: number } | null>(null);
  const [shotgunHoveredCell, setShotgunHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [shotgunDirection, setShotgunDirection] = useState<number | null>(null);
  const [shotgunModalOpen, setShotgunModalOpen] = useState(false);
  const [shotgunDamageAmount, setShotgunDamageAmount] = useState(4);
  const [shotgunDamageCover, setShotgunDamageCover] = useState(true);

  /** Rename map modal */
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState("");
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  /** Background position adjustment: when true, user can drag to reposition and confirm/cancel */
  const [positioningMode, setPositioningMode] = useState(false);
  const [editPositionX, setEditPositionX] = useState(50);
  const [editPositionY, setEditPositionY] = useState(50);
  const positionDragRef = useRef<{ lastClientX: number; lastClientY: number } | null>(null);
  const backgroundLayerRef = useRef<HTMLDivElement>(null);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  useEffect(() => {
    if (!isDraggingBackground) return;
    const onMove = (e: MouseEvent) => {
      const ref = positionDragRef.current;
      const el = backgroundLayerRef.current;
      if (!ref || !el) return;
      const rect = el.getBoundingClientRect();
      const dx = ((e.clientX - ref.lastClientX) / rect.width) * 100;
      const dy = ((e.clientY - ref.lastClientY) / rect.height) * 100;
      ref.lastClientX = e.clientX;
      ref.lastClientY = e.clientY;
      setEditPositionX((prev) => Math.min(100, Math.max(0, prev + dx)));
      setEditPositionY((prev) => Math.min(100, Math.max(0, prev + dy)));
    };
    const onUp = () => {
      positionDragRef.current = null;
      setIsDraggingBackground(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingBackground]);

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
  const hasBackgroundImage = !!mapGrid?.backgroundImage;

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
    if (mapBattle) setBattleCombatants(mapBattle, (prev) => prev.filter((x) => x.id !== combatantId));
    broadcastUpdate(`Mapa: ${name} removido do mapa e da iniciativa`);
    setCellMenu(null);
  };

  const applyDamage = (combatantId: string, amount: number) => {
    const combatant = initiativeCombatants.find((c) => c.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    if (mapBattle) setBattleCombatants(mapBattle, (prev) =>
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
    if (mapBattle) setBattleCombatants(mapBattle, (prev) =>
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

  const toggleCriticalInjury = (combatantId: string, injuryId: string) => {
    if (mapBattle) setBattleCombatants(mapBattle, (prev) =>
      prev.map((c) =>
        c.id === combatantId
          ? {
              ...c,
              criticalInjuries: (c.criticalInjuries ?? []).includes(injuryId)
                ? (c.criticalInjuries ?? []).filter((x) => x !== injuryId)
                : [...(c.criticalInjuries ?? []), injuryId],
            }
          : c
      )
    );
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
    const distanceCells = Math.floor(Math.sqrt((r - from.r) ** 2 + (c - from.c) ** 2));
    const distanceM = distanceCells * CELL_SCALE_METERS;
    const los = hasLineOfSight(from.r, from.c, r, c, coverCells);
    if (los) {
      message.success(`Linha de visão livre. Distância: ${distanceM}m (${from.r + 1},${from.c + 1}) → (${r + 1},${c + 1}).`);
    } else {
      message.error(`Sem linha de visão (cobertura no caminho). Distância: ${distanceM}m.`);
    }
    setMirarFrom(null);
    setMirarMode(false);
    setMirarHoveredCell(null);
  };

  const applyArmorHeadDamage = (combatantId: string, amount: number) => {
    const combatant = initiativeCombatants.find((c) => c.id === combatantId);
    const name = combatant?.name ?? combatantId.slice(-6);
    if (mapBattle) setBattleCombatants(mapBattle, (prev) =>
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

  /** Cells inside the current granada blast (10m = radius 5), for highlight */
  const granadaBlastCellSet = useMemo(() => {
    if (!granadaCenter || rows <= 0 || cols <= 0) return new Set<string>();
    const blastCells = getCellsInBlast(granadaCenter.r, granadaCenter.c, GRENADE_RADIUS_CELLS, rows, cols);
    return new Set(blastCells.map(({ r, c }) => coverKey(r, c)));
  }, [granadaCenter, rows, cols]);

  /** Effective direction: from modal when open, else from hover (Bresenham line shooter → hovered). */
  const effectiveShotgunDirection = useMemo((): number | null => {
    if (!shotgunShooter || rows <= 0 || cols <= 0) return null;
    if (shotgunModalOpen && shotgunDirection != null) return shotgunDirection;
    if (!shotgunHoveredCell || (shotgunHoveredCell.r === shotgunShooter.r && shotgunHoveredCell.c === shotgunShooter.c)) return null;
    return getDirectionFromLine(shotgunShooter.r, shotgunShooter.c, shotgunHoveredCell.r, shotgunHoveredCell.c);
  }, [shotgunShooter, shotgunHoveredCell, shotgunModalOpen, shotgunDirection, rows, cols]);

  const shotgunAffectedCellSet = useMemo(() => {
    if (!shotgunShooter || effectiveShotgunDirection == null || rows <= 0 || cols <= 0) return new Set<string>();
    const affected = getShotgunAffectedCells(shotgunShooter.r, shotgunShooter.c, effectiveShotgunDirection, SHOTGUN_RANGE_CELLS, rows, cols, coverCells);
    return new Set(affected.map(({ r, c }) => coverKey(r, c)));
  }, [shotgunShooter, effectiveShotgunDirection, rows, cols, coverCells]);

  const shotgunConePreviewCellSet = useMemo(() => {
    if (!shotgunShooter || effectiveShotgunDirection == null || rows <= 0 || cols <= 0) return new Set<string>();
    const cone = getCellsInCone(shotgunShooter.r, shotgunShooter.c, effectiveShotgunDirection, SHOTGUN_RANGE_CELLS, rows, cols);
    return new Set(cone.map(({ r, c }) => coverKey(r, c)));
  }, [shotgunShooter, effectiveShotgunDirection, rows, cols]);

  const handleGranadaCellClick = (r: number, c: number) => {
    if (!granadaMode || !isHost) return;
    setGranadaCenter({ r, c });
    message.info(`Centro da explosão: (${r + 1},${c + 1}). Use "Aplicar dano em área" para aplicar dano.`);
  };

  const applyGranadaAreaDamage = () => {
    if (!granadaCenter || !mapGrid || !isHost) return;
    const blastCells = getCellsInBlast(granadaCenter.r, granadaCenter.c, GRENADE_RADIUS_CELLS, rows, cols);
    const combatantIds = new Set<string>();
    for (const { r, c } of blastCells) {
      const id = cells[r]?.[c] ?? null;
      if (id) combatantIds.add(id);
    }
    const amount = granadaDamageAmount;
    for (const id of combatantIds) {
      applyDamage(id, amount);
    }
    if (granadaDamageCover) {
      let nextCover: Record<string, { health?: number }> = { ...coverCells };
      for (const { r, c } of blastCells) {
        const key = coverKey(r, c);
        const info = nextCover[key];
        if (info == null) continue;
        const current = info.health ?? 0;
        const newHealth = Math.max(0, current - amount);
        if (newHealth <= 0) {
          const { [key]: _, ...rest } = nextCover;
          nextCover = rest;
          broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) destruída`);
        } else {
          nextCover = { ...nextCover, [key]: { health: newHealth } };
          broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) tomou ${amount} de dano (HP: ${newHealth})`);
        }
      }
      setMapGrid({ ...mapGrid, coverCells: nextCover });
    }
    const n = combatantIds.size;
    broadcastUpdate(`Granada: ${amount} de dano em área${n > 0 ? ` (${n} alvo${n !== 1 ? "s" : ""})` : ""}${granadaDamageCover ? "; dano em cobertura aplicado" : ""}.`);
    setGranadaCenter(null);
    setGranadaMode(false);
    setGranadaDamageModalOpen(false);
    setGranadaDamageAmount(6);
    setGranadaDamageCover(true);
  };

  const applyShotgunDamage = () => {
    if (!shotgunShooter || shotgunDirection == null || !mapGrid || !isHost) return;
    const affected = getShotgunAffectedCells(shotgunShooter.r, shotgunShooter.c, shotgunDirection, SHOTGUN_RANGE_CELLS, rows, cols, coverCells);
    const combatantIds = new Set<string>();
    for (const { r, c } of affected) {
      const id = cells[r]?.[c] ?? null;
      if (id) combatantIds.add(id);
    }
    const amount = shotgunDamageAmount;
    for (const id of combatantIds) {
      applyDamage(id, amount);
    }
    if (shotgunDamageCover) {
      let nextCover: Record<string, { health?: number }> = { ...coverCells };
      for (const { r, c } of affected) {
        const key = coverKey(r, c);
        const info = nextCover[key];
        if (info == null) continue;
        const current = info.health ?? 0;
        const newHealth = Math.max(0, current - amount);
        if (newHealth <= 0) {
          const { [key]: _, ...rest } = nextCover;
          nextCover = rest;
          broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) destruída`);
        } else {
          nextCover = { ...nextCover, [key]: { health: newHealth } };
          broadcastUpdate(`Mapa: cobertura em (${r + 1},${c + 1}) tomou ${amount} de dano (HP: ${newHealth})`);
        }
      }
      setMapGrid({ ...mapGrid, coverCells: nextCover });
    }
    const n = combatantIds.size;
    broadcastUpdate(`Shotgun: ${amount} de dano em área 3×3 (6m)${n > 0 ? ` (${n} alvo${n !== 1 ? "s" : ""})` : ""}${shotgunDamageCover ? "; dano em cobertura aplicado" : ""}.`);
    setShotgunShooter(null);
    setShotgunDirection(null);
    setShotgunModalOpen(false);
    setShotgunDamageAmount(4);
    setShotgunDamageCover(true);
  };

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
                  onChange={(v) => setRowsInput(Number(v) ?? 16)}
                  style={{ width: 72, marginLeft: 8 }}
                />
              </Col>
              <Col>
                <span>Colunas:</span>
                <InputNumber
                  min={1}
                  max={24}
                  value={colsInput}
                  onChange={(v) => setColsInput(Number(v) ?? 16)}
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
              <Switch checked={paintMode} onChange={setPaintMode} disabled={mirarMode || granadaMode} />
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
                disabled={granadaMode}
              >
                Mirar
              </Button>
              {mirarMode && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
                  {mirarFrom ? `Alvo? (origem: ${mirarFrom.r + 1},${mirarFrom.c + 1})` : "Clique na origem"}
                </span>
              )}
            </Col>
            <Col>
              <Button
                type={granadaMode ? "primary" : "default"}
                onClick={() => {
                  setGranadaMode((g) => !g);
                  setGranadaCenter(null);
                  setGranadaDamageModalOpen(false);
                  if (granadaMode) message.info("Granada cancelado.");
                  else message.info("Clique na célula do impacto (centro da explosão 10m).");
                }}
                disabled={mirarMode || paintMode}
              >
                Granada
              </Button>
              {granadaMode && (
                <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
                  {granadaCenter ? `Centro: (${granadaCenter.r + 1},${granadaCenter.c + 1})` : "Clique no centro"}
                </span>
              )}
            </Col>
            {granadaMode && granadaCenter && (
              <Col>
                <Button
                  type="primary"
                  danger
                  onClick={() => setGranadaDamageModalOpen(true)}
                >
                  Aplicar dano em área
                </Button>
              </Col>
            )}
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
          {(initiativeCombatants.length > 0 || savedMaps.length > 0 || isHost) && (
            <Col flex="none">
              {initiativeCombatants.length > 0 && (
                <>
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
                </>
              )}
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, marginTop: initiativeCombatants.length > 0 ? 16 : 0 }}>Mapa</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Select
                  placeholder="Selecionar mapa"
                  value={currentMapId || undefined}
                  onChange={(id) => (id != null ? setCurrentMapId(id) : setCurrentMapId(null))}
                  disabled={!isHost}
                  style={{ minWidth: 160 }}
                  options={savedMaps.map((m) => ({ value: m.id, label: m.name }))}
                  allowClear
                />
                {isHost && currentMapId && (
                  <Select
                    placeholder="Batalha neste mapa"
                    value={mapBattle || undefined}
                    onChange={(battleId) => setMapBattleId(currentMapId, battleId ?? null)}
                    style={{ minWidth: 160 }}
                    allowClear
                    options={battles.map((b) => ({ value: b.id, label: `${b.name} (${b.combatants.length})` }))}
                  />
                )}
                {isHost && (
                  <>
                    <Button size="small" type="primary" onClick={() => createMap()}>
                      Novo mapa
                    </Button>
                    {currentMapId && (
                      <>
                        <Button
                          size="small"
                          onClick={() => {
                            const map = savedMaps.find((m) => m.id === currentMapId);
                            setRenameInputValue(map?.name ?? "");
                            setRenameModalOpen(true);
                          }}
                        >
                          Renomear mapa
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={backgroundImageInputRef}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file || !file.type.startsWith("image/")) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              setMapBackgroundImage(dataUrl);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <Button size="small" onClick={() => backgroundImageInputRef.current?.click()}>
                          Imagem de fundo
                        </Button>
                        {mapGrid?.backgroundImage && (
                          <>
                            {!positioningMode ? (
                              <Button size="small" onClick={() => { setEditPositionX(mapGrid?.backgroundPositionX ?? 50); setEditPositionY(mapGrid?.backgroundPositionY ?? 50); setPositioningMode(true); }}>
                                Ajustar posição
                              </Button>
                            ) : (
                              <>
                                <Button size="small" type="primary" onClick={() => { setMapBackgroundPosition(editPositionX, editPositionY); setPositioningMode(false); }}>
                                  Confirmar
                                </Button>
                                <Button size="small" onClick={() => setPositioningMode(false)}>
                                  Cancelar
                                </Button>
                              </>
                            )}
                            <Button size="small" danger onClick={() => { setMapBackgroundImage(null); setPositioningMode(false); }}>
                              Remover imagem
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              <Modal
                title="Renomear mapa"
                open={renameModalOpen}
                onOk={() => {
                  const trimmed = renameInputValue.trim();
                  if (currentMapId && trimmed) {
                    renameMap(currentMapId, trimmed);
                    setRenameModalOpen(false);
                  }
                }}
                onCancel={() => setRenameModalOpen(false)}
                okText="Guardar"
                cancelText="Cancelar"
              >
                <Input
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  placeholder="Nome do mapa"
                  onPressEnter={() => {
                    const trimmed = renameInputValue.trim();
                    if (currentMapId && trimmed) {
                      renameMap(currentMapId, trimmed);
                      setRenameModalOpen(false);
                    }
                  }}
                />
              </Modal>
            </Col>
          )}
          <Col flex="1" style={{ minWidth: 0 }}>
        {shotgunShooter && !shotgunModalOpen && (
          <div style={{ marginBottom: 8 }}>
            <Button size="small" onClick={() => { setShotgunShooter(null); setShotgunHoveredCell(null); }}>Cancelar shotgun</Button>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>Passe o mouse para apontar; clique numa célula para aplicar dano.</span>
          </div>
        )}
        <div style={{ position: "relative", display: "inline-block" }}>
          {mapGrid?.backgroundImage && (
            <div
              ref={backgroundLayerRef}
              role={positioningMode ? "button" : undefined}
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                right: 4,
                bottom: 4,
                borderRadius: 4,
                backgroundImage: `url(${mapGrid.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: positioningMode
                  ? `${editPositionX}% ${editPositionY}%`
                  : `${mapGrid.backgroundPositionX ?? 50}% ${mapGrid.backgroundPositionY ?? 50}%`,
                backgroundRepeat: "no-repeat",
                pointerEvents: positioningMode ? "auto" : "none",
                cursor: positioningMode ? "move" : undefined,
                zIndex: positioningMode ? 10 : 0,
                userSelect: positioningMode ? "none" : undefined,
              }}
              onMouseDown={
                positioningMode && isHost
                  ? (e) => {
                      e.preventDefault();
                      positionDragRef.current = { lastClientX: e.clientX, lastClientY: e.clientY };
                      setIsDraggingBackground(true);
                    }
                  : undefined
              }
            />
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              gap: 2,
              width: "fit-content",
              backgroundColor: mapGrid?.backgroundImage ? "rgba(217, 217, 217, 0.3)" : "#d9d9d9",
              padding: 4,
              borderRadius: 4,
              position: "relative",
            }}
            onMouseLeave={() => { if (shotgunShooter && !shotgunModalOpen) setShotgunHoveredCell(null); }}
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
              const isInGranadaBlast = granadaBlastCellSet.has(key);
              const isInShotgunCone = shotgunConePreviewCellSet.has(key);
              const isInShotgunAffected = shotgunAffectedCellSet.has(key);
              const canDrop = isHost && !paintMode && !mirarMode && !granadaMode && !isCover;
              const showCellMenu = isHost && !paintMode && !mirarMode && !granadaMode && !!combatantId;
              const showCoverMenu = isHost && !paintMode && !mirarMode && !granadaMode && isCover;
              const menuItems: MenuProps["items"] = showCellMenu
                ? [
                    { key: "deletar", label: "Deletar", onClick: () => clearCellCombatant(r, c, combatantId!) },
                    { key: "dano", label: "Dano", onClick: () => setDamageModal({ type: "dano", combatantId: combatantId!, r, c }) },
                    { key: "armadura", label: "Dano à armadura", onClick: () => setDamageModal({ type: "armadura", combatantId: combatantId!, r, c }) },
                    { key: "armaduraHead", label: "Dano à armadura (cabeça)", onClick: () => setDamageModal({ type: "armaduraHead", combatantId: combatantId!, r, c }) },
                    { key: "shotgun", label: "Shotgun", onClick: () => { setShotgunShooter({ r, c }); setShotgunHoveredCell(null); setShotgunDirection(null); setShotgunModalOpen(false); setCellMenu(null); } },
                  ]
                : [];
              const coverMenuItems: MenuProps["items"] = showCoverMenu
                ? [{ key: "dano", label: "Dano", onClick: () => { setCoverDamageModal({ r, c }); setCoverMenu(null); } }]
                : [];
              const isHovered = (hoveredCell?.r === r && hoveredCell?.c === c) || (hoveredPanelCell?.r === r && hoveredPanelCell?.c === c);
              const isMirarOrigin = mirarFrom?.r === r && mirarFrom?.c === c;
              const isOnMirarLine = mirarFrom && mirarHoveredCell && mirarLineCellSet.has(coverKey(r, c));
              const cellKey = `${r}-${c}`;
              const cellContent = (
                <div
                  key={cellKey}
                  ref={(el) => {
                    if (el) cellRefsMap.current[cellKey] = el;
                    else delete cellRefsMap.current[cellKey];
                  }}
                  role={isHost && (paintMode || mirarMode || granadaMode) ? "button" : undefined}
                  onClick={
                    isHost && paintMode
                      ? () => toggleCover(r, c)
                      : isHost && mirarMode
                        ? () => handleMirarClick(r, c)
                        : isHost && granadaMode
                          ? () => handleGranadaCellClick(r, c)
                          : isHost && shotgunShooter
                            ? () => {
                                if (shotgunShooter.r === r && shotgunShooter.c === c) {
                                  setShotgunShooter(null);
                                  setShotgunHoveredCell(null);
                                  return;
                                }
                                const dir = getDirectionFromLine(shotgunShooter.r, shotgunShooter.c, r, c);
                                if (dir != null) {
                                  setShotgunDirection(dir);
                                  setShotgunModalOpen(true);
                                }
                              }
                            : undefined
                  }
                  draggable={isHost && !paintMode && !granadaMode && !!combatantId}
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
                    if (shotgunShooter && !shotgunModalOpen) setShotgunHoveredCell({ r, c });
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
                        : isInGranadaBlast
                          ? "rgba(255, 100, 50, 0.45)"
                          : isInShotgunAffected
                            ? "rgba(255, 150, 50, 0.5)"
                            : isInShotgunCone
                              ? "rgba(255, 180, 80, 0.35)"
                              : isCover
                                ? "#1a1a1a"
                                : combatantId && combatant?.characterIcon
                                  ? "transparent"
                                  : combatantId && hasBackgroundImage
                                    ? "#fff"
                                    : hasBackgroundImage
                                      ? "transparent"
                                      : "#fff",
                    backgroundImage: combatant?.characterIcon
                      ? `url("${resolveCharacterIcon(combatant.characterIcon)}")`
                      : undefined,
                    backgroundSize: combatant?.characterIcon ? "cover" : undefined,
                    backgroundPosition: combatant?.characterIcon ? "center" : undefined,
                    border:
                      isMirarOrigin
                        ? "2px solid #1890ff"
                        : isInGranadaBlast
                          ? "1px solid #c0392b"
                          : isInShotgunAffected
                            ? "1px solid #d35400"
                            : isInShotgunCone
                              ? "1px solid #e67e22"
                              : isCover
                                ? "1px solid #333"
                                : "1px solid #bfbfbf",
                    borderRadius: combatantId && (hasBackgroundImage || combatant?.characterIcon) ? "50%" : 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: combatantId ? "#1677ff" : isCover ? "#e0e0e0" : "#bfbfbf",
                    overflow: "visible",
                    padding: 2,
                    cursor:
                      isHost && (paintMode || mirarMode || granadaMode)
                        ? "crosshair"
                        : isHost && (combatantId || isCover)
                          ? "pointer"
                          : undefined,
                  }}
                  title={
                    granadaMode
                      ? "Clique para definir centro da explosão (10m)"
                      : mirarMode
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
                  {combatant && (combatant.currentHealth ?? 0) <= 0 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(180, 0, 0, 0.6)",
                        borderRadius: hasBackgroundImage ? "50%" : 2,
                        pointerEvents: "none",
                      }}
                      aria-hidden
                    >
                      <svg
                        width={Math.max(20, Math.floor(cellSize * 0.65))}
                        height={Math.max(20, Math.floor(cellSize * 0.65))}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="10" rx="7" ry="8" />
                        <circle cx="9" cy="9" r="1.5" />
                        <circle cx="15" cy="9" r="1.5" />
                        <path d="M8 14c0 0 1.5 2 4 2s4-2 4-2" />
                      </svg>
                    </div>
                  )}
                  {combatantId && combatant ? (
                    <>
                      {combatant.characterIcon && (() => {
                        const resolved = resolveCharacterIcon(combatant.characterIcon);
                        if (!resolved) return null;
                        const safeUrl = resolved.replace(/\\/g, "\\\\").replace(/"/g, '\\22');
                        return (
                          <div
                            aria-hidden
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: "inherit",
                              backgroundImage: `url("${safeUrl}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              pointerEvents: "none",
                            }}
                          />
                        );
                      })()}
                      {isHovered && (
                        <CombatantHoverBars
                          cellEl={hoveredCellEl}
                          cellR={r}
                          cellC={c}
                          onPanelEnter={() => setHoveredPanelCell({ r, c })}
                          onPanelLeave={() => setHoveredPanelCell(null)}
                          combatantId={combatant.id}
                          currentHealth={combatant.currentHealth ?? 0}
                          maxHealth={combatant.maxHealth ?? 1}
                          stoppingPower={combatant.stoppingPower ?? 0}
                          stoppingPowerMax={combatant.stoppingPowerMax ?? 1}
                          stoppingPowerHead={combatant.stoppingPowerHead ?? combatant.stoppingPower ?? 0}
                          stoppingPowerHeadMax={combatant.stoppingPowerHeadMax ?? combatant.stoppingPowerMax ?? 1}
                          cellSize={cellSize}
                          criticalInjuries={combatant.criticalInjuries ?? []}
                          onToggleCriticalInjury={(injuryId) => toggleCriticalInjury(combatant.id, injuryId)}
                          isHost={!!isHost}
                        />
                      )}
                      {!combatant.characterIcon && (
                        <span
                          style={{
                            position: "relative",
                            zIndex: 1,
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
                      )}
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
      <Modal
        title="Granada — dano em área (10m)"
        open={granadaDamageModalOpen}
        onOk={applyGranadaAreaDamage}
        onCancel={() => { setGranadaDamageModalOpen(false); setGranadaDamageAmount(6); setGranadaDamageCover(true); }}
        okText="Aplicar dano"
        cancelText="Cancelar"
      >
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ marginRight: 8 }}>Dano (ex.: 6d6):</span>
            <InputNumber
              min={1}
              value={granadaDamageAmount}
              onChange={(v) => setGranadaDamageAmount(Number(v) ?? 6)}
            />
          </div>
          {granadaCenter && (() => {
            const blastCells = getCellsInBlast(granadaCenter.r, granadaCenter.c, GRENADE_RADIUS_CELLS, rows, cols);
            const ids = new Set<string>();
            for (const { r, c } of blastCells) {
              const id = cells[r]?.[c] ?? null;
              if (id) ids.add(id);
            }
            const names = [...ids].map((id) => initiativeCombatants.find((c) => c.id === id)?.name ?? id.slice(-6));
            return (
              <>
                <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
                  Alvos na área: {names.length ? names.join(", ") : "nenhum"}
                </div>
                <Checkbox
                  checked={granadaDamageCover}
                  onChange={(e) => setGranadaDamageCover(e.target.checked)}
                  style={{ marginTop: 8 }}
                >
                  Aplicar dano em cobertura na área
                </Checkbox>
              </>
            );
          })()}
        </div>
      </Modal>
      <Modal
        title="Shotgun — área 3×3 / 6m (cobertura bloqueia)"
        open={!!(shotgunModalOpen && shotgunShooter && shotgunDirection != null)}
        onOk={applyShotgunDamage}
        onCancel={() => { setShotgunModalOpen(false); setShotgunShooter(null); setShotgunDirection(null); }}
        okText="Aplicar dano"
        cancelText="Cancelar"
      >
        {shotgunShooter && shotgunDirection != null && (
          <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ marginRight: 8 }}>Dano:</span>
              <InputNumber
                min={1}
                value={shotgunDamageAmount}
                onChange={(v) => setShotgunDamageAmount(Number(v) ?? 4)}
              />
            </div>
            {(() => {
              const affected = getShotgunAffectedCells(shotgunShooter.r, shotgunShooter.c, shotgunDirection, SHOTGUN_RANGE_CELLS, rows, cols, coverCells);
              const ids = new Set<string>();
              for (const { r, c } of affected) {
                const id = cells[r]?.[c] ?? null;
                if (id) ids.add(id);
              }
              const names = [...ids].map((id) => initiativeCombatants.find((c) => c.id === id)?.name ?? id.slice(-6));
              return (
                <>
                  <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
                    Alvos na área 3×3 (com LOS): {names.length ? names.join(", ") : "nenhum"}
                  </div>
                  <Checkbox
                    checked={shotgunDamageCover}
                    onChange={(e) => setShotgunDamageCover(e.target.checked)}
                    style={{ marginTop: 8 }}
                  >
                    Aplicar dano em cobertura na área 3×3
                  </Checkbox>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </Row>
  );
}
