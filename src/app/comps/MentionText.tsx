"use client";

import React from "react";
import { Typography } from "antd";

const MENTION_REGEX = /@([a-z0-9-]+)/gi;

export interface MentionEntity {
  slug: string;
  label: string;
  type: "contact" | "note" | "group";
}

interface MentionTextProps {
  /** Raw text that may contain @slug mentions. */
  text: string;
  /** Known entities for link resolution; slugs not in list render as plain text. */
  entities: MentionEntity[];
  /** Called when user clicks a mention link (e.g. to scroll to that section). */
  onMentionClick?: (slug: string, type: "contact" | "note" | "group") => void;
  /** Optional class name for the container. */
  className?: string;
}

/**
 * Renders text with @slug patterns as clickable links. Non-matching @xyz left as-is.
 */
export function MentionText({ text, entities, onMentionClick, className }: MentionTextProps) {
  const entityMap = React.useMemo(() => {
    const m = new Map<string, MentionEntity>();
    entities.forEach((e) => m.set(e.slug.toLowerCase(), e));
    return m;
  }, [entities]);

  const parts = React.useMemo(() => {
    const result: { key: string; type: "text" | "mention"; text?: string; slug?: string; entity?: MentionEntity }[] = [];
    let lastIndex = 0;
    let keyIdx = 0;
    let match: RegExpExecArray | null;
    MENTION_REGEX.lastIndex = 0;
    while ((match = MENTION_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ key: `t-${keyIdx++}`, type: "text", text: text.slice(lastIndex, match.index) });
      }
      const slug = match[1].toLowerCase();
      const entity = entityMap.get(slug);
      result.push({
        key: `m-${keyIdx++}-${slug}`,
        type: "mention",
        text: match[0],
        slug,
        entity,
      });
      lastIndex = MENTION_REGEX.lastIndex;
    }
    if (lastIndex < text.length) {
      result.push({ key: `t-${keyIdx++}`, type: "text", text: text.slice(lastIndex) });
    }
    return result;
  }, [text, entityMap]);

  return (
    <Typography.Text className={className}>
      {parts.map((part) => {
        if (part.type === "text") {
          return <span key={part.key}>{part.text}</span>;
        }
        const { slug, entity } = part;
        const label = entity?.label ?? slug;
        return (
          <span key={part.key}>
            <Typography.Link
              type="secondary"
              onClick={() => {
                if (!entity || !onMentionClick) return;
                onMentionClick(slug ?? "", (entity.type ?? "note") as "contact" | "note" | "group");
              }}
              style={{ cursor: entity ? "pointer" : "default" }}
            >
              @{slug}
            </Typography.Link>
          </span>
        );
      })}
    </Typography.Text>
  );
}
