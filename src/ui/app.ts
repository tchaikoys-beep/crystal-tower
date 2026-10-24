// 画面遷移とメニュー類
import { h, btn, bar, toast, selectEl, type Child } from './dom';
import { BattleView } from './battleView';
import { synthScreen } from './synth';
import { masteryLevel, masteryNext, MAX_MASTERY } from '../core/formulas';
import { WEAPON_JP, type WeaponType } from '../core/types';
import { tomeSpell } from '../data/items';
import { iconEl, faceEl, monsterEl, elementIconEl } from './sprites';
import type { GameState, HeroState, Gambit, FloorEvent } from '../core/state';
import { GAMBIT_CONDS } from '../core/state';
import * as G from '../core/game';
import { save, load, clear, exportSave, importSave } from '../core/save';
import { buildHero, buildAlly, itemOf, canEquip, slotForKind, boardValue, isAlive, gradeMark } from '../core/entity';
import type { Combatant } from '../core/entity';
import { canBuy, buyNode, startFloorOptions, computeTP, trialMult } from '../core/rebirth';
import { expToNext, abpToNext, equipLevelReq, MAX_JOB_LEVEL } from '../core/formulas';
import { SLOTS, SLOT_JP, RARITY_JP, STAT_KEYS, type Slot, type ItemInstance } from '../core/types';
import { HEROES, JOBS, SUPPORTS, COMMANDS, jobOfCommand } from '../data/jobs';
import { categorySkills, availableCategories } from '../core/entity';
import { ITEMS } from '../data/items';
import { AFFIXES, UNIQUES } from '../data/affixes';
import { MONSTERS, areaFor, LAW_TAG_JP, SUPER_BOSSES } from '../data/monsters';
import { SETS } from '../data/affixes';
import { activeSets } from '../core/entity';
import { lawSafeRow, gambitViolates } from '../core/lawhelp';
import { recommendGambits, describeGambit } from '../core/autogambit';
import { BOARD, BLESSINGS, TRIALS } from '../data/board';
import { SKILLS } from '../data/skills';
import type { Battle } from '../core/battle';

type Screen = 'title' | 'hub' | 'tower' | 'battle' | 'menu' | 'shop' | 'ranch' | 'rebirth' | 'records' | 'synth' | 'missions' | 'trials';
const ROLE_JP: Record<string, string> = { attacker: 'アタッカー：攻撃+25%・追撃10%', blocker: 'ブロッカー：HP+25%・防御+15%・自動でかばう', healer: 'ヒーラー：回復+30%・オートリジェネ・MP+30%', jammer: 'ジャマー：状態異常付与率2倍・素早さ+10%', support: 'サポーター：先制+20%・味方のドロップ率とEXP+10%' };
const STAT_JP: Record<string, string> = { hp: 'HP', mp: 'MP', str: 'ちから', vit: 'たいりょく', mag: 'まりょく', spr: 'せいしん', spd: 'すばやさ', luck: 'うん' };

export class App {
  root: HTMLElement;
  s: GameState | null = null;
  screen: Screen = 'title';
  battle: Battle | null = null;
  battleEvent: FloorEvent | null = null;
  view: BattleView | null = null;
  menuTab = '編成';
  menuHero = '';
  shopTab = '買う';
  rebirthTab = '転生';
  rebirthSel = { blessing: 'fire', trials: [] as string[], start: 1 };
  partyDraft: { party: string[]; reserve: string[] } | null = null;

  constructor(root: HTMLElement) { this.root = root; this.render(); }
  go(sc: Screen) { this.screen = sc; this.render(); }
  autosave() { if (this.s) save(this.s); }
  render() {
    if (this.s) this.root.classList.toggle('hand-left', this.s.settings.hand === 'left');
    if (this.view) { this.view.destroy(); this.view = null; }
    this.root.replaceChildren();
    if (this.screen !== 'battle') this.autosave();
    switch (this.screen) {
      case 'title': this.root.append(this.title()); break;
      case 'hub': this.root.append(this.hub()); break;
      case 'tower': this.root.append(this.tower()); break;
      case 'battle': this.root.append(this.battleScreen()); break;
      case 'menu': this.root.append(this.menu()); break;
      case 'shop': this.root.append(this.shop()); break;
      case 'ranch': this.root.append(this.ranch()); break;
      case 'rebirth': this.root.append(this.rebirth()); break;
      case 'records': this.root.append(this.records()); break;
      case 'missions': this.root.append(this.missions()); break;
      case 'trials': this.root.append(this.trials()); break;
      case 'synth': this.root.append(synthScreen({ s: this.s!, itemLabel: it => this.itemLabel(it), render: () => this.render(), back: () => this.go('hub'), shell: o => this.shell(o) })); break;
    }
    this.root.querySelector('.content')?.scrollTo(0, 0);
  }
  // ---------- タイトル
  title(): HTMLElement {
    const saved = load();
    if (saved) { try { (saved as any).run.underground ??= false; } catch { /* noop */ } }
    const pick = (id: string) => { this.s = G.newGame(id); toast(`${HEROES[id].name}で冒険を始める`); this.go('hub'); };
    return this.shell({ title: 'クリスタルタワー', actions: saved ? [btn(`つづきから（${saved.run.floor}階・転生${saved.rebirths}回）`, () => { this.s = saved; this.go(saved.run.floor === 1 && saved.run.eventIndex === 0 ? 'hub' : 'tower'); }, 'primary')] : [], content: [
      h('div', { class: 'win center' }, h('h1', {}, 'クリスタルタワー'), h('div', { class: 'dim' }, 'v1.6 ／ 片手で遊ぶ無限塔RPG')),
      h('div', { class: 'win' }, h('h2', {}, 'セーブデータ読み込み'), this.importBox()),
      h('div', { class: 'win push' }, h('h2', {}, 'はじめから：英雄を選ぶ'),
        h('div', { class: 'list' }, ...['bartz', 'terra', 'cloud'].map(id => {
          const d = HEROES[id];
          return h('div', { class: 'item' }, faceEl(id, 40), h('div', { class: 'grow' }, h('div', {}, `${d.name} `, h('span', { class: 'pill' }, d.title)), h('div', { class: 'dim' }, `固有ジョブ：${JOBS[d.innateJob].name}／リミット：${SKILLS[d.limit].name}`)), btn('選ぶ', () => pick(id), 'small'));
        }))),
    ] });
  }
  importBox(): HTMLElement {
    const ta = h('textarea', { rows: 3, placeholder: 'エクスポートした文字列を貼る' }) as HTMLTextAreaElement;
    return h('div', {}, ta, btn('読み込む', () => { const s = importSave(ta.value); if (!s) { toast('読み込めなかった'); return; } this.s = s; save(s); this.go('hub'); }, 'small'));
  }
  // 画面の共通骨格：上＝スクロールする内容、下＝親指で届く操作ドック（右利き既定）
  shell(o: { title: string; back?: () => void; tabs?: HTMLElement[]; nav?: HTMLElement[]; actions?: HTMLElement[]; content: Child[] }): HTMLElement {
    const s = this.s;
    const hdr = h('div', { class: 'hdr' }, h('b', { class: 'grow' }, o.title), s ? h('span', { class: 'dim' }, `${s.gil}G　転生${s.rebirths}　TP${s.tp}`) : null);
    const content = h('div', { class: 'content' }, hdr, ...o.content);
    const actions = [...(o.actions ?? [])];
    if (o.back) actions.push(btn('戻る', o.back, 'back'));
    const dock = h('div', { class: 'dock' },
      o.tabs?.length ? h('div', { class: 'dock-tabs' }, ...o.tabs) : null,
      h('div', { class: 'dock-row' }, h('div', { class: 'dock-nav' }, ...(o.nav ?? [])), h('div', { class: 'dock-actions' }, ...actions)));
    return h('div', { class: 'shell' }, content, dock);
  }
  tabBtns(tabs: string[], cur: string, set: (t: string) => void): HTMLElement[] { return tabs.map(t => btn(t, () => { set(t); this.render(); }, t === cur ? 'sel' : '')); }
  // 画面下から出る選択シート（ドックの上に重なる）
  sheet(title: string, body: Child[], onClose: () => void): HTMLElement {
    const el = h('div', { class: 'sheet' }, h('div', { class: 'sheet-box' }, h('h2', {}, title), ...body, h('div', { class: 'dock-row' }, h('div', { class: 'dock-nav' }), h('div', { class: 'dock-actions' }, btn('やめる', () => { el.remove(); onClose(); }, 'back')))));
    return el;
  }
  partyBars(): HTMLElement {
    const cs = G.partyCombatants(this.s!);
    return h('div', { class: 'status-row' }, ...cs.map(c => h('div', { class: 'member row' + (c.hp <= 0 ? ' dead' : ''), style: 'flex-wrap:nowrap' }, c.kind === 'hero' ? faceEl(c.spriteId, 34) : monsterEl(c.spriteId, 34), h('div', { class: 'grow' }, h('div', { class: 'row' }, h('span', { class: 'grow' }, c.name), h('span', { class: 'dim' }, `Lv${c.level} ${c.hp}/${c.stats.hp}`)), bar(c.hp / c.stats.hp), bar(c.mp / Math.max(1, c.stats.mp), 'mp')))));
  }
  // ---------- 拠点
  hub(): HTMLElement {
    const s = this.s!;
    const warps = s.run.warps.filter(w => w > 1).sort((a, b) => a - b);
    return this.shell({ title: 'クリスタルの間（1階）',
      nav: [btn('メニュー', () => this.go('menu'), 'small'), btn('記録・設定', () => this.go('records'), 'small')],
      actions: [
        btn('塔へ登る（1階から）', () => { G.fullRestore(s); if (s.run.floor !== 1) G.warpTo(s, 1); this.go('tower'); }, 'primary'),
        btn('ワープ' + (warps.length ? `（〜${warps[warps.length - 1]}階）` : ''), () => this.warpDialog(), '', !warps.length),
        G.undergroundUnlocked(s) ? btn(`裏タワー（地下${s.maxDepthEver}階）`, () => { G.fullRestore(s); G.enterUnderground(s, 1); this.go('tower'); }, 'bad') : null,
      ].filter(Boolean) as HTMLElement[],
      content: [
        h('div', { class: 'win' }, h('div', { class: 'dim' }, `最高到達 ${s.maxFloorEver}階 ／ 今周の最高 ${s.run.maxFloor}階 ／ 転生ポイント見込み ${computeTP(s)}`), this.partyBars()),
        h('div', { class: 'win dim', style: 'font-size:12px' }, '拠点に戻ると全員回復。10階ごとのワープ地点に戻れる。装備のアビリティは戦闘で貯まるAPで覚える。'),
        h('div', { class: 'win grid2 push' },
          btn('ショップ', () => this.go('shop')),
          btn('合成屋', () => this.go('synth')),
          btn(`依頼掲示板${s.missions?.active.some(m => G.missionDone(s, m)) ? '（達成！）' : ''}`, () => { G.refreshOffers(s); this.go('missions'); }),
          btn(`魔獣牧場（${s.monsters.length}/${G.maxRanch(s)}）`, () => this.go('ranch')),
          btn('転生の祭壇', () => this.go('rebirth')),
          btn('試練の間（超ボス）', () => this.go('trials'), '', s.maxFloorEver < 1000 && s.rebirths < 10),
        ),
      ] });
  }
  warpDialog() {
    const s = this.s!;
    const warps = [...new Set([1, ...s.run.warps])].sort((a, b) => a - b);
    const ugw = G.undergroundUnlocked(s) ? [...new Set([1, ...s.run.undergroundWarps])].sort((a, b) => a - b) : [];
    const sheet: HTMLElement = this.sheet('ワープ先', [
      h('div', { class: 'grid3' }, ...warps.map(w => btn(w === 1 ? '拠点' : `${w}階`, () => { G.warpTo(s, w, false); sheet.remove(); this.go(w === 1 ? 'hub' : 'tower'); }))),
      ugw.length ? h('div', {}, h('h2', { style: 'margin-top:6px' }, '裏タワー'), h('div', { class: 'grid3' }, ...ugw.map(w => btn(`地下${w}階`, () => { G.warpTo(s, w, true); sheet.remove(); this.go('tower'); }, 'bad')))) : null,
    ], () => {});
    this.root.append(sheet);
  }
  // ---------- 塔
  tower(): HTMLElement {
    const s = this.s!;
    const ev = G.currentEvent(s);
    const area = areaFor(s.run.floor);
    const info: HTMLElement[] = []; const acts: HTMLElement[] = [];
    const nm = (e: string) => e.endsWith('+') ? '＋' + MONSTERS[e.slice(0, -1)].name : MONSTERS[e].name;
    if (s.run.cleared) {
      info.push(h('div', { class: 'good' }, 'この階の守護者を倒した。階段が現れている。'));
      acts.push(btn(s.run.underground ? `地下${s.run.floor + 1}階へ降りる` : `${s.run.floor + 1}階へ登る`, () => { const msg = G.climb(s); if (msg) toast(msg, 4000); this.render(); }, 'primary'));
    } else if (!ev) {
      info.push(h('div', {}, '…'));
    } else if (ev.type === 'battle') {
      info.push(h('div', {}, '敵の気配：', h('b', {}, ev.enemies.map(nm).join('、'))));
      acts.push(btn('戦う', () => this.startBattle(ev), 'primary'), btn('やり過ごす', () => { G.skipEvent(s); this.render(); }));
    } else if (ev.type === 'guardian') {
      const label = ev.boss === 'area' ? 'エリアボス' : ev.boss === 'mid' ? '中ボス' : '階段の守護者';
      info.push(h('div', { class: 'bad' }, `${label}：`, h('b', {}, ev.enemies.map(nm).join('、'))));
      acts.push(btn(`${label}に挑む`, () => this.startBattle(ev), 'primary'));
    } else {
      info.push(h('div', {}, ev.type === 'treasure' ? '宝箱がある' : '回復の泉がある'));
      acts.push(btn('調べる', () => { const m = G.resolveSimpleEvent(s); if (m) toast(m, 3500); this.render(); }, 'primary'));
    }
    const remaining = s.run.events.slice(s.run.eventIndex).map(e => e.type === 'battle' ? '⚔' : e.type === 'guardian' ? '☠' : e.type === 'treasure' ? '▣' : '♨').join(' ');
    const ug = s.run.underground;
    return this.shell({ title: ug ? `地下${s.run.floor}階 混沌（換算${G.effFloor(s)}階）` : `${s.run.floor}階 ${area.name}（${area.motif}）`,
      nav: [btn('メニュー', () => this.go('menu'), 'small'), btn('テレポ', () => this.warpDialog(), 'small'), btn('拠点へ', () => { G.toHub(s); this.go('hub'); }, 'small')],
      actions: acts,
      content: [
        h('div', { class: 'win' }, this.lawPanel(), h('div', { class: 'dim', style: 'font-size:12px' }, `この階の残り：${remaining || 'なし'}`)),
        h('div', { class: 'win' }, this.partyBars()),
        h('div', { class: 'win push' }, ...info),
      ] });
  }
  startBattle(ev: FloorEvent) {
    const s = this.s!;
    if (G.partyCombatants(s).every(c => c.hp <= 0)) { toast('全員戦闘不能。拠点で回復しよう'); return; }
    this.battle = G.startBattle(s, ev);
    this.battleEvent = ev;
    this.go('battle');
  }
  battleScreen(): HTMLElement {
    const s = this.s!;
    this.view = new BattleView(this.battle!, s.settings.auto, s.settings.speed, () => this.endBattle(), (auto, speed) => { s.settings.auto = auto; s.settings.speed = speed; });
    return this.view.root;
  }
  endBattle() {
    const s = this.s!;
    const b = this.battle!, ev = this.battleEvent!;
    const sum = G.finishBattle(s, b, ev);
    this.battle = null; this.battleEvent = null;
    if (this.view) { this.view.destroy(); this.view = null; }
    this.autosave();
    const box = this.shell({ title: b.result === 'won' ? '戦闘結果' : b.result === 'fled' ? '逃走' : '全滅',
      actions: [btn('OK', () => { if (b.result === 'lost' || (ev.type === 'guardian' && ev.superBoss)) { if (ev.type === 'guardian' && ev.superBoss) G.toHub(s); this.go('hub'); } else this.go('tower'); }, 'primary')],
      content: [h('div', { class: 'win' }, ...sum.lines.map(l => h('div', { class: l.includes('手に入れた') ? 'good' : l.includes('カード') ? 'law' : '' }, l)))] });
    this.root.replaceChildren(box);
  }
  // ---------- メニュー
  menu(): HTMLElement {
    const s = this.s!;
    const tabs = ['編成', 'ステータス', '装備', 'アビリティ', '作戦', '持ち物'];
    const back = () => { this.partyDraft = null; this.go(s.run.floor === 1 && s.run.eventIndex === 0 && !s.run.cleared ? 'hub' : 'tower'); };
    const body = this.menuTab === '編成' ? this.partyTab() : this.menuTab === 'ステータス' ? this.statusTab() : this.menuTab === '装備' ? this.equipTab() : this.menuTab === 'アビリティ' ? this.abilityTab() : this.menuTab === '作戦' ? this.gambitTab() : this.bagTab();
    return this.shell({ title: 'メニュー', back, tabs: this.tabBtns(tabs, this.menuTab, x => { this.menuTab = x; }), content: [body] });
  }
  memberName(key: string): string {
    if (key.startsWith('h:')) return HEROES[key.slice(2)].name;
    const m = this.s!.monsters.find(x => x.uid === key.slice(2)); return m ? gradeMark(m.grade) + MONSTERS[m.id].name : '?';
  }
  partyTab(): HTMLElement {
    const s = this.s!;
    const d = this.partyDraft ??= { party: [...s.party], reserve: [...s.reserve] };
    const all = [...Object.keys(s.heroes).map(k => 'h:' + k), ...s.monsters.map(m => 'm:' + m.uid)];
    const row = (key: string) => {
      const c = G.memberCombatant(s, key)!;
      const where = d.party.includes(key) ? '前線' : d.reserve.includes(key) ? '控え' : '待機';
      return h('div', { class: 'item' }, c.kind === 'hero' ? faceEl(c.spriteId, 32) : monsterEl(c.spriteId, 32), h('div', { class: 'grow' }, h('div', {}, `${c.name} `, h('span', { class: 'pill' }, where), h('span', { class: 'dim' }, ` Lv${c.level}`)), h('div', { class: 'dim', style: 'font-size:12px' }, `HP${c.stats.hp} 攻${c.atk} 防${c.def} 速${c.stats.spd}${c.kind === 'hero' ? ' ' + JOBS[s.heroes[c.ref].job].name : ''}`)),
        btn('前線', () => { d.reserve = d.reserve.filter(k => k !== key); if (!d.party.includes(key)) { const isH = key.startsWith('h:'); const cnt = d.party.filter(k => k.startsWith('h:') === isH).length; if (isH ? cnt >= G.MAX_HERO_SLOTS : cnt >= G.maxMonsterSlots(s)) { toast(isH ? '英雄枠がいっぱい' : 'モンスター枠がいっぱい（転生ボードで拡張）'); return; } d.party.push(key); } this.render(); }, 'small' + (where === '前線' ? ' sel' : '')),
        btn('控え', () => { d.party = d.party.filter(k => k !== key); if (!d.reserve.includes(key)) { if (d.reserve.length >= G.maxReserve(s)) { toast('控えがいっぱい'); return; } d.reserve.push(key); } this.render(); }, 'small' + (where === '控え' ? ' sel' : '')),
        btn('外す', () => { d.party = d.party.filter(k => k !== key); d.reserve = d.reserve.filter(k => k !== key); this.render(); }, 'small'));
    };
    const hn = d.party.filter(k => k.startsWith('h:')).length, mn = d.party.length - hn;
    return h('div', {}, h('div', { class: 'win' }, h('div', { class: 'dim' }, `前線：英雄 ${hn}/${G.MAX_HERO_SLOTS}　モンスター ${mn}/${G.maxMonsterSlots(s)}　控え ${d.reserve.length}/${G.maxReserve(s)}（控えはEXP50%、待機は10%）`),
      h('div', { class: 'list' }, ...all.map(row)),
      btn('この編成にする', () => { const e = G.setParty(s, d.party, d.reserve); if (e) toast(e); else { toast('編成を変更した'); this.partyDraft = null; } this.render(); }, 'primary')));
  }
  heroPicker(): HTMLElement {
    const s = this.s!;
    const ids = Object.keys(s.heroes);
    if (!ids.includes(this.menuHero)) this.menuHero = ids[0];
    return h('div', { class: 'row', style: 'margin:4px 6px' }, ...ids.map(id => btn(HEROES[id].name, () => { this.menuHero = id; this.render(); }, 'small' + (id === this.menuHero ? ' sel' : ''))));
  }
  itemLabel(it: ItemInstance, hs?: HeroState): HTMLElement {
    const base = ITEMS[it.base];
    let learnText: HTMLElement | null = null;
    if (base.learn) {
      const key = base.learn.ability ?? base.learn.skill!, name = G.learnName(base.learn);
      const known = hs ? (base.learn.ability ? G.learnedAbilities(this.s!, hs).includes(key) : (hs.learnedSkills.includes(key) || G.hasSkillByJob(hs, key))) : false;
      if (hs && known) learnText = h('div', { class: 'good', style: 'font-size:11px' }, `習得済：${name}`);
      else if (hs) { const ap = hs.itemAp[key] ?? 0; learnText = h('div', { class: 'law', style: 'font-size:11px' }, `習得：${name}　AP ${ap}/${base.learn.ap}`, bar(ap / base.learn.ap, 'limit')); }
      else learnText = h('div', { class: 'dim', style: 'font-size:11px' }, `習得：${name}（AP${base.learn.ap}）`);
    }
    const desc = [base.power ? `攻${Math.round(base.power * (1 + 0.02 * Math.max(0, it.found - 1)) * (1 + 0.3 * (it.tier - 1)))}` : '', base.def ? `防${base.def}` : '', base.mdef ? `魔防${base.mdef}` : '', base.element ? `${base.element}属性` : ''].filter(Boolean).join(' ');
    return h('div', { class: 'grow row', style: 'flex-wrap:nowrap;align-items:flex-start' }, iconEl(it.base, 28), h('div', { class: 'grow' },
      h('div', { class: 'r-' + it.rarity }, G.rarityMark(it.rarity) + ' ' + G.itemName(it), h('span', { class: 'dim', style: 'font-size:11px' }, ` Lv${it.unsealed ? Math.ceil(equipLevelReq(it.tier) / 2) : equipLevelReq(it.tier)} ${it.found}階`), base.set ? h('span', { class: 'pill' }, SETS[base.set]?.name + 'セット') : null),
      h('div', { class: 'dim', style: 'font-size:11px' }, desc, it.affixes.length ? '｜' + it.affixes.map(a => AFFIXES[a.id].desc(a.value)).join('、') : '', it.unique ? `｜【${UNIQUES[it.unique].name}】${UNIQUES[it.unique].desc}` : ''),
      learnText));
  }
  equipTab(): HTMLElement {
    const s = this.s!;
    const picker = this.heroPicker();
    const hs = s.heroes[this.menuHero];
    const c = buildHero(s, hs);
    const slotSel = (this as any)._slot as Slot | undefined;
    const slots = SLOTS.map(sl => {
      const it = itemOf(s, hs.equip[sl]);
      return h('div', { class: 'item' + (slotSel === sl ? ' sel' : ''), onclick: () => { (this as any)._slot = sl; this.render(); } }, h('span', { class: 'pill' }, SLOT_JP[sl]), it ? this.itemLabel(it, hs) : h('span', { class: 'dim grow' }, 'なし'), it ? btn('外す', (e?: Event) => { G.unequip(s, hs.id, sl); this.render(); }, 'small') : null);
    });
    const list: HTMLElement[] = [];
    if (slotSel) {
      const kinds = slotSel === 'acc1' || slotSel === 'acc2' ? ['acc'] : [slotSel];
      const cands = s.inventory.filter(it => kinds.includes(ITEMS[it.base].kind)).sort((a, b) => (ITEMS[b.base].power ?? 0) + (ITEMS[b.base].def ?? 0) - (ITEMS[a.base].power ?? 0) - (ITEMS[a.base].def ?? 0));
      for (const it of cands) {
        const ok = canEquip(hs, it);
        const owner = G.isEquipped(s, it.uid);
        list.push(h('div', { class: 'item' }, this.itemLabel(it, hs), owner ? h('span', { class: 'pill' }, owner) : null, btn('装備', () => { const e = G.equip(s, hs.id, it.uid, slotSel); if (e) toast(e); this.render(); }, 'small', !ok.ok), !ok.ok ? h('span', { class: 'bad', style: 'font-size:11px' }, ok.reason) : null));
      }
    }
    return h('div', {}, picker,
      h('div', { class: 'win' }, h('div', { class: 'row' }, h('b', {}, c.name), h('span', { class: 'dim' }, `Lv${hs.level} ${JOBS[hs.job].name}`), h('span', { class: 'grow' }), h('span', { class: 'dim' }, `HP${c.stats.hp} MP${c.stats.mp} 攻${c.atk} 防${c.def} 魔防${c.mdef} 速${c.stats.spd}`)),
        h('div', { class: 'dim', style: 'font-size:11px' }, `セット効果：${activeSets(s, hs).map(id => `${SETS[id].name}（${SETS[id].desc}）`).join('、') || 'なし'}`),
        h('div', { class: 'list', style: 'max-height:none' }, ...slots)),
      slotSel ? h('div', { class: 'win' }, h('h2', {}, `${SLOT_JP[slotSel]}の候補`), h('div', { class: 'list' }, ...(list.length ? list : [h('div', { class: 'dim' }, '候補なし')]))) : h('div', { class: 'win dim' }, '部位をタップすると候補が出る'));
  }
  abilityTab(): HTMLElement {
    const s = this.s!;
    const picker = this.heroPicker();
    const hs = s.heroes[this.menuHero];
    const learned = G.learnedAbilities(s, hs);
    const slots = G.abilitySlots(s);
    const cslots = G.cmdSlotsFor(s, hs);
    const jobs = G.unlockedJobs(s);
    const jl = hs.jobs[hs.job] ?? { lv: 1, abp: 0 };
    const apRows = Object.entries(hs.itemAp).map(([key, ap]) => { const it = SLOTS.map(sl => itemOf(s, hs.equip[sl])).find(i => i && (ITEMS[i.base].learn?.ability === key || ITEMS[i.base].learn?.skill === key)); const need = it ? ITEMS[it.base].learn!.ap : 0; return h('div', { class: 'dim', style: 'font-size:12px' }, `${SUPPORTS[key]?.name ?? (SKILLS[key] ? COMMANDS[SKILLS[key].category ?? '']?.name + '「' + SKILLS[key].name + '」' : key)}：AP ${ap}/${need || '?'}`); });
    return h('div', {}, picker,
      h('div', { class: 'win' }, h('h2', {}, 'ジョブ'), h('div', { class: 'dim' }, `${JOBS[hs.job].name} Lv${jl.lv}${jl.lv >= MAX_JOB_LEVEL ? '（マスター）' : `　ABP ${jl.abp}/${abpToNext(jl.lv)}`}`),
        h('div', { class: 'row' }, ...jobs.map(j => btn(`${JOBS[j].name}${hs.jobs[j] ? ' Lv' + hs.jobs[j].lv : ''}`, () => { const e = G.changeJob(s, hs.id, j); if (e) toast(e); this.render(); }, 'small' + (j === hs.job ? ' sel' : '')))),
        h('div', { class: 'dim', style: 'font-size:12px' }, `技の解放：${JOBS[hs.job].unlocks.map(u => `Lv${u.lv} ${SKILLS[u.skill]?.name}`).join('、') || 'なし'}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, `サポート習得：${JOBS[hs.job].learn.map(l => `Lv${l.lv} ${SUPPORTS[l.ability]?.name}`).join('、') || 'なし'}`)),
      h('div', { class: 'win' }, h('h2', {}, `コマンド（固有：${JOBS[hs.job].command ? COMMANDS[JOBS[hs.job].command!].name : 'なし'}　枠 ${hs.equippedCmds.length}/${cslots}）`),
        h('div', { class: 'dim', style: 'font-size:11px' }, 'カテゴリをセットすると、そのカテゴリで覚えている技が全部使える。技はそのジョブのLvと装備習得で増える'),
        h('div', { class: 'list', style: 'max-height:none' }, ...availableCategories(hs).map(cat => {
          const innate = JOBS[hs.job].command === cat;
          const on = innate || hs.equippedCmds.includes(cat);
          const sks = categorySkills(hs, cat);
          const job = jobOfCommand(cat);
          const total = (job?.unlocks.length ?? 0);
          return h('div', { class: 'item' + (on ? ' sel' : ''), style: 'flex-wrap:wrap' },
            h('div', { class: 'grow' }, h('div', {}, `${COMMANDS[cat].name} `, h('span', { class: 'pill' }, innate ? '固有' : `${sks.length}${total ? '/' + total : ''}技`), job ? h('span', { class: 'dim' }, ` ${job.name}Lv${hs.jobs[job.id]?.lv ?? 0}`) : null),
              h('div', { class: 'dim', style: 'font-size:11px' }, sks.map(k => k.name).join('、'))),
            innate ? null : btn(on ? '外す' : 'セット', () => { if (on) hs.equippedCmds = hs.equippedCmds.filter(x => x !== cat); else { if (hs.equippedCmds.length >= cslots) { toast('コマンド枠がいっぱい'); return; } hs.equippedCmds.push(cat); } this.render(); }, 'small'));
        }))),
      h('div', { class: 'win' }, h('h2', {}, `サポート枠（${hs.equipped.length}/${slots}）`),
        h('div', { class: 'list' }, ...learned.filter(a => !a.startsWith('cmd_')).map(ab => { const on = hs.equipped.includes(ab); return h('div', { class: 'item' + (on ? ' sel' : '') }, h('div', { class: 'grow' }, h('div', {}, SUPPORTS[ab]?.name ?? ab), h('div', { class: 'dim', style: 'font-size:11px' }, SUPPORTS[ab]?.desc ?? '')), btn(on ? '外す' : '装備', () => { if (on) hs.equipped = hs.equipped.filter(x => x !== ab); else { if (hs.equipped.length >= slots) { toast('サポート枠がいっぱい'); return; } hs.equipped.push(ab); } G.syncHp(s, hs); this.render(); }, 'small')); })),
        apRows.length ? h('div', { style: 'margin-top:6px' }, h('b', {}, '装備から習得中'), ...apRows) : null));
  }

  statusTab(): HTMLElement {
    const s = this.s!;
    const keys = [...Object.keys(s.heroes).map(k => 'h:' + k), ...s.monsters.map(m => 'm:' + m.uid)];
    if (!keys.includes((this as any)._skey)) (this as any)._skey = keys[0];
    const key = (this as any)._skey as string;
    const c = G.memberCombatant(s, key)!;
    const statRows = STAT_KEYS.map(k => h('div', { class: 'row', style: 'font-size:13px' }, h('span', { class: 'grow' }, STAT_JP[k]), h('span', {}, String(c.stats[k]))));
    const derived = h('div', { class: 'dim', style: 'font-size:12px' }, `攻撃 ${c.atk}　防御 ${c.def}　魔防 ${c.mdef}　クリ ${Math.round(c.mods.crit * 100)}%　回避 ${Math.round(c.mods.evasion * 100)}%`);
    const resist = Object.entries(c.mods.resist).map(([el, v]) => `${el}×${v}`).join(' ');
    let detail: HTMLElement;
    if (key.startsWith('h:')) {
      const hs = s.heroes[key.slice(2)];
      const def = HEROES[hs.id];
      detail = h('div', {},
        h('div', { class: 'dim', style: 'font-size:12px' }, `${def.title}　固有ジョブ：${JOBS[def.innateJob].name}${hs.job === def.innateJob ? '（適用中 全ステ+20%）' : ''}　リミット技：${SKILLS[def.limit].name}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, `Lv${hs.level}　EXP ${hs.exp}/${expToNext(hs.level)}　リミット ${Math.round(hs.limit)}%`),
        h('div', { class: 'dim', style: 'font-size:12px' }, `ジョブ：${Object.entries(hs.jobs).map(([j, v]) => `${JOBS[j].name}Lv${v.lv}${v.lv >= MAX_JOB_LEVEL ? '★' : ''}`).join('、')}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, `習得アビリティ：${G.learnedAbilities(s, hs).map(a => SUPPORTS[a]?.name ?? a).join('、') || 'なし'}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, `コマンド：${[JOBS[hs.job].command, ...hs.equippedCmds].filter(Boolean).map(c => COMMANDS[c!].name).join('、') || 'なし'}　サポート：${hs.equipped.map(a => SUPPORTS[a]?.name ?? a).join('、') || 'なし'}`),
        h('div', { style: 'font-size:12px;margin-top:4px' }, h('b', {}, '武器熟練度：'), Object.entries(hs.mastery ?? {}).filter(([, xp]) => xp > 0).map(([k, xp]) => { const lv = masteryLevel(xp); return `${k === 'shield' ? '盾' : WEAPON_JP[k as WeaponType] ?? k}Lv${lv}${lv < MAX_MASTERY ? `(${Math.floor(xp)}/${masteryNext(lv)})` : '★'}`; }).join('　') || 'まだなし'),
        h('div', { style: 'font-size:12px' }, h('b', {}, '魔法熟練度：'), Object.entries(hs.spellMastery ?? {}).filter(([, xp]) => masteryLevel(xp) > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, xp]) => `${SKILLS[k]?.name}Lv${masteryLevel(xp)}`).join('　') || 'まだなし'),
        h('div', { class: 'dim', style: 'font-size:11px' }, '熟練度は使うほど上がる（Lv1〜16、転生で引き継ぐ）。武器：攻撃+2.5%/Lv、Lv16でクリ+10%。魔法：威力・回復+3%/Lv。低い階で稼ぐと伸びにくい'),
        h('div', { class: 'dim', style: 'font-size:12px' }, `読んだ魔法書：${(hs.tomes ?? []).map(sp => SKILLS[sp]?.name).join('、') || 'なし'}`));
    } else {
      const m = s.monsters.find(x => x.uid === key.slice(2))!;
      const md = MONSTERS[m.id];
      const ivText = STAT_KEYS.map(k => `${STAT_JP[k]}${Math.round(m.iv[k] * 100)}%`).join(' ');
      detail = h('div', {},
        h('div', { class: 'dim', style: 'font-size:12px' }, `${md.family}族　Lv${m.level}　等級：${m.grade === 'plus_rare' ? '●＋ レアな強個体（成長率+20%、個体値+10%、特性+2）' : m.grade === 'rare' ? '● レア個体（成長率+20%、特性+1）' : m.grade === 'plus' ? '＋ 強個体（個体値+10%、特性+1）' : '無印'}`),
        h('div', { class: 'good', style: 'font-size:12px' }, ROLE_JP[md.role]),
        h('div', { class: 'dim', style: 'font-size:12px' }, `　EXP ${m.exp}/${expToNext(m.level)}${m.rare ? '　★レア個体（成長率+20%、特性+1）' : ''}`),
        h('div', { style: 'font-size:12px' }, h('b', {}, `絆ランク ${m.bond}/10 `), h('span', { class: 'dim' }, `（次まで ${Math.max(0, 5 + m.bond * 5 - Math.floor(m.bondXp))}戦）全ステ+${m.bond * 2}%。転生しても残る`)),
        h('div', { style: 'font-size:12px' }, h('b', {}, `性格：${m.nature} `), h('span', { class: 'dim' }, '得意ステ+10%')),
        h('div', { class: 'dim', style: 'font-size:12px' }, `個体値：${ivText}`),
        h('div', { style: 'font-size:12px' }, h('b', {}, '特性：'), m.traits.length ? m.traits.map(t => AFFIXES[t.id].desc(t.value)).join('、') : 'なし'),
        h('div', { style: 'font-size:12px' }, h('b', {}, '固有技：'), md.skills.map((k, i) => `${SKILLS[k].name}${i === 0 || m.bond >= 3 * (i + 1) ? '' : `（絆${3 * (i + 1)}で解放）`}`).join('、')),
        h('div', { class: 'dim', style: 'font-size:12px' }, `エサ加算：${Object.entries(m.food).map(([k, v]) => `${STAT_JP[k]}+${v}`).join(' ') || 'なし'}　進化：${md.evolveTo ? MONSTERS[md.evolveTo].name + '（Lv20＋素材×5＋魔晶石、牧場で）' : 'なし'}`));
    }
    return h('div', {},
      h('div', { class: 'row', style: 'margin:4px 6px' }, ...keys.map(k => btn(this.memberName(k), () => { (this as any)._skey = k; this.render(); }, 'small' + (k === key ? ' sel' : '')))),
      h('div', { class: 'win' }, h('div', { class: 'row' }, c.kind === 'hero' ? faceEl(c.spriteId, 48) : monsterEl(c.spriteId, 48), h('h2', {}, c.name)), detail),
      h('div', { class: 'win' }, h('div', { class: 'grid2' }, ...statRows), derived, Object.keys(c.mods.resist).length ? h('div', { class: 'dim row', style: 'font-size:12px;gap:4px' }, '属性耐性：', ...Object.entries(c.mods.resist).map(([el, v]) => h('span', {}, elementIconEl(el) ?? el, `×${v}`)), h('span', {}, '（2=弱点 0.5=半減 0=無効 -1=吸収）')) : null),
      h('div', { class: 'win' }, h('h2', {}, 'コマンド'), h('div', { class: 'dim', style: 'font-size:12px' }, c.commands.map(k => `${k.group === 'basic' ? '' : k.group + ':'}${k.name}`).join('、'))));
  }
  lawPanel(): HTMLElement {
    const s = this.s!;
    const law = G.currentLaw(s);
    if (!law) return h('div', { class: 'dim', style: 'font-size:13px' }, 'この階層にロウはない');
    const block = Math.floor(s.run.floor / 10);
    const cards = s.run.cards[block] ?? 0;
    const members = s.party.map(k => ({ key: k, c: G.memberCombatant(s, k)!, gam: k.startsWith('h:') ? s.heroes[k.slice(2)].gambits : s.monsters.find(m => m.uid === k.slice(2))!.gambits }));
    const risky = s.settings.autoGambit ? [] : members.filter(m => !m.gam.some(g => g.on && !gambitViolates(m.c, g, law)));
    return h('div', {},
      h('div', { class: 'law', style: 'font-size:13px' }, `ロウ：${LAW_TAG_JP[law.forbid]}禁止 ／ ${LAW_TAG_JP[law.favor]}推奨`, cards ? `　イエロー${cards}/3` : ''),
      h('div', { class: 'dim', style: 'font-size:11px' }, `${block * 10}〜${block * 10 + 9}階で有効。作戦は違反行動を自動で飛ばす。手動コマンドは⚠付きが違反。`),
      s.settings.autoGambit ? h('div', { class: 'good', style: 'font-size:12px' }, 'おまかせ作戦：このロウに合わせて自動で組む') : risky.length ? h('div', { class: 'bad', style: 'font-size:12px' }, `作戦に安全な行がない：${risky.map(m => m.c.name).join('、')}`) : h('div', { class: 'good', style: 'font-size:12px' }, '全員の作戦に安全な行がある'),
      h('div', { class: 'row' },
        risky.length ? btn('安全行を追加', () => { for (const m of risky) { const row = lawSafeRow(m.c, law); if (m.gam.length < G.gambitRows(s)) m.gam.push(row); else m.gam[m.gam.length - 1] = row; } toast('各メンバーの作戦に安全な行を追加した'); this.render(); }, 'small') : null,
        (s.bag.antilaw ?? 0) > 0 ? btn(`アンチロウカード（${s.bag.antilaw}）`, () => { s.run.antilaw.push(block); s.bag.antilaw!--; toast('この10階のロウを消した'); this.render(); }, 'small') : null));
  }
  gambitTab(): HTMLElement {
    const s = this.s!;
    const keys = [...s.party, ...s.reserve];
    if (!keys.includes((this as any)._gkey)) (this as any)._gkey = keys[0];
    const key = (this as any)._gkey as string;
    const c = G.memberCombatant(s, key)!;
    const gam: Gambit[] = key.startsWith('h:') ? s.heroes[key.slice(2)].gambits : s.monsters.find(m => m.uid === key.slice(2))!.gambits;
    const rows = G.gambitRows(s);
    const actions: { value: string; label: string }[] = [{ value: 'attack', label: 'たたかう' }, { value: 'defend', label: 'ぼうぎょ' }];
    if (c.limitSkill) actions.push({ value: 'limit', label: 'リミット技' });
    for (const k of c.commands.filter(k => k.group !== 'basic')) actions.push({ value: 'skill:' + k.id, label: `${k.group}:${k.name}` });
    for (const id of Object.keys(ITEMS)) if (ITEMS[id].effect && ITEMS[id].effect!.kind !== 'antilaw') actions.push({ value: 'item:' + id, label: 'アイテム:' + ITEMS[id].name });
    const rowEl = (g: Gambit, i: number) => h('div', { class: 'item', style: 'flex-wrap:wrap' },
      btn(g.on ? 'ON' : 'OFF', () => { g.on = !g.on; this.render(); }, 'small' + (g.on ? ' sel' : '')),
      selectEl(GAMBIT_CONDS.map(x => ({ value: x.id, label: x.name })), g.cond, v => { g.cond = v; }),
      selectEl(actions, g.action, v => { g.action = v; }),
      btn('↑', () => { if (i > 0) { [gam[i - 1], gam[i]] = [gam[i], gam[i - 1]]; this.render(); } }, 'small'),
      btn('×', () => { gam.splice(i, 1); this.render(); }, 'small'));
    const autoOn = s.settings.autoGambit;
    const law = G.currentLaw(s);
    const preview = recommendGambits(c, law, s.bag);
    return h('div', {},
      h('div', { class: 'win' }, h('div', { class: 'row' }, btn(autoOn ? 'おまかせ作戦：ON' : 'おまかせ作戦：OFF', () => { s.settings.autoGambit = !autoOn; this.render(); }, autoOn ? 'sel' : ''), h('span', { class: 'dim grow', style: 'font-size:11px' }, autoOn ? '戦闘のたびに、各メンバーの持ち技・役割・その階層のロウから作戦を自動で組む。手動の作戦は保存されたまま使われない' : '手動の作戦を使う。ロウ違反の行は自動で飛ばされる'))),
      h('div', { class: 'row', style: 'margin:4px 6px' }, ...keys.map(k => btn(this.memberName(k), () => { (this as any)._gkey = k; this.render(); }, 'small' + (k === key ? ' sel' : '')))),
      autoOn ? h('div', { class: 'win' }, h('h2', {}, `${c.name}の今の作戦（自動）`), law ? h('div', { class: 'law', style: 'font-size:11px' }, `ロウ：${law.name} を反映`) : null, h('div', { class: 'list', style: 'max-height:none' }, ...preview.map((g, i) => h('div', { class: 'item', style: 'font-size:13px' }, h('span', { class: 'pill' }, String(i + 1)), describeGambit(g, c))))) : null,
      h('div', { class: 'win', style: autoOn ? 'opacity:.6' : '' }, h('div', { class: 'dim', style: 'font-size:12px' }, (autoOn ? '【手動の作戦（今は未使用）】' : '') + '上から順に条件を見て、最初に当てはまった行動をとる。オート戦闘でも手動でも、ゲージが溜まった時に作戦が当てはまれば自動で行動する。'),
        h('div', { class: 'list', style: 'max-height:none' }, ...gam.map(rowEl)),
        btn('行を追加', () => { if (gam.length >= rows) { toast(`作戦は${rows}行まで`); return; } gam.push({ cond: 'always', action: 'attack', on: true }); this.render(); }, 'small')));
  }
  bagTab(): HTMLElement {
    const s = this.s!;
    const cons = Object.entries(s.bag).filter(([id, n]) => n > 0 && ITEMS[id].kind === 'consumable');
    const mats = Object.entries(s.bag).filter(([id, n]) => n > 0 && ITEMS[id].kind === 'material');
    const tomes = Object.entries(s.bag).filter(([id, n]) => n > 0 && ITEMS[id].kind === 'tome');
    const useOut = (id: string) => {
      const ef = ITEMS[id].effect!;
      if (ef.kind === 'antilaw') { const block = Math.floor(s.run.floor / 10); if (block === 0 || s.run.antilaw.includes(block)) { toast('この階層にはロウがない'); return; } s.run.antilaw.push(block); s.bag[id]--; toast('この10階のロウを消した'); this.render(); return; }
      // 回復系は前線の一番HP割合が低い者へ
      const cs = G.partyCombatants(s);
      const t = ef.kind === 'revive' ? cs.find(c => c.hp <= 0) : cs.filter(c => c.hp > 0).sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp)[0];
      if (!t) { toast('対象がいない'); return; }
      const apply = (hp: number, mp: number) => { if (t.kind === 'hero') { const hs = s.heroes[t.ref]; hs.hp = Math.min(t.stats.hp, Math.max(hs.hp, 0) + hp); hs.mp = Math.min(t.stats.mp, hs.mp + mp); } else { const m = s.monsters.find(x => x.uid === t.ref)!; m.hp = Math.min(t.stats.hp, m.hp + hp); m.mp = Math.min(t.stats.mp, m.mp + mp); } };
      if (ef.kind === 'heal') apply(ef.power!, 0); else if (ef.kind === 'fullheal') apply(t.stats.hp, 0); else if (ef.kind === 'mp') apply(0, ef.power!); else if (ef.kind === 'revive') apply(Math.round(t.stats.hp * ef.power!), 0); else { toast('戦闘中に使う'); return; }
      s.bag[id]--; toast(`${t.name}に${ITEMS[id].name}を使った`); this.render();
    };
    return h('div', {},
      h('div', { class: 'win' }, h('h2', {}, '消耗品'), h('div', { class: 'list' }, ...cons.map(([id, n]) => h('div', { class: 'item' }, iconEl(id), h('span', { class: 'grow' }, `${ITEMS[id].name} ×${n}`), btn('使う', () => useOut(id), 'small'))), !cons.length ? h('div', { class: 'dim' }, 'なし') : null)),
      h('div', { class: 'win' }, h('h2', {}, '魔法書'), h('div', { class: 'dim', style: 'font-size:11px' }, 'Lv4以上の魔法は、読んだ英雄だけが使える（ジョブLvの条件は別途必要）'),
        h('div', { class: 'list' }, ...tomes.map(([id, n]) => h('div', { class: 'item', style: 'flex-wrap:wrap' }, iconEl(id), h('span', { class: 'grow' }, `${ITEMS[id].name} ×${n}`),
          selectEl([{ value: '', label: '誰に読ませる' }, ...Object.keys(s.heroes).map(hid => ({ value: hid, label: `${HEROES[hid].name}${(s.heroes[hid].tomes ?? []).includes(tomeSpell(id)) ? '（読了）' : ''}` }))], '', v => { if (!v) return; const e = G.readTome(s, v, id); toast(e ?? `${HEROES[v].name}は${SKILLS[tomeSpell(id)].name}を覚えた`); this.render(); })))), !tomes.length ? h('div', { class: 'dim' }, 'なし（ボス・宝箱・稀に通常敵から）') : null),
      h('div', { class: 'win' }, h('h2', {}, '素材'), h('div', { class: 'dim' }, mats.map(([id, n]) => `${ITEMS[id].name}×${n}`).join('　') || 'なし')),
      h('div', { class: 'win' }, h('h2', {}, `倉庫（${s.inventory.length}/${G.maxStorage(s)}）`), h('div', { class: 'dim', style: 'font-size:12px' }, '売却はショップで。装備はメニューの装備タブから。')));
  }
  // ---------- ショップ
  shop(): HTMLElement {
    const s = this.s!;
    const tabs = ['買う', '売る'];
    let body: HTMLElement;
    if (this.shopTab === '買う') {
      body = h('div', { class: 'win' }, h('div', { class: 'list' }, ...G.shopList(s).map(id => { const b = ITEMS[id]; return h('div', { class: 'item' }, iconEl(id), h('div', { class: 'grow' }, h('div', {}, b.name, h('span', { class: 'dim' }, ` ${b.price}G`), (s.bag[id] ?? 0) > 0 ? h('span', { class: 'pill' }, `所持${s.bag[id]}`) : null), h('div', { class: 'dim', style: 'font-size:11px' }, b.effect ? describeEffect(b) : [b.power ? `攻${b.power}` : '', b.def ? `防${b.def}` : '', b.mdef ? `魔防${b.mdef}` : '', b.learn ? `習得:${G.learnName(b.learn)}` : ''].filter(Boolean).join(' '))), btn('買う', () => { const e = G.buyItem(s, id); toast(e ?? `${b.name}を買った`); this.render(); }, 'small', s.gil < b.price)); })));
    } else {
      const items = s.inventory.filter(it => !G.isEquipped(s, it.uid));
      body = h('div', { class: 'win' }, h('div', { class: 'row' }, btn(`ノーマル品を一括売却（${items.filter(i => i.rarity === 'normal').length}個）`, () => { let g = 0; for (const it of items.filter(i => i.rarity === 'normal')) { g += G.sellPrice(it); G.sellItem(s, it.uid); } toast(`${g}Gで売った`); this.render(); }, 'small')),
        h('div', { class: 'list' }, ...items.map(it => h('div', { class: 'item' }, this.itemLabel(it), btn(`${G.sellPrice(it)}G`, () => { G.sellItem(s, it.uid); this.render(); }, 'small')))));
    }
    return this.shell({ title: 'ショップ', back: () => this.go('hub'), tabs: this.tabBtns(tabs, this.shopTab, x => { this.shopTab = x; }), content: [body] });
  }
  // ---------- 牧場
  ranch(): HTMLElement {
    const s = this.s!;
    const feedables = Object.entries(s.bag).filter(([id, n]) => n > 0 && ITEMS[id].kind === 'material');
    const fuseSel = (this as any)._fuse as string | null;
    const cmp: string[] = ((this as any)._cmp ??= []);
    const toggleCmp = (uid: string) => { const i = cmp.indexOf(uid); if (i >= 0) cmp.splice(i, 1); else { if (cmp.length >= 2) cmp.shift(); cmp.push(uid); } this.render(); };
    const compareBox = (() => {
      const ms = cmp.map(u => s.monsters.find(x => x.uid === u)).filter(Boolean) as typeof s.monsters;
      if (ms.length < 2) return cmp.length ? h('div', { class: 'win dim', style: 'font-size:12px' }, `比較：${MONSTERS[ms[0].id].name} を選択中。もう1体「比較」を押す`) : null;
      const [a, b] = ms; const ca = buildAlly(s, a), cb = buildAlly(s, b);
      const gradeJp = (g: string) => g === 'plus_rare' ? '●＋' : g === 'rare' ? '●' : g === 'plus' ? '＋' : '無印';
      const rowsC: [string, string | number, string | number, boolean][] = [
        ['Lv', a.level, b.level, true], ['HP', ca.stats.hp, cb.stats.hp, true], ['攻撃', ca.atk, cb.atk, true], ['防御', ca.def, cb.def, true], ['魔力', ca.stats.mag, cb.stats.mag, true], ['素早さ', ca.stats.spd, cb.stats.spd, true],
        ['個体値合計', Math.round(Object.values(a.iv).reduce((x, y) => x + y, 0) * 100) / 100, Math.round(Object.values(b.iv).reduce((x, y) => x + y, 0) * 100) / 100, true],
        ['絆', a.bond, b.bond, true], ['特性数', a.traits.length, b.traits.length, true],
        ['等級', gradeJp(a.grade), gradeJp(b.grade), false], ['性格', a.nature, b.nature, false], ['役割', ROLE_JP[MONSTERS[a.id].role], ROLE_JP[MONSTERS[b.id].role], false],
        ['特性', a.traits.map(t => AFFIXES[t.id].desc(t.value)).join('、') || 'なし', b.traits.map(t => AFFIXES[t.id].desc(t.value)).join('、') || 'なし', false],
      ];
      const cell = (v: string | number, other: string | number, num: boolean) => h('td', { class: num && typeof v === 'number' && typeof other === 'number' ? (v > other ? 'good' : v < other ? 'bad' : '') : '', style: 'padding:2px 6px;font-size:12px;vertical-align:top' }, String(v));
      return h('div', { class: 'win' }, h('div', { class: 'row' }, h('h2', { class: 'grow' }, '比較'), btn('閉じる', () => { cmp.length = 0; this.render(); }, 'small')),
        h('table', { style: 'width:100%;border-collapse:collapse' },
          h('tr', {}, h('th', {}), h('th', { style: 'font-size:12px' }, monsterEl(a.id, 28), ca.name), h('th', { style: 'font-size:12px' }, monsterEl(b.id, 28), cb.name)),
          ...rowsC.map(([k, va, vb, num]) => h('tr', { style: 'border-top:1px solid #2a3f8a' }, h('td', { class: 'dim', style: 'padding:2px 6px;font-size:12px;white-space:nowrap' }, k), cell(va, vb, num), cell(vb, va, num)))));
    })();
    const rows = s.monsters.map(m => {
      const c = buildAlly(s, m);
      const where = s.party.includes('m:' + m.uid) ? '前線' : s.reserve.includes('m:' + m.uid) ? '控え' : '牧場';
      return h('div', { class: 'item', style: 'flex-wrap:wrap' }, monsterEl(m.id, 40),
        h('div', { class: 'grow' }, h('div', {}, `${c.name} `, h('span', { class: 'pill' }, where), h('span', { class: 'dim' }, ` Lv${m.level} 絆${m.bond} ${m.nature}`)),
          h('div', { class: 'dim', style: 'font-size:11px' }, `HP${c.stats.hp} 攻${c.atk} 防${c.def} 速${c.stats.spd}｜${ROLE_JP[MONSTERS[m.id].role]}｜特性：${m.traits.map(t => AFFIXES[t.id].desc(t.value)).join('、') || 'なし'}`),
          h('div', { class: 'dim', style: 'font-size:11px' }, `固有技：${MONSTERS[m.id].skills.map((k, i) => SKILLS[k].name + (i === 0 || m.bond >= 3 * (i + 1) ? '' : `(絆${3 * (i + 1)})`)).join('、')}`)),
        h('div', { class: 'row' },
          (() => { const r = G.evolveReq(s, m); return r ? btn(`進化→${MONSTERS[r.to].name}`, () => { const e = G.evolveMonster(s, m.uid); toast(e ?? `${MONSTERS[r.to].name}に進化した！`); this.render(); }, 'small' + (r.ok ? ' sel' : ''), !r.ok) : null; })(),
          (() => { const r = G.evolveReq(s, m); return r && !r.ok ? h('span', { class: 'dim', style: 'font-size:11px' }, `進化：Lv${r.level}＋${ITEMS[r.material].name}×${r.count}＋魔晶石`) : null; })(),
          feedables.length ? selectEl([{ value: '', label: 'エサ' }, ...feedables.map(([id, n]) => ({ value: id, label: `${ITEMS[id].name}×${n}` }))], '', v => { if (!v) return; const e = G.feedMonster(s, m.uid, v); toast(e ?? 'ステータスが上がった'); this.render(); }) : null,
          btn(cmp.includes(m.uid) ? '比較中' : '比較', () => toggleCmp(m.uid), 'small' + (cmp.includes(m.uid) ? ' sel' : '')),
          btn('放つ', () => { if (confirm(`${c.name}を放つ？素材になる`)) { G.releaseMonster(s, m.uid); this.render(); } }, 'small'),
          s.rebirths >= 5 ? btn(fuseSel === m.uid ? '融合先を選択中' : '融合', () => { (this as any)._fuse = fuseSel === m.uid ? null : m.uid; this.render(); }, 'small' + (fuseSel === m.uid ? ' sel' : '')) : null,
          fuseSel && fuseSel !== m.uid ? btn('この子を取り込む', () => { const base = s.monsters.find(x => x.uid === fuseSel)!; if (!confirm(`${MONSTERS[base.id].name}に${c.name}を融合する？${c.name}は消える`)) return; const e = G.fuseMonsters(s, fuseSel, m.uid); toast(e ?? '融合した。特性と絆の半分を引き継いだ'); (this as any)._fuse = null; this.render(); }, 'small bad') : null));
    });
    return this.shell({ title: `魔獣牧場 ${s.monsters.length}/${G.maxRanch(s)}`, back: () => this.go('hub'),
      actions: cmp.length ? [btn('比較を解除', () => { cmp.length = 0; this.render(); }, 'small')] : [],
      content: [
        compareBox,
        h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, `編成はメニューの「編成」から。絆は前線で戦うと上がり、転生しても残る。等級：＋強個体（5%出現・守護者は確定）、●レア。守護者を捕まえると＋確定。融合（A＋B→A。Bの特性1つと絆の半分を継承、特性は4つまで）は${s.rebirths >= 5 ? '解放済み' : '転生5回で解放'}。`)),
        h('div', { class: 'win' }, h('div', { class: 'list' }, ...(rows.length ? rows : [h('div', { class: 'dim' }, 'まだ仲間がいない。魔獣使い（20階で解放）の「とらえる」か「魔石のケージ」で捕まえる。')]))),
      ] });
  }

  // ---------- 依頼掲示板
  missions(): HTMLElement {
    const s = this.s!;
    const ms = s.missions;
    const rewardText = (m: typeof ms.active[number]) => [`${m.reward.gil}G`, m.reward.tp ? `${m.reward.tp}TP` : '', m.reward.item ? `${RARITY_JP[m.reward.item]}装備` : '', ...Object.entries(m.reward.bag ?? {}).map(([k, v]) => `${ITEMS[k].name}×${v}`)].filter(Boolean).join('、');
    const progress = (m: typeof ms.active[number]) => m.type === 'collect' ? `${Math.min(m.count, s.bag[m.target!] ?? 0)}/${m.count}` : m.type === 'reach' ? `${Math.max(s.run.maxFloor, s.maxFloorEver)}/${m.count}階` : `${m.progress}/${m.count}`;
    return this.shell({ title: '依頼掲示板', back: () => this.go('hub'), content: [
      h('div', { class: 'win' }, h('h2', {}, `受注中（${ms.active.length}/3）　達成数 ${ms.completed}`),
        h('div', { class: 'list', style: 'max-height:none' }, ...ms.active.map(m => { const done = G.missionDone(s, m); return h('div', { class: 'item' + (done ? ' sel' : ''), style: 'flex-wrap:wrap' }, h('div', { class: 'grow' }, h('div', {}, m.title), h('div', { class: 'dim', style: 'font-size:11px' }, `進捗 ${progress(m)}　報酬：${rewardText(m)}`)), done ? btn('報酬を受け取る', () => { const r = G.claimMission(s, m.id); toast(r ?? '', 4000); this.render(); }, 'small primary') : btn('破棄', () => { G.abandonMission(s, m.id); this.render(); }, 'small')); }), !ms.active.length ? h('div', { class: 'dim' }, '受注中の依頼なし') : null)),
      h('div', { class: 'win' }, h('h2', {}, 'モンブランの依頼'), h('div', { class: 'dim', style: 'font-size:11px' }, '拠点に戻るたびに補充される。受けると進捗が記録される'),
        h('div', { class: 'list', style: 'max-height:none' }, ...ms.offers.map(m => h('div', { class: 'item', style: 'flex-wrap:wrap' }, h('div', { class: 'grow' }, h('div', {}, m.title), h('div', { class: 'dim', style: 'font-size:11px' }, `報酬：${rewardText(m)}`)), btn('受ける', () => { const e = G.acceptMission(s, m.id); if (e) toast(e); this.render(); }, 'small', ms.active.length >= 3))))) ] });
  }
  // ---------- 試練の間
  trials(): HTMLElement {
    const s = this.s!;
    return this.shell({ title: '試練の間', back: () => this.go('hub'), content: [
      h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, '超ボスはロウなし。初回撃破で大きな報酬、2回目以降はアルテマ装備と少量のTP。全滅してもペナルティはギル半減のみ'), this.partyBars()),
      ...SUPER_BOSSES.map(b => { const av = G.superBossAvailable(s, b.id); const n = s.superBosses?.[b.id] ?? 0; return h('div', { class: 'win' }, h('div', { class: 'row' }, h('b', { class: 'grow' }, b.name), h('span', { class: 'pill' }, `換算${b.scale}階`), n ? h('span', { class: 'pill' }, `撃破${n}`) : null), h('div', { class: 'dim', style: 'font-size:12px' }, `条件：${b.cond}　報酬：${b.rewardText}`), btn(av.ok ? `${b.name}に挑む` : av.reason!, () => this.startBattle(G.superBossEvent(b.id)), av.ok ? 'primary' : '', !av.ok)); })] });
  }
  // ---------- 転生
  rebirth(): HTMLElement {
    const s = this.s!;
    const tabs = ['転生', '転生ボード'];
    let body: HTMLElement;
    if (this.rebirthTab === '転生') {
      const r = this.rebirthSel;
      const tp = Math.round(computeTP(s) * (1 + G.partyMods(s).tp));
      const starts = startFloorOptions(s);
      if (!starts.includes(r.start)) r.start = 1;
      const canDo = s.run.maxFloor >= 100 || s.rebirths > 0 || s.maxFloorEver >= 100;
      body = h('div', {},
        h('div', { class: 'win' }, h('h2', {}, `転生ポイント見込み：${tp}`), h('div', { class: 'dim', style: 'font-size:12px' }, `今周の最高${s.run.maxFloor}階、エリアボス${s.run.areaBossKills}、更新${s.run.newFloors}階、試練倍率×${trialMult(r.trials).toFixed(1)}、レッドカード${s.run.redCards}枚`),
          !canDo ? h('div', { class: 'bad' }, '初回の転生は100階到達で解禁') : null),
        h('div', { class: 'win' }, h('h2', {}, 'クリスタルの加護（1周の間）'), h('div', { class: 'grid2' }, ...BLESSINGS.map(b => btn(`${b.name}\n${b.desc}`, () => { r.blessing = b.id; this.render(); }, 'small' + (r.blessing === b.id ? ' sel' : ''))))),
        h('div', { class: 'win' }, h('h2', {}, '試練（任意、TP倍率）'), h('div', { class: 'grid2' }, ...TRIALS.map(t => btn(`${t.name} ×${t.mult}\n${t.desc}`, () => { r.trials = r.trials.includes(t.id) ? r.trials.filter(x => x !== t.id) : [...r.trials, t.id]; this.render(); }, 'small' + (r.trials.includes(t.id) ? ' sel' : ''))))),
        h('div', { class: 'win' }, h('h2', {}, '開始階'), h('div', { class: 'row' }, ...starts.map(f => btn(`${f}階`, () => { r.start = f; this.render(); }, 'small' + (r.start === f ? ' sel' : ''))))),
        h('div', { class: 'win' }, h('div', { class: 'dim', style: 'font-size:12px' }, '転生で失うもの：Lv、今の階、ギルの9割。残るもの：装備・アイテム・仲間・習得アビリティ・マスター済みジョブ・転生ボード。'),
          btn('転生する', () => { if (!confirm('転生する？')) return; const lines = G.doRebirth(s, r.blessing, r.trials, r.start); toast(lines.join('\n'), 5000); this.rebirthTab = '転生ボード'; this.render(); }, 'primary', !canDo)));
    } else {
      const cats = [...new Set(BOARD.map(b => b.cat))];
      body = h('div', {}, h('div', { class: 'win' }, h('h2', {}, `TP ${s.tp}`), h('div', { class: 'dim', style: 'font-size:12px' }, '隣接する開放済みマスから買える。重ね買いはコスト×1.5。')),
        ...cats.map(cat => h('div', { class: 'win' }, h('h2', {}, cat), h('div', { class: 'list', style: 'max-height:none' }, ...BOARD.filter(b => b.cat === cat && b.id !== 'start').map(b => { const n = s.board[b.id] ?? 0; const cb = canBuy(s, b.id); return h('div', { class: 'item' }, h('div', { class: 'grow' }, h('div', {}, `${b.name} `, h('span', { class: 'pill' }, `${n}/${b.max}`)), h('div', { class: 'dim', style: 'font-size:11px' }, b.desc)), btn(`${cb.cost}TP`, () => { if (buyNode(s, b.id)) toast('開放した'); this.render(); }, 'small', !cb.ok), !cb.ok && cb.reason !== 'TP不足' ? h('span', { class: 'dim', style: 'font-size:11px' }, cb.reason) : null); })))));
    }
    return this.shell({ title: '転生の祭壇', back: () => this.go('hub'), tabs: this.tabBtns(tabs, this.rebirthTab, x => { this.rebirthTab = x; }), content: [body] });
  }
  // ---------- 記録
  records(): HTMLElement {
    const s = this.s!;
    const ta = h('textarea', { rows: 4 }) as HTMLTextAreaElement;
    ta.value = exportSave(s);
    return this.shell({ title: '記録・図鑑・セーブ', back: () => this.go('hub'), content: [
      h('div', { class: 'win' }, h('h2', {}, '記録'), h('div', { class: 'dim' }, `最高到達 ${s.maxFloorEver}階 ／ 裏タワー最深 地下${s.maxDepthEver ?? 0}階 ／ 転生 ${s.rebirths}回 ／ 戦闘 ${s.stats.battles} ／ 撃破 ${s.stats.kills} ／ 捕獲 ${s.stats.captures}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, s.stats.rebirthLog.map((r, i) => `${i + 1}周目：${r.floor}階 +${r.tp}TP`).join('　'))),
      h('div', { class: 'win' }, h('h2', {}, '図鑑'), h('div', { class: 'dim', style: 'font-size:12px' }, `装備 ${s.codex.items.length}/${Object.values(ITEMS).filter(i => i.kind !== 'consumable' && i.kind !== 'material').length}　付加 ${s.codex.affixes.length}/${Object.keys(AFFIXES).length}　敵 ${s.codex.monsters.length}/${Object.keys(MONSTERS).length}`),
        h('div', { class: 'dim', style: 'font-size:12px' }, '敵：' + s.codex.monsters.map(m => MONSTERS[m].name).join('、'))),
      h('div', { class: 'win' }, h('h2', {}, 'セーブ書き出し'), h('div', { class: 'dim', style: 'font-size:12px' }, '端末を跨ぐときはこの文字列をコピーして、タイトル画面で読み込む。'), ta, btn('コピー', () => { navigator.clipboard?.writeText(ta.value).then(() => toast('コピーした')); }, 'small')),
      h('div', { class: 'win' }, h('h2', {}, '設定'), h('div', { class: 'row' }, h('span', { class: 'dim' }, '操作する手：'), btn('右手（ボタンは右寄せ）', () => { s.settings.hand = 'right'; this.render(); }, 'small' + (s.settings.hand === 'right' ? ' sel' : '')), btn('左手', () => { s.settings.hand = 'left'; this.render(); }, 'small' + (s.settings.hand === 'left' ? ' sel' : '')))),
      h('div', { class: 'win' }, btn('データを消して最初から', () => { if (confirm('本当に消す？')) { clear(); this.s = null; this.go('title'); } }, 'small'))] });
  }
}
function describeEffect(b: typeof ITEMS[string]): string {
  const e = b.effect!;
  switch (e.kind) { case 'heal': return `HP${e.power}回復`; case 'fullheal': return 'HP全回復'; case 'mp': return `MP${e.power}回復`; case 'revive': return '戦闘不能回復'; case 'cure': return '状態異常回復'; case 'damage': return `敵全体に${e.element}ダメージ`; case 'capture': return '捕獲（誰でも使える）'; case 'antilaw': return '10階分のロウを消す'; }
}
