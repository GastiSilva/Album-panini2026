/**
 * albumData.js
 * Modelo de datos completo del Álbum Mundial FIFA 2026
 *
 * IDs:
 *  - Especiales:  1  →  20  (20 figuritas)
 *  - 48 países:  21 → 980  (48 × 20 = 960 figuritas)
 *  - TOTAL: 980 figuritas
 */

// ─────────────────────────────────────────────────────────────────────────
//  GRUPOS DEL MUNDIAL 2026 (12 grupos × 4 equipos)
// ─────────────────────────────────────────────────────────────────────────
export const WC_GROUPS = {
  A: { label: 'Grupo A', teams: ['mexico',     'south_africa', 'south_korea', 'czech_republic'] },
  B: { label: 'Grupo B', teams: ['canada',     'bosnia',       'qatar',       'switzerland']   },
  C: { label: 'Grupo C', teams: ['brazil',     'morocco',      'haiti',       'scotland']       },
  D: { label: 'Grupo D', teams: ['usa',        'paraguay',     'australia',   'turkey']         },
  E: { label: 'Grupo E', teams: ['germany',    'curacao',      'ivory_coast', 'ecuador']        },
  F: { label: 'Grupo F', teams: ['netherlands','japan',        'sweden',      'tunisia']        },
  G: { label: 'Grupo G', teams: ['belgium',    'egypt',        'iran',        'new_zealand']    },
  H: { label: 'Grupo H', teams: ['spain',      'cape_verde',   'saudi_arabia','uruguay']        },
  I: { label: 'Grupo I', teams: ['france',     'senegal',      'iraq',        'norway']         },
  J: { label: 'Grupo J', teams: ['argentina',  'algeria',      'austria',     'jordan']         },
  K: { label: 'Grupo K', teams: ['portugal',   'dr_congo',     'uzbekistan',  'colombia']       },
  L: { label: 'Grupo L', teams: ['england',    'croatia',      'ghana',       'panama']         },
}

// ─────────────────────────────────────────────────────────────────────────
//  CONFEDERACIONES
// ─────────────────────────────────────────────────────────────────────────
export const CONFEDERATIONS = {
  UEFA:     { code: 'UEFA',     name: 'UEFA – Europa',         color: '#003DA5', bg: '#E8EEF8' },
  CONMEBOL: { code: 'CONMEBOL', name: 'CONMEBOL – Sudamérica', color: '#009B3A', bg: '#E6F5EC' },
  CONCACAF: { code: 'CONCACAF', name: 'CONCACAF – N/C/Caribe', color: '#C8102E', bg: '#FAEAEC' },
  CAF:      { code: 'CAF',      name: 'CAF – África',          color: '#F7A800', bg: '#FEF7E6' },
  AFC:      { code: 'AFC',      name: 'AFC – Asia',            color: '#E30613', bg: '#FDEAEB' },
  OFC:      { code: 'OFC',      name: 'OFC – Oceanía',         color: '#00529B', bg: '#E6EFF8' },
}

// ─────────────────────────────────────────────────────────────────────────
//  SECCIÓN ESPECIALES  (IDs 1-20)
// ─────────────────────────────────────────────────────────────────────────
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
  isSpecial: true,
  stickers: ESPECIALES_STICKERS,
}

// ─────────────────────────────────────────────────────────────────────────
// Flag URLs (usando flagcdn.com CDN gratuito)
// ─────────────────────────────────────────────────────────────────────────
const FLAG_CDN = 'https://flagcdn.com/h20'
const flagUrl = (code) => `${FLAG_CDN}/${code}.png`

// ─────────────────────────────────────────────────────────────────────────
//  EQUIPOS (48 selecciones en orden de grupos)
// ─────────────────────────────────────────────────────────────────────────
const TEAMS_RAW = [
  // ── GRUPO A ────────────────────────────────────────────────────────────
  { id: 'mexico',          name: 'México',                flag: flagUrl('mx'), confederation: 'CONCACAF', group: 'A' },
  { id: 'south_africa',    name: 'Sudáfrica',             flag: flagUrl('za'), confederation: 'CAF',      group: 'A' },
  { id: 'south_korea',     name: 'República de Corea',    flag: flagUrl('kr'), confederation: 'AFC',      group: 'A' },
  { id: 'czech_republic',  name: 'Chequia',               flag: flagUrl('cz'), confederation: 'UEFA',     group: 'A' },
  // ── GRUPO B ────────────────────────────────────────────────────────────
  { id: 'canada',          name: 'Canadá',                flag: flagUrl('ca'), confederation: 'CONCACAF', group: 'B' },
  { id: 'bosnia',          name: 'Bosnia y Herzegovina',  flag: flagUrl('ba'), confederation: 'UEFA',     group: 'B' },
  { id: 'qatar',           name: 'Catar',                 flag: flagUrl('qa'), confederation: 'AFC',      group: 'B' },
  { id: 'switzerland',     name: 'Suiza',                 flag: flagUrl('ch'), confederation: 'UEFA',     group: 'B' },
  // ── GRUPO C ────────────────────────────────────────────────────────────
  { id: 'brazil',          name: 'Brasil',                flag: flagUrl('br'), confederation: 'CONMEBOL', group: 'C' },
  { id: 'morocco',         name: 'Marruecos',             flag: flagUrl('ma'), confederation: 'CAF',      group: 'C' },
  { id: 'haiti',           name: 'Haití',                 flag: flagUrl('ht'), confederation: 'CONCACAF', group: 'C' },
  { id: 'scotland',        name: 'Escocia',               flag: flagUrl('gb-sct'), confederation: 'UEFA',     group: 'C' },
  // ── GRUPO D ────────────────────────────────────────────────────────────
  { id: 'usa',             name: 'EE.UU.',                flag: flagUrl('us'), confederation: 'CONCACAF', group: 'D' },
  { id: 'paraguay',        name: 'Paraguay',              flag: flagUrl('py'), confederation: 'CONMEBOL', group: 'D' },
  { id: 'australia',       name: 'Australia',             flag: flagUrl('au'), confederation: 'AFC',      group: 'D' },
  { id: 'turkey',          name: 'Turquía',               flag: flagUrl('tr'), confederation: 'UEFA',     group: 'D' },
  // ── GRUPO E ────────────────────────────────────────────────────────────
  { id: 'germany',         name: 'Alemania',              flag: flagUrl('de'), confederation: 'UEFA',     group: 'E' },
  { id: 'curacao',         name: 'Curazao',               flag: flagUrl('cw'), confederation: 'CONCACAF', group: 'E' },
  { id: 'ivory_coast',     name: 'Costa de Marfil',       flag: flagUrl('ci'), confederation: 'CAF',      group: 'E' },
  { id: 'ecuador',         name: 'Ecuador',               flag: flagUrl('ec'), confederation: 'CONMEBOL', group: 'E' },
  // ── GRUPO F ────────────────────────────────────────────────────────────
  { id: 'netherlands',     name: 'Países Bajos',          flag: flagUrl('nl'), confederation: 'UEFA',     group: 'F' },
  { id: 'japan',           name: 'Japón',                 flag: flagUrl('jp'), confederation: 'AFC',      group: 'F' },
  { id: 'sweden',          name: 'Suecia',                flag: flagUrl('se'), confederation: 'UEFA',     group: 'F' },
  { id: 'tunisia',         name: 'Túnez',                 flag: flagUrl('tn'), confederation: 'CAF',      group: 'F' },
  // ── GRUPO G ────────────────────────────────────────────────────────────
  { id: 'belgium',         name: 'Bélgica',               flag: flagUrl('be'), confederation: 'UEFA',     group: 'G' },
  { id: 'egypt',           name: 'Egipto',                flag: flagUrl('eg'), confederation: 'CAF',      group: 'G' },
  { id: 'iran',            name: 'RI de Irán',            flag: flagUrl('ir'), confederation: 'AFC',      group: 'G' },
  { id: 'new_zealand',     name: 'Nueva Zelanda',         flag: flagUrl('nz'), confederation: 'OFC',      group: 'G' },
  // ── GRUPO H ────────────────────────────────────────────────────────────
  { id: 'spain',           name: 'España',                flag: flagUrl('es'), confederation: 'UEFA',     group: 'H' },
  { id: 'cape_verde',      name: 'Islas de Cabo Verde',   flag: flagUrl('cv'), confederation: 'CAF',      group: 'H' },
  { id: 'saudi_arabia',    name: 'Arabia Saudí',          flag: flagUrl('sa'), confederation: 'AFC',      group: 'H' },
  { id: 'uruguay',         name: 'Uruguay',               flag: flagUrl('uy'), confederation: 'CONMEBOL', group: 'H' },
  // ── GRUPO I ────────────────────────────────────────────────────────────
  { id: 'france',          name: 'Francia',               flag: flagUrl('fr'), confederation: 'UEFA',     group: 'I' },
  { id: 'senegal',         name: 'Senegal',               flag: flagUrl('sn'), confederation: 'CAF',      group: 'I' },
  { id: 'iraq',            name: 'Irak',                  flag: flagUrl('iq'), confederation: 'AFC',      group: 'I' },
  { id: 'norway',          name: 'Noruega',               flag: flagUrl('no'), confederation: 'UEFA',     group: 'I' },
  // ── GRUPO J ────────────────────────────────────────────────────────────
  { id: 'argentina',       name: 'Argentina',             flag: flagUrl('ar'), confederation: 'CONMEBOL', group: 'J' },
  { id: 'algeria',         name: 'Argelia',               flag: flagUrl('dz'), confederation: 'CAF',      group: 'J' },
  { id: 'austria',         name: 'Austria',               flag: flagUrl('at'), confederation: 'UEFA',     group: 'J' },
  { id: 'jordan',          name: 'Jordania',              flag: flagUrl('jo'), confederation: 'AFC',      group: 'J' },
  // ── GRUPO K ────────────────────────────────────────────────────────────
  { id: 'portugal',        name: 'Portugal',              flag: flagUrl('pt'), confederation: 'UEFA',     group: 'K' },
  { id: 'dr_congo',        name: 'RD Congo',              flag: flagUrl('cd'), confederation: 'CAF',      group: 'K' },
  { id: 'uzbekistan',      name: 'Uzbekistán',            flag: flagUrl('uz'), confederation: 'AFC',      group: 'K' },
  { id: 'colombia',        name: 'Colombia',              flag: flagUrl('co'), confederation: 'CONMEBOL', group: 'K' },
  // ── GRUPO L ────────────────────────────────────────────────────────────
  { id: 'england',         name: 'Inglaterra',            flag: flagUrl('gb-eng'), confederation: 'UEFA',     group: 'L' },
  { id: 'croatia',         name: 'Croacia',               flag: flagUrl('hr'), confederation: 'UEFA',     group: 'L' },
  { id: 'ghana',           name: 'Ghana',                 flag: flagUrl('gh'), confederation: 'CAF',      group: 'L' },
  { id: 'panama',          name: 'Panamá',                flag: flagUrl('pa'), confederation: 'CONCACAF', group: 'L' },
]

// ─────────────────────────────────────────────────────────────────────────
//  Helpers de stickers por equipo (20 figuritas cada uno)
// ─────────────────────────────────────────────────────────────────────────
const STICKER_TYPES_20 = [
  { type: 'shield', label: 'Escudo' },
  { type: 'team',   label: 'Foto de Equipo' },
  ...Array.from({ length: 18 }, (_, i) => ({ type: 'player', label: `Jugador ${i + 1}` })),
]

function buildTeamStickers(teamId, teamName) {
  return STICKER_TYPES_20.map((sticker, index) => ({
    id: `${teamId}-${index + 1}`,
    localId: index + 1,
    type: sticker.type,
    label: sticker.label,
    teamId,
    teamName,
  }))
}

// ─────────────────────────────────────────────────────────────────────────
//  SECCIONES DE EQUIPOS
// ─────────────────────────────────────────────────────────────────────────
export const TEAMS_MAP = {}

TEAMS_RAW.forEach((team) => {
  const conf    = CONFEDERATIONS[team.confederation]
  const section = {
    ...team,
    subtitle:  `${team.name}`,
    icon:      'shield',
    color:     conf.color,
    bg:        conf.bg,
    stickers:  buildTeamStickers(team.id, team.name),
  }
  TEAMS_MAP[team.id] = section
})

// ─────────────────────────────────────────────────────────────────────────
//  SECCIONES DE GRUPOS (para la vista principal)
// ─────────────────────────────────────────────────────────────────────────
const GROUP_COLORS = {
  A: '#1565C0', B: '#C62828', C: '#2E7D32', D: '#6A1B9A',
  E: '#F57F17', F: '#00695C', G: '#AD1457', H: '#0277BD',
  I: '#4E342E', J: '#37474F', K: '#558B2F', L: '#4527A0',
}

export const GROUP_SECTIONS = Object.entries(WC_GROUPS).map(([key, group]) => ({
  id:    `group-${key}`,
  key,
  label: group.label,
  color: GROUP_COLORS[key],
  teams: group.teams.map(id => TEAMS_MAP[id]).filter(Boolean),
}))

// ─────────────────────────────────────────────────────────────────────────
//  ÁLBUM COMPLETO (plano, para búsquedas)
// ─────────────────────────────────────────────────────────────────────────
export const TEAMS_SECTIONS = TEAMS_RAW.map(t => TEAMS_MAP[t.id])
export const ALBUM_SECTIONS  = [ESPECIALES_SECTION, ...TEAMS_SECTIONS]

/** Mapa plano stickerID → info */
export const STICKERS_MAP = (() => {
  const map = {}
  for (const section of ALBUM_SECTIONS) {
    for (const sticker of section.stickers) {
      map[sticker.id] = { ...sticker, sectionId: section.id, sectionName: section.name }
    }
  }
  return map
})()

export const TOTAL_STICKERS = 20 + (48 * 20) // 20 especiales + 48 equipos × 20 figuritas = 980

