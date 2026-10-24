// ATB戦闘エンジン。描画に依存しない。
import type { Skill, Status, Element, LawDef, ConsumableEffect } from './types';
import { BAD_STATUS, STATUS_JP } from './types';
import type { Gambit } from './state';
import type { Combatant, Command } from './entity';
import { isAlive, elementMultiplier } from './entity';
import { Rng } from './rng';
import { physDamage, magicDamage, healAmount, atbRate, captureChance } from './formulas';
import { SKILLS } from '../data/skills';
import { ITEMS } from '../data/items';

export interface LogEntry { text: string; kind: 'info' | 'dmg' | 'heal' | 'bad' | 'good' | 'law' | 'sys' }
export interface Fx { type: 'hit' | 'heal' | 'miss' | 'status' | 'act'; uid: string; amount?: number; text?: string; crit?: boolean }
export interface BattleOptions {
  floor: number;
  law: LawDef | null;
  noItem: boolean;
  auto: boolean;
  respectLaw: boolean;
  bag: Record<string, number>;
  gil: number;
  canCaptureMidboss: boolean;
  canFlee: boolean;
  windBlessing: boolean;
}
export type BattleResult = 'running' | 'won' | 'lost' | 'fled';
export interface Action { cmd: Command; targetUid?: string }

const BUFF_DUR = 40, DEBUFF_DUR = 25;

export class Battle {
  players: Combatant[];
  enemies: Combatant[];
  rng: Rng;
  opt: BattleOptions;
  log: LogEntry[] = [];
  fx: Fx[] = [];
  result: BattleResult = 'running';
  pending: Combatant | null = null;
  lawViolated = false;
  lawFavored = false;
  stolen: string[] = [];
  captured: Combatant[] = [];
  gilSpent = 0;
  time = 0;
  waitingAuto = false;
  uses: { uid: string; kind: 'weapon' | 'shield' | 'spell'; key: string }[] = [];

  constructor(players: Combatant[], enemies: Combatant[], rng: Rng, opt: BattleOptions) {
    this.players = players; this.enemies = enemies; this.rng = rng; this.opt = opt;
    for (const c of [...players, ...enemies]) {
      c.atb = rng.range(0, 40) + (c.side === 'player' ? c.mods.first * 100 : 0);
      if (c.supports.has('auto_regen')) c.statuses.regen = BUFF_DUR;
      if (c.supports.has('auto_protect')) c.statuses.protect = BUFF_DUR;
      if (c.supports.has('auto_shell')) c.statuses.shell = BUFF_DUR;
      if (c.supports.has('auto_haste')) c.statuses.haste = BUFF_DUR;
      if (c.mods.hermes) c.statuses.haste = 9999;
    }
    if (opt.law) this.say(`ロウ：${opt.law.name}`, 'law');
  }
  say(text: string, kind: LogEntry['kind'] = 'info') { this.log.push({ text, kind }); if (this.log.length > 200) this.log.shift(); }
  all(): Combatant[] { return [...this.players, ...this.enemies]; }
  alivePlayers() { return this.players.filter(isAlive); }
  aliveEnemies() { return this.enemies.filter(isAlive); }

  /** 戦闘時間を dt 秒進める。手動入力待ちになったら pending に入って止まる */
  tick(dt: number): void {
    if (this.result !== 'running' || this.pending) return;
    this.time += dt;
    const order = this.all().filter(isAlive).sort((a, b) => b.atb - a.atb);
    for (const c of order) {
      if (!isAlive(c)) continue;
      // 状態の時間経過
      for (const k of Object.keys(c.statuses) as Status[]) {
        const left = (c.statuses[k] ?? 0) - dt;
        if (left <= 0 && k !== 'poison') delete c.statuses[k]; else c.statuses[k] = Math.max(left, k === 'poison' ? 999 : left);
      }
      const stuck = c.statuses.sleep || c.statuses.paralyze;
      if (!stuck) {
        let rate = atbRate(c.stats.spd);
        if (c.statuses.haste) rate *= 1.5;
        if (c.statuses.slow) rate *= 0.6;
        c.atb += rate * dt;
      }
      if (c.atb >= 100) {
        this.turnStart(c);
        if (!isAlive(c)) { this.checkEnd(); if (this.result !== 'running') return; continue; }
        if (c.side === 'enemy') { this.enemyAct(c); }
        else {
          const act = this.decideGambit(c);
          if (act) this.act(c, act);
          else if (this.opt.auto) this.act(c, this.autoFallback(c));
          else { this.pending = c; return; }
        }
        if (this.result !== 'running') return;
      }
    }
  }
  private turnStart(c: Combatant) {
    c.defending = 0;
    if (c.statuses.poison) { const d = Math.max(1, Math.round(c.stats.hp * 0.05)); this.damage(c, d, 'poison'); this.say(`${c.name}は毒で${d}のダメージ`, 'bad'); }
    if (c.statuses.regen && isAlive(c)) { const h = Math.round(c.stats.hp * 0.06); this.heal(c, h); }
    if (c.mods.regen > 0 && isAlive(c)) this.heal(c, Math.round(c.stats.hp * c.mods.regen));
  }

  /** 手動コマンド */
  command(action: Action): void {
    if (!this.pending) return;
    const c = this.pending; this.pending = null;
    this.act(c, action);
  }
  availableTargets(c: Combatant, skill: Skill): Combatant[] {
    switch (skill.target) {
      case 'enemy': case 'enemies': return c.side === 'player' ? this.aliveEnemies() : this.alivePlayers();
      case 'ally': case 'allies': return c.side === 'player' ? this.alivePlayers() : this.aliveEnemies();
      case 'self': return [c];
      case 'dead_ally': return (c.side === 'player' ? this.players : this.enemies).filter(x => x.hp <= 0 && !x.captured);
    }
  }
  private pickTarget(c: Combatant, skill: Skill, uid?: string): Combatant | null {
    const cands = this.availableTargets(c, skill);
    if (cands.length === 0) return null;
    if (uid) { const t = cands.find(x => x.uid === uid); if (t) return t; }
    if (skill.effect === 'heal' || skill.effect === 'cure' || skill.effect === 'buff') {
      if (skill.effect === 'heal') return cands.reduce((a, b) => a.hp / a.stats.hp < b.hp / b.stats.hp ? a : b);
      if (skill.effect === 'cure') return cands.find(x => BAD_STATUS.some(s => x.statuses[s])) ?? cands[0];
      return cands.find(x => !x.statuses[skill.status as Status]) ?? cands[0];
    }
    if (skill.effect === 'capture') return cands.reduce((a, b) => a.hp / a.stats.hp < b.hp / b.stats.hp ? a : b);
    const el = skill.element ?? c.weaponElement;
    if (el && el !== 'none') { const weak = cands.filter(t => elementMultiplier(t, el) > 1); if (weak.length) return this.rng.pick(weak); }
    const safe = cands.filter(t => elementMultiplier(t, el) > 0);
    return this.rng.pick(safe.length ? safe : cands);
  }

  act(c: Combatant, action: Action): void {
    const skill = action.cmd.skill;
    c.atb = 0;
    // ロウ判定
    const tags = this.actionTags(c, skill, action.cmd);
    if (this.opt.law && c.side === 'player') {
      if (tags.has(this.opt.law.forbid)) { this.lawViolated = true; this.say(`ジャッジ：${c.name}の「${action.cmd.name}」はロウ違反！`, 'law'); }
      if (tags.has(this.opt.law.favor)) this.lawFavored = true;
    }
    if (action.cmd.group === 'item') { this.useItem(c, action.cmd.id, action.targetUid); this.after(); return; }
    if (skill.mp > 0) {
      const mpCost = c.supports.has('half_mp') ? Math.ceil(skill.mp / 2) : skill.mp;
      if (c.mp < mpCost) { this.say(`${c.name}はMPが足りない`, 'sys'); this.after(); return; }
      if (c.statuses.silence && skill.kind === 'spell') { this.say(`${c.name}は沈黙していて唱えられない`, 'bad'); this.after(); return; }
      c.mp -= mpCost;
    }
    if (skill.effect !== 'defend' && skill.effect !== 'flee') this.fx.push({ type: 'act', uid: c.uid, text: skill.kind === 'spell' || skill.effect === 'magic' || skill.effect === 'heal' ? 'cast' : 'attack' });
    if (skill.kind === 'limit') { c.limit = 0; this.say(`${c.name}のリミット技「${skill.name}」！`, 'good'); }
    const targets = this.resolveTargets(c, skill, action.targetUid);
    if (c.kind === 'hero') { if (skill.kind === 'spell') this.uses.push({ uid: c.uid, kind: 'spell', key: skill.id }); else if (skill.effect === 'phys') this.uses.push({ uid: c.uid, kind: 'weapon', key: c.weaponType ?? 'fist' }); }
    if (skill.effect !== 'defend' && skill.effect !== 'flee' && skill.effect !== 'focus') this.say(`${c.name}の${skill.name}`);
    switch (skill.effect) {
      case 'phys': for (const t of targets) this.physHit(c, t, skill); break;
      case 'magic': for (const t of targets) this.magicHit(c, t, skill); break;
      case 'drain': for (const t of targets) { const d = this.magicHit(c, t, skill); if (d > 0) this.heal(c, Math.round(d * 0.6)); } break;
      case 'heal': if (skill.kind === 'spell') { const ml = c.mods.spellMastery[skill.id] ?? 0; if (ml) c.mods.heal += 0.03 * ml; } if (skill.id === 'chakra') { const h = Math.round(c.stats.hp * 0.25); this.heal(c, h); for (const s of BAD_STATUS) delete c.statuses[s]; this.say(`${c.name}のHPが${h}回復し状態異常が治った`, 'heal'); break; } for (const t of targets) { const h = Math.round(healAmount(skill.power, c.stats.mag, c.stats.spr) * (1 + c.mods.heal) * (targets.length > 1 ? 0.8 : 1)); this.heal(t, h); this.say(`${t.name}のHPが${h}回復`, 'heal'); } break;
      case 'revive': for (const t of targets) { t.hp = Math.max(1, Math.round(t.stats.hp * skill.power)); this.say(`${t.name}が復活した`, 'good'); } break;
      case 'cure': for (const t of targets) { if (skill.status) delete t.statuses[skill.status]; else for (const s of BAD_STATUS) delete t.statuses[s]; this.say(`${t.name}の状態異常が治った`, 'good'); } break;
      case 'buff': for (const t of targets) if (skill.status) { t.statuses[skill.status] = BUFF_DUR; this.say(`${t.name}に${STATUS_JP[skill.status]}`, 'good'); } break;
      case 'status': for (const t of targets) this.inflict(c, t, skill.status!, skill.chance ?? 0.5, skill); break;
      case 'defend': c.defending = skill.power >= 1 ? 1 : 0.5; this.say(`${c.name}は身を守っている`); break;
      case 'focus': c.focus = skill.power; this.say(`${c.name}は力をためた`); break;
      case 'flee': if (skill.power >= 1 && this.opt.canFlee) { this.say('とんずらした', 'good'); this.result = 'fled'; } else this.tryFlee(c); break;
      case 'steal': for (const t of targets) this.steal(c, t, skill); break;
      case 'capture': for (const t of targets) this.tryCapture(c, t); break;
      case 'gil_toss': { const cost = Math.min(this.opt.gil - this.gilSpent, 50 * this.opt.floor); if (cost <= 0) { this.say('ギルがない', 'sys'); break; } this.gilSpent += cost; for (const t of targets) this.damageHit(c, t, Math.round(cost / targets.length), 'none', false); break; }
      case 'fixed': for (const t of targets) {
        let d = c.kind === 'enemy' ? skill.power * Math.min(1, this.opt.floor / 100) : skill.power;
        if (skill.power < 0) d = Math.round(t.hp * -skill.power * (t.boss ? 0.25 : 1));
        if (skill.id === 'self_destruct') { d = Math.round(c.hp * 0.7); }
        if (skill.id === 'grudge') d = 6 * this.opt.floor + 100 * c.kills;
        if (c.mods.cactuar && skill.id === 'needles') d = c.mods.cactuar;
        this.damageHit(c, t, d, skill.element ?? 'none', true);
        if (skill.id === 'self_destruct') { c.hp = 0; this.say(`${c.name}は自爆した`, 'bad'); }
      } break;
      case 'limit': break;
    }
    this.after();
  }
  private after() {
    this.checkEnd();
  }
  private actionTags(c: Combatant, skill: Skill, cmd: Command): Set<string> {
    const t = new Set<string>();
    if (cmd.group === 'item') t.add('item');
    if (skill.kind === 'spell') t.add('magic');
    if (skill.tag) t.add(skill.tag);
    if (skill.effect === 'phys') t.add('physical');
    if ((skill.element ?? (skill.effect === 'phys' ? c.weaponElement : null)) === 'fire') t.add('fire');
    if (skill.effect === 'heal' || skill.effect === 'revive') t.add('heal');
    if (skill.status && (skill.effect === 'status' || skill.effect === 'magic')) t.add('status');
    if (c.kind === 'ally') t.add('monster');
    if (skill.kind === 'limit') t.add('limit');
    return t;
  }
  private resolveTargets(c: Combatant, skill: Skill, uid?: string): Combatant[] {
    if (skill.target === 'enemies' || skill.target === 'allies') return this.availableTargets(c, skill);
    const t = this.pickTarget(c, skill, uid);
    return t ? [t] : [];
  }
  // ---- ダメージ処理
  private physHit(c: Combatant, t: Combatant, skill: Skill) {
    const hits = (skill.hits ?? 1) + (c.mods.genji ? 1 : 0) + (this.rng.chance(c.mods.multi) ? 1 : 0);
    for (let i = 0; i < hits; i++) {
      if (!isAlive(t)) break;
      if (this.rng.chance(t.mods.evasion + (c.statuses.blind ? 0.5 : 0) + (t.statuses.blink ? 0.5 : 0))) { this.say(`${t.name}はかわした`); this.fx.push({ type: 'miss', uid: t.uid }); continue; }
      const el = skill.element ?? c.weaponElement;
      let mult = skill.power * c.focus;
      if (c.mods.brave && c.hp >= c.stats.hp) mult *= 1.5;
      if (c.supports.has('desperate') && c.hp <= c.stats.hp * 0.3) mult *= 1.5;
      if (t.family in c.mods.slayer) mult *= 1 + c.mods.slayer[t.family];
      if (t.boss && c.mods.slayer.boss) mult *= 1 + c.mods.slayer.boss;
      const crit = this.rng.chance(c.mods.crit);
      if (crit) mult *= 2;
      const def = t.def * (1 - c.mods.pierce);
      let d = physDamage(c.atk, c.stats.str, def, mult, this.rng.range(0.9, 1.1));
      d = this.applyDefMods(t, d, 'phys');
      const em = elementMultiplier(t, el);
      if (em > 1) this.lawFavored = this.lawFavored || this.opt.law?.favor === 'weak';
      if (el && el !== 'none') d = Math.round(d * (1 + (c.mods.elementDmg[el] ?? 0)));
      this.dealElemental(c, t, d, em, crit);
      if (c.mods.vamp > 0 && d > 0) this.heal(c, Math.round(d * c.mods.vamp));
      for (const inf of c.mods.inflict) if (isAlive(t)) this.inflict(c, t, inf.status, inf.chance, null, true);
      if (skill.id === 'mug') this.steal(c, t, skill);
      // カウンター
      if (isAlive(t) && t.supports.has('counter') && this.rng.chance(0.5) && skill.effect === 'phys' && c.side !== t.side) {
        this.say(`${t.name}のカウンター！`, 'good');
        const d2 = physDamage(t.atk, t.stats.str, c.def, 1, this.rng.range(0.9, 1.1));
        this.dealElemental(t, c, this.applyDefMods(c, d2, 'phys'), elementMultiplier(c, t.weaponElement), false);
      }
    }
    c.focus = 1;
  }
  private magicHit(c: Combatant, t: Combatant, skill: Skill): number {
    const el = skill.element ?? 'none';
    const pw = c.kind === 'enemy' ? skill.power * Math.min(1, 0.1 + this.opt.floor / 60) : skill.power * (1 + 0.03 * (c.mods.spellMastery[skill.id] ?? 0));
    let d = magicDamage(pw, c.stats.mag, t.mdef, 1, this.rng.range(0.9, 1.1));
    d = this.applyDefMods(t, d, 'magic');
    if (el !== 'none') d = Math.round(d * (1 + (c.mods.elementDmg[el] ?? 0)));
    const em = elementMultiplier(t, el);
    if (em > 1) this.lawFavored = this.lawFavored || this.opt.law?.favor === 'weak';
    const dealt = this.dealElemental(c, t, d, em, false);
    if (skill.status && isAlive(t)) this.inflict(c, t, skill.status, skill.chance ?? 0.3, null, true);
    return dealt;
  }
  private damageHit(c: Combatant, t: Combatant, d: number, el: Element, ignoreDef: boolean) {
    const em = elementMultiplier(t, el);
    this.dealElemental(c, t, ignoreDef ? d : this.applyDefMods(t, d, 'phys'), em, false);
  }
  private applyDefMods(t: Combatant, d: number, kind: 'phys' | 'magic'): number {
    if (t.defending >= 1) return 0;
    if (t.defending > 0) d *= 0.5;
    if (kind === 'phys' && t.statuses.protect) d *= 0.5;
    if (kind === 'magic' && t.statuses.shell) d *= 0.5;
    if (kind === 'magic' && t.mods.magicBarrier) d *= 1 - t.mods.magicBarrier;
    if (t.statuses.sleep) d *= 1.3;
    return Math.round(d);
  }
  /** 属性倍率を適用して与える。吸収は回復。戻り値は与えたダメージ */
  private dealElemental(c: Combatant, t: Combatant, d: number, em: number, crit: boolean): number {
    if (em < 0) { const h = Math.round(d); this.heal(t, h); this.say(`${t.name}は${h}吸収した`, 'bad'); return 0; }
    if (em === 0) { this.say(`${t.name}には効かない`); this.fx.push({ type: 'miss', uid: t.uid, text: '無効' }); return 0; }
    d = Math.round(d * em);
    this.damage(t, d, 'hit');
    this.fx.push({ type: 'hit', uid: t.uid, amount: d, crit });
    this.say(`${t.name}に${d}のダメージ${crit ? '（会心）' : ''}${em > 1 ? '（弱点）' : em < 1 ? '（半減）' : ''}`, 'dmg');
    if (!isAlive(t)) { c.kills++; this.say(`${t.name}を倒した`, 'good'); }
    return d;
  }
  private damage(t: Combatant, d: number, _src: string) {
    t.hp = Math.max(0, t.hp - d);
    if (t.statuses.sleep) delete t.statuses.sleep;
    if (t.kind === 'hero') t.limit = Math.min(100, t.limit + (d / t.stats.hp) * 70 * (t.supports.has('limit_up') ? 1.5 : 1));
    // オートポーション：袋のポーションを自動で使う（戦闘中の袋を消費）
    if (t.hp > 0 && t.side === 'player' && t.supports.has('auto_potion') && !this.opt.noItem) {
      const pid = ['x_potion', 'hi_potion', 'potion'].find(k => (this.opt.bag[k] ?? 0) > 0);
      if (pid) { this.opt.bag[pid]--; const h = pid === 'x_potion' ? t.stats.hp : pid === 'hi_potion' ? 500 : 100; this.heal(t, h); this.say(`${t.name}はオートポーション（${pid === 'x_potion' ? 'エクスポーション' : pid === 'hi_potion' ? 'ハイポーション' : 'ポーション'}）`, 'heal'); }
    }
    if (t.hp <= 0 && t.mods.phoenix && !t.phoenixUsed) { t.phoenixUsed = true; t.hp = Math.round(t.stats.hp * 0.5); this.say(`${t.name}はフェニックスの力で蘇った`, 'good'); }
  }
  private heal(t: Combatant, h: number) {
    if (!isAlive(t)) return;
    t.hp = Math.min(t.stats.hp, t.hp + h);
    this.fx.push({ type: 'heal', uid: t.uid, amount: h });
  }
  private inflict(c: Combatant, t: Combatant, st: Status, chance: number, skill: Skill | null, quiet = false) {
    const res = t.mods.statusRes[st] ?? 0;
    if (c.kind === 'ally' && c.role === 'jammer') chance *= 2;
    if (t.boss && (st === 'sleep' || st === 'paralyze')) chance *= 0.3;
    if (this.rng.chance(chance * (1 - res))) {
      t.statuses[st] = st === 'poison' ? 999 : DEBUFF_DUR;
      this.say(`${t.name}は${STATUS_JP[st]}になった`, 'bad');
      this.fx.push({ type: 'status', uid: t.uid, text: STATUS_JP[st] });
    } else if (!quiet) this.say(`${t.name}には効かなかった`);
  }
  private tryFlee(c: Combatant) {
    if (!this.opt.canFlee) { this.say('逃げられない！', 'bad'); return; }
    const p = this.opt.windBlessing ? 1 : 0.45 + c.mods.first + c.stats.luck / 400;
    if (this.rng.chance(p)) { this.say('うまく逃げ切れた', 'good'); this.result = 'fled'; }
    else this.say('逃げられなかった', 'bad');
  }
  private steal(c: Combatant, t: Combatant, skill: Skill) {
    const p = skill.power + c.mods.steal + c.stats.luck / 300;
    if (skill.id === 'gil_steal') { if (this.rng.chance(p)) { const g = Math.round(10 * this.opt.floor * this.rng.range(0.5, 1.5)); this.gilSpent -= g; this.say(`${t.name}から${g}ギルを盗んだ`, 'good'); if (this.opt.law?.favor === 'steal') this.lawFavored = true; } else this.say('盗めなかった'); return; }
    if (this.rng.chance(p)) {
      const mat = (t.ref && (ITEMS_MATERIAL_OF[t.ref] ?? null));
      const got = mat ?? this.rng.pick(['potion', 'hi_potion', 'ether', 'antidote', 'phoenix_down']);
      this.stolen.push(got);
      this.say(`${t.name}から${ITEMS[got].name}を盗んだ`, 'good');
      if (this.opt.law?.favor === 'steal') this.lawFavored = true;
    } else this.say('盗めなかった');
  }
  private tryCapture(c: Combatant, t: Combatant) {
    if (t.boss && !(t.midboss && this.opt.canCaptureMidboss)) { this.say(`${t.name}は捕獲できない`, 'bad'); return; }
    const statusBonus = (t.statuses.sleep || t.statuses.paralyze) ? 1.5 : 1;
    const p = captureChance(t.captureRate, t.hp / t.stats.hp, statusBonus, c.mods.capture);
    if (this.rng.chance(p)) {
      t.captured = true; this.captured.push(t);
      this.say(`${t.name}を捕まえた！`, 'good');
      if (this.opt.law?.favor === 'capture') this.lawFavored = true;
    } else this.say(`${t.name}は暴れて逃れた（${Math.round(p * 100)}%）`);
  }
  // ---- アイテム
  useItem(c: Combatant, itemId: string, targetUid?: string) {
    const base = ITEMS[itemId];
    const ef = base.effect as ConsumableEffect;
    if ((this.opt.bag[itemId] ?? 0) <= 0) { this.say('持っていない', 'sys'); return; }
    if (this.opt.noItem) { this.say('試練：アイテムは使えない', 'sys'); return; }
    const pseudo: Skill = { id: itemId, name: base.name, kind: 'item', mp: 0, target: ef.target, effect: 'heal', power: 0, desc: '' };
    if (ef.kind === 'revive') pseudo.target = 'dead_ally';
    if (ef.kind === 'capture' || ef.kind === 'damage') pseudo.target = ef.target;
    if (ef.kind === 'heal' || ef.kind === 'fullheal' || ef.kind === 'mp' || ef.kind === 'cure') pseudo.target = 'ally';
    if (ef.kind === 'cure') pseudo.effect = 'cure';
    if (ef.kind === 'capture') pseudo.effect = 'capture';
    const targets = this.resolveTargets(c, pseudo, targetUid);
    if (targets.length === 0 && ef.kind !== 'antilaw') { this.say('対象がいない', 'sys'); return; }
    this.opt.bag[itemId]--;
    this.say(`${c.name}は${base.name}を使った`);
    for (const t of targets) {
      switch (ef.kind) {
        case 'heal': this.heal(t, ef.power!); this.say(`${t.name}のHPが${ef.power}回復`, 'heal'); break;
        case 'fullheal': this.heal(t, t.stats.hp); this.say(`${t.name}のHPが全回復`, 'heal'); break;
        case 'mp': t.mp = Math.min(t.stats.mp, t.mp + ef.power!); this.say(`${t.name}のMPが${ef.power}回復`, 'heal'); break;
        case 'revive': t.hp = Math.max(1, Math.round(t.stats.hp * ef.power!)); this.say(`${t.name}が復活した`, 'good'); break;
        case 'cure': for (const s of BAD_STATUS) delete t.statuses[s]; this.say(`${t.name}の状態異常が治った`, 'good'); break;
        case 'damage': this.damageHit(c, t, ef.power! * (1 + this.opt.floor / 50), ef.element ?? 'none', true); break;
        case 'capture': { const save = c.mods.capture; c.mods.capture = save + 0.3; this.tryCapture(c, t); c.mods.capture = save; break; }
        case 'antilaw': break;
      }
    }
  }
  // ---- 敵AI
  private enemyAct(c: Combatant) {
    const skills = c.commands.filter(k => k.group !== 'basic' && c.mp >= k.skill.mp);
    let cmd = c.commands[0];
    const useSkill = skills.length > 0 && this.rng.chance(c.boss ? 0.5 : 0.3);
    if (useSkill) cmd = this.rng.pick(skills);
    if (cmd.skill.id === 'self_destruct' && c.hp > c.stats.hp * 0.4) cmd = c.commands[0];
    let target: Combatant | undefined;
    if (cmd.skill.target === 'enemy') {
      const cands = this.alivePlayers();
      target = this.rng.pick(cands);
      // かばう
      if (cmd.skill.effect === 'phys' && target.hp < target.stats.hp * 0.3) {
        const cover = cands.find(p => p !== target && p.supports.has('cover') && p.hp > p.stats.hp * 0.3);
        if (cover) { this.say(`${cover.name}が${target.name}をかばう！`, 'good'); target = cover; }
      }
    }
    this.act(c, { cmd, targetUid: target?.uid });
  }
  // ---- 作戦
  decideGambit(c: Combatant): Action | null {
    const allies = this.alivePlayers(), enemies = this.aliveEnemies();
    for (const [gi, g] of c.gambits.entries()) {
      if (!g.on) continue;
      let target: Combatant | undefined;
      switch (g.cond) {
        case 'always': break;
        case 'once': if (c.onceUsed?.has(gi)) continue; break;
        case 'ally_hp_lt_50': target = allies.find(a => a.hp < a.stats.hp * 0.5); if (!target) continue; break;
        case 'ally_hp_lt_30': target = allies.find(a => a.hp < a.stats.hp * 0.3); if (!target) continue; break;
        case 'self_hp_lt_30': if (c.hp >= c.stats.hp * 0.3) continue; target = c; break;
        case 'ally_dead': target = this.players.find(a => a.hp <= 0 && !a.captured); if (!target) continue; break;
        case 'ally_bad_status': target = allies.find(a => BAD_STATUS.some(s => a.statuses[s])); if (!target) continue; break;
        case 'enemy_weak': { const el = this.actionElement(c, g.action); target = enemies.find(e => elementMultiplier(e, el) > 1); if (!target) continue; break; }
        case 'enemy_hp_lt_30': target = enemies.find(e => e.hp < e.stats.hp * 0.3); if (!target) continue; break;
        case 'enemy_capturable': target = enemies.find(e => e.hp < e.stats.hp * 0.3 && !e.boss); if (!target) continue; break;
        case 'enemy_boss': target = enemies.find(e => e.boss); if (!target) continue; break;
        case 'enemy_count_ge_2': if (enemies.length < 2) continue; break;
        case 'enemy_count_ge_3': if (enemies.length < 3) continue; break;
        case 'mp_gt_10': if (c.mp < c.stats.mp * 0.1) continue; break;
        case 'mp_gt_30': if (c.mp < c.stats.mp * 0.3) continue; break;
        case 'mp_gt_60': if (c.mp < c.stats.mp * 0.6) continue; break;
        case 'limit_ready': if (c.limit < 100) continue; break;
        case 'not_buffed': if (c.statuses.protect || c.statuses.shell || c.statuses.haste) continue; target = c; break;
        default: continue;
      }
      const cmd = this.commandFor(c, g.action);
      if (!cmd) continue;
      if (cmd.group === 'item' && (this.opt.bag[cmd.id] ?? 0) <= 0) continue;
      if (cmd.skill.mp > c.mp) continue;
      if (cmd.skill.effect === 'buff' && target && target.statuses[cmd.skill.status as Status]) continue;
      if (cmd.skill.effect === 'revive' && !(target && target.hp <= 0)) continue;
      if (cmd.skill.effect === 'capture' && !(target && !target.boss)) continue;
      if (this.opt.respectLaw && this.opt.law && this.actionTags(c, cmd.skill, cmd).has(this.opt.law.forbid)) continue;
      if (cmd.skill.target === 'dead_ally' && !target) continue;
      if (g.cond === 'once') { (c.onceUsed ??= new Set()).add(gi); }
      if (cmd.skill.effect === 'phys' || cmd.skill.effect === 'magic' || cmd.skill.effect === 'drain') {
        const el = cmd.skill.element ?? (cmd.skill.effect === 'phys' ? c.weaponElement : null);
        if (el && el !== 'none' && enemies.every(e => elementMultiplier(e, el) <= 0)) continue;
        if (target && target.side === 'enemy' && elementMultiplier(target, el) <= 0) continue;
      }
      return { cmd, targetUid: target?.uid };
    }
    return null;
  }
  /** 作戦に該当なしのときの自動行動：吸収されない攻撃を探す */
  autoFallback(c: Combatant): Action {
    const enemies = this.aliveEnemies();
    const ok = (el: Element | null | undefined) => enemies.some(e => elementMultiplier(e, el) > 0);
    const legal = (cmd: Command) => !(this.opt.respectLaw && this.opt.law && this.actionTags(c, cmd.skill, cmd).has(this.opt.law.forbid));
    if (ok(c.weaponElement) && legal(c.commands[0])) return { cmd: c.commands[0] };
    for (const cmd of c.commands) {
      if ((cmd.skill.effect === 'phys' || cmd.skill.effect === 'magic') && cmd.skill.mp <= c.mp && ok(cmd.skill.element ?? c.weaponElement) && legal(cmd)) return { cmd };
    }
    // 合法な攻撃手段がない：防御で固まるより違反して殴る（イエローカード覚悟）
    if (ok(c.weaponElement)) return { cmd: c.commands[0] };
    for (const cmd of c.commands) if ((cmd.skill.effect === 'phys' || cmd.skill.effect === 'magic') && cmd.skill.mp <= c.mp && ok(cmd.skill.element ?? c.weaponElement)) return { cmd };
    return { cmd: c.commands.find(k => k.id === 'defend') ?? c.commands[0] };
  }
  /** そのコマンドが現在のロウに違反するか（UI用） */
  violates(c: Combatant, cmd: Command): boolean {
    return !!(this.opt.law && this.actionTags(c, cmd.skill, cmd).has(this.opt.law.forbid));
  }
  private actionElement(c: Combatant, action: string): Element | null {
    const cmd = this.commandFor(c, action);
    if (!cmd) return null;
    return cmd.skill.element ?? (cmd.skill.effect === 'phys' ? c.weaponElement : null);
  }
  commandFor(c: Combatant, action: string): Command | null {
    if (action === 'attack') return c.commands[0];
    if (action === 'defend') return c.commands.find(k => k.id === 'defend') ?? null;
    if (action === 'limit') return c.limitSkill && c.limit >= 100 ? { id: c.limitSkill, name: SKILLS[c.limitSkill].name, skill: SKILLS[c.limitSkill], group: 'limit' } : null;
    if (action.startsWith('skill:')) return c.commands.find(k => k.id === action.slice(6)) ?? null;
    if (action.startsWith('item:')) { const id = action.slice(5); const b = ITEMS[id]; if (!b?.effect) return null; return { id, name: b.name, skill: { id, name: b.name, kind: 'item', mp: 0, target: b.effect.target, effect: 'heal', power: 0, desc: '' }, group: 'item' }; }
    return null;
  }
  private checkEnd() {
    if (this.result !== 'running') return;
    if (this.aliveEnemies().length === 0) { this.result = 'won'; this.say('勝利！', 'good'); }
    else if (this.alivePlayers().length === 0) { this.result = 'lost'; this.say('全滅した…', 'bad'); }
  }
}
import { MONSTERS } from '../data/monsters';
const ITEMS_MATERIAL_OF: Record<string, string | undefined> = Object.fromEntries(Object.values(MONSTERS).map(m => [m.id, m.material]));
