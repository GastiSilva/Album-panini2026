# 📘 Álbum Panini – FIFA World Cup 2026

PWA para llevar el control del álbum de figuritas del **Mundial 2026**, sincronizada en tiempo real con Firebase Firestore.

## ✨ Características
- 🃏 **980 figuritas** — Especiales + 48 selecciones × 20 figuritas
- 🔄 **3 estados**: Falta / Tengo / Repetida (tap cicla, long press resetea)
- 📡 **Sincronización en tiempo real** Firestore + soporte offline
- 👫 **Vista de Intercambios** con amigos por UID
- 🌙 **Modo oscuro** | 📱 **Mobile-first PWA**

## 🚀 Inicio rápido
```bash
npm install -g @quasar/cli
npm install
cp .env.example .env.local   # Rellena tus credenciales Firebase
quasar dev
```

## 🗄️ Esquema Firestore
```
users/{uid} → { displayName, photoURL, owned: Map<id, count> }
```
`owned` vacío = Falta · `count=1` = Tengo · `count>1` = Repetida

## 📁 Estructura
```
src/
├── boot/firebase.js
├── components/StickerCard.vue
├── composables/useFirebaseAlbum.js
├── data/albumData.js
├── firebase/config.js
├── layouts/MainLayout.vue
├── pages/ AlbumView | ExchangeView | LoginPage
└── stores/authStore.js
```
