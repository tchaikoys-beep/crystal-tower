// 戦闘画面：上半分キャンバス（四角と文字）、下半分コマンド
import { h, btn, bar } from './dom';
import { SFX } from './sfx';
import type { Element } from '../core/types';
interface Particle { x: number; y: number; vx: number; vy: number; t0: number; life: number; color: string; size: number; kind: 'dot' | 'ring' | 'slash' | 'bolt' | 'spark' | 'ray' }
import type { Battle, Action } from '../core/battle';
import type { Combatant, Command } from '../core/entity';
import { isAlive } from '../core/entity';
import { STATUS_JP, type Status } from '../core/types';
import { ITEMS } from '../data/items';
import { SKILLS } from '../data/skills';
import { areaFor } from '../data/monsters';
import { heroSprite, enemySprite, bgSprite, preloadAll, statusIcon, statusIconEl, heroRegistered, enemyRegistered, type HeroPose, uiIconEl, faceSprite } from './sprites';

interface FloatText { uid: string; text: string; color: string; t: number }

export class BattleView {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  logEl: HTMLElement;
  partyEl: HTMLElement;
  cmdEl: HTMLElement;
  topEl: HTMLElement;
  navEl!: HTMLElement;
  floats: FloatText[] = [];
  flashes: Record<string, number> = {};
  poses: Record<string, { pose: HeroPose; until: number }> = {};
  deaths: Record<string, number> = {};
  particles: Particle[] = [];
  shakeUntil = 0; shakeMag = 0;
  victoryAt = 0;
  enemyActs: Record<string, { t: number; cast: boolean }> = {};
  cutin: { until: number; start: number; name: string; sub: string; face: string | null; kind: 'limit' | 'summon' } | null = null;
  last = 0;
  raf = 0;
  logCount = 0;
  menu: { level: 'root' | 'group' | 'item' | 'target'; group?: string; action?: Action } = { level: 'root' };
  done = false;
  endRendered = false;

  constructor(public battle: Battle, public auto: boolean, public speed: number, public onEnd: () => void, public onSettings: (auto: boolean, speed: number) => void) {
    this.canvas = h('canvas', { width: 256, height: 224 }) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.topEl = h('div', { class: 'hdr' });
    this.navEl = h('div', { class: 'dock-nav' });
    this.partyEl = h('div', { class: 'status-row', style: 'padding:0 6px' });
    this.logEl = h('div', { class: 'log' });
    this.cmdEl = h('div', { class: 'dock-actions cmds' });
    this.root = h('div', { class: 'shell battle' },
      h('div', { class: 'content' }, this.topEl, this.canvas, this.partyEl, this.logEl),
      h('div', { class: 'dock' }, h('div', { class: 'dock-row' }, this.navEl, this.cmdEl)));
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
      h('b', {}, `${b.opt.floor}階 ${areaFor(b.opt.floor).name}`),
      h('span', { class: 'law grow', style: 'font-size:12px' }, b.opt.law ? `ロウ:${b.opt.law.name}` : ''),
    );
    this.navEl.replaceChildren(
      btn(this.auto ? 'オート:ON' : 'オート:OFF', () => { this.auto = !this.auto; this.battle.opt.auto = this.auto; this.onSettings(this.auto, this.speed); this.renderTop(); if (this.auto && this.battle.pending) { const c = this.battle.pending; this.battle.pending = null; this.battle.act(c, this.battle.decideGambit(c) ?? this.battle.autoFallback(c)); this.menu = { level: 'root' }; this.renderCommands(); } }, 'small' + (this.auto ? ' sel' : '')),
      btn(`速度 x${this.speed}`, () => { this.speed = this.speed >= 4 ? 1 : this.speed * 2; this.onSettings(this.auto, this.speed); this.renderTop(); }, 'small'),
    );
  }
  loop = (now: number) => {
    if (this.done) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const b = this.battle;
    if (b.result === 'running' && !b.pending && !(this.cutin && now < this.cutin.until)) {
      b.tick(dt * this.speed);
      if (b.pending) { this.menu = { level: 'root' }; this.renderCommands(); }
    }
    this.consumeFx(now);
    this.draw(now);
    this.renderParty();
    this.renderLog();
    if (b.result !== 'running') {
      if (!this.endRendered) { this.endRendered = true; this.cmdEl.replaceChildren(h('div', { class: 'wide' }, btn(b.result === 'won' ? '勝利！ 結果へ' : b.result === 'fled' ? '逃げた' : '全滅…', () => this.onEnd(), 'primary'))); }
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
  consumeFx(now: number) {
    const b = this.battle;
    const where = (uid: string) => { const idx = b.players.findIndex(x => x.uid === uid); const c = [...b.players, ...b.enemies].find(x => x.uid === uid); if (!c) return null; return idx >= 0 ? this.pos(c, idx, b.players.length) : this.pos(c, b.enemies.indexOf(c), b.enemies.length); };
    for (const f of b.fx) {
      const p = where(f.uid);
      if (f.type === 'hit') {
        this.floats.push({ uid: f.uid, text: String(f.amount) + (f.crit ? '!' : ''), color: f.crit ? '#ffcf5a' : '#fff', t: now });
        this.flashes[f.uid] = now; this.poses[f.uid] = { pose: 'hurt', until: now + 350 };
        if (p) this.burst(p.x, p.y, f.element ?? null, !!f.phys, !!f.crit, now);
        if (f.crit) { this.shakeUntil = now + 220; this.shakeMag = 4; SFX.crit(); } else if (f.phys) SFX.hit(); else SFX.magic(f.element);
        const tgt = b.enemies.find(e => e.uid === f.uid); if (tgt?.boss && (f.amount ?? 0) > tgt.stats.hp * 0.08) { this.shakeUntil = now + 200; this.shakeMag = Math.max(this.shakeMag, 3); }
      }
      if (f.type === 'act') { this.poses[f.uid] = { pose: (f.text as HeroPose) ?? 'attack', until: now + 600 }; if (b.enemies.some(e => e.uid === f.uid)) { this.enemyActs[f.uid] = { t: now, cast: f.text === 'cast' }; if (f.text === 'cast' && p) this.sparkle(p.x, p.y, '#9cf', now, 10); } }
      if (f.type === 'heal') { this.floats.push({ uid: f.uid, text: String(f.amount), color: '#7cf3a5', t: now }); if (p) this.sparkle(p.x, p.y, '#9f9', now); SFX.heal(); }
      if (f.type === 'miss') { this.floats.push({ uid: f.uid, text: f.text ?? 'miss', color: '#9fb0e0', t: now }); SFX.miss(); }
      if (f.type === 'status') { this.floats.push({ uid: f.uid, text: f.text ?? '', color: '#ff8ae0', t: now }); if (p) this.sparkle(p.x, p.y, '#f8e', now); SFX.status(); }
      if (f.type === 'capture') { if (p) this.sparkle(p.x, p.y, '#ffd', now, 24); SFX.capture(); }
      if (f.type === 'limit') { this.shakeUntil = now + 300; this.shakeMag = 3; if (p) this.sparkle(p.x, p.y, '#ffcf5a', now, 30); SFX.limit();
        const c = b.players.find(x => x.uid === f.uid); this.cutin = { start: now, until: now + 1100, name: f.text ?? '', sub: `${c?.name ?? ''}のリミット技`, face: c?.kind === 'hero' ? c.spriteId : null, kind: 'limit' }; }
      if (f.type === 'summon') { const c = b.players.find(x => x.uid === f.uid); this.cutin = { start: now, until: now + 1000, name: f.text ?? '', sub: '召喚', face: c?.kind === 'hero' ? c.spriteId : null, kind: 'summon' }; SFX.magic('holy'); }
    }
    b.fx.length = 0;
    this.floats = this.floats.filter(f => now - f.t < 900);
    this.particles = this.particles.filter(q => now - q.t0 < q.life);
  }
  private burst(x: number, y: number, el: Element | null, phys: boolean, crit: boolean, now: number) {
    const col: Record<string, string> = { fire: '#f84', ice: '#9ef', thunder: '#ff6', water: '#6af', wind: '#9f9', earth: '#c96', holy: '#fff', dark: '#b6f', poison: '#8c4', none: '#fff' };
    const c = col[el ?? 'none'] ?? '#fff';
    const n = crit ? 22 : 12;
    if (phys) {
      this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 220, color: crit ? '#ffcf5a' : '#fff', size: crit ? 34 : 24, kind: 'slash' });
      for (let i = 0; i < n / 2; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.7) * 120, t0: now, life: 350, color: el && el !== 'none' ? c : '#fff', size: 2, kind: 'spark' });
    }
    switch (el) {
      case 'fire': for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 16, y: y + 10, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 60, t0: now, life: 450, color: i % 3 ? '#f84' : '#fd4', size: 3 + Math.random() * 3, kind: 'dot' }); break;
      case 'ice': for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 20, y: y - 30, vx: 0, vy: 90 + Math.random() * 60, t0: now, life: 400, color: '#cff', size: 2 + Math.random() * 2, kind: 'spark' }); this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 400, color: '#9ef', size: 20, kind: 'ring' }); break;
      case 'thunder': this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 260, color: '#ff8', size: 40, kind: 'bolt' }); for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, t0: now, life: 250, color: '#ffc', size: 2, kind: 'spark' }); break;
      case 'water': for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 100, vy: -80 - Math.random() * 50, t0: now, life: 500, color: '#6af', size: 3, kind: 'dot' }); this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 400, color: '#6af', size: 18, kind: 'ring' }); break;
      case 'wind': for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; this.particles.push({ x: x + Math.cos(a) * 14, y: y + Math.sin(a) * 8, vx: -Math.sin(a) * 80, vy: Math.cos(a) * 40 - 30, t0: now, life: 450, color: '#bfb', size: 2, kind: 'spark' }); } break;
      case 'earth': for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 24, y: y + 14, vx: (Math.random() - 0.5) * 60, vy: -90 - Math.random() * 80, t0: now, life: 500, color: i % 2 ? '#c96' : '#864', size: 3 + Math.random() * 3, kind: 'dot' }); this.shakeUntil = Math.max(this.shakeUntil, now + 180); this.shakeMag = Math.max(this.shakeMag, 3); break;
      case 'holy': for (let i = 0; i < 6; i++) this.particles.push({ x, y, vx: 0, vy: 0, t0: now + i * 30, life: 350, color: '#fff', size: 30 + i * 6, kind: 'ray' }); this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 450, color: '#ffd', size: 26, kind: 'ring' }); break;
      case 'dark': for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, vx: 0, vy: -20, t0: now, life: 500, color: i % 2 ? '#b6f' : '#538', size: 4 + Math.random() * 3, kind: 'dot' }); this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 450, color: '#b6f', size: 22, kind: 'ring' }); break;
      case 'poison': for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 20, y: y + 8, vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 30, t0: now, life: 600, color: '#8c4', size: 3 + Math.random() * 2, kind: 'ring' }); break;
      default: if (!phys) { this.particles.push({ x, y, vx: 0, vy: 0, t0: now, life: 350, color: '#fff', size: 22, kind: 'ring' }); for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 140, vy: (Math.random() - 0.5) * 140, t0: now, life: 300, color: '#fff', size: 2, kind: 'spark' }); }
    }
  }
  private sparkle(x: number, y: number, color: string, now: number, n = 14) {
    for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 28, y: y + (Math.random() - 0.3) * 30, vx: 0, vy: -40 - Math.random() * 40, t0: now + Math.random() * 120, life: 600, color, size: 2 + Math.random() * 2, kind: 'spark' });
  }
  private drawCutin(ctx: CanvasRenderingContext2D, now: number) {
    const ci = this.cutin!; const dur = ci.until - ci.start; const t = (now - ci.start) / dur;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const bandIn = ease(Math.min(1, t / 0.18)), fade = t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = fade;
    // 黒帯（斜め）
    const h = 64 * bandIn, cy = 112;
    ctx.fillStyle = ci.kind === 'limit' ? '#000c' : '#102a' ; ctx.beginPath(); ctx.moveTo(0, cy - h / 2 + 6); ctx.lineTo(256, cy - h / 2 - 6); ctx.lineTo(256, cy + h / 2 - 6); ctx.lineTo(0, cy + h / 2 + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ci.kind === 'limit' ? '#ffcf5a' : '#9ef'; ctx.lineWidth = 1; ctx.stroke();
    // 流れる光の筋
    ctx.globalAlpha = fade * 0.5; ctx.fillStyle = ci.kind === 'limit' ? '#ffcf5a' : '#9ef';
    for (let i = 0; i < 6; i++) { const x = ((t * 400 + i * 50) % 300) - 40; ctx.fillRect(x, cy - h / 2 + 8 + i * 9, 26 - i * 3, 1); }
    ctx.globalAlpha = fade;
    // 顔（左からスライド）
    const face = ci.face ? faceSprite(ci.face) : null;
    const fx = -56 + ease(Math.min(1, t / 0.3)) * 70;
    if (face && h > 40) { ctx.drawImage(face, Math.round(fx), cy - 24, 48, 48); ctx.strokeStyle = '#fff'; ctx.strokeRect(Math.round(fx) + 0.5, cy - 24 + 0.5, 47, 47); }
    // 技名（右からスライド、縁取り）
    const tx = 256 + 80 - ease(Math.min(1, t / 0.3)) * 170;
    ctx.textAlign = 'left'; ctx.font = 'bold 16px monospace'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round';
    ctx.strokeText(ci.name, tx, cy + 8); ctx.fillStyle = ci.kind === 'limit' ? '#ffcf5a' : '#cff'; ctx.fillText(ci.name, tx, cy + 8);
    ctx.font = '9px monospace'; ctx.strokeText(ci.sub, tx, cy - 10); ctx.fillStyle = '#fff'; ctx.fillText(ci.sub, tx, cy - 10);
    ctx.restore(); ctx.textAlign = 'center'; ctx.font = '9px monospace';
  }
  private whiteOut(sp: CanvasImageSource, x: number, y: number, w: number, h: number) {
    const ctx = this.ctx; ctx.save(); ctx.globalAlpha = 0.85;
    // スプライト形状の範囲だけ白く：一時キャンバス経由
    const tmp = whiteCanvas(sp, w, h); if (tmp) ctx.drawImage(tmp, x, y); ctx.restore();
  }
  private drawParticles(ctx: CanvasRenderingContext2D, now: number) {
    for (const q of this.particles) {
      const age = (now - q.t0) / q.life; if (age < 0 || age > 1) continue;
      const x = q.x + q.vx * age * (q.life / 1000), y = q.y + q.vy * age * (q.life / 1000);
      ctx.globalAlpha = 1 - age; ctx.fillStyle = q.color; ctx.strokeStyle = q.color;
      switch (q.kind) {
        case 'dot': ctx.beginPath(); ctx.arc(x, y, q.size * (1 - age * 0.5), 0, Math.PI * 2); ctx.fill(); break;
        case 'spark': ctx.fillRect(Math.round(x), Math.round(y), q.size, q.size); break;
        case 'ring': ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 4 + q.size * age, 0, Math.PI * 2); ctx.stroke(); break;
        case 'slash': { ctx.lineWidth = 3; ctx.lineCap = 'round'; const s = q.size, k = Math.min(1, age * 2.2); ctx.beginPath(); ctx.moveTo(x - s / 2, y - s / 2); ctx.lineTo(x - s / 2 + s * k, y - s / 2 + s * k); ctx.stroke(); if (age > 0.3) { ctx.globalAlpha = (1 - age) * 0.7; ctx.beginPath(); ctx.moveTo(x + s / 2, y - s / 3); ctx.lineTo(x + s / 2 - s * k, y - s / 3 + s * 0.7 * k); ctx.stroke(); } break; }
        case 'bolt': { ctx.lineWidth = 2; ctx.beginPath(); let yy = y - q.size - 20, xx = x; ctx.moveTo(xx, yy); while (yy < y) { yy += 8; xx = x + (Math.random() - 0.5) * 14; ctx.lineTo(xx, yy); } ctx.stroke(); ctx.globalAlpha = (1 - age) * 0.5; ctx.fillRect(0, 0, 256, 224); break; }
        case 'ray': { ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + age; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * q.size * age, y + Math.sin(a) * q.size * age); ctx.stroke(); } break; }
      }
    }
    ctx.globalAlpha = 1;
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (now < this.shakeUntil) ctx.translate(Math.round((Math.random() - 0.5) * 2 * this.shakeMag), Math.round((Math.random() - 0.5) * 2 * this.shakeMag));
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
      const p0 = this.pos(e, i, enemies.length);
      const ea = this.enemyActs[e.uid]; const prog = ea ? (now - ea.t) / 360 : 2;
      const lunge = prog < 1 && !ea!.cast ? Math.sin(prog * Math.PI) * 14 : 0;
      const p = { x: p0.x + lunge, y: p0.y - (prog < 1 && !ea!.cast ? Math.sin(prog * Math.PI) * 4 : 0) };
      const size = e.boss ? 44 : 26;
      const flash = this.flashes[e.uid] && now - this.flashes[e.uid] < 150;
      if (isAlive(e)) {
        if (ea && ea.cast && prog < 1.5) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - prog / 1.5); ctx.strokeStyle = '#9cf'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y + (e.boss ? 44 : 26) / 2 + 6, 18 + prog * 10, 5 + prog * 3, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
        const sp = enemySprite(e.spriteId, e.boss);
        let half = size / 2;
        if (sp) {
          const sw = sp.width, sh = sp.height; half = sh / 2;
          ctx.drawImage(sp, Math.round(p.x - sw / 2), Math.round(p.y - sh / 2), sw, sh);
          if (flash) this.whiteOut(sp, Math.round(p.x - sw / 2), Math.round(p.y - sh / 2), sw, sh);
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
        if (alive && c.kind === 'ally') { const scl = Math.min(1, 40 / Math.max(sp.width, sp.height)); const w2 = sp.width * scl, h2 = sp.height * scl; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(-1, 1); ctx.drawImage(sp, Math.round(-w2 / 2), Math.round(-h2 / 2), w2, h2); ctx.restore(); }
        else if (alive) { ctx.drawImage(sp, Math.round(p.x - sp.width / 2), Math.round(p.y - sp.height / 2)); if (flash) this.whiteOut(sp, Math.round(p.x - sp.width / 2), Math.round(p.y - sp.height / 2), sp.width, sp.height); }
        else { ctx.save(); ctx.translate(p.x, p.y + 10); ctx.rotate(-Math.PI / 2); ctx.globalAlpha = 0.6; ctx.drawImage(sp, -sp.width / 2, -sp.height / 2); ctx.restore(); }
        ctx.globalAlpha = 1;
      } else if (!(c.kind === 'hero' ? heroRegistered(c.spriteId) : enemyRegistered(c.spriteId))) {
        ctx.fillStyle = !alive ? '#555' : flash ? '#fff' : c.color;
        if (alive) ctx.fillRect(p.x - w / 2, p.y - hh / 2, w, hh); else ctx.fillRect(p.x - hh / 2, p.y + 4, hh, w / 2);
      }
      if (b.pending === c) { ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.moveTo(p.x - 16, p.y - 4); ctx.lineTo(p.x - 10, p.y); ctx.lineTo(p.x - 16, p.y + 4); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.fillText(c.name, p.x, p.y + (sp ? sp.height / 2 : hh / 2) + 10);
    });
    this.drawParticles(ctx, now);
    for (const f of this.floats) {
      const all = [...b.players, ...b.enemies];
      const idx = b.players.findIndex(x => x.uid === f.uid);
      const c = all.find(x => x.uid === f.uid); if (!c) continue;
      const p = idx >= 0 ? this.pos(c, idx, b.players.length) : this.pos(c, b.enemies.indexOf(c), b.enemies.length);
      const age = (now - f.t) / 900;
      const pop = age < 0.15 ? 1 + (0.15 - age) * 4 : 1;
      const big = f.color === '#ffcf5a';
      ctx.font = `bold ${Math.round((big ? 15 : 12) * pop)}px monospace`;
      ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round';
      const yy = p.y - 12 - Math.min(age, 0.6) * 24 + (age > 0.6 ? 0 : 0);
      ctx.strokeText(f.text, p.x, yy); ctx.fillStyle = f.color; ctx.fillText(f.text, p.x, yy);
      ctx.font = '9px monospace';
    }
    if (this.cutin && now < this.cutin.until) this.drawCutin(ctx, now);
    if (b.result === 'won') {
      if (!this.victoryAt) { this.victoryAt = now; SFX.victory(); }
      const a = Math.min(1, (now - this.victoryAt) / 400);
      ctx.globalAlpha = a; ctx.font = 'bold 22px monospace'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.strokeText('VICTORY', 128, 40 + (1 - a) * 10); ctx.fillStyle = '#ffcf5a'; ctx.fillText('VICTORY', 128, 40 + (1 - a) * 10); ctx.globalAlpha = 1; ctx.font = '9px monospace';
    } else if (b.result === 'lost' && !this.victoryAt) { this.victoryAt = now; SFX.defeat(); }
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
    if (!c || b.result !== 'running') { this.cmdEl.replaceChildren(h('div', { class: 'dim center wide', style: 'padding:12px' }, this.auto ? 'オート戦闘中…' : 'ゲージ充填中…')); return; }
    const groups = [...new Set(c.commands.filter(k => k.group !== 'basic').map(k => k.group))];
    const el: HTMLElement[] = [];
    const vio = (cmd: Command) => b.violates(c, cmd);
    const mark = (label: string, cmd: Command) => vio(cmd) ? '⚠' + label : label;
    const guard = (cmd: Command, fn: () => void) => () => { if (vio(cmd) && !confirm(`「${cmd.name}」はロウ違反。それでも使う？`)) return; fn(); };
    if (this.menu.level === 'root') {
      const withIcon = (b: HTMLElement, ic: string) => { const i = uiIconEl(ic); if (i) b.prepend(i); return b; };
      el.push(withIcon(btn(mark('たたかう', c.commands[0]), guard(c.commands[0], () => this.pickTarget({ cmd: c.commands[0] })), 'primary'), 'sword'));
      for (const g of groups) el.push(btn(g, () => { this.menu = { level: 'group', group: g }; this.renderCommands(); }));
      el.push(withIcon(btn('アイテム', () => { this.menu = { level: 'item' }; this.renderCommands(); }), 'bag'));
      el.push(withIcon(btn('ぼうぎょ', () => this.exec({ cmd: c.commands.find(k => k.id === 'defend')! })), 'shield'));
      if (c.limitSkill) { const lc = b.commandFor(c, 'limit'); el.push(withIcon(btn(lc ? mark('リミット技', lc) : 'リミット技', () => this.pickTarget({ cmd: b.commandFor(c, 'limit')! }), c.limit >= 100 ? 'sel' : '', c.limit < 100), 'star')); }
      el.push(withIcon(btn('にげる', () => this.exec({ cmd: { id: 'flee', name: 'にげる', skill: SKILLS.flee, group: 'basic' } }), '', !b.opt.canFlee), 'run'));
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

const _wc = document.createElement('canvas');
function whiteCanvas(sp: CanvasImageSource, w: number, h: number): HTMLCanvasElement | null {
  _wc.width = w; _wc.height = h; const c = _wc.getContext('2d'); if (!c) return null;
  c.clearRect(0, 0, w, h); c.drawImage(sp, 0, 0, w, h); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over';
  return _wc;
}
