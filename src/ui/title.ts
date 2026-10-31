// タイトル画面のクリスタル：Canvas の手描きアニメ（回転する結晶・光芒・きらめき）
export class TitleCrystal {
  el: HTMLCanvasElement; private ctx: CanvasRenderingContext2D; private raf = 0; private t0 = performance.now();
  constructor() {
    this.el = document.createElement('canvas'); this.el.width = 256; this.el.height = 120; this.el.className = 'title-crystal';
    this.ctx = this.el.getContext('2d')!;
    const loop = (now: number) => { if (!this.el.isConnected && now - this.t0 > 2000) { cancelAnimationFrame(this.raf); return; } this.draw(now); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  private draw(now: number) {
    const c = this.ctx, t = (now - this.t0) / 1000;
    c.clearRect(0, 0, 256, 120);
    // 背景の星
    for (let i = 0; i < 40; i++) { const x = (i * 97) % 256, y = (i * 53) % 120; const tw = 0.5 + 0.5 * Math.sin(t * 2 + i); c.globalAlpha = 0.3 + 0.5 * tw; c.fillStyle = '#cde'; c.fillRect(x, y, 1, 1); }
    c.globalAlpha = 1;
    const cx = 128, cy = 62;
    // 光芒
    c.save(); c.translate(cx, cy); c.rotate(t * 0.2);
    for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); const g = c.createLinearGradient(0, 0, 0, -70); g.addColorStop(0, 'rgba(160,220,255,0.35)'); g.addColorStop(1, 'rgba(160,220,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.lineTo(0, -70 - 10 * Math.sin(t * 3 + i)); c.closePath(); c.fill(); }
    c.restore();
    // 結晶（横幅が sin で伸縮して回って見える）
    const w = 22 * Math.abs(Math.cos(t * 0.9)) + 4, h = 46;
    const shade = Math.cos(t * 0.9) > 0 ? 1 : 0.75;
    const pts = [[cx, cy - h], [cx + w, cy - h * 0.35], [cx + w * 0.8, cy + h * 0.45], [cx, cy + h], [cx - w * 0.8, cy + h * 0.45], [cx - w, cy - h * 0.35]];
    const g = c.createLinearGradient(cx - w, cy - h, cx + w, cy + h); g.addColorStop(0, `rgba(200,240,255,${0.95 * shade})`); g.addColorStop(0.5, `rgba(90,160,255,${0.9 * shade})`); g.addColorStop(1, `rgba(40,80,200,${0.95 * shade})`);
    c.fillStyle = g; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
    c.strokeStyle = '#eef'; c.lineWidth = 1; c.stroke();
    // 面の分割線
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.moveTo(cx, cy - h); c.lineTo(cx, cy + h); c.moveTo(cx - w, cy - h * 0.35); c.lineTo(cx + w * 0.8, cy + h * 0.45); c.stroke();
    // ハイライトのきらめき
    const sp = (t * 1.3) % 1; const sx = cx - w * 0.5 + sp * w, sy = cy - h * 0.6 + sp * h * 0.4;
    c.globalAlpha = 1 - Math.abs(sp - 0.5) * 2; c.fillStyle = '#fff'; c.fillRect(sx - 1, sy - 6, 2, 12); c.fillRect(sx - 6, sy - 1, 12, 2); c.globalAlpha = 1;
    // 足元の光
    const rg = c.createRadialGradient(cx, cy + h + 4, 2, cx, cy + h + 4, 40); rg.addColorStop(0, 'rgba(120,180,255,0.6)'); rg.addColorStop(1, 'rgba(120,180,255,0)'); c.fillStyle = rg; c.fillRect(cx - 40, cy + h - 6, 80, 24);
  }
}
