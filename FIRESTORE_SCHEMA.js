/**
 * ESQUEMA DE FIRESTORE — Álbum Mundial 2026
 * ══════════════════════════════════════════════════════════════════════════
 *
 * COLECCIÓN: users
 * ────────────────────────────────────────────────────────────────────────
 * Documento: users/{uid}
 * {
 *   displayName : string,          // Nombre del usuario
 *   photoURL    : string | null,   // URL de foto de perfil
 *   email       : string | null,   // Email (null si anónimo)
 *   createdAt   : Timestamp,       // Fecha de registro
 *   updatedAt   : Timestamp,       // Última modificación
 *
 *   owned: {                       // Map<stickerIdString, count: number>
 *     "1"  : 1,                    // Tengo (pegada)
 *     "21" : 1,                    // Tengo (pegada)
 *     "45" : 3,                    // Tengo 1 pegada + 2 repetidas → total 3
 *     "980": 2,                    // Tengo 1 pegada + 1 repetida  → total 2
 *   }
 * }
 *
 * ══════════════════════════════════════════════════════════════════════════
 * DECISIONES DE DISEÑO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * 1. UN ÚNICO DOCUMENTO por usuario
 *    ✔ Solo 1 lectura para cargar las 980 figuritas
 *    ✔ onSnapshot → actualizaciones en tiempo real sin múltiples listeners
 *    ✔ Firestore cobra por documento leído, no por campos
 *
 * 2. SOLO SE GUARDAN LAS FIGURITAS POSEÍDAS (count ≥ 1)
 *    ✔ Si owned["id"] no existe → falta (no se almacena)
 *    ✔ owned["id"] = 1          → tengo (pegada)
 *    ✔ owned["id"] = N (N > 1)  → tengo + (N-1) repetidas
 *    ✔ Al quitar una figurita se usa deleteField() → ahorra espacio
 *    ✔ Evita guardar 980 campos con valor 0
 *
 * 3. ESCRITURAS EN BATCH con DEBOUNCE (300 ms)
 *    ✔ Múltiples clicks rápidos → 1 sola escritura a Firestore
 *    ✔ Usa updateDoc con notación de punto: { "owned.45": 3 }
 *    ✔ No sobreescribe campos no relacionados
 *
 * 4. OPTIMISTIC UPDATES
 *    ✔ La UI responde al instante
 *    ✔ Si Firestore falla → revert automático + Notify
 *
 * 5. OFFLINE SUPPORT
 *    ✔ enableIndexedDbPersistence → funciona sin conexión
 *    ✔ Al recuperar internet, Firestore sincroniza automáticamente
 *
 * ══════════════════════════════════════════════════════════════════════════
 * REGLAS DE SEGURIDAD (firestore.rules)
 * ══════════════════════════════════════════════════════════════════════════
 */

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Un usuario solo puede leer/escribir su propio documento
    match /users/{userId} {
      allow read:  if request.auth != null;      // Amigos pueden leer para comparar
      allow write: if request.auth.uid == userId; // Solo el dueño escribe

      // Validaciones opcionales para mayor seguridad
      allow update: if request.auth.uid == userId
        && request.resource.data.owned is map
        && request.resource.data.owned.size() <= 980;
    }
  }
}
*/

/**
 * EJEMPLO DE DOCUMENTO REAL (JSON)
 * ════════════════════════════════
 * users/abc123XYZ {
 *   "displayName": "Matías",
 *   "photoURL": null,
 *   "email": null,
 *   "createdAt": Timestamp(2026-05-01),
 *   "updatedAt": Timestamp(2026-05-01),
 *   "owned": {
 *     "1":   1,   // Portada Álbum - TENGO
 *     "2":   1,   // Copa del Mundo - TENGO
 *     "3":   3,   // Mascota - TENGO + 2 REPETIDAS
 *     "21":  1,   // Escudo Alemania - TENGO
 *     "22":  1,   // Foto Equipo Alemania - TENGO
 *     "23":  2,   // Jugador 1 Alemania - TENGO + 1 REPETIDA
 *     "980": 1    // Jugador 18 Uzbekistán - TENGO
 *   }
 * }
 *
 * CONSULTA PARA VER REPETIDAS DE TODOS LOS AMIGOS (no implementada,
 * pero el esquema la permite eficientemente):
 *
 *   const q = query(collection(db, 'users'))
 *   // Descarga un documento por amigo → máximo 1 lectura/usuario
 */

export {}
