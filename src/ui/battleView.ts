// 戦闘画面：上半分キャンバス（四角と文字）、下半分コマンド
import { h, btn, bar } from './dom';
import type { Battle, Action } from '../core/battle';
import type { Combatant, Command } from '../core/entity';
import { isAlive } from '../core/entity';
import { STATUS_JP, type Status } from '../core/types';
import { ITEMS } from '../data/items';
import { SKILLS } from '../data/skills';
import { areaFor } from '../data/monsters';
import { heroSprite, enemySprite, bgSprite, preloadAll, statusIcon, statusIconEl, heroRegistered, enemyRegistered, type HeroPose } from './sprites';

interface FloatText { uid: string; text: string; color: string; t: number }

export class BattleView {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  logEl: HTMLElement;
  partyEl: HTMLElement;
  cmdEl: HTMLElement;
  topEl: HTMLElement;
  floats: FloatText[] = [];
  flashes: Record<string, number> = {};
  poses: Record<string, { pose: HeroPose; until: number }> = {};
  deaths: Record<string, number> = {};
  last = 0;
  raf = 0;
  logCount = 0;
  menu: { level: 'root' | 'group' | 'item' | 'target'; group?: string; action?: Action } = { level: 'root' };
  done = false;
  endRendered = false;

  constructor(public battle: Battle, public auto: boolean, public speed: number, public onEnd: () => void, public onSettings: (auto: boolean, speed: number) => void) {
    this.canvas = h('canvas', { width: 256, height: 224 }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.topEl = h('div', { class: 'row', style: 'padding:4px 6px;gap:4px' });
    this.partyEl = h('div', { class: 'status-row', style: 'padding:0 6px' });
    this.logEl = h('div', { class: 'log' });
    this.cmdEl = h('div', { class: 'cmds' });
    this.root = h('div', { class: 'scene' }, this.topEl, this.canvas, this.partyEl, this.logEl, this.cmdEl);
    preloadAll();
    this.renderTop();
    this.renderCommands();
    this.last = performance.now();
    this.loop(this.last);
  }
  destroy() { cancelAnimationFrame(this.raf); this.done = true; }
  renderTop() {
    const b = this.battle;
    this.topEl.replaceChildren(
      h('span', { class: 'dim' }, `${b.opt.floor}階 ${areaFor(b.opt.floor).name}`),
      h('span', { class: 'law', style: 'font-size:12px' }, b.opt.law ? `ロウ:${b.opt.law.name}` : ''),
      h('span', { class: 'grow' }),
      btn(this.auto ? 'オート:ON' : 'オート:OFF', () => { this.auto = !this.auto; this.battle.opt.auto = this.auto; this.onSettings(this.auto, this.speed); this.renderTop(); if (this.auto && this.battle.pending) { const c = this.battle.pending; this.battle.pending = null; this.battle.act(c, this.battle.decideGambit(c) ?? this.battle.autoFallback(c)); this.menu = { level: 'root' }; this.renderCommands(); } }, 'small' + (this.auto ? ' sel' : '')),
      btn(`x${this.speed}`, () => { this.speed = this.speed >= 4 ? 1 : this.speed * 2; this.onSettings(this.auto, this.speed); this.renderTop(); }, 'small'),
    );
  }
  loop = (now: number) => {
    if (this.done) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const b = this.battle;
    if (b.result === 'running' && !b.pending) {
      b.tick(dt * this.speed);
      if (b.pending) { this.menu = { level: 'root' }; this.renderCommands(); }
    }
    this.consumeFx(now);
    this.draw(now);
    this.renderParty();
    this.renderLog();
    if (b.result !== 'running') {
      if (!this.endRendered) { this.endRendered = true; this.cmdEl.replaceChildren(h('div', { style: 'grid-column:1/4' }, btn(b.result === 'won' ? '勝利！ 結果へ' : b.result === 'fled' ? '逃げた' : '全滅…', () => this.onEnd(), 'primary'))); }
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
  consumeFx(now: number) {
    for (const f of this.battle.fx) {
      if (f.type === 'hit') { this.floats.push({ uid: f.uid, text: String(f.amount) + (f.crit ? '!' : ''), color: f.crit ? '#ffcf5a' : '#fff', t: now }); this.flashes[f.uid] = now; this.poses[f.uid] = { pose: 'hurt', until: now + 450 }; }
      if (f.type === 'act') this.poses[f.uid] = { pose: (f.text as HeroPose) ?? 'attack', until: now + 600 };
      if (f.type === 'heal') this.floats.push({ uid: f.uid, text: String(f.amount), color: '#7cf3a5', t: now });
      if (f.type === 'miss') this.floats.push({ uid: f.uid, text: f.text ?? 'miss', color: '#9fb0e0', t: now });
      if (f.type === 'status') this.floats.push({ uid: f.uid, text: f.text ?? '', color: '#ff8ae0', t: now });
    }
    this.battle.fx.length = 0;
    this.floats = this.floats.filter(f => now - f.t < 900);
  }
  pos(c: Combatant, idx: number, n: number): { x: number; y: number } {
    if (c.side === 'player') {
      const b = this.battle;
      const heroes = b.players.filter(p => p.kind === 'hero'), mons = b.players.filter(p => p.kind !== 'hero');
      const hi = heroes.indexOf(c), mi = mons.indexOf(c);
      if (hi >= 0) return { x: 226, y: 36 + hi * 44 };
      return { x: 180, y: 54 + mi * 44 };
    }
    const spread = Math.min(40, 120 / Math.max(1, n));
    return { x: 44 + idx * spread + (idx % 2) * 6, y: 62 + (idx % 2) * 56 };
  }
  draw(now: number) {
    const ctx = this.ctx, b = this.battle;
    const area = areaFor(b.opt.floor).id;
    const bgi = bgSprite(area);
    if (bgi) ctx.drawImage(bgi, 0, 0, 256, 224);
    else {
      const g = ctx.createLinearGradient(0, 0, 0, 224);
      g.addColorStop(0, area === 1 ? '#1a2a5a' : '#3a1a2a'); g.addColorStop(1, area === 1 ? '#0b1030' : '#200a10');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 224);
      ctx.fillStyle = '#243b6b'; ctx.fillRect(0, 190, 256, 34);
    }
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    const enemies = b.enemies;
    enemies.forEach((e, i) => {
      if (e.captured) return;
      const p = this.pos(e, i, enemies.length);
      const size = e.boss ? 44 : 26;
      const flash = this.flashes[e.uid] && now - this.flashes[e.uid] < 150;
      if (isAlive(e)) {
        const sp = enemySprite(e.spriteId, e.boss);
        let half = size / 2;
        if (sp) {
          const sw = sp.width, sh = sp.height; half = sh / 2;
          if (flash) ctx.globalAlpha = 0.4;
          ctx.drawImage(sp, Math.round(p.x - sw / 2), Math.round(p.y - sh / 2), sw, sh);
          ctx.globalAlpha = 1;
        } else if (!enemyRegistered(e.spriteId)) {
          ctx.fillStyle = flash ? '#fff' : e.color;
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
          ctx.strokeStyle = '#000'; ctx.strokeRect(p.x - size / 2 + 0.5, p.y - size / 2 + 0.5, size - 1, size - 1);
        }
        ctx.fillStyle = '#fff'; ctx.fillText(e.name.replace('（守護者）', ''), p.x, p.y + half + 10);
        ctx.fillStyle = '#300'; ctx.fillRect(p.x - 14, p.y + half + 12, 28, 3);
        ctx.fillStyle = '#f55'; ctx.fillRect(p.x - 14, p.y + half + 12, 28 * e.hp / e.stats.hp, 3);
        const st = Object.keys(e.statuses) as Status[];
        if (st.length) { let ix = p.x - st.length * 7; for (const s of st) { const ic = statusIcon(s); if (ic) { ctx.drawImage(ic, Math.round(ix), Math.round(p.y - half - 16), 14, 14); } else { ctx.fillStyle = '#ff8ae0'; ctx.fillText(STATUS_JP[s], ix + 7, p.y - half - 4); } ix += 14; } }
      } else {
        if (!this.deaths[e.uid]) this.deaths[e.uid] = now;
        const age = (now - this.deaths[e.uid]) / 700;
        const sp = enemySprite(e.spriteId, e.boss);
        if (sp && age < 1) { ctx.globalAlpha = 1 - age; ctx.drawImage(sp, Math.round(p.x - sp.width / 2), Math.round(p.y - sp.height / 2 + age * 10)); ctx.globalAlpha = 1; }
        else if (!sp) { ctx.fillStyle = '#444'; ctx.fillRect(p.x - 6, p.y + 8, 12, 4); }
      }
    });
    b.players.forEach((c, i) => {
      const p = this.pos(c, i, b.players.length);
      const flash = this.flashes[c.uid] && now - this.flashes[c.uid] < 150;
      const w = c.kind === 'hero' ? 14 : 18, hh = c.kind === 'hero' ? 22 : 18;
      const alive = isAlive(c);
      const ps = this.poses[c.uid]; const pose: HeroPose = b.result === 'won' ? 'win' : ps && ps.until > now ? ps.pose : 'idle';
      const sp = c.kind === 'hero' ? heroSprite(c.spriteId, pose) : enemySprite(c.spriteId, false);
      if (sp) {
        if (flash) ctx.globalAlpha = 0.4;
        if (alive && c.kind === 'ally') { const scl = Math.min(1, 40 / Math.max(sp.width, sp.height)); const w2 = sp.width * scl, h2 = sp.height * scl; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(-1, 1); ctx.drawImage(sp, Math.round(-w2 / 2), Math.round(-h2 / 2), w2, h2); ctx.restore(); }
        else if (alive) ctx.drawImage(sp, Math.round(p.x - sp.width / 2), Math.round(p.y - sp.height / 2));
        else { ctx.save(); ctx.translate(p.x, p.y + 10); ctx.rotate(-Math.PI / 2); ctx.globalAlpha = 0.6; ctx.drawImage(sp, -sp.width / 2, -sp.height / 2); ctx.restore(); }
        ctx.globalAlpha = 1;
      } else if (!(c.kind === 'hero' ? heroRegistered(c.spriteId) : enemyRegistered(c.spriteId))) {
        ctx.fillStyle = !alive ? '#555' : flash ? '#fff' : c.color;
        if (alive) ctx.fillRect(p.x - w / 2, p.y - hh / 2, w, hh); else ctx.fillRect(p.x - hh / 2, p.y + 4, hh, w / 2);
      }
      if (b.pending === c) { ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.moveTo(p.x - 16, p.y - 4); ctx.lineTo(p.x - 10, p.y); ctx.lineTo(p.x - 16, p.y + 4); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.fillText(c.name, p.x, p.y + (sp ? sp.height / 2 : hh / 2) + 10);
    });
    for (const f of this.floats) {
      const all = [...b.players, ...b.enemies];
      const idx = b.players.findIndex(x => x.uid === f.uid);
      const c = all.find(x => x.uid === f.uid); if (!c) continue;
      const p = idx >= 0 ? this.pos(c, idx, b.players.length) : this.pos(c, b.enemies.indexOf(c), b.enemies.length);
      const age = (now - f.t) / 900;
      ctx.fillStyle = f.color; ctx.font = 'bold 11px monospace';
      ctx.fillText(f.text, p.x, p.y - 10 - age * 18);
      ctx.font = '9px monospace';
    }
    if (b.pending && !this.auto) { ctx.fillStyle = '#ffcf5a'; ctx.textAlign = 'left'; ctx.fillText(`${b.pending.name} のコマンド`, 4, 10); ctx.textAlign = 'center'; }
  }
  renderParty() {
    const b = this.battle;
    const rows = b.players.map(c => {
      const st = (Object.keys(c.statuses) as Status[]).map(s => STATUS_JP[s]).join(' ');
      return h('div', { class: 'member' + (b.pending === c ? ' active' : '') + (!isAlive(c) ? ' dead' : '') },
        h('div', { class: 'row' }, h('span', { class: 'grow' }, c.name), h('span', { class: 'dim' }, `${c.hp}/${c.stats.hp}`)),
        bar(c.hp / c.stats.hp), h('div', { class: 'row', style: 'gap:2px;margin-top:2px' }, h('div', { class: 'grow' }, bar(c.mp / Math.max(1, c.stats.mp), 'mp')), h('div', { class: 'grow' }, bar(c.atb / 100, 'atb')), c.kind === 'hero' ? h('div', { class: 'grow' }, bar(c.limit / 100, 'limit')) : null),
        st ? h('div', { class: 'bad row', style: 'font-size:11px;gap:2px' }, ...(Object.keys(c.statuses) as Status[]).map(s => statusIconEl(s) ?? h('span', {}, STATUS_JP[s]))) : null);
    });
    // DOM差し替えは軽量化のため毎フレーム簡略
    if (this.partyEl.childElementCount !== rows.length || performance.now() % 4 < 1 || true) this.partyEl.replaceChildren(...rows);
  }
  renderLog() {
    const b = this.battle;
    if (b.log.length === this.logCount) return;
    this.logEl.replaceChildren(...b.log.slice(-40).map(l => h('div', { class: l.kind }, l.text)));
    this.logEl.scrollTop = this.logEl.scrollHeight;
    this.logCount = b.log.length;
  }
  renderCommands() {
    const b = this.battle;
    const c = b.pending;
    if (!c || b.result !== 'running') { this.cmdEl.replaceChildren(h('div', { class: 'dim center', style: 'grid-column:1/-1;padding:12px' }, this.auto ? 'オート戦闘中…' : 'ゲージ充填中…')); return; }
    const groups = [...new Set(c.commands.filter(k => k.group !== 'basic').map(k => k.group))];
    const el: HTMLElement[] = [];
    const vio = (cmd: Command) => b.violates(c, cmd);
    const mark = (label: string, cmd: Command) => vio(cmd) ? '⚠' + label : label;
    const guard = (cmd: Command, fn: () => void) => () => { if (vio(cmd) && !confirm(`「${cmd.name}」はロウ違反。それでも使う？`)) return; fn(); };
    if (this.menu.level === 'root') {
      el.push(btn(mark('たたかう', c.commands[0]), guard(c.commands[0], () => this.pickTarget({ cmd: c.commands[0] })), 'primary'));
      for (const g of groups) el.push(btn(g, () => { this.menu = { level: 'group', group: g }; this.renderCommands(); }));
      el.push(btn('アイテム', () => { this.menu = { level: 'item' }; this.renderCommands(); }));
      el.push(btn('ぼうぎょ', () => this.exec({ cmd: c.commands.find(k => k.id === 'defend')! })));
      if (c.limitSkill) { const lc = b.commandFor(c, 'limit'); el.push(btn(lc ? mark('リミット技', lc) : 'リミット技', () => this.pickTarget({ cmd: b.commandFor(c, 'limit')! }), c.limit >= 100 ? 'sel' : '', c.limit < 100)); }
      el.push(btn('にげる', () => this.exec({ cmd: { id: 'flee', name: 'にげる', skill: SKILLS.flee, group: 'basic' } }), '', !b.opt.canFlee));
    } else if (this.menu.level === 'group') {
      for (const k of c.commands.filter(k => k.group === this.menu.group)) el.push(btn(mark(`${k.name}${k.skill.mp ? ` ${k.skill.mp}` : ''}`, k), guard(k, () => this.pickTarget({ cmd: k })), vio(k) ? 'bad' : '', k.skill.mp > c.mp));
      el.push(btn('もどる', () => { this.menu = { level: 'root' }; this.renderCommands(); }, 'small'));
    } else if (this.menu.level === 'item') {
      for (const [id, n] of Object.entries(b.opt.bag)) {
        const base = ITEMS[id]; if (!base?.effect || n <= 0) continue;
        const ic = b.commandFor(c, 'item:' + id)!;
        el.push(btn(mark(`${base.name}×${n}`, ic), guard(ic, () => this.pickTarget({ cmd: ic })), vio(ic) ? 'bad' : ''));
      }
      el.push(btn('もどる', () => { this.menu = { level: 'root' }; this.renderCommands(); }, 'small'));
    } else if (this.menu.level === 'target' && this.menu.action) {
      const a = this.menu.action;
      const sk = a.cmd.group === 'item' ? this.itemSkill(a.cmd) : a.cmd.skill;
      const targets = b.availableTargets(c, sk);
      for (const t of targets) el.push(btn(`${t.name} ${Math.round(100 * t.hp / t.stats.hp)}%`, () => this.exec({ ...a, targetUid: t.uid })));
      el.push(btn('もどる', () => { this.menu = { level: 'root' }; this.renderCommands(); }, 'small'));
    }
    this.cmdEl.replaceChildren(...el);
  }
  private itemSkill(cmd: Command) {
    const ef = ITEMS[cmd.id].effect!;
    const sk = { ...cmd.skill };
    sk.target = ef.kind === 'revive' ? 'dead_ally' : ef.kind === 'damage' || ef.kind === 'capture' ? ef.target : 'ally';
    return sk;
  }
  pickTarget(a: Action) {
    const sk = a.cmd.group === 'item' ? this.itemSkill(a.cmd) : a.cmd.skill;
    if (sk.target === 'enemies' || sk.target === 'allies' || sk.target === 'self') { this.exec(a); return; }
    const targets = this.battle.availableTargets(this.battle.pending!, sk);
    if (targets.length === 1) { this.exec({ ...a, targetUid: targets[0].uid }); return; }
    if (targets.length === 0) { return; }
    this.menu = { level: 'target', action: a }; this.renderCommands();
  }
  exec(a: Action) {
    this.battle.command(a);
    this.menu = { level: 'root' };
    this.renderCommands();
  }
}
