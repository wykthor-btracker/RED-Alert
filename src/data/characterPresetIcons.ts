/**
 * Preset character/NPC headshot icons in a cyberpunk aesthetic.
 * All are original inline SVGs (no external assets), suitable for use as character icons.
 */

export interface PresetIcon {
  id: string;
  name: string;
  /** Data URL (SVG) for the icon. */
  dataUrl: string;
}

function svgToDataUrl(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/** Cyberpunk-style preset headshots (abstract silhouettes / portraits). */
const PRESETS: PresetIcon[] = [
  {
    id: "cyber-neon",
    name: "Neon",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0ff"/><stop offset="100%" style="stop-color:#609"/></linearGradient></defs>
        <ellipse cx="32" cy="36" rx="20" ry="24" fill="#1a1a2e" stroke="url(#g1)" stroke-width="2"/>
        <circle cx="26" cy="32" r="3" fill="#0ff" opacity="0.9"/>
        <circle cx="38" cy="32" r="3" fill="#0ff" opacity="0.9"/>
        <path d="M24 44 Q32 50 40 44" stroke="#0ff" stroke-width="1.5" fill="none" opacity="0.8"/>
      </svg>`
    ),
  },
  {
    id: "cyber-visor",
    name: "Visor",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="34" rx="22" ry="26" fill="#0d0d12" stroke="#e040fb" stroke-width="1.5"/>
        <rect x="18" y="28" width="28" height="8" rx="2" fill="#1a1a2e" stroke="#e040fb" stroke-width="1"/>
        <line x1="20" y1="32" x2="44" y2="32" stroke="#e040fb" stroke-width="2" opacity="0.9"/>
      </svg>`
    ),
  },
  {
    id: "cyber-synth",
    name: "Synth",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path d="M32 8 L52 28 L52 52 L12 52 L12 28 Z" fill="#16213e" stroke="#00d9ff" stroke-width="1.5"/>
        <circle cx="32" cy="34" r="6" fill="none" stroke="#00d9ff" stroke-width="1.5"/>
        <circle cx="32" cy="34" r="2" fill="#00d9ff"/>
        <path d="M28 44 L32 48 L36 44" stroke="#00d9ff" stroke-width="1" fill="none"/>
      </svg>`
    ),
  },
  {
    id: "cyber-nomad",
    name: "Nomad",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="36" rx="20" ry="24" fill="#0f0f1a" stroke="#ff6b35" stroke-width="1.5"/>
        <path d="M20 22 Q32 14 44 22" fill="none" stroke="#ff6b35" stroke-width="1.5"/>
        <circle cx="28" cy="32" r="2.5" fill="#ff6b35"/>
        <circle cx="36" cy="32" r="2.5" fill="#ff6b35"/>
        <path d="M26 42 Q32 46 38 42" stroke="#ff6b35" stroke-width="1" fill="none" opacity="0.9"/>
      </svg>`
    ),
  },
  {
    id: "cyber-corpo",
    name: "Corpo",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="35" rx="21" ry="25" fill="#1a1a2e" stroke="#7c3aed" stroke-width="1.5"/>
        <rect x="26" y="26" width="12" height="14" rx="2" fill="#0f0f1a" stroke="#7c3aed" stroke-width="1"/>
        <circle cx="32" cy="32" r="2" fill="#7c3aed"/>
        <path d="M28 42 L32 46 L36 42" stroke="#7c3aed" stroke-width="1" fill="none"/>
      </svg>`
    ),
  },
  {
    id: "cyber-rocker",
    name: "Rocker",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="36" rx="20" ry="24" fill="#1a0a0a" stroke="#f43f5e" stroke-width="1.5"/>
        <path d="M18 24 Q32 16 46 24" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <circle cx="27" cy="32" r="2.5" fill="#f43f5e"/>
        <circle cx="37" cy="32" r="2.5" fill="#f43f5e"/>
        <path d="M24 44 Q32 50 40 44" stroke="#f43f5e" stroke-width="1.2" fill="none"/>
      </svg>`
    ),
  },
  {
    id: "cyber-netrunner",
    name: "Netrunner",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <ellipse cx="32" cy="35" rx="20" ry="24" fill="#0a0a14" stroke="#22d3ee" stroke-width="1.5"/>
        <path d="M24 20 L32 12 L40 20" fill="none" stroke="#22d3ee" stroke-width="1.2"/>
        <circle cx="32" cy="32" r="4" fill="none" stroke="#22d3ee" stroke-width="1"/>
        <circle cx="32" cy="32" r="1.5" fill="#22d3ee"/>
        <path d="M26 42 Q32 48 38 42" stroke="#22d3ee" stroke-width="1" fill="none" opacity="0.8"/>
      </svg>`
    ),
  },
  {
    id: "cyber-tech",
    name: "Tech",
    dataUrl: svgToDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect x="14" y="18" width="36" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
        <rect x="22" y="28" width="20" height="12" rx="1" fill="#0a0a14" stroke="#38bdf8" stroke-width="1"/>
        <circle cx="32" cy="34" r="2" fill="#38bdf8"/>
        <path d="M28 46 L32 50 L36 46" stroke="#38bdf8" stroke-width="1" fill="none"/>
      </svg>`
    ),
  },
];

export { PRESETS };

/** Resolve icon URL: if value is a preset id, return its dataUrl; otherwise return value (data URL). */
export function resolveCharacterIcon(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const preset = PRESETS.find((p) => p.id === value);
  return preset ? preset.dataUrl : value;
}
