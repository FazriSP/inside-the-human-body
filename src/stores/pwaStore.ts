import { create } from 'zustand';

export interface PwaState {
  isOnline: boolean;
  swRegistered: boolean;
  updateAvailable: boolean;
  offlineLiteReady: boolean;
  cachingLitePack: boolean;

  setOnline: (online: boolean) => void;
  setSwRegistered: (registered: boolean) => void;
  setUpdateAvailable: (available: boolean) => void;
  setOfflineLiteReady: (ready: boolean) => void;
  applySwUpdate: () => void;
  precacheLiteModelsOffline: () => void;
}

let waitingServiceWorker: ServiceWorker | null = null;
let listenersInitialized = false;

export const usePwaStore = create<PwaState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  swRegistered: false,
  updateAvailable: false,
  offlineLiteReady: false,
  cachingLitePack: false,

  setOnline: (online) => set({ isOnline: online }),
  setSwRegistered: (registered) => set({ swRegistered: registered }),
  setUpdateAvailable: (available) => set({ updateAvailable: available }),
  setOfflineLiteReady: (ready) =>
    set({ offlineLiteReady: ready, cachingLitePack: false }),

  applySwUpdate: () => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      set({ updateAvailable: false });
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  },

  precacheLiteModelsOffline: () => {
    if (
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !navigator.serviceWorker.controller
    ) {
      return;
    }
    set({ cachingLitePack: true });
    navigator.serviceWorker.controller.postMessage({
      type: 'PRECACHE_LITE_MODELS',
    });
  },
}));

/**
 * Registers the PWA Service Worker (/sw.js) and binds browser online/offline
 * and Service Worker update listeners once at application startup.
 */
export function initPwaServiceWorker() {
  if (listenersInitialized || typeof window === 'undefined') return;
  listenersInitialized = true;

  const store = usePwaStore.getState();

  window.addEventListener('online', () => store.setOnline(true));
  window.addEventListener('offline', () => store.setOnline(false));

  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LITE_MODELS_PRECACHED') {
      usePwaStore.getState().setOfflineLiteReady(true);
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        usePwaStore.getState().setSwRegistered(true);

        if (registration.waiting) {
          waitingServiceWorker = registration.waiting;
          usePwaStore.getState().setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              waitingServiceWorker = installing;
              usePwaStore.getState().setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {
        // Ignore service worker registration errors in unsupported contexts
      });
  });
}
