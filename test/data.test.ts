import { describe, it, expect } from 'vitest';
import { MONSTERS, AREAS } from '../src/data/monsters';
import { ITEMS } from '../src/data/items';
import { SKILLS } from '../src/data/skills';
import { JOBS, HEROES, SUPPORTS, COMMANDS } from '../src/data/jobs';
import { AFFIXES } from '../src/data/affixes';

describe('データ整合性', () => {
  it('エリアの敵・ボス・装備が存在する', () => {
    for (const a of AREAS) {
      for (const sub of a.subs) for (const m of sub.pool) expect(MONSTERS[m], `${a.name} ${m}`).toBeTruthy();
      for (const m of a.midBosses) expect(MONSTERS[m], `${a.name} mid ${m}`).toBeTruthy();
      expect(MONSTERS[a.boss], `${a.name} boss`).toBeTruthy();
      for (const i of a.itemPool) expect(ITEMS[i], `${a.name} item ${i}`).toBeTruthy();
      expect(ITEMS[a.key]).toBeTruthy();
    }
  });
  it('階が連続している', () => {
    let f = 1;
    for (const a of AREAS) { expect(a.floors[0]).toBe(f); f = a.floors[1] + 1; }
    expect(f).toBe(1001);
  });
  it('敵の技・素材・進化先が存在する', () => {
    for (const m of Object.values(MONSTERS)) {
      for (const s of m.skills) expect(SKILLS[s], `${m.name} ${s}`).toBeTruthy();
      if (m.material) expect(ITEMS[m.material], `${m.name} mat`).toBeTruthy();
      if (m.evolveTo) expect(MONSTERS[m.evolveTo], `${m.name} evolve`).toBeTruthy();
    }
  });
  it('ジョブの技とサポートが存在する', () => {
    for (const j of Object.values(JOBS)) {
      if (j.command) expect(COMMANDS[j.command]).toBeTruthy();
      for (const u of j.unlocks) { expect(SKILLS[u.skill], `${j.name} ${u.skill}`).toBeTruthy(); expect(SKILLS[u.skill].category).toBe(j.command); }
      for (const l of j.learn) expect(SUPPORTS[l.ability], `${j.name} ${l.ability}`).toBeTruthy();
    }
    for (const h of Object.values(HEROES)) { expect(JOBS[h.innateJob]).toBeTruthy(); expect(SKILLS[h.limit]).toBeTruthy(); }
  });
  it('装備の習得が存在する', () => {
    for (const i of Object.values(ITEMS)) {
      if (!i.learn) continue;
      if (i.learn.ability) expect(SUPPORTS[i.learn.ability], `${i.name}`).toBeTruthy();
      if (i.learn.skill) { expect(SKILLS[i.learn.skill], `${i.name}`).toBeTruthy(); expect(SKILLS[i.learn.skill].category, `${i.name} category`).toBeTruthy(); }
    }
    expect(Object.keys(AFFIXES).length).toBeGreaterThan(40);
  });
});

import { learnsetFor } from '../src/data/learnsets';
import { MONSTERS as MON2, VARIANT_OF } from '../src/data/monsters';
import { SKILLS as SK2 } from '../src/data/skills';
describe('monster learnsets', () => {
  it('every non-boss species has a learn table with valid skills', () => {
    for (const def of Object.values(MON2)) {
      if (def.boss) continue;
      const ls = learnsetFor(def, VARIANT_OF[def.id]);
      expect(ls.length, def.id).toBeGreaterThanOrEqual(3);
      for (const e of ls) { expect(SK2[e.skill], `${def.id}:${e.skill}`).toBeTruthy(); expect(e.lv).toBeGreaterThanOrEqual(2); }
      expect(new Set(ls.map(e => e.skill)).size).toBe(ls.length);
    }
  });
});
