// おまかせ作戦：メンバーの持ち技・役割・現在のロウから作戦を自動生成する
import type { LawDef, Skill, AutoMode } from './types';
import type { Gambit } from './state';
import { ITEMS } from '../data/items';
import type { Combatant, Command } from './entity';

function tagsOf(c: Combatant, cmd: Command): Set<string> {
  const skill = cmd.skill, t = new Set<string>();
  if (cmd.group === 'item') t.add('item');
  if (skill.kind === 'spell') t.add('magic');
  if (skill.tag) t.add(skill.tag);
  if (skill.effect === 'phys') t.add('physical');
  if ((skill.element ?? (skill.effect === 'phys' ? c.weaponElement : null)) === 'fire') t.add('fire');
  if (skill.effect === 'heal' || skill.effect === 'revive') t.add('heal');
  if (skill.status && (skill.effect === 'status' || skill.effect === 'magic')) t.add('status');
  if (skill.kind === 'limit') t.add('limit');
  return t;
}
const itemCmd = (id: string, target: Skill['target']): Command => ({ id, name: id, skill: { id, name: id, kind: 'item', mp: 0, target, effect: 'heal', power: 0, desc: '' }, group: 'item' });

export const AUTO_MODES: { id: AutoMode; name: string; desc: string }[] = [
  { id: 'balanced', name: 'バランス', desc: '役割に応じて回復・弱点・攻撃を自動配分' },
  { id: 'attack', name: 'ガンガンいこうぜ', desc: '攻撃最優先。回復は瀕死のときだけ、MPは気にしない' },
  { id: 'skill', name: 'アビリティ主体', desc: '技・魔法を常に使う。弱点・全体・状態異常を積極的に' },
  { id: 'save', name: 'MP温存', desc: '技・魔法はMP60%以上のときだけ。基本はたたかう' },
  { id: 'heal', name: 'いのちだいじに', desc: '回復と強化を優先。HP50%で回復、瀕死なら防御' },
  { id: 'noheal', name: '回復はしない', desc: '回復・蘇生の行を入れない（他の仲間に任せる）' },
];
export function recommendGambits(c: Combatant, law: LawDef | null, bag: Record<string, number>, opts: { roleHint?: 'healer' | 'mage' | 'attacker'; mode?: AutoMode } = {}): Gambit[] {
  const mode: AutoMode = opts.mode ?? 'balanced';
  const legal = (cmd: Command) => !law || !tagsOf(c, cmd).has(law.forbid);
  const cmds = c.commands.filter(k => k.group !== 'basic');
  const by = (f: (s: Skill) => boolean) => cmds.filter(k => f(k.skill) && legal(k));
  const strongest = (list: Command[]) => [...list].sort((a, b) => b.skill.power - a.skill.power)[0];
  const heals = by(s => s.effect === 'heal' && s.target !== 'self');
  const revives = by(s => s.effect === 'revive');
  const cures = by(s => s.effect === 'cure');
  const buffs = by(s => s.effect === 'buff' && (s.status === 'protect' || s.status === 'haste' || s.status === 'shell'));
  const captures = by(s => s.effect === 'capture');
  const steals = by(s => s.effect === 'steal');
  const dmgSingle = by(s => (s.effect === 'phys' || s.effect === 'magic' || s.effect === 'drain') && s.target === 'enemy');
  const dmgAll = by(s => (s.effect === 'phys' || s.effect === 'magic') && s.target === 'enemies');
  const elemental = [...dmgSingle, ...dmgAll].filter(k => k.skill.element && k.skill.element !== 'none');
  const statusAttacks = by(s => s.effect === 'status' && (s.status === 'sleep' || s.status === 'slow' || s.status === 'paralyze' || s.status === 'poison'));
  const g: Gambit[] = [];
  const row = (cond: string, action: string) => { if (!g.some(x => x.cond === cond && x.action === action)) g.push({ cond, action, on: true }); };
  const isHealer = heals.length >= 2 || opts.roleHint === 'healer' || c.role === 'healer';
  const isMage = dmgSingle.some(k => k.skill.effect === 'magic') || opts.roleHint === 'mage';
  const favor = law?.favor;
  // 1. リミット
  if (c.limitSkill) row('limit_ready', 'limit');
  // 2. 蘇生・回復（モードで閾値が変わる）
  if (mode !== 'noheal') {
    if (revives.length) row('ally_dead', 'skill:' + strongest(revives).id);
    else if ((bag.phoenix_down ?? 0) > 0 && (!law || law.forbid !== 'item') && (!law || law.forbid !== 'heal')) row('ally_dead', 'item:phoenix_down');
    if (heals.length) {
      const h = strongest(heals); const hAll = heals.find(k => k.skill.target === 'allies');
      if (mode === 'heal') { row('ally_hp_lt_50', 'skill:' + (hAll ?? h).id); row('self_hp_lt_30', 'defend'); }
      row('ally_hp_lt_30', 'skill:' + h.id);
      if (isHealer && mode !== 'attack') row('ally_hp_lt_50', 'skill:' + (hAll ?? h).id);
    } else if (!law || (law.forbid !== 'item' && law.forbid !== 'heal')) { for (const it of ['x_potion', 'hi_potion', 'potion']) if ((bag[it] ?? 0) > 0) { row(mode === 'heal' ? 'ally_hp_lt_50' : 'ally_hp_lt_30', 'item:' + it); break; } }
    if (cures.length && mode !== 'attack') row('ally_bad_status', 'skill:' + cures[0].id);
  }
  // 3. ロウ推奨
  if (favor === 'capture') { if (captures.length) row('enemy_capturable', 'skill:' + captures[0].id); else if ((bag.magi_cage ?? 0) > 0 && law?.forbid !== 'item') row('enemy_capturable', 'item:magi_cage'); }
  if (favor === 'steal' && steals.length) row('once', 'skill:' + steals[0].id);
  if (favor === 'defend') row('once', 'defend');
  // 4. 捕獲（通常時も）
  if (captures.length) row('enemy_capturable', 'skill:' + captures[0].id);
  else if ((bag.magi_cage ?? 0) > 0 && (!law || law.forbid !== 'item')) row('enemy_capturable', 'item:magi_cage');
  // 5. 弱点を突く
  if (mode !== 'save') for (const k of elemental.sort((a, b) => b.skill.power - a.skill.power).slice(0, mode === 'skill' ? 6 : 4)) row('enemy_weak', 'skill:' + k.id);
  // 6. 強化（ヒーラー・魔道士）
  if (buffs.length && mode !== 'attack' && mode !== 'save' && (isHealer || isMage || mode === 'heal' || mode === 'skill')) row('not_buffed', 'skill:' + buffs[0].id);
  // 7. 全体技（敵3体以上）
  if (dmgAll.length && mode !== 'save') row(mode === 'skill' || mode === 'attack' ? 'enemy_count_ge_2' : 'enemy_count_ge_3', 'skill:' + strongest(dmgAll).id);
  // 8. 状態異常（ジャマー・魔道士）
  if ((c.role === 'jammer' || isMage || mode === 'skill') && statusAttacks.length && mode !== 'save' && mode !== 'attack' && (!law || law.forbid !== 'status')) row('enemy_boss', 'skill:' + statusAttacks[0].id);
  // 9. 主力攻撃
  const attackLegal = !law || law.forbid !== 'physical';
  if (dmgSingle.length) {
    const s = strongest(dmgSingle);
    const useSkill = isMage || !attackLegal || c.kind === 'ally' || mode === 'skill' || mode === 'attack';
    if (mode === 'save') { if (s.skill.mp > 0) row('mp_gt_60', 'skill:' + s.id); else row('always', 'skill:' + s.id); }
    else if (useSkill) { if (s.skill.mp > 0) row(mode === 'attack' ? 'mp_gt_10' : 'mp_gt_30', 'skill:' + s.id); else row('always', 'skill:' + s.id); }
  }
  // 合法な攻撃手段がなければ違反覚悟で殴る（防御で固まるより良い）
  if (attackLegal) row('always', 'attack'); else if (dmgSingle.length) row('always', 'skill:' + strongest(dmgSingle).id); else row('always', 'attack');
  return g.slice(0, 12);
}
export function describeGambit(g: Gambit, c: Combatant): string {
  const cond: Record<string, string> = { mp_gt_60: '自分MP>60%', mp_gt_10: '自分MP>10%', enemy_count_ge_2: '敵が2体以上', always: 'いつでも', ally_hp_lt_50: '味方HP<50%', ally_hp_lt_30: '味方HP<30%', self_hp_lt_30: '自分HP<30%', ally_dead: '味方が戦闘不能', ally_bad_status: '味方が状態異常', enemy_weak: '敵が弱点持ち', enemy_hp_lt_30: '敵HP<30%', enemy_capturable: '敵が捕獲圏内', enemy_boss: '敵がボス', enemy_count_ge_3: '敵が3体以上', mp_gt_30: '自分MP>30%', limit_ready: 'リミット可', not_buffed: '自分に強化なし', once: '1戦闘に1回' };
  let act = g.action;
  if (act === 'attack') act = 'たたかう'; else if (act === 'defend') act = 'ぼうぎょ'; else if (act === 'limit') act = 'リミット技';
  else if (act.startsWith('skill:')) act = c.commands.find(k => k.id === act.slice(6))?.name ?? act.slice(6);
  else if (act.startsWith('item:')) act = 'アイテム:' + (ITEMS[act.slice(5)]?.name ?? act.slice(5));
  return `${cond[g.cond] ?? g.cond} → ${act}`;
}
