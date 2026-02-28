"use client";

import {
  Button,
  Card,
  Collapse,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Popover,
  Radio,
  Row,
  Col,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import { MessageBusContext } from "../contexts/MessageBusContext";
import { MentionText, type MentionEntity } from "../comps/MentionText";
import type {
  CharacterData as CharacterDataT,
  Contact,
  CustomHumanityLossEntry,
  CyberwareEntry,
  Group,
  HumanityRecoveryEntry,
  InventoryEntry,
  Note,
  SkillEntry,
  Stats,
} from "../types/character";
import {
  createDefaultCharacterData,
  DEFAULT_STAT_KEYS,
  getDerivedMaxHealth,
  slugify,
} from "../types/character";
import { referenceSkills, SKILL_CATEGORY_LABELS } from "@/data/reference/skills";
import type { SkillCategoryKey } from "@/app/types/reference";
import { referenceWeapons, MELEE_CATEGORY_LABELS, type ReferenceWeapon } from "@/data/reference/weapons";
import { referenceWearables } from "@/data/reference/wearables";
import {
  RANGE_BANDS,
  BASE_SHOT_DV,
  AUTOFIRE_DV,
  getAutofireRangeBands,
  WEAPON_TYPE_LABELS,
  type RangedWeaponTypeKey,
  type WeaponTypeKey,
} from "@/data/weaponRangeTables";
import type { ReferenceWearable, ReferenceCyberware } from "@/app/types/reference";
import { referenceConsumables } from "@/data/reference/consumables";
import { referenceCyberware, CYBERWARE_CATEGORY_LABELS } from "@/data/reference/cyberware";
import { PRESETS, resolveCharacterIcon } from "@/data/characterPresetIcons";

const { Title, Text } = Typography;

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Short stats line for list summary (e.g. "BODY 6, REF 5, INT 4"). */
function statsBreakdown(stats: Record<string, number>, keys: string[] = DEFAULT_STAT_KEYS): string {
  const parts = keys.filter((k) => stats[k] != null).map((k) => `${k} ${stats[k] ?? 0}`);
  return parts.length ? parts.join(", ") : "—";
}

/** EMP is derived from humanity (tens digit); other stats from sheet. */
function getEffectiveStat(data: CharacterDataT | null, key: string): number {
  if (!data) return 0;
  if (key === "EMP") return Math.floor((data.currentHumanity ?? 0) / 10);
  return data.stats?.[key] ?? 0;
}

/** Stats for display (EMP derived from humanity). */
function getStatsForDisplay(data: CharacterDataT | null): Record<string, number> {
  if (!data?.stats) return {};
  return { ...data.stats, EMP: Math.floor((data.currentHumanity ?? 0) / 10) };
}

export default function CharacterData() {
  const {
    userData,
    setUserData,
    exportUserData,
    importUserData,
    isHost,
    connected,
    savedCharacters,
    removeSavedCharacter,
    currentEditedOwnerName,
    setCurrentEditedOwnerName,
    receivedSheets,
    senderData,
    send,
  } = useContext(MessageBusContext);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [deleteSheetConfirmOpen, setDeleteSheetConfirmOpen] = useState(false);
  const [customHumanityLossModalOpen, setCustomHumanityLossModalOpen] = useState(false);
  const [humanidadeRecoveryModalOpen, setHumanidadeRecoveryModalOpen] = useState(false);
  const [recoveryType, setRecoveryType] = useState<"recuperacao-padrao" | "recuperacao-extrema" | "terapia-dependencia">("recuperacao-padrao");
  const [recoveryRolled, setRecoveryRolled] = useState<number | null>(null);
  const [mainCollapseOpen, setMainCollapseOpen] = useState<string[]>([]);
  const contactRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const noteRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const groupRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const scrollToCyberwareRef = useRef<((slug: string) => void) | null>(null);
  const [customHumanityLossForm] = Form.useForm<{ description: string; amount: number; type: "max" | "current" }>();

  const data = userData ?? null;
  const canEdit = isHost || connected;
  /** Only host or the client who owns this sheet can change the character icon. */
  const canEditIcon =
    isHost ||
    (currentEditedOwnerName == null && connected) ||
    (currentEditedOwnerName != null && currentEditedOwnerName === senderData?.name);

  const mentionEntities: MentionEntity[] = useMemo(() => {
    const out: MentionEntity[] = [];
    (data?.contacts ?? []).forEach((c) => out.push({ slug: c.slug, label: c.name, type: "contact" }));
    (data?.notes ?? []).forEach((n) => out.push({ slug: n.slug, label: n.title, type: "note" }));
    (data?.groups ?? []).forEach((g) => out.push({ slug: g.slug, label: g.name, type: "group" }));
    return out;
  }, [data?.contacts, data?.notes, data?.groups]);

  const handleMentionClick = useCallback((slug: string, type: "contact" | "note" | "group") => {
    const el =
      type === "contact"
        ? contactRefsMap.current[slug]
        : type === "note"
          ? noteRefsMap.current[slug]
          : groupRefsMap.current[slug];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const initializeData = useCallback(() => {
    setUserData(createDefaultCharacterData());
  }, [setUserData]);

  const updateData = useCallback(
    (updater: (prev: CharacterDataT) => CharacterDataT) => {
      if (!data) return;
      setUserData(updater(data));
    },
    [data, setUserData]
  );

  const setStats = useCallback(
    (stats: Stats) => updateData((d) => ({ ...d, stats })),
    [updateData]
  );

  const setStat = useCallback(
    (key: string, value: number) => {
      setStats({ ...(data?.stats ?? {}), [key]: value });
    },
    [data?.stats, setStats]
  );

  const setCredits = useCallback(
    (credits: number) => updateData((d) => ({ ...d, credits })),
    [updateData]
  );

  const setSheetName = useCallback(
    (sheetName: string) => updateData((d) => ({ ...d, sheetName: sheetName || undefined })),
    [updateData]
  );

  const setCharacterIcon = useCallback(
    (characterIcon: string | undefined) => updateData((d) => ({ ...d, characterIcon })),
    [updateData]
  );

  const setHealth = useCallback(
    (currentHealth?: number, maxHealth?: number) =>
      updateData((d) => ({ ...d, currentHealth, maxHealth })),
    [updateData]
  );
  const setHumanity = useCallback(
    (currentHumanity?: number, maxHumanity?: number) =>
      updateData((d) => ({ ...d, currentHumanity, maxHumanity })),
    [updateData]
  );
  const setReputation = useCallback(
    (reputation?: number) => updateData((d) => ({ ...d, reputation })),
    [updateData]
  );

  const setSkills = useCallback(
    (skills: CharacterDataT["skills"]) => updateData((d) => ({ ...d, skills })),
    [updateData]
  );

  const setSkillValue = useCallback(
    (skillKey: string, value: number) => {
      if (!data) return;
      const ref = referenceSkills.find((r) => r.id === skillKey);
      const entry = data.skills[skillKey];
      const nextEntry: SkillEntry = ref
        ? { skillId: ref.id, ...(entry ?? {}), value }
        : { ...(entry ?? { name: skillKey, baseStat: "INT" }), value };
      setSkills({ ...data.skills, [skillKey]: nextEntry });
    },
    [data, setSkills]
  );

  const handleExport = useCallback(() => {
    const json = exportUserData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "character-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [exportUserData]);

  const handleImportConfirm = useCallback(() => {
    importUserData(importText);
    setImportModalOpen(false);
    setImportText("");
  }, [importUserData, importText]);

  const openCharacter = useCallback(
    (entry: { ownerName: string; data: CharacterDataT }) => {
      // Set owner first so host's setUserData uses correct ownerKey when updating savedCharacters (avoids saving as MAESTRO/Host)
      setCurrentEditedOwnerName(entry.ownerName);
      setUserData(entry.data);
    },
    [setUserData, setCurrentEditedOwnerName]
  );

  const handleNewCharacter = useCallback(() => {
    setUserData(createDefaultCharacterData());
    setCurrentEditedOwnerName(senderData?.name ?? "Host");
  }, [setUserData, setCurrentEditedOwnerName, senderData?.name]);

  const handleBackToList = useCallback(() => {
    setUserData(null);
    setCurrentEditedOwnerName(null);
  }, [setUserData, setCurrentEditedOwnerName]);

  const CATEGORY_ORDER: SkillCategoryKey[] = [
    "conscientizacao",
    "corporal",
    "controle",
    "educacao",
    "luta",
    "performance",
    "longo-alcance",
    "social",
    "tecnica",
    "outros",
  ];

  // Always run same hooks (guard for null data so early returns don't change hook count)
  const allStatKeys = useMemo(() => {
    if (!data?.stats) return [...DEFAULT_STAT_KEYS];
    const set = new Set(DEFAULT_STAT_KEYS);
    Object.keys(data.stats).forEach((k) => set.add(k));
    return Array.from(set);
  }, [data?.stats]);

  const skillEntriesWithMeta = useMemo(() => {
    if (!data?.skills) return [];
    const arr: { key: string; name: string; baseStat: string; value: number; description: string; category: SkillCategoryKey }[] = [];
    referenceSkills.forEach((ref) => {
      const entry = data.skills[ref.id];
      const value = entry?.value ?? 0;
      arr.push({
        key: ref.id,
        name: ref.name,
        baseStat: ref.baseStat,
        value,
        description: ref.description,
        category: ref.category,
      });
    });
    Object.entries(data.skills).forEach(([key, entry]) => {
      if (referenceSkills.some((r) => r.id === key)) return;
      arr.push({
        key,
        name: entry.name ?? key,
        baseStat: entry.baseStat ?? "INT",
        value: entry.value,
        description: `Perícia personalizada. Usa ${entry.baseStat ?? "INT"}.`,
        category: "outros",
      });
    });
    return arr;
  }, [data?.skills]);

  const skillsByCategory = useMemo(() => {
    if (!data?.skills) return [];
    const byCat = new Map<SkillCategoryKey, (typeof skillEntriesWithMeta)[0][]>();
    CATEGORY_ORDER.forEach((c) => byCat.set(c, []));
    skillEntriesWithMeta.forEach((item) => {
      const list = byCat.get(item.category);
      if (list) list.push(item);
    });
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: byCat.get(category)!,
    })).filter((g) => g.items.length > 0);
  }, [skillEntriesWithMeta]);

  /** Skill id -> { bonus, sources: { slug, bonus }[] } from worn cyberware. */
  const skillBonusesFromCyberware = useMemo(() => {
    const map: Record<string, { bonus: number; sources: { slug: string; bonus: number }[] }> = {};
    for (const entry of data?.cyberware ?? []) {
      if (entry.worn === false) continue;
      const ref = entry.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) : null;
      if (!ref?.skillBonuses) continue;
      const slug = ref.slug ?? ref.id;
      for (const { skillId, bonus } of ref.skillBonuses) {
        if (!map[skillId]) map[skillId] = { bonus: 0, sources: [] };
        map[skillId].bonus += bonus;
        map[skillId].sources.push({ slug, bonus });
      }
    }
    return map;
  }, [data?.cyberware]);

  const handleCyberwareSlugClick = useCallback((slug: string) => {
    setMainCollapseOpen((prev) => (prev.includes("cyberware") ? prev : [...prev, "cyberware"]));
    setTimeout(() => scrollToCyberwareRef.current?.(slug), 400);
  }, []);

  // Host: first part of flow = list of saved characters
  const hostListBlock = isHost && (
    <Card size="small" title="Personagens guardados" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleNewCharacter}>
          Novo personagem
        </Button>
      </div>
      {savedCharacters.length === 0 ? (
        <Text type="secondary">Ainda não há personagens. Crie um ou peça aos jogadores para enviarem as fichas.</Text>
      ) : (
        <List
          size="small"
          dataSource={savedCharacters}
          renderItem={(entry) => (
            <List.Item
              actions={[
                <Button key="open" type="link" size="small" onClick={() => openCharacter(entry)}>
                  Abrir
                </Button>,
              ]}
            >
              <div>
                <Text strong>{entry.data.sheetName?.trim() || entry.ownerName}</Text>
                {(entry.data.sheetName?.trim() && entry.ownerName) ? (
                  <div style={{ fontSize: 12 }}>
                    <Text type="secondary">por {entry.ownerName}</Text>
                  </div>
                ) : null}
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {statsBreakdown(getStatsForDisplay(entry.data))}
                  </Text>
                </div>
                <div style={{ marginTop: 2, fontSize: 12 }}>
                  <Text type="secondary">
                    Vida: {entry.data.currentHealth ?? "—"} / {getDerivedMaxHealth(getEffectiveStat(entry.data, "BODY"), getEffectiveStat(entry.data, "WILL"))}
                    {" · "}
                    Humanidade: {entry.data.currentHumanity ?? "—"} / {entry.data.maxHumanity ?? "—"}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  // Client: show list of sheets host sent, or empty + Inicializar ficha
  if (!data && !isHost) {
    if (receivedSheets.length > 0) {
      return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              <UserOutlined /> Personagem
            </Title>
          </div>
          <Card title="Fichas enviadas pelo host">
            <List
              dataSource={receivedSheets}
              renderItem={(sheet) => (
                <List.Item
                  actions={[
                    <Button key="open" type="primary" onClick={() => setUserData(sheet)}>
                      Abrir
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={sheet.sheetName || "Sem nome"}
                    description={statsBreakdown(getStatsForDisplay(sheet))}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      );
    }
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Empty
          image={<UserOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />}
          description="Nenhum dado de personagem carregado."
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={initializeData}>
            Inicializar ficha
          </Button>
        </Empty>
      </div>
    );
  }

  // Host with no character selected: show list only + prompt
  if (isHost && !data) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <UserOutlined /> Personagem
          </Title>
        </div>
        {hostListBlock}
        <Empty
          image={<UserOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />}
          description="Selecione um personagem para editar ou crie um novo."
        />
      </div>
    );
  }

  // From here on we have data (host with open character or client with their sheet)

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <UserOutlined /> Personagem
          {isHost && currentEditedOwnerName && (
            <Text type="secondary" style={{ marginLeft: 8, fontWeight: "normal" }}>
              ({currentEditedOwnerName})
            </Text>
          )}
        </Title>
        <Space>
          {isHost && (
            <Button onClick={handleBackToList}>
              Voltar à lista
            </Button>
          )}
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Exportar
          </Button>
          {isHost && (
            <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
              Importar
            </Button>
          )}
        </Space>
      </div>

      {isHost && hostListBlock}

      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label="Nome da ficha">
          <Space.Compact style={{ width: "100%", maxWidth: 400 }}>
            <Input
              placeholder="Ex.: Nome do personagem ou apelido"
              value={data.sheetName ?? ""}
              onChange={(e) => setSheetName(e.target.value)}
              disabled={!canEdit}
              allowClear
              style={{ flex: 1 }}
            />
            {isHost && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteSheetConfirmOpen(true)}
                title="Apagar ficha"
              />
            )}
          </Space.Compact>
        </Form.Item>
        {isHost && (
          <Modal
            title="Apagar ficha?"
            open={deleteSheetConfirmOpen}
            onCancel={() => setDeleteSheetConfirmOpen(false)}
            onOk={() => {
              const ownerName = currentEditedOwnerName ?? senderData?.name ?? "Host";
              removeSavedCharacter(ownerName);
              setDeleteSheetConfirmOpen(false);
            }}
            okText="Apagar"
            okButtonProps={{ danger: true }}
            cancelText="Cancelar"
          >
            Tem a certeza que deseja apagar esta ficha? Esta ação não pode ser desfeita.
          </Modal>
        )}
        <Form.Item label="Ícone do personagem">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12 }}>
            {data.characterIcon && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundImage: `url(${resolveCharacterIcon(data.characterIcon)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "2px solid #d9d9d9",
                  }}
                  aria-hidden
                />
                <Text type="secondary" style={{ fontSize: 12 }}>Atual</Text>
              </div>
            )}
            {canEditIcon && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={iconFileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file?.type.startsWith("image/")) return;
                    const reader = new FileReader();
                    reader.onload = () => setCharacterIcon(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                <Button size="small" icon={<UploadOutlined />} onClick={() => iconFileInputRef.current?.click()}>
                  Carregar imagem
                </Button>
                <Button size="small" onClick={() => setCharacterIcon(undefined)} disabled={!data.characterIcon}>
                  Remover ícone
                </Button>
              </>
            )}
          </div>
          {canEditIcon && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Presets (estética cyberpunk)</Text>
              <Row gutter={[8, 8]}>
                {PRESETS.map((preset) => {
                  const resolved = resolveCharacterIcon(preset.id);
                  const isSelected = data.characterIcon === preset.id;
                  return (
                    <Col key={preset.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setCharacterIcon(preset.id)}
                        onKeyDown={(e) => e.key === "Enter" && setCharacterIcon(preset.id)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundImage: resolved ? `url(${resolved})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: isSelected ? "2px solid #1677ff" : "2px solid #d9d9d9",
                          cursor: "pointer",
                        }}
                        title={preset.name}
                        aria-label={preset.name}
                      />
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Form.Item>
      </Form>

      <Collapse
        activeKey={mainCollapseOpen}
        onChange={(keys) => setMainCollapseOpen(Array.isArray(keys) ? keys : [keys])}
        items={[
          {
            key: "stats",
            label: "Atributos e perícias",
            children: (
              <>
                <Title level={5}>Atributos</Title>
                <Form layout="inline" style={{ marginBottom: 16 }}>
                  {allStatKeys.map((key) => {
                    const isEmp = key === "EMP";
                    const value = getEffectiveStat(data, key);
                    return (
                      <Form.Item key={key} label={key} style={{ marginRight: 16 }} tooltip={isEmp ? "Calculado a partir da humanidade (humanidade ÷ 10)" : undefined}>
                        <InputNumber
                          min={0}
                          max={20}
                          value={value}
                          onChange={isEmp ? undefined : (v) => setStat(key, v ?? 0)}
                          disabled={!canEdit || isEmp}
                        />
                      </Form.Item>
                    );
                  })}
                </Form>
                <Title level={5}>Reputação</Title>
                <Space align="center" wrap style={{ marginBottom: 16 }}>
                  <Form.Item label="Nível de Reputação" style={{ marginBottom: 0 }}>
                    <InputNumber
                      value={data.reputation ?? 0}
                      onChange={(v) => setReputation(v ?? 0)}
                      disabled={!canEdit}
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                  <Tooltip title="Rolar 1d10 + COOL + Reputação (evento positivo). O resultado aparece no registo de atividade.">
                    <Button
                      type="default"
                      onClick={() => {
                        if (!data || !senderData) return;
                        const { sum: d10 } = rollDice(1, 10);
                        const cool = getEffectiveStat(data, "COOL");
                        const rep = data.reputation ?? 0;
                        const total = d10 + cool + rep;
                        const msg = `Carão (+): 1d10 (${d10}) + COOL (${cool}) + Reputação (${rep}) = ${total}`;
                        send({
                          content: { message: msg },
                          metadata: { sender: senderData, code: 2, type: "message", data: {} },
                        });
                      }}
                    >
                      + Carão
                    </Button>
                  </Tooltip>
                  <Tooltip title="Rolar 1d10 + COOL − Reputação (evento negativo/covardia). Se o seu Evento de Reputação for por covardia, o seu Nível de Reputação é tratado como um número negativo. O resultado aparece no registo de atividade.">
                    <Button
                      type="default"
                      onClick={() => {
                        if (!data || !senderData) return;
                        const { sum: d10 } = rollDice(1, 10);
                        const cool = getEffectiveStat(data, "COOL");
                        const rep = data.reputation ?? 0;
                        const total = d10 + cool - rep;
                        const msg = `Carão (−): 1d10 (${d10}) + COOL (${cool}) − Reputação (${rep}) = ${total}`;
                        send({
                          content: { message: msg },
                          metadata: { sender: senderData, code: 2, type: "message", data: {} },
                        });
                      }}
                    >
                      − Carão
                    </Button>
                  </Tooltip>
                </Space>
                <Title level={5}>Perícias</Title>
                <Collapse
                  size="small"
                  defaultActiveKey={[]}
                  style={{ marginTop: 8 }}
                  items={skillsByCategory.map(({ category, items }) => {
                    const mid = Math.ceil(items.length / 2);
                    const left = items.slice(0, mid);
                    const right = items.slice(mid);
                    const renderSkill = (item: (typeof items)[0]) => {
                      const statVal = getEffectiveStat(data, item.baseStat);
                      const bonusData = skillBonusesFromCyberware[item.key];
                      const bonus = bonusData?.bonus ?? 0;
                      const total = statVal + item.value + bonus;
                      const isTechnical = item.category === "tecnica";
                      const nameStyle = isTechnical
                        ? {
                            fontSize: 11,
                            maxWidth: 140,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }
                        : undefined;
                      const metaStyle = isTechnical ? { fontSize: 11 } : undefined;
                      const breakdownText =
                        bonus > 0
                          ? `${item.baseStat} ${statVal} + ${item.name} ${item.value} + ${bonus}(cyber) = ${total}`
                          : `${item.baseStat} ${statVal} + ${item.name} ${item.value} = ${total}`;
                      const totalWithHover = (
                        <Popover
                          trigger="hover"
                          mouseEnterDelay={0.2}
                          content={
                            <div style={{ maxWidth: 320 }}>
                              <div style={{ marginBottom: 6 }}>{breakdownText}</div>
                              {bonus > 0 && bonusData?.sources?.length ? (
                                <>
                                  <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Bônus de cyberware (clique para ir)</div>
                                  {bonusData.sources.map(({ slug, bonus: b }) => (
                                    <div key={slug}>
                                      <button
                                        type="button"
                                        onClick={() => handleCyberwareSlugClick(slug)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          padding: 0,
                                          cursor: "pointer",
                                          color: "#1677ff",
                                          textDecoration: "underline",
                                          font: "inherit",
                                        }}
                                      >
                                        @{slug}
                                      </button>
                                      {" "}
                                      (+{b})
                                    </div>
                                  ))}
                                </>
                              ) : null}
                            </div>
                          }
                        >
                          <span style={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                            <Text style={metaStyle}> = {total}</Text>
                          </span>
                        </Popover>
                      );
                      return (
                        <List.Item
                          key={item.key}
                          style={{ border: "none", padding: "4px 0" }}
                          actions={
                            canEdit
                              ? [
                                  <InputNumber
                                    key="val"
                                    min={0}
                                    max={20}
                                    size="small"
                                    style={{ width: 56 }}
                                    value={item.value}
                                    onChange={(v) => setSkillValue(item.key, v ?? 0)}
                                  />,
                                ]
                              : undefined
                          }
                        >
                          <Space size="small">
                            <Tooltip title={item.description}>
                              <InfoCircleOutlined style={{ color: "#999" }} />
                            </Tooltip>
                            <Text strong style={nameStyle}>{item.name}</Text>
                            <Text type="secondary" style={metaStyle}>
                              ({item.baseStat})
                            </Text>
                            {totalWithHover}
                          </Space>
                        </List.Item>
                      );
                    };
                    return {
                      key: category,
                      label: SKILL_CATEGORY_LABELS[category],
                      children: (
                        <Row gutter={[16, 0]}>
                          <Col xs={24} md={12}>
                            <List size="small" bordered={false} dataSource={left} renderItem={renderSkill} />
                          </Col>
                          <Col xs={24} md={12}>
                            <List size="small" bordered={false} dataSource={right} renderItem={renderSkill} />
                          </Col>
                        </Row>
                      ),
                    };
                  })}
                />
              </>
            ),
          },
          {
            key: "health",
            label: "Vida e humanidade",
            children: (
              <>
                <Space size="middle" wrap>
                  <Form.Item label="Vida atual">
                    <InputNumber
                      min={0}
                      max={getDerivedMaxHealth(getEffectiveStat(data, "BODY"), getEffectiveStat(data, "WILL"))}
                      value={data.currentHealth}
                      onChange={(v) => setHealth(v ?? undefined, data.maxHealth)}
                      disabled={!canEdit}
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                  <Form.Item label="Vida máx." tooltip="10 + (5 × média de BODY e WILL, arredondada para cima).">
                    <InputNumber
                      min={0}
                      value={getDerivedMaxHealth(getEffectiveStat(data, "BODY"), getEffectiveStat(data, "WILL"))}
                      disabled
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                  <Form.Item label="Humanidade atual">
                    <InputNumber
                      min={0}
                      value={data.currentHumanity}
                      onChange={(v) => setHumanity(v ?? undefined, data.maxHumanity)}
                      disabled={!canEdit}
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                  <Form.Item label="Humanidade máx.">
                    <InputNumber
                      min={0}
                      value={data.maxHumanity}
                      onChange={(v) => setHumanity(data.currentHumanity, v ?? undefined)}
                      disabled={!canEdit}
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                </Space>
                <HumanityRundown
                  data={data}
                  canEdit={canEdit}
                  updateData={updateData}
                  onAddCustomLoss={() => setCustomHumanityLossModalOpen(true)}
                />
                <div style={{ marginTop: 24 }}>
                  <Typography.Text strong>Recuperações de humanidade</Typography.Text>
                  <List
                    size="small"
                    dataSource={data?.humanityRecoveries ?? []}
                    locale={{
                      emptyText: (
                        <div style={{ textAlign: "center", padding: 12, color: "#999" }}>
                          Nenhuma recuperação registrada.
                        </div>
                      ),
                    }}
                    renderItem={(entry: HumanityRecoveryEntry) => {
                      const isExtrema = entry.type === "recuperacao-extrema";
                      const isTerapia = entry.type === "terapia-dependencia";
                      const label = isTerapia
                        ? "Terapia Dependência (libertação de vício)"
                        : isExtrema
                          ? `Recuperação Extrema: +${entry.amountRecovered} humanidade`
                          : `Recuperação Padrão: +${entry.amountRecovered} humanidade`;
                      const removeRecovery = () => {
                        updateData((d) => {
                          const list = (d.humanityRecoveries ?? []).filter((e) => e.id !== entry.id);
                          const subtract = entry.amountRecovered;
                          const newCurrent =
                            subtract > 0
                              ? Math.max(0, (d.currentHumanity ?? 0) - subtract)
                              : d.currentHumanity;
                          return {
                            ...d,
                            humanityRecoveries: list.length ? list : undefined,
                            currentHumanity: newCurrent,
                          };
                        });
                      };
                      return (
                        <List.Item
                          actions={
                            canEdit
                              ? [
                                  <Button
                                    key="remove"
                                    type="link"
                                    danger
                                    size="small"
                                    onClick={removeRecovery}
                                  >
                                    Remover
                                  </Button>,
                                ]
                              : undefined
                          }
                        >
                          {label}
                        </List.Item>
                      );
                    }}
                    style={{ marginTop: 4 }}
                  />
                  {canEdit && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRecoveryRolled(null);
                        setHumanidadeRecoveryModalOpen(true);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Registrar recuperação de humanidade
                    </Button>
                  )}
                </div>
              </>
            ),
          },
          {
            key: "credits",
            label: "Pixéis (eb)",
            children: (
              <Form.Item label="Pixéis">
                <InputNumber
                  min={0}
                  value={data.credits}
                  onChange={(v) => setCredits(v ?? 0)}
                  disabled={!canEdit}
                  style={{ width: 120 }}
                />
              </Form.Item>
            ),
          },
          {
            key: "inventory",
            label: "Inventário",
            children: (
              <InventorySection
                data={data}
                weapons={data.weapons}
                wearables={data.wearables}
                consumables={data.consumables}
                canEdit={canEdit}
                updateData={updateData}
              />
            ),
          },
          {
            key: "cyberware",
            label: "Cyberware",
            children: (
              <CyberwareSection
                cyberware={data.cyberware}
                currentHumanity={data.currentHumanity}
                canEdit={canEdit}
                updateData={updateData}
                scrollToCyberwareRef={scrollToCyberwareRef}
              />
            ),
          },
          {
            key: "info",
            label: "Informação (Contatos, Notas e Grupos)",
            children: (
              <InfoSection
                contacts={data.contacts}
                notes={data.notes}
                groups={data.groups ?? []}
                canEdit={canEdit}
                updateData={updateData}
                mentionEntities={mentionEntities}
                onMentionClick={handleMentionClick}
                contactRefsMap={contactRefsMap}
                noteRefsMap={noteRefsMap}
                groupRefsMap={groupRefsMap}
              />
            ),
          },
        ]}
      />

      <Modal
        title="Importar dados do personagem"
        open={importModalOpen}
        onOk={handleImportConfirm}
        onCancel={() => { setImportModalOpen(false); setImportText(""); }}
        okText="Importar"
      >
        <Input.TextArea
          rows={8}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Colar JSON exportado..."
        />
      </Modal>

      <Modal
        title="Registrar perda de humanidade"
        open={customHumanityLossModalOpen}
        onOk={() => {
          customHumanityLossForm.validateFields().then((vals) => {
            const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const entry: CustomHumanityLossEntry = {
              id,
              description: vals.description.trim() || "Perda custom",
              amount: vals.amount,
              type: vals.type,
            };
            updateData((d) => {
              const list = [...(d.customHumanityLoss ?? []), entry];
              const newMax = entry.type === "max" ? Math.max(0, (d.maxHumanity ?? 0) - entry.amount) : d.maxHumanity;
              const newCurrent = entry.type === "current" ? Math.max(0, (d.currentHumanity ?? 0) - entry.amount) : d.currentHumanity;
              return { ...d, customHumanityLoss: list, maxHumanity: newMax, currentHumanity: newCurrent };
            });
            customHumanityLossForm.resetFields();
            setCustomHumanityLossModalOpen(false);
          });
        }}
        onCancel={() => setCustomHumanityLossModalOpen(false)}
        okText="Registrar"
      >
        <Form form={customHumanityLossForm} layout="vertical" initialValues={{ type: "current", amount: 1 }}>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}>
            <Input placeholder="Ex.: Trauma em combate, Terapia" />
          </Form.Item>
          <Form.Item name="amount" label="Quantidade" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="type" label="Tipo">
            <Select options={[{ value: "max", label: "Reduz humanidade máx." }, { value: "current", label: "Reduz humanidade atual" }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Registrar recuperação de humanidade"
        open={humanidadeRecoveryModalOpen}
        onOk={() => {
          const isTerapia = recoveryType === "terapia-dependencia";
          const rolled = recoveryRolled ?? 0;
          if (!isTerapia && rolled <= 0) {
            message.warning("Rola os dados antes de registrar.");
            return;
          }
          const maxH = data?.maxHumanity ?? 0;
          const curH = data?.currentHumanity ?? 0;
          const actualRecovered = isTerapia ? 0 : Math.min(rolled, Math.max(0, maxH - curH));
          const id = `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const entry: HumanityRecoveryEntry = { id, type: recoveryType, amountRecovered: actualRecovered };
          updateData((d) => {
            const list = [...(d.humanityRecoveries ?? []), entry];
            const newCurrent = isTerapia ? d.currentHumanity : Math.min(d.maxHumanity ?? 999, (d.currentHumanity ?? 0) + actualRecovered);
            return { ...d, humanityRecoveries: list, currentHumanity: newCurrent };
          });
          setHumanidadeRecoveryModalOpen(false);
          setRecoveryRolled(null);
        }}
        onCancel={() => { setHumanidadeRecoveryModalOpen(false); setRecoveryRolled(null); }}
        okText="Registrar"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Typography.Text type="secondary">Método</Typography.Text>
          <Radio.Group
            value={recoveryType}
            onChange={(e) => {
                const v = e.target.value as typeof recoveryType;
                if (v) { setRecoveryType(v); setRecoveryRolled(null); }
              }}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
          >
            <Radio value="terapia-dependencia" style={{ marginLeft: 0, alignItems: "flex-start" }}>
              <div>
                <strong>Terapia Dependência</strong>
                <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                  1 semana de psicoterapia intensiva + fármacos anti‑adicção. 1.000eb (Muito Caro). Liberta um vício (DV15, materiais 500eb).
                </div>
              </div>
            </Radio>
            <Radio value="recuperacao-padrao" style={{ marginLeft: 0, alignItems: "flex-start" }}>
              <div>
                <strong>Recuperação Padrão</strong>
                <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                  2d6 humanidade. Psicoterapia intensiva (stresse/raiva, hipnose, reprogramação menor, dança terapêutica). 500eb (Caro), DV15.
                </div>
              </div>
            </Radio>
            <Radio value="recuperacao-extrema" style={{ marginLeft: 0, alignItems: "flex-start" }}>
              <div>
                <strong>Recuperação Extrema</strong>
                <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                  4d6 humanidade. Reprogramação cerebral extrema, fármacos de última geração. 1.000eb + 500eb materiais (Muito Caro), DV17.
                </div>
              </div>
            </Radio>
          </Radio.Group>
          {recoveryType !== "terapia-dependencia" && (
            <div>
              <Button
                type="primary"
                onClick={() => {
                  const { sum } = rollDice(recoveryType === "recuperacao-padrao" ? 2 : 4, 6);
                  setRecoveryRolled(sum);
                }}
              >
                Rolar {recoveryType === "recuperacao-padrao" ? "2d6" : "4d6"}
              </Button>
              {recoveryRolled != null && (
                <span style={{ marginLeft: 12 }}>
                  Resultado: <strong>{recoveryRolled}</strong>
                  {data && (data.maxHumanity ?? 0) - (data.currentHumanity ?? 0) < recoveryRolled && (
                    <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                      (máx. recuperável: {(data.maxHumanity ?? 0) - (data.currentHumanity ?? 0)})
                    </Typography.Text>
                  )}
                </span>
              )}
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
}

/** Parse "2d6" -> { count: 2, size: 6 }. Returns null if invalid. */
function parseDamageDice(dice: string): { count: number; size: number } | null {
  const m = dice.trim().match(/^(\d+)\s*d\s*(\d+)$/i);
  if (!m) return null;
  const count = parseInt(m[1], 10);
  const size = parseInt(m[2], 10);
  if (count < 1 || size < 1) return null;
  return { count, size };
}

/** Roll count dice of size; return values and sum. */
function rollDice(count: number, size: number): { rolls: number[]; sum: number } {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * size) + 1);
  }
  return { rolls, sum: rolls.reduce((a, b) => a + b, 0) };
}

type WeaponAttackMeta = {
  baseStatKey: string;
  baseStatValue: number;
  skillName: string;
  skillValue: number;
};

function resolveWeaponAttackMeta(
  refWeapon: ReferenceWeapon | undefined,
  data: CharacterDataT | null
): WeaponAttackMeta | undefined {
  if (!refWeapon || !data) return undefined;

  const name = refWeapon.skill ?? "";

  // Try to match directly by reference skill name
  let refSkill =
    referenceSkills.find((s) => s.name === name) ??
    // Fallbacks for slight naming differences / melee
    (name === "Arma Pesada"
      ? referenceSkills.find((s) => s.id === "armas-pesadas")
      : name === "Luta" || refWeapon.weaponType === "melee"
      ? referenceSkills.find((s) => s.id === "melee-weapon")
      : undefined);

  if (!refSkill) return undefined;

  const baseStatKey = refSkill.baseStat;
  const baseStatValue = getEffectiveStat(data, baseStatKey);
  const skillEntry = data.skills?.[refSkill.id];
  const skillValue = skillEntry?.value ?? 0;

  return {
    baseStatKey,
    baseStatValue,
    skillName: refSkill.name,
    skillValue,
  };
}

function WeaponUseModal({
  open,
  onCancel,
  weapon,
  refWeapon,
  attackMeta,
}: {
  open: boolean;
  onCancel: () => void;
  weapon: InventoryEntry;
  refWeapon: ReferenceWeapon | undefined;
  attackMeta?: WeaponAttackMeta;
}) {
  const { send, senderData } = useContext(MessageBusContext);
  const weaponType = refWeapon?.weaponType;
  const isMelee = weaponType === "melee";
  const isRanged = weaponType && !isMelee;
  const damageDice = refWeapon?.damageDice;
  const hasAutofire = !!refWeapon?.autofire;

  const rollAndSend = (label: string) => {
    if (!damageDice || !senderData) return;
    const parsed = parseDamageDice(damageDice);
    if (!parsed) return;
    const { rolls, sum } = rollDice(parsed.count, parsed.size);
    const detail = rolls.length === 1 ? `${rolls[0]}` : `${rolls.join(" + ")} = ${sum}`;
    const message = `${weapon.name} — ${label}: ${parsed.count}d${parsed.size} = ${detail}`;
    send({
      content: { message },
      metadata: { sender: senderData, code: 2, type: "message", data: {} },
    });
  };

  const meleeDetailsRow =
    refWeapon &&
    isMelee &&
    (refWeapon.skill || refWeapon.damageDice)
      ? [
          {
            key: "melee",
            tipo:
              refWeapon.meleeCategory && MELEE_CATEGORY_LABELS[refWeapon.meleeCategory]
                ? MELEE_CATEGORY_LABELS[refWeapon.meleeCategory]
                : "—",
            exemplo: refWeapon.name ?? "—",
            hands: refWeapon.hands ?? "—",
            damage: refWeapon.damageDice ?? "—",
            rof: refWeapon.rof ?? "—",
            concealable:
              refWeapon.concealable == null ? "—" : refWeapon.concealable ? "SIM" : "NÃO",
            cost:
              refWeapon.price != null
                ? `${refWeapon.price}eb${refWeapon.costTier ? ` (${refWeapon.costTier})` : ""}`
                : refWeapon.costTier ?? "—",
          },
        ]
      : null;
  const detailsRow =
    refWeapon &&
    !isMelee &&
    (refWeapon.skill || refWeapon.damageDice)
      ? [
          {
            key: "details",
            skill: refWeapon.skill ?? "—",
            damage: refWeapon.damageDice ?? "—",
            magazine: refWeapon.magazineSize ?? "N/A",
            rof: refWeapon.rof ?? "—",
            hands: refWeapon.hands ?? "—",
            concealable:
              refWeapon.concealable == null ? "—" : refWeapon.concealable ? "Sim" : "Não",
            cost:
              refWeapon.price != null
                ? `${refWeapon.price} eb${
                    refWeapon.costTier ? ` (${refWeapon.costTier})` : ""
                  }`
                : refWeapon.costTier ?? "—",
            special: refWeapon.special ?? "—",
          },
        ]
      : null;

  const baseShotDv = isRanged && weaponType in BASE_SHOT_DV ? BASE_SHOT_DV[weaponType as RangedWeaponTypeKey] : null;
  const autofireDv = hasAutofire && weaponType && weaponType in AUTOFIRE_DV ? AUTOFIRE_DV[weaponType] : null;

  const baseColumns = baseShotDv
    ? [
        { title: "Tipo de Arma", dataIndex: "band", key: "band" },
        ...RANGE_BANDS.map((b, i) => ({
          title: `${b} m/yds`,
          dataIndex: String(i),
          key: String(i),
          render: (val: number | null) => val ?? "—",
        })),
      ]
    : [];
  const baseTableData = baseShotDv
    ? [
        {
          key: "1",
          band: WEAPON_TYPE_LABELS[weaponType as WeaponTypeKey],
          ...Object.fromEntries(RANGE_BANDS.map((_, i) => [String(i), baseShotDv[i]])),
        },
      ]
    : [];

  const autofireBands = getAutofireRangeBands();
  const autofireColumns = autofireDv
    ? [
        { title: "Tipo de Arma", dataIndex: "band", key: "band" },
        ...autofireBands.map((b, i) => ({
          title: `${b} m/yds`,
          dataIndex: String(i),
          key: String(i),
          render: (val: number | null) => val ?? "—",
        })),
      ]
    : [];
  const autofireTableData = autofireDv
    ? [
        {
          key: "1",
          band: WEAPON_TYPE_LABELS[weaponType as WeaponTypeKey],
          ...Object.fromEntries(autofireBands.map((_, i) => [String(i), autofireDv[i]])),
        },
      ]
    : [];

  return (
    <Modal
      title={`Usar: ${weapon.name}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={Math.min(900, typeof window !== "undefined" ? window.innerWidth - 48 : 900)}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {meleeDetailsRow && (
          <Table
            size="small"
            pagination={false}
            bordered
            columns={[
              { title: "Tipo de Arma Branca", dataIndex: "tipo", key: "tipo" },
              { title: "Exemplo", dataIndex: "exemplo", key: "exemplo" },
              { title: "Mãos", dataIndex: "hands", key: "hands" },
              { title: "Dano", dataIndex: "damage", key: "damage" },
              { title: "CDT", dataIndex: "rof", key: "rof" },
              { title: "Pode ser Ocultado?", dataIndex: "concealable", key: "concealable" },
              { title: "Custo", dataIndex: "cost", key: "cost" },
            ]}
            dataSource={meleeDetailsRow}
          />
        )}
        {detailsRow && (
          <Table
            size="small"
            pagination={false}
            bordered
            columns={[
              { title: "Habilidade", dataIndex: "skill", key: "skill" },
              { title: "Dano", dataIndex: "damage", key: "damage" },
              { title: "Carregador", dataIndex: "magazine", key: "magazine" },
              { title: "CDT", dataIndex: "rof", key: "rof" },
              { title: "Mãos", dataIndex: "hands", key: "hands" },
              { title: "Ocultável?", dataIndex: "concealable", key: "concealable" },
              { title: "Custo", dataIndex: "cost", key: "cost" },
              { title: "Especiais", dataIndex: "special", key: "special" },
            ]}
            dataSource={detailsRow}
          />
        )}
        {isRanged && baseShotDv && (
          <>
            <Text strong>DVs de disparo baseados na distância</Text>
            <Table
              size="small"
              pagination={false}
              columns={baseColumns}
              dataSource={baseTableData}
              bordered
            />
          </>
        )}
        {hasAutofire && autofireDv && (
          <>
            <Text strong>DVs de disparo automático baseados na distância</Text>
            <Table
              size="small"
              pagination={false}
              columns={autofireColumns}
              dataSource={autofireTableData}
              bordered
            />
          </>
        )}
        {attackMeta && (
          <Text>
            Teste de ataque usando {attackMeta.baseStatKey} {attackMeta.baseStatValue} +
            {" "}
            {attackMeta.skillName} {attackMeta.skillValue}.
          </Text>
        )}
        {!attackMeta && isMelee && (
          <Text>
            Corpo a corpo. Use a habilidade indicada na ficha para o teste de ataque.
          </Text>
        )}
        <Space wrap>
          {attackMeta && (
            <Button onClick={() => {
              if (!senderData) return;
              const { rolls } = rollDice(1, 10);
              const rolled = rolls[0];
              const total = attackMeta.baseStatValue + attackMeta.skillValue + rolled;
              const message = `${weapon.name} — Ataque: ${attackMeta.baseStatKey} ${attackMeta.baseStatValue} + ${attackMeta.skillName} ${attackMeta.skillValue} + ${rolled}(d10) = ${total}`;
              send({
                content: { message },
                metadata: { sender: senderData, code: 2, type: "message", data: {} },
              });
            }}>
              Teste para Acertar
            </Button>
          )}
          {isRanged && damageDice && (
            <>
              <Button type="primary" onClick={() => rollAndSend("Disparo padrão")}>
                Disparo padrão
              </Button>
              <Button onClick={() => rollAndSend("Disparo mirado")}>Disparo mirado</Button>
              {hasAutofire && (
                <Button onClick={() => rollAndSend("Disparo automático")}>Disparo automático</Button>
              )}
            </>
          )}
          {isMelee && damageDice && (
            <Button type="primary" onClick={() => rollAndSend("Golpe")}>
              Golpe
            </Button>
          )}
          {!damageDice && (isRanged || isMelee) && (
            <Text type="secondary">Adicione a arma a partir da referência para rolar dano.</Text>
          )}
        </Space>
        {(isRanged || isMelee) && (
          <Card size="small" bordered style={{ marginTop: 8 }}>
            <Text style={{ whiteSpace: "pre-line" }}>
              {`Em um máximo de CDT 1 você pode mirar um único Ataque à Distância ou Corpo a Corpo por toda a sua ação com -8 em seu Teste para Mirar para qualquer uma dessas áreas especiais.
Se você acertar, você causa o dano do ataque normalmente e também o alvo recebe um efeito adicional baseado na área especial que você acertou.`}
            </Text>
            <Table
              size="small"
              style={{ marginTop: 8 }}
              pagination={false}
              bordered
              columns={[
                { title: "Mirando em...", dataIndex: "target", key: "target" },
                { title: "Efeito", dataIndex: "effect", key: "effect" },
              ]}
              dataSource={[
                {
                  key: "head",
                  target: "Cabeça",
                  effect: "Multiplique o dano que atravessa a armadura de cabeça do alvo por 2.",
                },
                {
                  key: "held",
                  target: "Item Segurado",
                  effect:
                    "Se um único ponto de dano passar pela armadura de seu alvo, ele deixa cair um item de sua escolha mantido em suas mãos. Ele cai no chão na frente deles.",
                },
                {
                  key: "leg",
                  target: "Perna",
                  effect:
                    "Se um único ponto de dano atravessa a armadura de seu alvo, seu alvo também sofre a lesão crítica de perna quebrada, se houver alguma perna restante que não esteja quebrada.",
                },
              ]}
            />
          </Card>
        )}
      </Space>
    </Modal>
  );
}

function InventorySection({
  data,
  weapons,
  wearables,
  consumables,
  canEdit,
  updateData,
}: {
  data: CharacterDataT;
  weapons: InventoryEntry[];
  wearables: InventoryEntry[];
  consumables: InventoryEntry[];
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
}) {
  const [addModal, setAddModal] = useState<"weapon" | "wearable" | "consumable" | null>(null);
  /** When adding wearable from Armadura or Capacete section, so custom items get equipmentKind and SP fields. */
  const [addSection, setAddSection] = useState<"armor" | "helm" | null>(null);
  /** Index of weapon being used (opens use-weapon modal). */
  const [useWeaponIndex, setUseWeaponIndex] = useState<number | null>(null);
  const [addForm] = Form.useForm();

  const addEntry = (kind: "weapons" | "wearables" | "consumables", entry: InventoryEntry) => {
    updateData((d) => ({
      ...d,
      [kind]: [...d[kind], { ...entry, quantity: entry.quantity || 1 }],
    }));
  };

  const removeEntry = (kind: "weapons" | "wearables" | "consumables", index: number) => {
    updateData((d) => ({
      ...d,
      [kind]: d[kind].filter((_, i) => i !== index),
    }));
  };

  const refs = {
    weapons: referenceWeapons,
    wearables: referenceWearables,
    consumables: referenceConsumables,
  };

  const handleAdd = (kind: "weapon" | "wearable" | "consumable", section?: "armor" | "helm") => {
    addForm.resetFields();
    setAddModal(kind);
    setAddSection(section ?? null);
  };

  const handleAddOk = () => {
    const k = addModal!;
    const key = (k + "s") as "weapons" | "wearables" | "consumables";
    addForm.validateFields().then((vals) => {
      // For wearables, ensure referenceId comes from the selected ref so armor vs helm is correct
      let referenceId = vals.referenceId;
      if (k === "wearable" && referenceId) {
        const ref = (refs.wearables as ReferenceWearable[]).find((r) => r.id === referenceId);
        if (ref) referenceId = ref.id;
      }
      const entry: InventoryEntry = {
        name: vals.name ?? vals.referenceId ?? "Item",
        quantity: vals.quantity ?? 1,
        referenceId,
        notes: vals.notes,
      };
      if (k === "wearable") {
        const ref = (refs.wearables as ReferenceWearable[]).find((r) => r.id === referenceId);
        entry.equipmentKind = ref?.equipmentKind ?? addSection ?? undefined;
        const maxBody = vals.spBodyMax != null ? Number(vals.spBodyMax) : undefined;
        const curBody = vals.spBodyCurrent != null ? Number(vals.spBodyCurrent) : maxBody;
        const maxHead = vals.spHeadMax != null ? Number(vals.spHeadMax) : undefined;
        const curHead = vals.spHeadCurrent != null ? Number(vals.spHeadCurrent) : maxHead;
        if (addSection === "armor" && (maxBody != null || curBody != null)) {
          const max = maxBody ?? curBody ?? 0;
          entry.stoppingPowerBody = max;
          entry.currentSPBody = curBody ?? max;
        }
        if (addSection === "helm" && (maxHead != null || curHead != null)) {
          const max = maxHead ?? curHead ?? 0;
          entry.stoppingPowerHead = max;
          entry.currentSPHead = curHead ?? max;
        }
      }
      addEntry(key, entry);
      setAddModal(null);
      setAddSection(null);
    });
  };

  const renderList = (
    title: string,
    kind: "weapons" | "wearables" | "consumables",
    items: InventoryEntry[]
  ) => (
    <Card size="small" title={title} style={{ marginBottom: 12 }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(item, idx) => (
          <List.Item
            actions={
              canEdit
                ? [<Button key="x" type="link" danger size="small" onClick={() => removeEntry(kind, idx)}>Remover</Button>]
                : undefined
            }
          >
            {item.name} × {item.quantity}
            {item.notes ? ` — ${item.notes}` : ""}
          </List.Item>
        )}
      />
      {canEdit && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAdd(kind.slice(0, -1) as "weapon" | "wearable" | "consumable")}>
          Adicionar
        </Button>
      )}
    </Card>
  );

  const refWearables = refs.wearables as ReferenceWearable[];
  const wearablesWithIndex = wearables.map((w, i) => ({ w, globalIdx: i }));
  const armorItems = wearablesWithIndex.filter(({ w }) => {
    const kind = w.equipmentKind ?? refWearables.find((r) => r.id === w.referenceId)?.equipmentKind;
    return kind === "armor";
  });
  const helmItems = wearablesWithIndex.filter(({ w }) => {
    const kind = w.equipmentKind ?? refWearables.find((r) => r.id === w.referenceId)?.equipmentKind;
    return kind === "helm";
  });
  const otherWearables = wearablesWithIndex.filter(({ w }) => {
    const kind = w.equipmentKind ?? refWearables.find((r) => r.id === w.referenceId)?.equipmentKind;
    return !kind;
  });

  const updateWearableAt = (globalIdx: number, updater: (prev: InventoryEntry) => InventoryEntry) => {
    updateData((d) => ({
      ...d,
      wearables: d.wearables.map((w, i) => (i === globalIdx ? updater(w) : w)),
    }));
  };

  const getWearableKind = (w: InventoryEntry) =>
    w.equipmentKind ?? refWearables.find((r) => r.id === w.referenceId)?.equipmentKind;

  const setEquipped = (globalIdx: number, kind: "armor" | "helm", checked: boolean) => {
    if (checked) {
      updateData((d) => ({
        ...d,
        wearables: d.wearables.map((w, i) => {
          const wKind = getWearableKind(w);
          if (i === globalIdx) return { ...w, equipped: true };
          if (wKind === kind) return { ...w, equipped: false };
          return w;
        }),
      }));
    } else {
      updateWearableAt(globalIdx, (prev) => ({ ...prev, equipped: false }));
    }
  };

  const renderArmorHelmList = (
    title: string,
    kind: "armor" | "helm",
    items: { w: InventoryEntry; globalIdx: number }[]
  ) => (
    <Card size="small" title={title} style={{ marginBottom: 12 }}>
      <List
        size="small"
        dataSource={items}
        renderItem={({ w, globalIdx }) => {
          const ref = refWearables.find((r) => r.id === w.referenceId) as ReferenceWearable | undefined;
          const defaultSP = kind === "armor" ? (ref?.stoppingPower ?? 0) : (ref?.stoppingPowerHead ?? ref?.stoppingPower ?? 0);
          const spMax = kind === "armor" ? (w.stoppingPowerBody ?? defaultSP) : (w.stoppingPowerHead ?? defaultSP);
          const spCurrent = kind === "armor" ? (w.currentSPBody ?? w.stoppingPowerBody ?? defaultSP) : (w.currentSPHead ?? w.stoppingPowerHead ?? defaultSP);
          return (
            <List.Item
              actions={
                canEdit
                  ? [<Button key="x" type="link" danger size="small" onClick={() => removeEntry("wearables", globalIdx)}>Remover</Button>]
                  : undefined
              }
            >
              <Space direction="vertical" size={0}>
                <span>{w.name} × {w.quantity}{w.notes ? ` — ${w.notes}` : ""}</span>
                {canEdit && (
                  <Space align="center" wrap>
                    <Switch
                      size="small"
                      checked={!!w.equipped}
                      onChange={(checked) => setEquipped(globalIdx, kind, checked)}
                    />
                    <span>Equipado</span>
                    <span style={{ marginLeft: 8 }}>SP atual</span>
                    <InputNumber
                      min={0}
                      size="small"
                      style={{ width: 56 }}
                      value={spCurrent}
                      onChange={(v) =>
                        updateWearableAt(globalIdx, (prev) =>
                          kind === "armor" ? { ...prev, currentSPBody: v ?? spMax } : { ...prev, currentSPHead: v ?? spMax }
                        )
                      }
                    />
                    <span>SP máx</span>
                    <InputNumber
                      min={0}
                      size="small"
                      style={{ width: 56 }}
                      value={spMax}
                      onChange={(v) => {
                        const maxVal = v ?? defaultSP;
                        updateWearableAt(globalIdx, (prev) =>
                          kind === "armor"
                            ? { ...prev, stoppingPowerBody: maxVal, currentSPBody: Math.min(prev.currentSPBody ?? prev.stoppingPowerBody ?? maxVal, maxVal) }
                            : { ...prev, stoppingPowerHead: maxVal, currentSPHead: Math.min(prev.currentSPHead ?? prev.stoppingPowerHead ?? maxVal, maxVal) }
                        );
                      }}
                    />
                  </Space>
                )}
              </Space>
            </List.Item>
          );
        }}
      />
      {canEdit && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAdd("wearable", kind)}>
          Adicionar
        </Button>
      )}
    </Card>
  );

  const weaponForModal = useWeaponIndex != null ? weapons[useWeaponIndex] ?? null : null;
  const refWeaponForModal = weaponForModal?.referenceId
    ? (referenceWeapons as ReferenceWeapon[]).find((r) => r.id === weaponForModal.referenceId)
    : undefined;
  const attackMetaForModal = useMemo(
    () => resolveWeaponAttackMeta(refWeaponForModal, data),
    [refWeaponForModal, data]
  );

  return (
    <>
      <Card size="small" title="Armas" style={{ marginBottom: 12 }}>
        <List
          size="small"
          dataSource={weapons}
          renderItem={(item, idx) => (
            <List.Item
              actions={
                canEdit
                  ? [
                      <Button key="use" type="link" size="small" onClick={() => setUseWeaponIndex(idx)}>
                        Usar
                      </Button>,
                      <Button key="x" type="link" danger size="small" onClick={() => removeEntry("weapons", idx)}>
                        Remover
                      </Button>,
                    ]
                  : undefined
              }
            >
              {item.name} × {item.quantity}
              {item.notes ? ` — ${item.notes}` : ""}
            </List.Item>
          )}
        />
        {canEdit && (
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAdd("weapon")}>
            Adicionar
          </Button>
        )}
      </Card>
      <WeaponUseModal
        open={useWeaponIndex !== null}
        onCancel={() => setUseWeaponIndex(null)}
        weapon={weaponForModal ?? { name: "", quantity: 1 }}
        refWeapon={refWeaponForModal}
        attackMeta={attackMetaForModal}
      />
      {renderArmorHelmList("Armadura (corpo)", "armor", armorItems)}
      {renderArmorHelmList("Capacete (cabeça)", "helm", helmItems)}
      <Card size="small" title="Outros vestuário" style={{ marginBottom: 12 }}>
        {otherWearables.length > 0 && (
          <List
            size="small"
            dataSource={otherWearables}
            renderItem={({ w, globalIdx }) => (
              <List.Item
                actions={
                  canEdit
                    ? [<Button key="x" type="link" danger size="small" onClick={() => removeEntry("wearables", globalIdx)}>Remover</Button>]
                    : undefined
                }
              >
                {w.name} × {w.quantity}{w.notes ? ` — ${w.notes}` : ""}
              </List.Item>
            )}
          />
        )}
        {canEdit && (
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleAdd("wearable")}>
            Adicionar
          </Button>
        )}
      </Card>
      {renderList("Consumíveis", "consumables", consumables)}
      <Modal
        title={`Adicionar ${addModal === "weapon" ? "arma" : addModal === "wearable" ? "vestuário" : "consumível"}`}
        open={addModal !== null}
        onOk={handleAddOk}
        onCancel={() => setAddModal(null)}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="referenceId" label="Da referência (opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Custom..."
              options={
                addModal
                  ? refs[addModal + "s" as "weapons" | "wearables" | "consumables"].map((r) => ({
                      value: r.id,
                      label: `${r.name} (${r.price} eb)`,
                    }))
                  : []
              }
              onChange={(v) => {
                if (!v || !addModal) return;
                const arr = refs[addModal + "s" as "weapons" | "wearables" | "consumables"];
                const ref = arr.find((r) => r.id === v);
                if (ref) {
                  addForm.setFieldValue("referenceId", ref.id);
                  addForm.setFieldValue("name", ref.name);
                }
              }}
            />
          </Form.Item>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input placeholder="Nome do item" />
          </Form.Item>
          <Form.Item name="quantity" label="Quantidade" initialValue={1}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          {addModal === "wearable" && addSection === "armor" && (
            <>
              <Form.Item name="spBodyMax" label="SP corpo (máx)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Máx" />
              </Form.Item>
              <Form.Item name="spBodyCurrent" label="SP corpo (atual)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Se vazio, usa máx" />
              </Form.Item>
            </>
          )}
          {addModal === "wearable" && addSection === "helm" && (
            <>
              <Form.Item name="spHeadMax" label="SP cabeça (máx)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Máx" />
              </Form.Item>
              <Form.Item name="spHeadCurrent" label="SP cabeça (atual)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Se vazio, usa máx" />
              </Form.Item>
            </>
          )}
          <Form.Item name="notes" label="Notas">
            <Input placeholder="Notas" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const CYBERWARE_CATEGORY_ORDER = [
  "Fashionware",
  "Neuralware",
  "Cyberópticos",
  "Cyberaudio",
  "Cyberware Interno",
  "Cyberware Externo",
  "Cybermembros",
  "Borgware",
];

/** Ref ids already on the character (from referenceId). */
function getInstalledRefIds(cyberware: CyberwareEntry[]): Set<string> {
  const set = new Set<string>();
  cyberware.forEach((e) => {
    if (e.referenceId) set.add(e.referenceId);
  });
  return set;
}

/** Missing prerequisite ref ids for this ref (not yet installed). */
function getMissingPrereqs(
  ref: ReferenceCyberware | null,
  installedIds: Set<string>,
): string[] {
  if (!ref?.requires?.length) return [];
  return ref.requires.filter((id) => !installedIds.has(id));
}

/**
 * Returns refs to install in dependency order (prerequisites first), including the target.
 * Only includes refs not already installed. Handles transitive requires.
 */
function getInstallOrder(
  refList: ReferenceCyberware[],
  targetId: string,
  installedIds: Set<string>,
): ReferenceCyberware[] {
  const refMap = new Map(refList.map((r) => [r.id, r]));

  // Collect full set of ref ids to add (target + transitive missing prereqs)
  const toAddIds = new Set<string>();
  function collect(id: string) {
    if (toAddIds.has(id)) return;
    const ref = refMap.get(id);
    if (!ref) return;
    toAddIds.add(id);
    (ref.requires ?? []).forEach(collect);
  }
  collect(targetId);

  // Keep only those not already installed
  const missing = [...toAddIds].filter((id) => !installedIds.has(id));
  if (missing.length === 0) return [];

  const remaining = new Set(missing);
  const ordered: string[] = [];
  while (remaining.size > 0) {
    let found = false;
    for (const id of remaining) {
      const ref = refMap.get(id);
      const reqs = ref?.requires ?? [];
      const allSatisfied = reqs.every(
        (r) => installedIds.has(r) || ordered.includes(r),
      );
      if (allSatisfied) {
        ordered.push(id);
        remaining.delete(id);
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  return ordered.map((id) => refMap.get(id)!).filter(Boolean);
}

const LOW_HUMANITY_WARNING =
  "Cuidado! Você vai se sentir mais máquina do que carne desse jeito...";

/** Max humanity reduction per installed cyberware: 2 normally, 4 for borgware. Zero if humanity cost is 0. */
function getMaxHumanityReductionForRef(
  ref: ReferenceCyberware | null,
  entry?: CyberwareEntry
): number {
  const cost = ref?.humanityCost ?? entry?.humanityCost ?? 0;
  if (cost === 0) return 0;
  return ref && (ref.borgware === true || ref.category === "Borgware") ? 4 : 2;
}

function HumanityRundown({
  data,
  canEdit,
  updateData,
  onAddCustomLoss,
}: {
  data: CharacterDataT | null;
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
  onAddCustomLoss: () => void;
}) {
  const cyberwareItems = useMemo(() => {
    if (!data?.cyberware?.length) return [];
    return data.cyberware
      .map((entry, index) => {
        const ref = entry.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) ?? null : null;
        const reduction = getMaxHumanityReductionForRef(ref, entry);
        return reduction > 0 ? { key: `cyber-${index}`, label: `${entry.name}: -${reduction} máx.`, source: "cyberware" as const, entry: undefined as CustomHumanityLossEntry | undefined } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
  }, [data?.cyberware]);
  const customItems = useMemo(() => (data?.customHumanityLoss ?? []), [data?.customHumanityLoss]);
  const removeCustomLoss = (entry: CustomHumanityLossEntry) => {
    updateData((d) => {
      const list = (d.customHumanityLoss ?? []).filter((e) => e.id !== entry.id);
      const addBackMax = entry.type === "max" ? entry.amount : 0;
      const addBackCurrent = entry.type === "current" ? entry.amount : 0;
      return {
        ...d,
        customHumanityLoss: list.length ? list : undefined,
        maxHumanity: addBackMax > 0 ? (d.maxHumanity ?? 0) + addBackMax : d.maxHumanity,
        currentHumanity: addBackCurrent > 0 ? Math.min(d.maxHumanity ?? 999, (d.currentHumanity ?? 0) + addBackCurrent) : d.currentHumanity,
      };
    });
  };
  if (cyberwareItems.length === 0 && customItems.length === 0 && !canEdit) return null;
  const rundownDataSource = [...cyberwareItems, ...customItems.map((e) => ({ key: e.id, label: `${e.description}: -${e.amount} ${e.type === "max" ? "máx." : "atual"}`, source: "custom" as const, entry: e as CustomHumanityLossEntry }))];
  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Text strong>Reduções de humanidade</Typography.Text>
      <List
        size="small"
        dataSource={rundownDataSource}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: 16, color: "#999" }}>
              <HeartOutlined style={{ fontSize: 40, display: "block", marginBottom: 8 }} />
              Nenhuma redução registada (cyberware com custo ou perdas customizadas).
            </div>
          ),
        }}
        renderItem={({ key, label, source, entry }) => (
          <List.Item
            key={key}
            actions={
              source === "custom" && canEdit && entry
                ? [
                    <Button key="del" type="link" danger size="small" onClick={() => removeCustomLoss(entry)}>
                      Remover
                    </Button>,
                  ]
                : undefined
            }
          >
            {label}
          </List.Item>
        )}
        style={{ marginTop: 4 }}
      />
      {canEdit && (
        <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={onAddCustomLoss} style={{ marginTop: 8 }}>
          Registrar perda de humanidade
        </Button>
      )}
    </div>
  );
}

function CyberwareSection({
  cyberware,
  currentHumanity,
  canEdit,
  updateData,
  scrollToCyberwareRef,
}: {
  cyberware: CyberwareEntry[];
  currentHumanity?: number;
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
  scrollToCyberwareRef: React.MutableRefObject<((slug: string) => void) | null>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [cyberwareCategoryOpen, setCyberwareCategoryOpen] = useState<string[]>([]);
  const [installAllConfirmOpen, setInstallAllConfirmOpen] = useState(false);
  const [installList, setInstallList] = useState<ReferenceCyberware[]>([]);
  /** Rolled total CH for install-all (when user clicks Rolar); null = use reference sum. */
  const [installAllRolledHumanityTotal, setInstallAllRolledHumanityTotal] = useState<number | null>(null);

  const installedIds = useMemo(() => getInstalledRefIds(cyberware), [cyberware]);
  const refId = Form.useWatch("referenceId", form);
  const formHumanityCost = Form.useWatch("humanityCost", form);
  const selectedRef = refId
    ? referenceCyberware.find((r) => r.id === refId) ?? null
    : null;

  const singleAddHumanityCost =
    (formHumanityCost ?? selectedRef?.humanityCost ?? 0) || 0;
  const installAllTotalHumanityCost = useMemo(
    () => installList.reduce((s, r) => s + (r.humanityCost ?? 0), 0),
    [installList]
  );
  const effectiveInstallAllHumanityCost = installAllRolledHumanityTotal ?? installAllTotalHumanityCost;

  /** True if user already pressed "Reduzir humanidade" in the current single-add flow (so we don't apply again on Confirm). */
  const [singleAddHasReduced, setSingleAddHasReduced] = useState(false);
  /** True if user already pressed "Reduzir humanidade" on the install-all screen (so we don't apply again on Confirm). */
  const [installAllHasReduced, setInstallAllHasReduced] = useState(false);

  const reduceHumanity = (cost: number) => {
    if (cost <= 0) return;
    updateData((d) => ({
      ...d,
      currentHumanity: Math.max(0, (d.currentHumanity ?? 0) - cost),
    }));
    message.success(`Humanidade reduzida em ${cost}.`);
  };

  const singleAddWouldReduceBelow20 =
    singleAddHumanityCost > 0 && ((currentHumanity ?? 0) - singleAddHumanityCost < 20);
  const installAllWouldReduceBelow20 =
    effectiveInstallAllHumanityCost > 0 &&
    (currentHumanity ?? 0) - effectiveInstallAllHumanityCost < 20;

  /** Reference cyberware grouped by category for the add modal. */
  const refByCategory = useMemo(() => {
    const map = new Map<string, ReferenceCyberware[]>();
    referenceCyberware.forEach((r) => {
      const cat = r.category ?? "Outros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(r);
    });
    const order = [
      ...CYBERWARE_CATEGORY_ORDER.filter((c) => map.has(c)),
      ...Array.from(map.keys()).filter((c) => !CYBERWARE_CATEGORY_ORDER.includes(c)),
    ];
    return order.map((category) => ({
      category,
      label: CYBERWARE_CATEGORY_LABELS[category] ?? category,
      items: map.get(category)!,
    }));
  }, []);

  const missingPrereqs = useMemo(
    () => getMissingPrereqs(selectedRef, installedIds),
    [selectedRef, installedIds],
  );

  const add = (entry: CyberwareEntry) => {
    const ref = entry.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) ?? null : null;
    const reduction = getMaxHumanityReductionForRef(ref, entry);
    updateData((d) => ({
      ...d,
      cyberware: [...d.cyberware, entry],
      maxHumanity: Math.max(0, (d.maxHumanity ?? 0) - reduction),
    }));
  };

  const remove = (index: number) => {
    const entry = cyberware[index];
    const ref = entry?.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) ?? null : null;
    const reduction = getMaxHumanityReductionForRef(ref, entry);
    updateData((d) => ({
      ...d,
      cyberware: d.cyberware.filter((_, i) => i !== index),
      maxHumanity: (d.maxHumanity ?? 0) + reduction,
    }));
  };

  const toggleWorn = (index: number) => {
    updateData((d) => ({
      ...d,
      cyberware: d.cyberware.map((e, i) => (i === index ? { ...e, worn: e.worn === false ? true : false } : e)),
    }));
  };

  scrollToCyberwareRef.current = (slug: string) => {
    const ref = referenceCyberware.find((r) => (r.slug ?? r.id) === slug || r.id === slug);
    const category = ref?.category;
    if (category) {
      setCyberwareCategoryOpen((prev) => (prev.includes(category) ? prev : [...prev, category]));
    }
    setTimeout(() => {
      const el = document.querySelector(`[data-cyberware-slug="${slug}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const byCategory = useMemo(() => {
    const map = new Map<string, { entry: CyberwareEntry; index: number }[]>();
    cyberware.forEach((entry, index) => {
      const ref = entry.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) : null;
      const cat = ref?.category ?? "Outros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ entry, index });
    });
    return map;
  }, [cyberware]);

  /** For each refId, names of installed cyberware that have it in their requires (this ref is prerequisite of those). */
  const prerequisiteOfNames = useMemo(() => {
    const result = new Map<string, string[]>();
    cyberware.forEach((e) => {
      const ref = e.referenceId ? referenceCyberware.find((r) => r.id === e.referenceId) : null;
      ref?.requires?.forEach((reqId) => {
        if (!result.has(reqId)) result.set(reqId, []);
        const name = ref?.name ?? e.name ?? e.referenceId ?? "";
        if (name && !result.get(reqId)!.includes(name)) result.get(reqId)!.push(name);
      });
    });
    return result;
  }, [cyberware, referenceCyberware]);

  const handleOk = () => {
    form.validateFields().then((vals) => {
      const ref = vals.referenceId ? referenceCyberware.find((r) => r.id === vals.referenceId) : null;
      const missing = ref ? getMissingPrereqs(ref, installedIds) : [];
      if (missing.length > 0) {
        const names = missing
          .map((id) => referenceCyberware.find((r) => r.id === id)?.name ?? id)
          .join(", ");
        message.warning(
          `Pré-requisitos em falta: ${names}. Adicione-os primeiro ou use "Instalar tudo".`,
        );
        return;
      }
      const cost = (vals.humanityCost ?? ref?.humanityCost ?? 0) || 0;
      if (cost > 0 && !singleAddHasReduced) {
        updateData((d) => ({
          ...d,
          currentHumanity: Math.max(0, (d.currentHumanity ?? 0) - cost),
        }));
        message.info(`Humanidade reduzida em ${cost} (aplicado ao confirmar).`);
      }
      add({
        name: vals.name ?? ref?.name ?? "Cyberware",
        referenceId: vals.referenceId,
        notes: vals.notes,
        humanityCost: vals.humanityCost ?? ref?.humanityCost,
        worn: true,
      });
      form.resetFields();
      setModalOpen(false);
    });
  };

  const openInstallAllConfirm = () => {
    if (!selectedRef) return;
    const order = getInstallOrder(referenceCyberware, selectedRef.id, installedIds);
    setInstallList(order);
    setInstallAllHasReduced(false);
    setInstallAllConfirmOpen(true);
  };

  const closeInstallAllConfirm = () => {
    setInstallAllConfirmOpen(false);
    setInstallList([]);
    setInstallAllRolledHumanityTotal(null);
    setInstallAllHasReduced(false);
  };

  const confirmInstallAll = () => {
    const newEntries: CyberwareEntry[] = installList.map((r) => ({
      name: r.name,
      referenceId: r.id,
      notes: undefined,
      humanityCost: r.humanityCost,
      worn: true,
    }));
    const totalMaxReduction = installList.reduce((s, r) => s + getMaxHumanityReductionForRef(r, undefined), 0);
    if (effectiveInstallAllHumanityCost > 0 && !installAllHasReduced) {
      message.info(`Humanidade reduzida em ${effectiveInstallAllHumanityCost} (aplicado ao confirmar).`);
    }
    updateData((d) => ({
      ...d,
      cyberware: [...d.cyberware, ...newEntries],
      maxHumanity: Math.max(0, (d.maxHumanity ?? 0) - totalMaxReduction),
      currentHumanity:
        effectiveInstallAllHumanityCost > 0 && !installAllHasReduced
          ? Math.max(0, (d.currentHumanity ?? 0) - effectiveInstallAllHumanityCost)
          : d.currentHumanity,
    }));
    form.resetFields();
    setModalOpen(false);
    closeInstallAllConfirm();
  };

  return (
    <>
      <Collapse
        size="small"
        activeKey={cyberwareCategoryOpen}
        onChange={(keys) => setCyberwareCategoryOpen(Array.isArray(keys) ? keys : [keys])}
        items={[
          ...CYBERWARE_CATEGORY_ORDER.filter((cat) => byCategory.has(cat)),
          ...Array.from(byCategory.keys()).filter((cat) => !CYBERWARE_CATEGORY_ORDER.includes(cat)),
        ].map((category) => ({
          key: category,
          label: CYBERWARE_CATEGORY_LABELS[category] ?? category,
          children: (
            <List
              size="small"
              dataSource={byCategory.get(category)!}
              renderItem={({ entry, index }) => {
                const ref = entry.referenceId ? referenceCyberware.find((r) => r.id === entry.referenceId) : null;
                const slug = ref?.slug ?? ref?.id ?? `custom-${index}`;
                const worn = entry.worn !== false;
                return (
                  <List.Item
                    key={index}
                    data-cyberware-slug={slug}
                    actions={
                      canEdit
                        ? (() => {
                            const dependents = (entry.referenceId && prerequisiteOfNames.get(entry.referenceId)) ?? [];
                            const canRemove = dependents.length === 0;
                            const removeBtn = (
                              <Button
                                key="x"
                                type="link"
                                danger
                                size="small"
                                disabled={!canRemove}
                                onClick={() => remove(index)}
                              >
                                Remover
                              </Button>
                            );
                            return [
                              <Tooltip key="worn" title={worn ? "Instalado (bônus ativos)" : "Não instalado"}>
                                <Switch size="small" checked={worn} onChange={() => toggleWorn(index)} />
                              </Tooltip>,
                              canRemove ? (
                                removeBtn
                              ) : (
                                <Tooltip key="x" title={`Pré-requisito de: ${dependents.join(", ")}`}>
                                  <span style={{ display: "inline-block" }}>{removeBtn}</span>
                                </Tooltip>
                              ),
                            ];
                          })()
                        : undefined
                    }
                  >
                    <Tooltip
                      title={ref?.description ?? entry.notes ?? "Sem descrição"}
                    >
                      <span style={{ cursor: "help" }}>
                        {entry.name}
                        {entry.notes ? ` — ${entry.notes}` : ""}
                      </span>
                    </Tooltip>
                  </List.Item>
                );
              }}
            />
          ),
        }))}
      />
      {byCategory.size === 0 && (
        <Empty
          image={<ThunderboltOutlined style={{ fontSize: 56, color: "#bfbfbf" }} />}
          description="Nenhum cyberware. Adicione para ver por categoria."
          style={{ marginBottom: 8 }}
        />
      )}
      {canEdit && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalOpen(true);
            setSingleAddHasReduced(false);
            setInstallAllHasReduced(false);
          }}
        >
          Adicionar cyberware
        </Button>
      )}
      <Modal
        title={installAllConfirmOpen ? "Instalar tudo — confirmação" : "Adicionar cyberware"}
        open={modalOpen}
        onCancel={() => {
          if (installAllConfirmOpen) closeInstallAllConfirm();
          else {
            setSingleAddHasReduced(false);
            setModalOpen(false);
          }
        }}
        width={560}
        footer={
          <Space>
            {installAllConfirmOpen ? (
              <>
                <Button onClick={closeInstallAllConfirm}>Voltar</Button>
                {effectiveInstallAllHumanityCost > 0 && (
                  <Button
                    onClick={() => {
                      setInstallAllHasReduced(true);
                      reduceHumanity(effectiveInstallAllHumanityCost);
                    }}
                  >
                    Reduzir humanidade
                  </Button>
                )}
                <Button type="primary" onClick={confirmInstallAll}>
                  Confirmar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
                {singleAddHumanityCost > 0 && (
                  <Button
                    onClick={() => {
                      setSingleAddHasReduced(true);
                      reduceHumanity(singleAddHumanityCost);
                    }}
                    disabled={missingPrereqs.length > 0}
                  >
                    Reduzir humanidade
                  </Button>
                )}
                {missingPrereqs.length > 0 && selectedRef ? (
                  <Button type="primary" onClick={openInstallAllConfirm}>
                    Instalar tudo
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleOk}>
                    Adicionar
                  </Button>
                )}
              </>
            )}
          </Space>
        }
      >
        {installAllConfirmOpen ? (
          <>
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Serão instalados os seguintes itens (pré-requisitos primeiro):
            </Text>
            <List
              size="small"
              dataSource={installList}
              renderItem={(r) => (
                <List.Item>
                  <div>
                    <strong>{r.name}</strong> — {r.price} eb
                    {r.humanityCost != null && r.humanityCost > 0 && (
                      <>, {r.humanityCost} CH</>
                    )}
                    {r.description && (
                      <div style={{ marginTop: 4, color: "var(--color-text-secondary)" }}>
                        {r.description}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
            <div style={{ marginTop: 12 }}>
              <strong>Total:</strong>{" "}
              {installList.reduce((s, r) => s + r.price, 0)} eb
              {effectiveInstallAllHumanityCost > 0 ? `, ${effectiveInstallAllHumanityCost} CH` : ""}
              {installList.some((r) => r.humanityCostDice) && (
                <Button
                  type="default"
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    let total = 0;
                    installList.forEach((r) => {
                      if (r.humanityCostDice) {
                        const parsed = parseDamageDice(r.humanityCostDice);
                        if (parsed) {
                          const { sum } = rollDice(parsed.count, parsed.size);
                          total += sum;
                        } else {
                          total += r.humanityCost ?? 0;
                        }
                      } else {
                        total += r.humanityCost ?? 0;
                      }
                    });
                    setInstallAllRolledHumanityTotal(total);
                    message.success(`${total} CH total — use "Reduzir humanidade" para descontar.`);
                  }}
                >
                  Rolar
                </Button>
              )}
            </div>
            {installAllWouldReduceBelow20 && (
              <Text type="danger" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                {LOW_HUMANITY_WARNING}
              </Text>
            )}
          </>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item name="referenceId" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item label="Escolher da referência" style={{ marginBottom: 12 }}>
              <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid var(--color-border)", borderRadius: 6, padding: 8 }}>
                {refByCategory.map(({ category, label, items }) => (
                  <div key={category} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--color-text-secondary)" }}>{label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {items.map((r) => {
                        const selected = refId === r.id;
                        const tooltipTitle = r.description ?? r.name;
                        return (
                          <Tooltip key={r.id} title={tooltipTitle} placement="left">
                            <button
                              type="button"
                              onClick={() => form.setFieldsValue({ referenceId: r.id, name: r.name, humanityCost: r.humanityCost })}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                textAlign: "left",
                                padding: "6px 10px",
                                borderRadius: 4,
                                border: "1px solid transparent",
                                background: selected ? "var(--color-primary-bg)" : "transparent",
                                color: selected ? "var(--color-primary)" : "var(--color-text)",
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                              <span style={{ flexShrink: 0, marginLeft: 8 }}>
                                {r.price} eb
                                {r.humanityCost != null && r.humanityCost > 0 ? `, ${r.humanityCost} CH` : ""}
                              </span>
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <Button type="link" size="small" onClick={() => form.setFieldsValue({ referenceId: undefined, name: "", humanityCost: undefined })} style={{ marginTop: 4 }}>
                  Limpar / entrada custom
                </Button>
              </div>
            </Form.Item>
            {missingPrereqs.length > 0 && selectedRef && (
              <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                Pré-requisitos em falta:{" "}
                {missingPrereqs
                  .map((id) => referenceCyberware.find((r) => r.id === id)?.name ?? id)
                  .join(", ")}
                . Use &quot;Instalar tudo&quot; para instalar pré-requisitos e este item.
              </Text>
            )}
            <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Custo de humanidade">
              <Space wrap>
                <Form.Item name="humanityCost" noStyle>
                  <InputNumber
                    min={0}
                    style={{ width: 100 }}
                    placeholder={selectedRef?.humanityCost != null ? String(selectedRef.humanityCost) : undefined}
                  />
                </Form.Item>
                {selectedRef?.humanityCostDice && (
                  <Button
                    type="default"
                    onClick={() => {
                      const parsed = parseDamageDice(selectedRef.humanityCostDice!);
                      if (!parsed) return;
                      const { sum } = rollDice(parsed.count, parsed.size);
                      form.setFieldsValue({ humanityCost: sum });
                      message.success(`${selectedRef.humanityCostDice}: ${sum} CH — use "Reduzir humanidade" para descontar.`);
                    }}
                  >
                    Rolar
                  </Button>
                )}
              </Space>
            </Form.Item>
            {singleAddWouldReduceBelow20 && (
              <Text type="danger" style={{ display: "block", marginBottom: 16, fontSize: 12 }}>
                {LOW_HUMANITY_WARNING}
              </Text>
            )}
            <Form.Item name="notes" label="Notas">
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

function InfoSection({
  contacts,
  notes,
  groups,
  canEdit,
  updateData,
  mentionEntities,
  onMentionClick,
  contactRefsMap,
  noteRefsMap,
  groupRefsMap,
}: {
  contacts: Contact[];
  notes: Note[];
  groups: Group[];
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
  mentionEntities: MentionEntity[];
  onMentionClick: (slug: string, type: "contact" | "note" | "group") => void;
  contactRefsMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  noteRefsMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  groupRefsMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const [contactModal, setContactModal] = useState<Contact | null>(null);
  const [noteModal, setNoteModal] = useState<Note | null>(null);
  const [groupModal, setGroupModal] = useState<Group | null>(null);
  const [contactForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [groupForm] = Form.useForm<{ name: string; reputation: number }>();

  const addContact = () => {
    contactForm.resetFields();
    setContactModal({
      id: nextId(),
      name: "",
      shortDescription: "",
      longDescription: "",
      affiliation: "",
      slug: "",
    });
  };

  const saveContact = () => {
    contactForm.validateFields().then((vals) => {
      const name = vals.name ?? "";
      const slug = slugify(name);
      const c: Contact = {
        id: (contactModal?.id) ?? nextId(),
        name,
        shortDescription: vals.shortDescription ?? "",
        longDescription: vals.longDescription ?? "",
        affiliation: vals.affiliation ?? "",
        slug,
      };
      const existing = contacts.find((x) => x.id === c.id);
      if (existing) {
        updateData((d) => ({
          ...d,
          contacts: d.contacts.map((x) => (x.id === c.id ? c : x)),
        }));
      } else {
        updateData((d) => ({ ...d, contacts: [...d.contacts, c] }));
      }
      setContactModal(null);
    });
  };

  const removeContact = (id: string) => {
    updateData((d) => ({ ...d, contacts: d.contacts.filter((c) => c.id !== id) }));
  };

  const addNote = () => {
    noteForm.resetFields();
    setNoteModal({
      id: nextId(),
      title: "",
      content: "",
      slug: "",
    });
  };

  const saveNote = () => {
    noteForm.validateFields().then((vals) => {
      const title = vals.title ?? "";
      const slug = slugify(title);
      const n: Note = {
        id: (noteModal?.id) ?? nextId(),
        title,
        content: vals.content ?? "",
        slug,
      };
      const existing = notes.find((x) => x.id === n.id);
      if (existing) {
        updateData((d) => ({
          ...d,
          notes: d.notes.map((x) => (x.id === n.id ? n : x)),
        }));
      } else {
        updateData((d) => ({ ...d, notes: [...d.notes, n] }));
      }
      setNoteModal(null);
    });
  };

  const removeNote = (id: string) => {
    updateData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
  };

  const addGroup = () => {
    groupForm.resetFields();
    setGroupModal({
      id: nextId(),
      name: "",
      slug: "",
      reputation: 0,
    });
  };

  const saveGroup = () => {
    groupForm.validateFields().then((vals) => {
      const name = vals.name ?? "";
      const slug = slugify(name);
      const g: Group = {
        id: (groupModal?.id) ?? nextId(),
        name,
        slug,
        reputation: vals.reputation ?? 0,
      };
      const existing = groups.find((x) => x.id === g.id);
      const list = existing ? groups.map((x) => (x.id === g.id ? g : x)) : [...(groups ?? []), g];
      updateData((d) => ({ ...d, groups: list }));
      setGroupModal(null);
    });
  };

  const removeGroup = (id: string) => {
    updateData((d) => ({ ...d, groups: (d.groups ?? []).filter((x) => x.id !== id) }));
  };

  return (
    <>
      <Title level={5}>Contatos</Title>
      {contacts.map((c) => (
        <Card
          key={c.id}
          size="small"
          ref={(el) => { contactRefsMap.current[c.slug] = el; }}
          style={{ marginBottom: 8 }}
          title={c.name}
          extra={
            canEdit && (
              <Space>
                <Button size="small" onClick={() => { setContactModal(c); contactForm.setFieldsValue(c); }}>Editar</Button>
                <Button size="small" danger onClick={() => removeContact(c.id)}>Remover</Button>
              </Space>
            )
          }
        >
          <p><Text type="secondary">Resumo:</Text> <MentionText text={c.shortDescription} entities={mentionEntities} onMentionClick={onMentionClick} /></p>
          <p><Text type="secondary">Descrição:</Text> <MentionText text={c.longDescription} entities={mentionEntities} onMentionClick={onMentionClick} /></p>
          <p><Text type="secondary">Afiliação:</Text> <MentionText text={c.affiliation} entities={mentionEntities} onMentionClick={onMentionClick} /></p>
        </Card>
      ))}
      {canEdit && <Button type="dashed" icon={<PlusOutlined />} onClick={addContact} style={{ marginBottom: 16 }}>Adicionar contacto</Button>}

      <Title level={5}>Notas</Title>
      {notes.map((n) => (
        <Card
          key={n.id}
          size="small"
          ref={(el) => { noteRefsMap.current[n.slug] = el; }}
          style={{ marginBottom: 8 }}
          title={n.title}
          extra={
            canEdit && (
              <Space>
                <Button size="small" onClick={() => { setNoteModal(n); noteForm.setFieldsValue(n); }}>Editar</Button>
                <Button size="small" danger onClick={() => removeNote(n.id)}>Remover</Button>
              </Space>
            )
          }
        >
          <MentionText text={n.content} entities={mentionEntities} onMentionClick={onMentionClick} />
        </Card>
      ))}
      {canEdit && <Button type="dashed" icon={<PlusOutlined />} onClick={addNote}>Adicionar nota</Button>}

      <Title level={5}>Grupos</Title>
      {(groups ?? []).map((g) => (
        <Card
          key={g.id}
          size="small"
          ref={(el) => { groupRefsMap.current[g.slug] = el; }}
          style={{ marginBottom: 8 }}
          title={g.name}
          extra={
            canEdit && (
              <Space>
                <Button size="small" onClick={() => { setGroupModal(g); groupForm.setFieldsValue({ name: g.name, reputation: g.reputation }); }}>Editar</Button>
                <Button size="small" danger onClick={() => removeGroup(g.id)}>Remover</Button>
              </Space>
            )
          }
        >
          <p><Text type="secondary">Reputação:</Text> {g.reputation}</p>
        </Card>
      ))}
      {canEdit && <Button type="dashed" icon={<PlusOutlined />} onClick={addGroup} style={{ marginBottom: 16 }}>Adicionar grupo</Button>}

      <Modal title={contactModal?.id ? "Editar contacto" : "Novo contacto"} open={!!contactModal} onOk={saveContact} onCancel={() => setContactModal(null)} width={560}>
        <Form form={contactForm} layout="vertical" initialValues={contactModal ?? undefined}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input placeholder="Nome (usado para @menção)" />
          </Form.Item>
          <Form.Item name="shortDescription" label="Resumo">
            <Input.TextArea rows={2} placeholder="Pode usar @slug para ligar a contactos/notas/grupos" />
          </Form.Item>
          <Form.Item name="longDescription" label="Descrição longa">
            <Input.TextArea rows={3} placeholder="Pode usar @slug" />
          </Form.Item>
          <Form.Item name="affiliation" label="Afiliação">
            <Input placeholder="Pode usar @slug" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={noteModal?.id ? "Editar nota" : "Nova nota"} open={!!noteModal} onOk={saveNote} onCancel={() => setNoteModal(null)} width={560}>
        <Form form={noteForm} layout="vertical" initialValues={noteModal ?? undefined}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}>
            <Input placeholder="Título (usado para @menção)" />
          </Form.Item>
          <Form.Item name="content" label="Conteúdo">
            <Input.TextArea rows={5} placeholder="Pode usar @slug para ligar a contactos/notas/grupos" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={groupModal?.id ? "Editar grupo" : "Novo grupo"} open={!!groupModal} onOk={saveGroup} onCancel={() => setGroupModal(null)} width={400}>
        <Form form={groupForm} layout="vertical" initialValues={groupModal ? { name: groupModal.name, reputation: groupModal.reputation } : undefined}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input placeholder="Nome (usado para @menção)" />
          </Form.Item>
          <Form.Item name="reputation" label="Reputação">
            <InputNumber style={{ width: "100%" }} placeholder="Reputação com este grupo" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
