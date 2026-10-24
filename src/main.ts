import { App } from './ui/app';
import { preloadAll } from './ui/sprites';
preloadAll();
new App(document.getElementById('app')!);
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !location.hostname.includes('claude')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
