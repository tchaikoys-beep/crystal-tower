// スプライト登録と読み込み。public/sprites/ にあるものは絵で、ないものは四角で描く
import { SPRITE_FILES } from './spriteList';
import { ITEMS } from '../data/items';
const has = new Set(SPRITE_FILES);
const cache = new Map<string, HTMLImageElement>();
function load(name: string | null): HTMLImageElement | null {
  if (!name || !has.has(name)) return null;
  let img = cache.get(name);
  if (!img) { img = new Image(); img.src = './sprites/' + name + '.png'; cache.set(name, img); }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
export type HeroPose = 'idle' | 'attack' | 'cast' | 'hurt' | 'win';
export function registered(name: string) { return has.has(name); }
export function heroSprite(id: string, pose: HeroPose = 'idle') { return load(`hero_${id}_${pose}`) ?? load(`hero_${id}_idle`); }
export function heroRegistered(id: string) { return has.has(`hero_${id}_idle`); }
export function enemyRegistered(id0: string) { const id = ALIAS[id0] ?? id0; return has.has(`enemy_${id}`) || has.has(`boss_${id}`); }
const ALIAS: Record<string, string> = { titan_boss: 'titan' };
export function enemySprite(id0: string, boss: boolean) { const id = ALIAS[id0] ?? id0; return (boss ? load(`boss_${id}`) : null) ?? load(`enemy_${id}`) ?? load(`boss_${id}`); }
export function faceSprite(id: string) { return load(`face_${id}`); }
export function bgSprite(area: number) { return load(`bg_area${area}`); }
export function iconName(itemId: string): string | null {
  if (has.has('icon_' + itemId)) return 'icon_' + itemId;
  const b = ITEMS[itemId]; if (!b) return null;
  if (b.kind === 'tome') return has.has('icon_tome') ? 'icon_tome' : null;
  if (b.kind === 'material') return has.has('icon_material') ? 'icon_material' : null;
  if (b.kind === 'consumable') return has.has('icon_consumable') ? 'icon_consumable' : null;
  if (b.kind === 'weapon' && b.wtype) { const m: Record<string, string> = { sword: 'icon_sword', katana: 'icon_katana', dagger: 'icon_dagger', spear: 'icon_spear', staff: 'icon_staff', rod: 'icon_rod', axe: 'icon_axe', bow: 'icon_bow', fist: 'icon_fist', whip: 'icon_whip' }; const n = m[b.wtype]; return n && has.has(n) ? n : null; }
  const k: Record<string, string> = { shield: 'icon_shield', head: 'icon_helm', body: 'icon_armor', acc: 'icon_ring' };
  const n = k[b.kind]; return n && has.has(n) ? n : null;
}
export function iconPath(itemId: string): string | undefined { const n = iconName(itemId); return n ? `./sprites/${n}.png` : undefined; }
export function iconEl(itemId: string, size = 24): HTMLElement | null {
  const p = iconPath(itemId); if (!p) return null;
  const img = document.createElement('img'); img.src = p; img.style.cssText = `width:${size}px;height:${size}px;image-rendering:pixelated;flex:none`; return img;
}
export function preloadAll() { for (const n of SPRITE_FILES) load(n); }
export function faceEl(heroId: string, size = 36): HTMLElement | null {
  if (!has.has('face_' + heroId)) return null;
  const img = document.createElement('img'); img.src = `./sprites/face_${heroId}.png`; img.style.cssText = `width:${size}px;height:${size}px;image-rendering:pixelated;flex:none;border:1px solid #6a7fc5;border-radius:3px;background:#0a1030`; return img;
}
export function monsterEl(speciesId0: string, size = 36): HTMLElement | null {
  const speciesId = ALIAS[speciesId0] ?? speciesId0;
  const n = has.has('enemy_' + speciesId) ? 'enemy_' + speciesId : has.has('boss_' + speciesId) ? 'boss_' + speciesId : null;
  if (!n) return null;
  const img = document.createElement('img'); img.src = `./sprites/${n}.png`; img.style.cssText = `width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;flex:none;transform:scaleX(-1)`; return img;
}
export function statusIcon(st: string) { return load('st_' + st); }
export function elementIconEl(el: string, size = 14): HTMLElement | null {
  if (!has.has('el_' + el)) return null;
  const img = document.createElement('img'); img.src = `./sprites/el_${el}.png`; img.style.cssText = `width:${size}px;height:${size}px;image-rendering:pixelated;vertical-align:middle`; img.title = el; return img;
}
export function statusIconEl(st: string, size = 14): HTMLElement | null {
  if (!has.has('st_' + st)) return null;
  const img = document.createElement('img'); img.src = `./sprites/st_${st}.png`; img.style.cssText = `width:${size}px;height:${size}px;image-rendering:pixelated;vertical-align:middle;margin-right:2px`; return img;
}
