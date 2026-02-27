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
  Row,
  Col,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
  Popover,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import { MessageBusContext } from "../contexts/MessageBusContext";
import { MentionText, type MentionEntity } from "../comps/MentionText";
import type {
  CharacterData as CharacterDataT,
  Contact,
  CyberwareEntry,
  InventoryEntry,
  Note,
  SkillEntry,
  Stats,
} from "../types/character";
import {
  createDefaultCharacterData,
  DEFAULT_STAT_KEYS,
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
  } = useContext(MessageBusContext);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [deleteSheetConfirmOpen, setDeleteSheetConfirmOpen] = useState(false);
  const [mainCollapseOpen, setMainCollapseOpen] = useState<string[]>([]);
  const contactRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const noteRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const scrollToCyberwareRef = useRef<((slug: string) => void) | null>(null);

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
    return out;
  }, [data?.contacts, data?.notes]);

  const handleMentionClick = useCallback((slug: string, type: "contact" | "note") => {
    const el = type === "contact" ? contactRefsMap.current[slug] : noteRefsMap.current[slug];
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
                    {statsBreakdown(entry.data.stats)}
                  </Text>
                </div>
                <div style={{ marginTop: 2, fontSize: 12 }}>
                  <Text type="secondary">
                    Vida: {entry.data.currentHealth ?? "—"} / {entry.data.maxHealth ?? "—"}
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
                    description={statsBreakdown(sheet.stats ?? {})}
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
        <Empty description="Nenhum dado de personagem carregado.">
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
        <Empty description="Selecione um personagem para editar ou crie um novo." />
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
                  {allStatKeys.map((key) => (
                    <Form.Item key={key} label={key} style={{ marginRight: 16 }}>
                      <InputNumber
                        min={0}
                        max={20}
                        value={data.stats[key] ?? 0}
                        onChange={(v) => setStat(key, v ?? 0)}
                        disabled={!canEdit}
                      />
                    </Form.Item>
                  ))}
                </Form>
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
                      const statVal = data.stats[item.baseStat] ?? 0;
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
                      const bonusPopover =
                        bonus > 0 && bonusData?.sources?.length ? (
                          <Popover
                            trigger="click"
                            content={
                              <div style={{ maxWidth: 280 }}>
                                <div style={{ marginBottom: 6, fontWeight: 600 }}>Bônus de cyberware</div>
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
                              </div>
                            }
                          >
                            <span style={{ cursor: "pointer", textDecoration: "underline", color: "#1677ff" }}>
                              = {statVal + item.value}
                              {bonus > 0 ? ` + ${bonus}(cyber) = ${total}` : ` = ${total}`}
                            </span>
                          </Popover>
                        ) : (
                          <Text style={metaStyle}>= {total}</Text>
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
                            {bonusPopover}
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
                      value={data.currentHealth}
                      onChange={(v) => setHealth(v ?? undefined, data.maxHealth)}
                      disabled={!canEdit}
                      style={{ width: 72 }}
                    />
                  </Form.Item>
                  <Form.Item label="Vida máx.">
                    <InputNumber
                      min={0}
                      value={data.maxHealth}
                      onChange={(v) => setHealth(data.currentHealth, v ?? undefined)}
                      disabled={!canEdit}
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
                canEdit={canEdit}
                updateData={updateData}
                scrollToCyberwareRef={scrollToCyberwareRef}
              />
            ),
          },
          {
            key: "info",
            label: "Informação (Contatos e Notas)",
            children: (
              <InfoSection
                contacts={data.contacts}
                notes={data.notes}
                canEdit={canEdit}
                updateData={updateData}
                mentionEntities={mentionEntities}
                onMentionClick={handleMentionClick}
                contactRefsMap={contactRefsMap}
                noteRefsMap={noteRefsMap}
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
  const baseStatValue = data.stats?.[baseStatKey] ?? 0;
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

function CyberwareSection({
  cyberware,
  canEdit,
  updateData,
  scrollToCyberwareRef,
}: {
  cyberware: CyberwareEntry[];
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
  scrollToCyberwareRef: React.MutableRefObject<((slug: string) => void) | null>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [cyberwareCategoryOpen, setCyberwareCategoryOpen] = useState<string[]>([]);
  const [installAllConfirmOpen, setInstallAllConfirmOpen] = useState(false);
  const [installList, setInstallList] = useState<ReferenceCyberware[]>([]);

  const installedIds = useMemo(() => getInstalledRefIds(cyberware), [cyberware]);
  const refId = Form.useWatch("referenceId", form);
  const selectedRef = refId
    ? referenceCyberware.find((r) => r.id === refId) ?? null
    : null;
  const missingPrereqs = useMemo(
    () => getMissingPrereqs(selectedRef, installedIds),
    [selectedRef, installedIds],
  );

  const add = (entry: CyberwareEntry) => {
    updateData((d) => ({ ...d, cyberware: [...d.cyberware, entry] }));
  };

  const remove = (index: number) => {
    updateData((d) => ({ ...d, cyberware: d.cyberware.filter((_, i) => i !== index) }));
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
    setInstallAllConfirmOpen(true);
  };

  const confirmInstallAll = () => {
    const newEntries: CyberwareEntry[] = installList.map((r) => ({
      name: r.name,
      referenceId: r.id,
      notes: undefined,
      humanityCost: r.humanityCost,
      worn: true,
    }));
    updateData((d) => ({
      ...d,
      cyberware: [...d.cyberware, ...newEntries],
    }));
    form.resetFields();
    setModalOpen(false);
    setInstallAllConfirmOpen(false);
    setInstallList([]);
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
                        ? [
                            <Tooltip key="worn" title={worn ? "Instalado (bônus ativos)" : "Não instalado"}>
                              <Switch size="small" checked={worn} onChange={() => toggleWorn(index)} />
                            </Tooltip>,
                            <Button key="x" type="link" danger size="small" onClick={() => remove(index)}>
                              Remover
                            </Button>,
                          ]
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
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Nenhum cyberware. Adicione para ver por categoria.</Text>
      )}
      {canEdit && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Adicionar cyberware
        </Button>
      )}
      <Modal
        title="Adicionar cyberware"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            {missingPrereqs.length > 0 && selectedRef ? (
              <Button type="primary" onClick={openInstallAllConfirm}>
                Instalar tudo
              </Button>
            ) : (
              <Button type="primary" onClick={handleOk}>
                Adicionar
              </Button>
            )}
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="referenceId" label="Da referência (opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Custom..."
              options={referenceCyberware.map((r) => ({
                value: r.id,
                label: `${r.name} (${r.price} eb)`,
              }))}
              onChange={(v) => {
                const ref = referenceCyberware.find((r) => r.id === v);
                if (ref) {
                  form.setFieldsValue({ name: ref.name, humanityCost: ref.humanityCost });
                }
              }}
            />
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
          <Form.Item name="humanityCost" label="Custo de humanidade">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="notes" label="Notas">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Instalar tudo — confirmação"
        open={installAllConfirmOpen}
        onCancel={() => setInstallAllConfirmOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setInstallAllConfirmOpen(false)}>Voltar</Button>
            <Button type="primary" onClick={confirmInstallAll}>
              Confirmar
            </Button>
          </Space>
        }
      >
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
          {(() => {
            const ch = installList.reduce((s, r) => s + (r.humanityCost ?? 0), 0);
            return ch > 0 ? `, ${ch} CH` : "";
          })()}
        </div>
      </Modal>
    </>
  );
}

function InfoSection({
  contacts,
  notes,
  canEdit,
  updateData,
  mentionEntities,
  onMentionClick,
  contactRefsMap,
  noteRefsMap,
}: {
  contacts: Contact[];
  notes: Note[];
  canEdit: boolean;
  updateData: (updater: (prev: CharacterDataT) => CharacterDataT) => void;
  mentionEntities: MentionEntity[];
  onMentionClick: (slug: string, type: "contact" | "note") => void;
  contactRefsMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  noteRefsMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const [contactModal, setContactModal] = useState<Contact | null>(null);
  const [noteModal, setNoteModal] = useState<Note | null>(null);
  const [contactForm] = Form.useForm();
  const [noteForm] = Form.useForm();

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

      <Modal title={contactModal?.id ? "Editar contacto" : "Novo contacto"} open={!!contactModal} onOk={saveContact} onCancel={() => setContactModal(null)} width={560}>
        <Form form={contactForm} layout="vertical" initialValues={contactModal ?? undefined}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input placeholder="Nome (usado para @menção)" />
          </Form.Item>
          <Form.Item name="shortDescription" label="Resumo">
            <Input.TextArea rows={2} placeholder="Pode usar @slug para ligar a outros contactos/notas" />
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
            <Input.TextArea rows={5} placeholder="Pode usar @slug para ligar a contactos/notas" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
