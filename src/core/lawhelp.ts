// ロウ対策の補助（作戦の安全行）
import type { LawDef } from './types';
import type { Gambit } from './state';
import type { Combatant, Command } from './entity';
import { ITEMS } from '../data/items';

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
export function commandOf(c: Combatant, action: string): Command | null {
  if (action === 'attack') return c.commands[0];
  if (action === 'defend') return c.commands.find(k => k.id === 'defend') ?? null;
  if (action === 'limit') return c.limitSkill ? { id: c.limitSkill, name: 'リミット', skill: { id: c.limitSkill, name: 'リミット', kind: 'limit', mp: 0, target: 'enemy', effect: 'limit', power: 0, desc: '' }, group: 'limit' } : null;
  if (action.startsWith('skill:')) return c.commands.find(k => k.id === action.slice(6)) ?? null;
  if (action.startsWith('item:')) { const id = action.slice(5); const b = ITEMS[id]; if (!b?.effect) return null; return { id, name: b.name, skill: { id, name: b.name, kind: 'item', mp: 0, target: b.effect.target, effect: 'heal', power: 0, desc: '' }, group: 'item' }; }
  return null;
}
export function gambitViolates(c: Combatant, g: Gambit, law: LawDef): boolean {
  const cmd = commandOf(c, g.action);
  if (!cmd) return true;
  return tagsOf(c, cmd).has(law.forbid);
}
/** ロウに違反しない「いつでも」行を1つ作る */
export function lawSafeRow(c: Combatant, law: LawDef): Gambit {
  const cands = ['attack', ...c.commands.filter(k => k.group !== 'basic' && (k.skill.effect === 'phys' || k.skill.effect === 'magic')).map(k => 'skill:' + k.id), 'defend'];
  for (const a of cands) { const cmd = commandOf(c, a); if (cmd && !tagsOf(c, cmd).has(law.forbid)) return { cond: 'always', action: a, on: true }; }
  return { cond: 'always', action: 'defend', on: true };
}
