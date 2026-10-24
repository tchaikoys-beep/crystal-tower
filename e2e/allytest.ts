// 仲間モンスターの絵が引けるかの確認（spriteId）
import { newGame, createMonsterAlly, setParty, partyCombatants } from '/home/user/crystal-tower/src/core/game';
import { SPRITE_FILES } from '/home/user/crystal-tower/src/ui/spriteList';
const s = newGame('cloud', 1);
const m = createMonsterAlly(s, 'pudding', 3); s.monsters.push(m);
setParty(s, ['h:cloud', 'm:' + m.uid], []);
for (const c of partyCombatants(s)) console.log(c.name, 'ref', c.ref, 'spriteId', c.spriteId, 'has', SPRITE_FILES.includes((c.kind === 'hero' ? 'hero_' : 'enemy_') + c.spriteId + (c.kind === 'hero' ? '_idle' : '')));
