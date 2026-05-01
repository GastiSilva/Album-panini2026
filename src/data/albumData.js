/**
 * albumData.js
 * Modelo de datos completo del Álbum Mundial FIFA 2026
 *
 * Estructura de IDs:
 *  - Especiales:  1  →  20  (20 figuritas)
 *  - 48 países:  21 → 980  (48 × 20 = 960 figuritas)
 *  - TOTAL: 980 figuritas
 *
 * Cada país tiene:
 *  - 1 Escudo        (type: 'shield')
 *  - 1 Foto Equipo   (type: 'team')
 *  - 18 Jugadores    (type: 'player')
 */

// ─────────────────────────────────────────────
//  CONFEDERACIONES
// ─────────────────────────────────────────────
export const CONFEDERATIONS = {
  UEFA:     { code: 'UEFA',     name: 'UEFA – Europa',        color: '#003DA5', bg: '#E8EEF8' },
  CONMEBOL: { code: 'CONMEBOL', name: 'CONMEBOL – Sudamérica', color: '#009B3A', bg: '#E6F5EC' },
  CONCACAF: { code: 'CONCACAF', name: 'CONCACAF – N/C/Caribe', color: '#C8102E', bg: '#FAEAEC' },
  CAF:      { code: 'CAF',      name: 'CAF – África',          color: '#F7A800', bg: '#FEF7E6' },
  AFC:      { code: 'AFC',      name: 'AFC – Asia',            color: '#E30613', bg: '#FDEAEB' },
  OFC:      { code: 'OFC',      name: 'OFC – Oceanía',         color: '#00529B', bg: '#E6EFF8' },
}

// ─────────────────────────────────────────────
//  SECCIÓN ESPECIALES  (IDs 1-20)
// ─────────────────────────────────────────────
const ESPECIALES_STICKERS = [
  { id: 1,  type: 'special', label: 'Portada Álbum' },
  { id: 2,  type: 'special', label: 'Copa del Mundo' },
  { id: 3,  type: 'special', label: 'Pelota Oficial – Conext26' },
  { id: 4,  type: 'special', label: 'Mascota Oficial' },
  { id: 5,  type: 'special', label: 'Logo FIFA World Cup 2026' },
  { id: 6,  type: 'special', label: 'Sede – Los Ángeles' },
  { id: 7,  type: 'special', label: 'Sede – Nueva York / NJ' },
  { id: 8,  type: 'special', label: 'Sede – Dallas' },
  { id: 9,  type: 'special', label: 'Sede – San Francisco' },
  { id: 10, type: 'special', label: 'Sede – Miami' },
  { id: 11, type: 'special', label: 'Sede – Seattle' },
  { id: 12, type: 'special', label: 'Sede – Boston' },
  { id: 13, type: 'special', label: 'Sede – Houston' },
  { id: 14, type: 'special', label: 'Sede – Atlanta' },
  { id: 15, type: 'special', label: 'Sede – Kansas City' },
  { id: 16, type: 'special', label: 'Sede – Philadelphia' },
  { id: 17, type: 'special', label: 'Sede – Toronto (Canadá)' },
  { id: 18, type: 'special', label: 'Sede – Vancouver (Canadá)' },
  { id: 19, type: 'special', label: 'Sede – Guadalajara (México)' },
  { id: 20, type: 'special', label: 'Sede – Ciudad de México' },
]

export const ESPECIALES_SECTION = {
  id: 'especiales',
  name: 'Especiales',
  subtitle: 'Copa, Mascota, Sedes y más',
  icon: 'emoji_events',
  color: '#FFD600',
  bg: '#FFFDE7',
  confederation: null,
  stickers: ESPECIALES_STICKERS,
}

// ─────────────────────────────────────────────
//  EQUIPOS (48 selecciones clasificadas)
// ─────────────────────────────────────────────
const TEAMS_RAW = [
  // ── UEFA (16) ──────────────────────────────────────────────
  { id: 'germany',     name: 'Alemania',        flag: '🇩🇪', confederation: 'UEFA' },
  { id: 'france',      name: 'Francia',          flag: '🇫🇷', confederation: 'UEFA' },
  { id: 'spain',       name: 'España',           flag: '🇪🇸', confederation: 'UEFA' },
  { id: 'england',     name: 'Inglaterra',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { id: 'portugal',    name: 'Portugal',         flag: '🇵🇹', confederation: 'UEFA' },
  { id: 'netherlands', name: 'Países Bajos',     flag: '🇳🇱', confederation: 'UEFA' },
  { id: 'italy',       name: 'Italia',           flag: '🇮🇹', confederation: 'UEFA' },
  { id: 'croatia',     name: 'Croacia',          flag: '🇭🇷', confederation: 'UEFA' },
  { id: 'switzerland', name: 'Suiza',            flag: '🇨🇭', confederation: 'UEFA' },
  { id: 'austria',     name: 'Austria',          flag: '🇦🇹', confederation: 'UEFA' },
  { id: 'denmark',     name: 'Dinamarca',        flag: '🇩🇰', confederation: 'UEFA' },
  { id: 'serbia',      name: 'Serbia',           flag: '🇷🇸', confederation: 'UEFA' },
  { id: 'turkey',      name: 'Turquía',          flag: '🇹🇷', confederation: 'UEFA' },
  { id: 'poland',      name: 'Polonia',          flag: '🇵🇱', confederation: 'UEFA' },
  { id: 'belgium',     name: 'Bélgica',          flag: '🇧🇪', confederation: 'UEFA' },
  { id: 'ukraine',     name: 'Ucrania',          flag: '🇺🇦', confederation: 'UEFA' },

  // ── CONMEBOL (6) ───────────────────────────────────────────
  { id: 'brazil',      name: 'Brasil',           flag: '🇧🇷', confederation: 'CONMEBOL' },
  { id: 'argentina',   name: 'Argentina',        flag: '🇦🇷', confederation: 'CONMEBOL' },
  { id: 'colombia',    name: 'Colombia',         flag: '🇨🇴', confederation: 'CONMEBOL' },
  { id: 'uruguay',     name: 'Uruguay',          flag: '🇺🇾', confederation: 'CONMEBOL' },
  { id: 'ecuador',     name: 'Ecuador',          flag: '🇪🇨', confederation: 'CONMEBOL' },
  { id: 'venezuela',   name: 'Venezuela',        flag: '🇻🇪', confederation: 'CONMEBOL' },

  // ── CONCACAF (6 + co-sedes automáticas) ────────────────────
  { id: 'usa',         name: 'Estados Unidos',   flag: '🇺🇸', confederation: 'CONCACAF' },
  { id: 'mexico',      name: 'México',           flag: '🇲🇽', confederation: 'CONCACAF' },
  { id: 'canada',      name: 'Canadá',           flag: '🇨🇦', confederation: 'CONCACAF' },
  { id: 'panama',      name: 'Panamá',           flag: '🇵🇦', confederation: 'CONCACAF' },
  { id: 'honduras',    name: 'Honduras',         flag: '🇭🇳', confederation: 'CONCACAF' },
  { id: 'costa_rica',  name: 'Costa Rica',       flag: '🇨🇷', confederation: 'CONCACAF' },

  // ── CAF (9) ─────────────────────────────────────────────────
  { id: 'morocco',     name: 'Marruecos',        flag: '🇲🇦', confederation: 'CAF' },
  { id: 'senegal',     name: 'Senegal',          flag: '🇸🇳', confederation: 'CAF' },
  { id: 'nigeria',     name: 'Nigeria',          flag: '🇳🇬', confederation: 'CAF' },
  { id: 'egypt',       name: 'Egipto',           flag: '🇪🇬', confederation: 'CAF' },
  { id: 'cameroon',    name: 'Camerún',          flag: '🇨🇲', confederation: 'CAF' },
  { id: 'ghana',       name: 'Ghana',            flag: '🇬🇭', confederation: 'CAF' },
  { id: 'tunisia',     name: 'Túnez',            flag: '🇹🇳', confederation: 'CAF' },
  { id: 'dr_congo',    name: 'R. D. Congo',      flag: '🇨🇩', confederation: 'CAF' },
  { id: 'algeria',     name: 'Argelia',          flag: '🇩🇿', confederation: 'CAF' },

  // ── AFC (8) ─────────────────────────────────────────────────
  { id: 'japan',       name: 'Japón',            flag: '🇯🇵', confederation: 'AFC' },
  { id: 'south_korea', name: 'Corea del Sur',    flag: '🇰🇷', confederation: 'AFC' },
  { id: 'australia',   name: 'Australia',        flag: '🇦🇺', confederation: 'AFC' },
  { id: 'iran',        name: 'Irán',             flag: '🇮🇷', confederation: 'AFC' },
  { id: 'saudi_arabia',name: 'Arabia Saudita',   flag: '🇸🇦', confederation: 'AFC' },
  { id: 'iraq',        name: 'Irak',             flag: '🇮🇶', confederation: 'AFC' },
  { id: 'jordan',      name: 'Jordania',         flag: '🇯🇴', confederation: 'AFC' },
  { id: 'indonesia',   name: 'Indonesia',        flag: '🇮🇩', confederation: 'AFC' },

  // ── OFC (1) ──────────────────────────────────────────────────
  { id: 'new_zealand', name: 'Nueva Zelanda',    flag: '🇳🇿', confederation: 'OFC' },

  // ── Repechaje Intercontinental (2) ──────────────────────────
  { id: 'paraguay',    name: 'Paraguay',         flag: '🇵🇾', confederation: 'CONMEBOL' },
  { id: 'uzbekistan',  name: 'Uzbekistán',       flag: '🇺🇿', confederation: 'AFC' },
]

// ─────────────────────────────────────────────
//  Helpers de stickers por equipo
// ─────────────────────────────────────────────

const PLAYER_NAMES = Array.from({ length: 18 }, (_, i) => `Jugador ${i + 1}`)

function buildTeamStickers(startId) {
  return [
    { id: startId,      type: 'shield', label: 'Escudo' },
    { id: startId + 1,  type: 'team',   label: 'Foto de Equipo' },
    ...PLAYER_NAMES.map((label, i) => ({
      id: startId + 2 + i,
      type: 'player',
      label,
    })),
  ]
}

// ─────────────────────────────────────────────
//  SECCIONES DE EQUIPOS
// ─────────────────────────────────────────────
export const TEAMS_SECTIONS = TEAMS_RAW.map((team, index) => {
  const startId = 21 + index * 20
  const conf = CONFEDERATIONS[team.confederation]
  return {
    ...team,
    subtitle: `${team.flag} ${conf.name}`,
    icon: 'shield',
    color: conf.color,
    bg: conf.bg,
    startId,
    endId: startId + 19,
    stickers: buildTeamStickers(startId),
  }
})

// ─────────────────────────────────────────────
//  ÁLBUM COMPLETO
// ─────────────────────────────────────────────
export const ALBUM_SECTIONS = [ESPECIALES_SECTION, ...TEAMS_SECTIONS]

/**
 * Mapa plano: stickerID → { id, type, label, sectionId, sectionName }
 * Útil para lookups O(1) sin iterar secciones.
 */
export const STICKERS_MAP = (() => {
  const map = {}
  for (const section of ALBUM_SECTIONS) {
    for (const sticker of section.stickers) {
      map[sticker.id] = { ...sticker, sectionId: section.id, sectionName: section.name }
    }
  }
  return map
})()

export const TOTAL_STICKERS = Object.keys(STICKERS_MAP).length // 980

// Agrupación por confederación para el menú lateral
export const SECTIONS_BY_CONFEDERATION = Object.entries(
  TEAMS_SECTIONS.reduce((acc, team) => {
    const key = team.confederation
    if (!acc[key]) acc[key] = { ...CONFEDERATIONS[key], teams: [] }
    acc[key].teams.push(team)
    return acc
  }, {})
).map(([, v]) => v)
