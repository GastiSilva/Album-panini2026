/**
 * Album data model for FIFA World Cup 2026 Panini
 *
 * Structure:
 * - Special section: 20 stickers (IDs 1-20)
 * - 48 national teams × 20 stickers each = 960 stickers (IDs 21-980)
 *   Each team: 1 Badge + 1 Team Photo + 18 Players
 *
 * Total: 980 stickers
 *
 * Firestore schema (optimized):
 * /users/{userId} {
 *   displayName: string,
 *   photoURL: string,
 *   updatedAt: timestamp,
 *   stickers: {
 *     [stickerId]: 0 | 1 | 2 | 3 | ...
 *     // 0 = falta (missing) — NOT stored (default)
 *     // 1 = tengo (have, pasted)
 *     // 2+ = repetida x(n-1) (repeated)
 *   }
 * }
 * Only stickers with state > 0 are stored to minimize reads/writes.
 */

// ─── Special Section (20 stickers: IDs 1–20) ────────────────────────────────
const specialStickers = [
  { id: 1,  label: 'FWC 1',  type: 'especial', desc: 'Copa del Mundo' },
  { id: 2,  label: 'FWC 2',  type: 'especial', desc: 'Copa del Mundo' },
  { id: 3,  label: 'FWC 3',  type: 'especial', desc: 'Trofeo' },
  { id: 4,  label: 'FWC 4',  type: 'especial', desc: 'Sede USA' },
  { id: 5,  label: 'FWC 5',  type: 'especial', desc: 'Sede México' },
  { id: 6,  label: 'FWC 6',  type: 'especial', desc: 'Sede Canadá' },
  { id: 7,  label: 'FWC 7',  type: 'especial', desc: 'Pelota Oficial' },
  { id: 8,  label: 'FWC 8',  type: 'especial', desc: 'Pelota Oficial' },
  { id: 9,  label: 'FWC 9',  type: 'especial', desc: 'Mascota' },
  { id: 10, label: 'FWC 10', type: 'especial', desc: 'Mascota' },
  { id: 11, label: 'FWC 11', type: 'especial', desc: 'Logo Oficial' },
  { id: 12, label: 'FWC 12', type: 'especial', desc: 'Logo Oficial' },
  { id: 13, label: 'FWC 13', type: 'especial', desc: 'Logo Brillo' },
  { id: 14, label: 'FWC 14', type: 'especial', desc: 'Estadio AT&T' },
  { id: 15, label: 'FWC 15', type: 'especial', desc: 'Estadio Azteca' },
  { id: 16, label: 'FWC 16', type: 'especial', desc: 'Estadio MetLife' },
  { id: 17, label: 'FWC 17', type: 'especial', desc: 'Estadio BC Place' },
  { id: 18, label: 'FWC 18', type: 'especial', desc: 'Estadio Levi\'s' },
  { id: 19, label: 'FWC 19', type: 'especial', desc: 'Estadio Rose Bowl' },
  { id: 20, label: 'FWC 20', type: 'especial', desc: 'Estadio Lincoln Financial' }
]

// ─── 48 National Teams ───────────────────────────────────────────────────────
const TEAMS = [
  // CONMEBOL (6)
  { code: 'ARG', name: 'Argentina',   flag: '🇦🇷', confederation: 'CONMEBOL' },
  { code: 'BRA', name: 'Brasil',      flag: '🇧🇷', confederation: 'CONMEBOL' },
  { code: 'URU', name: 'Uruguay',     flag: '🇺🇾', confederation: 'CONMEBOL' },
  { code: 'COL', name: 'Colombia',    flag: '🇨🇴', confederation: 'CONMEBOL' },
  { code: 'ECU', name: 'Ecuador',     flag: '🇪🇨', confederation: 'CONMEBOL' },
  { code: 'PAR', name: 'Paraguay',    flag: '🇵🇾', confederation: 'CONMEBOL' },

  // UEFA (16)
  { code: 'GER', name: 'Alemania',    flag: '🇩🇪', confederation: 'UEFA' },
  { code: 'FRA', name: 'Francia',     flag: '🇫🇷', confederation: 'UEFA' },
  { code: 'ESP', name: 'España',      flag: '🇪🇸', confederation: 'UEFA' },
  { code: 'ENG', name: 'Inglaterra',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { code: 'POR', name: 'Portugal',    flag: '🇵🇹', confederation: 'UEFA' },
  { code: 'NED', name: 'Países Bajos',flag: '🇳🇱', confederation: 'UEFA' },
  { code: 'BEL', name: 'Bélgica',     flag: '🇧🇪', confederation: 'UEFA' },
  { code: 'ITA', name: 'Italia',      flag: '🇮🇹', confederation: 'UEFA' },
  { code: 'CRO', name: 'Croacia',     flag: '🇭🇷', confederation: 'UEFA' },
  { code: 'SUI', name: 'Suiza',       flag: '🇨🇭', confederation: 'UEFA' },
  { code: 'DEN', name: 'Dinamarca',   flag: '🇩🇰', confederation: 'UEFA' },
  { code: 'AUT', name: 'Austria',     flag: '🇦🇹', confederation: 'UEFA' },
  { code: 'SCO', name: 'Escocia',     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA' },
  { code: 'HUN', name: 'Hungría',     flag: '🇭🇺', confederation: 'UEFA' },
  { code: 'SRB', name: 'Serbia',      flag: '🇷🇸', confederation: 'UEFA' },
  { code: 'TUR', name: 'Turquía',     flag: '🇹🇷', confederation: 'UEFA' },

  // CONCACAF (6)
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', confederation: 'CONCACAF' },
  { code: 'MEX', name: 'México',      flag: '🇲🇽', confederation: 'CONCACAF' },
  { code: 'CAN', name: 'Canadá',      flag: '🇨🇦', confederation: 'CONCACAF' },
  { code: 'CRC', name: 'Costa Rica',  flag: '🇨🇷', confederation: 'CONCACAF' },
  { code: 'JAM', name: 'Jamaica',     flag: '🇯🇲', confederation: 'CONCACAF' },
  { code: 'PAN', name: 'Panamá',      flag: '🇵🇦', confederation: 'CONCACAF' },

  // CAF (9)
  { code: 'MAR', name: 'Marruecos',   flag: '🇲🇦', confederation: 'CAF' },
  { code: 'SEN', name: 'Senegal',     flag: '🇸🇳', confederation: 'CAF' },
  { code: 'EGY', name: 'Egipto',      flag: '🇪🇬', confederation: 'CAF' },
  { code: 'NGA', name: 'Nigeria',     flag: '🇳🇬', confederation: 'CAF' },
  { code: 'CMR', name: 'Camerún',     flag: '🇨🇲', confederation: 'CAF' },
  { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', confederation: 'CAF' },
  { code: 'MLI', name: 'Malí',        flag: '🇲🇱', confederation: 'CAF' },
  { code: 'RSA', name: 'Sudáfrica',   flag: '🇿🇦', confederation: 'CAF' },
  { code: 'TUN', name: 'Túnez',       flag: '🇹🇳', confederation: 'CAF' },

  // AFC (8)
  { code: 'JPN', name: 'Japón',       flag: '🇯🇵', confederation: 'AFC' },
  { code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', confederation: 'AFC' },
  { code: 'AUS', name: 'Australia',   flag: '🇦🇺', confederation: 'AFC' },
  { code: 'IRN', name: 'Irán',        flag: '🇮🇷', confederation: 'AFC' },
  { code: 'SAU', name: 'Arabia Saudita', flag: '🇸🇦', confederation: 'AFC' },
  { code: 'QAT', name: 'Qatar',       flag: '🇶🇦', confederation: 'AFC' },
  { code: 'UZB', name: 'Uzbekistán',  flag: '🇺🇿', confederation: 'AFC' },
  { code: 'IRQ', name: 'Irak',        flag: '🇮🇶', confederation: 'AFC' },

  // OFC (1)
  { code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', confederation: 'OFC' },

  // Repechaje / Intercontinental (2 — cupos restantes)
  { code: 'VEN', name: 'Venezuela',   flag: '🇻🇪', confederation: 'CONMEBOL' },
  { code: 'CHI', name: 'Chile',       flag: '🇨🇱', confederation: 'CONMEBOL' }
]

/**
 * Generate 20 stickers for a team:
 * - 1 Badge (escudo)
 * - 1 Team Photo (foto del equipo)
 * - 18 Players (jugadores)
 */
function generateTeamStickers (team, startId) {
  const stickers = []
  // Escudo
  stickers.push({ id: startId, label: `${team.code}-1`, type: 'escudo', desc: `Escudo ${team.name}`, teamCode: team.code })
  // Foto del Equipo
  stickers.push({ id: startId + 1, label: `${team.code}-2`, type: 'foto', desc: `Foto ${team.name}`, teamCode: team.code })
  // 18 Jugadores
  for (let i = 1; i <= 18; i++) {
    stickers.push({
      id: startId + 1 + i,
      label: `${team.code}-${i + 2}`,
      type: 'jugador',
      desc: `Jugador ${i}`,
      teamCode: team.code
    })
  }
  return stickers // 20 stickers total
}

// ─── Build full sections array ────────────────────────────────────────────────
let nextId = 21 // special section ends at 20

const teamSections = TEAMS.map((team) => {
  const stickers = generateTeamStickers(team, nextId)
  nextId += 20
  return {
    id: team.code,
    name: team.name,
    flag: team.flag,
    confederation: team.confederation,
    stickers
  }
})

export const albumSections = [
  {
    id: 'FWC',
    name: 'Especiales',
    flag: '🏆',
    confederation: 'ESPECIAL',
    stickers: specialStickers
  },
  ...teamSections
]

export const totalStickers = albumSections.reduce((sum, section) => sum + section.stickers.length, 0)

/** Flat map of all stickers by ID for O(1) lookup */
export const stickersById = Object.fromEntries(
  albumSections.flatMap(s => s.stickers).map(s => [s.id, s])
)

export default albumSections
