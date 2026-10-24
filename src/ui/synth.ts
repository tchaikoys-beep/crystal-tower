// 合成屋の画面
import { h, btn, toast } from './dom';
import type { GameState } from '../core/state';
import type { ItemInstance } from '../core/types';
import * as G from '../core/game';
import { ITEMS } from '../data/items';
import { AFFIXES } from '../data/affixes';
import { tierOf } from '../core/formulas';

export interface SynthCtx { s: GameState; itemLabel: (it: ItemInstance) => HTMLElement; render: () => void; back: () => void; shell: (o: { title: string; back?: () => void; tabs?: HTMLElement[]; content: HTMLElement[] }) => HTMLElement }
const state: { tab: string; from: string | null; affix: number | null; to: string | null } = { tab: '移植', from: null, affix: null, to: null };

export function synthScreen(ctx: SynthCtx): HTMLElement {
  const { s } = ctx;
  const tabs = ['移植', 'リロール', 'ランク上げ', '封印解除', '分解'];
  const costText = (c: { gil: number; mats: Record<string, number> }) => `${c.gil}G＋${Object.entries(c.mats).map(([k, v]) => `${ITEMS[k].name}×${v}`).join('、')}`;
  const bagText = h('div', { class: 'dim', style: 'font-size:11px' }, `所持：${['mithril', 'magicite', 'orichalcum', 'phoenix_feather'].map(k => `${ITEMS[k].name}×${s.bag[k] ?? 0}`).join('　')}`);
  const equipItems = s.inventory.filter(it => ITEMS[it.base].kind !== 'consumable');
  let body: HTMLElement;
  const row = (it: ItemInstance, action: HTMLElement | null, extra?: HTMLElement | null) => h('div', { class: 'item', style: 'flex-wrap:wrap' }, ctx.itemLabel(it), G.isEquipped(s, it.uid) ? h('span', { class: 'pill' }, G.isEquipped(s, it.uid)) : null, extra ?? null, action);
  if (state.tab === '移植') {
    const from = s.inventory.find(i => i.uid === state.from), to = s.inventory.find(i => i.uid === state.to);
    if (!from) {
      body = h('div', { class: 'win' }, h('h2', {}, '1. 付加を取り出す装備（消滅する）'), h('div', { class: 'list' }, ...equipItems.filter(i => i.affixes.length).map(it => row(it, btn('選ぶ', () => { state.from = it.uid; state.affix = null; state.to = null; ctx.render(); }, 'small')))));
    } else if (state.affix === null) {
      body = h('div', { class: 'win' }, h('h2', {}, '2. 移す付加を選ぶ'), ctx.itemLabel(from), h('div', { class: 'list' }, ...from.affixes.map((a, i) => h('div', { class: 'item' }, h('span', { class: 'grow' }, `${AFFIXES[a.id].name}：${AFFIXES[a.id].desc(a.value)}`), btn('これ', () => { state.affix = i; ctx.render(); }, 'small')))), btn('やり直す', () => { state.from = null; ctx.render(); }, 'small'));
    } else if (!to) {
      const roll = from.affixes[state.affix];
      const cands = equipItems.filter(i => i.uid !== from.uid && AFFIXES[roll.id].kinds.includes(ITEMS[i.base].kind) && !i.affixes.some(x => x.id === roll.id));
      body = h('div', { class: 'win' }, h('h2', {}, `3. 「${AFFIXES[roll.id].name}」を移す先`), h('div', { class: 'list' }, ...cands.map(it => row(it, btn('ここへ', () => { state.to = it.uid; ctx.render(); }, 'small'), h('span', { class: 'dim', style: 'font-size:11px' }, costText(G.synthCost('transplant', it)))))), btn('やり直す', () => { state.from = null; state.affix = null; ctx.render(); }, 'small'));
    } else {
      const max = { normal: 1, mithril: 1, crystal: 2, legend: 3, ultima: 4 }[to.rarity];
      const full = to.affixes.length >= max;
      const doIt = (rep: number | null) => { const e = G.transplant(s, from.uid, state.affix!, to.uid, rep); toast(e ?? '移植した'); if (!e) { state.from = null; state.affix = null; state.to = null; } ctx.render(); };
      body = h('div', { class: 'win' }, h('h2', {}, '4. 確認'), h('div', {}, '移す付加：', h('b', {}, AFFIXES[from.affixes[state.affix].id].desc(from.affixes[state.affix].value))), h('div', {}, '移す先：'), ctx.itemLabel(to), h('div', { class: 'dim' }, `費用：${costText(G.synthCost('transplant', to))}`),
        full ? h('div', {}, h('div', { class: 'bad' }, `付加枠（${max}）が埋まっている。置き換える付加を選ぶ`), ...to.affixes.map((a, i) => btn(`${AFFIXES[a.id].desc(a.value)} を置き換え`, () => doIt(i), 'small'))) : btn('移植する', () => doIt(null), 'primary'),
        btn('やり直す', () => { state.from = null; state.affix = null; state.to = null; ctx.render(); }, 'small'));
    }
  } else if (state.tab === 'リロール') {
    body = h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, '付加を同じ数・同じティアで振り直す'), h('div', { class: 'list' }, ...equipItems.filter(i => i.affixes.length).map(it => row(it, btn(costText(G.synthCost('reroll', it)), () => { const e = G.reroll(s, it.uid); toast(e ?? '振り直した'); ctx.render(); }, 'small')))));
  } else if (state.tab === 'ランク上げ') {
    body = h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, `付加ティアを+1（上限：到達階のT${tierOf(s.maxFloorEver)}）。基礎値と付加値が伸びる`), h('div', { class: 'list' }, ...equipItems.filter(i => i.tier < tierOf(s.maxFloorEver)).map(it => row(it, btn(costText(G.synthCost('rankup', it)), () => { const e = G.rankUp(s, it.uid); toast(e ?? `T${it.tier}になった`); ctx.render(); }, 'small')))));
  } else if (state.tab === '封印解除') {
    body = h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, '装備Lv制限を半分にする。転生直後に強い装備を使うために'), h('div', { class: 'list' }, ...equipItems.filter(i => !i.unsealed && i.tier > 1).map(it => row(it, btn(costText(G.synthCost('unseal', it)), () => { const e = G.unseal(s, it.uid); toast(e ?? '封印を解除した'); ctx.render(); }, 'small')))), !equipItems.some(i => !i.unsealed && i.tier > 1) ? h('div', { class: 'dim' }, 'T2以上の装備が対象（250階から出る）') : null);
  } else {
    body = h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, '装備を素材に。レアリティが高いほど魔晶石・オリハルコンが出る'), h('div', { class: 'list' }, ...equipItems.filter(i => !G.isEquipped(s, i.uid)).map(it => row(it, btn('分解', () => { const r = G.dismantle(s, it.uid); toast(r ?? '失敗'); ctx.render(); }, 'small')))));
  }
  return ctx.shell({ title: '合成屋', back: ctx.back, tabs: tabs.map(t => btn(t, () => { state.tab = t; ctx.render(); }, t === state.tab ? 'sel' : '')), content: [h('div', { class: 'win tight' }, bagText), body] });
}
