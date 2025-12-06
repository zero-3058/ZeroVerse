import WebApp from '@twa-dev/sdk';

export const telegram = WebApp;

// This ensures Telegram WebApp is fully expanded and ready
export function initTelegram() {
  telegram.ready();
  telegram.expand();
}
