# 🏆 Álbum Panini Mundial 2026

PWA para llevar el control del álbum de figuritas del Mundial FIFA 2026. Conectada a Firebase (Firestore) para sincronizar en tiempo real con tus amigos y ver qué figuritas repetidas tienen para intercambiar.

## ✨ Características

- **980 figuritas** organizadas en secciones: Especiales + 48 selecciones nacionales
- **3 estados por figurita**: Falta → Tengo → Repetida (×1, ×2, ×3…)
- **Sincronización en tiempo real** con Firebase Firestore
- **PWA instalable** en móvil y desktop
- **Intercambios**: Visualizá qué figuritas repetidas podés darle a cada amigo
- **Filtros**: Por confederación (UEFA, CONMEBOL, CAF, AFC, CONCACAF, OFC) y búsqueda por nombre

## 🚀 Instalación

### Prerequisitos

- Node.js ≥ 16
- npm ≥ 6

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Build para producción (PWA)
npm run build:pwa
```

## 🔥 Configuración de Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear un nuevo proyecto
3. Activar **Firestore Database**
4. Ir a Configuración del proyecto → Tus apps → App web → Configuración del SDK
5. Copiar los valores en el archivo `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Reglas de Firestore recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;          // Amigos pueden ver tu álbum
      allow write: if request.auth == null ||
                      request.auth.uid == userId; // Solo vos podés editar
    }
  }
}
```

## 📁 Estructura del proyecto

```
src/
├── boot/
│   └── firebase.js          # Inicialización de Firebase
├── components/
│   └── StickerCard.vue      # Componente de figurita (3 estados)
├── composables/
│   └── useFirebaseAlbum.js  # Lógica de Firestore + estados
├── data/
│   └── albumData.js         # Modelo de datos: 980 figuritas
├── firebase/
│   ├── config.js            # Configuración de Firebase
│   └── index.js             # Instancia de Firestore/Auth
├── layouts/
│   └── MainLayout.vue       # Layout con drawer y bottom nav
├── pages/
│   ├── AlbumView.vue        # Vista principal del álbum
│   ├── ExchangeView.vue     # Vista de intercambios
│   └── SetupView.vue        # Ingreso de nombre de usuario
├── router/
│   ├── index.js             # Router con guards de navegación
│   └── routes.js            # Definición de rutas
└── stores/
    └── userStore.js         # Store Pinia para usuario
```

## 🗄️ Esquema de Firestore

```
/users/{userId}
  displayName: string
  updatedAt:   timestamp
  stickers: {
    "21": 1,    // tengo (pegada)
    "35": 2,    // repetida ×1
    "36": 3,    // repetida ×2
    ...
  }
```

Solo se guardan las figuritas con estado > 0, minimizando lecturas y escrituras.

## 🎮 Uso

1. Al abrir la app, ingresá tu nombre
2. Navegá por las secciones del álbum
3. **Click** en una figurita para cambiar su estado:
   - ⬜ **Gris** = Falta
   - ✅ **Verde** = Tengo
   - 🔶 **Naranja** = Repetida (con contador)
4. En la sección **Intercambios**, buscá qué figuritas podés darle a tus amigos

## 🛠️ Tecnologías

- [Vue 3](https://vuejs.org/) con Composition API
- [Quasar Framework](https://quasar.dev/) v2
- [Firebase](https://firebase.google.com/) (Firestore)
- [Pinia](https://pinia.vuejs.org/) para state management
- [Vite](https://vitejs.dev/) como bundler
