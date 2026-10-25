// 共通型定義（ゲームロジックは描画に依存しない）
export type StatKey = 'hp' | 'mp' | 'str' | 'vit' | 'mag' | 'spr' | 'spd' | 'luck';
export type Stats = Record<StatKey, number>;
export const STAT_KEYS: StatKey[] = ['hp', 'mp', 'str', 'vit', 'mag', 'spr', 'spd', 'luck'];

export type Element = 'fire' | 'ice' | 'thunder' | 'water' | 'wind' | 'earth' | 'holy' | 'dark' | 'poison' | 'none';
export const ELEMENTS: Element[] = ['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'holy', 'dark', 'poison'];
export const ELEMENT_JP: Record<Element, string> = {
  fire: '炎', ice: '冷気', thunder: '雷', water: '水', wind: '風', earth: '土', holy: '聖', dark: '闇', poison: '毒', none: '無',
};

export type Status = 'poison' | 'sleep' | 'slow' | 'haste' | 'protect' | 'shell' | 'regen' | 'blind' | 'silence' | 'berserk' | 'paralyze' | 'blink';
export const STATUS_JP: Record<Status, string> = {
  poison: '毒', sleep: '睡眠', slow: 'スロウ', haste: 'ヘイスト', protect: 'プロテス', shell: 'シェル', regen: 'リジェネ',
  blind: '暗闇', silence: '沈黙', berserk: 'バーサク', paralyze: '麻痺', blink: '分身',
};
export const BAD_STATUS: Status[] = ['poison', 'sleep', 'slow', 'blind', 'silence', 'berserk', 'paralyze'];

export type Slot = 'weapon' | 'shield' | 'head' | 'body' | 'acc1' | 'acc2';
export const SLOTS: Slot[] = ['weapon', 'shield', 'head', 'body', 'acc1', 'acc2'];
export const SLOT_JP: Record<Slot, string> = { weapon: '武器', shield: '盾', head: '頭', body: '体', acc1: 'アクセ1', acc2: 'アクセ2' };
export type ItemKind = 'weapon' | 'shield' | 'head' | 'body' | 'acc' | 'consumable' | 'material' | 'tome';
export type WeaponType = 'sword' | 'dagger' | 'spear' | 'katana' | 'axe' | 'bow' | 'staff' | 'rod' | 'fist' | 'whip' | 'gun' | 'book';
export const WEAPON_JP: Record<WeaponType, string> = {
  sword: '剣', dagger: '短剣', spear: '槍', katana: '刀', axe: '斧', bow: '弓', staff: '杖', rod: 'ロッド', fist: '格闘', whip: '鞭', gun: '銃', book: '本',
};

export type Rarity = 'normal' | 'mithril' | 'crystal' | 'legend' | 'ultima';
export const RARITY_ORDER: Rarity[] = ['normal', 'mithril', 'crystal', 'legend', 'ultima'];
export const RARITY_JP: Record<Rarity, string> = { normal: 'ノーマル', mithril: 'ミスリル', crystal: 'クリスタル', legend: 'レジェンド', ultima: 'アルテマ' };
export const RARITY_AFFIXES: Record<Rarity, number> = { normal: 0, mithril: 1, crystal: 2, legend: 3, ultima: 4 };

export interface ConsumableEffect {
  kind: 'heal' | 'mp' | 'revive' | 'cure' | 'damage' | 'capture' | 'antilaw' | 'fullheal';
  power?: number;
  element?: Element;
  target: 'ally' | 'enemy' | 'allies' | 'enemies' | 'self';
}

export interface BaseItem {
  id: string;
  name: string;
  kind: ItemKind;
  wtype?: WeaponType;
  power?: number;      // 武器攻撃力
  def?: number;        // 物理防御
  mdef?: number;       // 魔法防御
  stats?: Partial<Stats>;
  element?: Element;   // 武器の属性
  price: number;
  area: number;        // 出現し始めるエリア
  learn?: { ability?: string; skill?: string; ap: number }; // FFTA式 装備アビリティ（サポート or 技）
  effect?: ConsumableEffect;
  set?: string;
}

export type AutoMode = 'balanced' | 'attack' | 'skill' | 'save' | 'heal' | 'noheal';
export type AffixCat = 'attack' | 'element' | 'slayer' | 'status' | 'defense' | 'resist' | 'action' | 'farm' | 'monster';
export interface AffixDef {
  id: string;
  name: string;          // 接頭辞
  cat: AffixCat;
  kinds: ItemKind[];     // 乗る部位
  base: number;
  perTier: number;       // 既定 0.3
  weight: number;
  element?: Element;
  status?: Status;
  family?: string;
  desc: (v: number) => string;
}

export interface AffixRoll { id: string; value: number }

export interface ItemInstance {
  uid: string;
  base: string;
  rarity: Rarity;
  tier: number;
  affixes: AffixRoll[];
  unique?: string;
  found: number; // 入手階
  unsealed?: boolean; // 封印解除（装備Lv制限半減）
  spell?: string;     // 魔法書の対象（kind=tome）
  learn?: { ability?: string; skill?: string; ap: number }; // 個体に付いた装備アビリティ（基礎の learn より優先）
}

export type School = 'white' | 'black' | 'time' | 'blue';
export type TargetKind = 'enemy' | 'enemies' | 'ally' | 'allies' | 'self' | 'dead_ally';
export type SkillEffect =
  | 'phys' | 'magic' | 'heal' | 'revive' | 'status' | 'cure' | 'buff' | 'drain' | 'capture' | 'steal'
  | 'defend' | 'flee' | 'gil_toss' | 'focus' | 'limit' | 'fixed';

export interface Skill {
  id: string;
  name: string;
  kind: 'spell' | 'ability' | 'limit' | 'monster' | 'item';
  category?: string;     // コマンドカテゴリ（white/black/knight/dragoon…）
  school?: School;
  level?: number;        // 魔法Lv
  mp: number;
  target: TargetKind;
  effect: SkillEffect;
  power: number;         // 威力（効果ごとに意味が違う）
  element?: Element;
  status?: Status;
  chance?: number;       // 状態異常付与率
  hits?: number;
  tag?: string;          // ロウ判定用の行動タグ
  desc: string;
}

export interface SupportAbility {
  id: string;
  name: string;
  desc: string;
  cost: number;        // 魔石コスト（FF9式）
}

export interface CommandCategory { id: string; name: string; desc: string }
export interface JobDef {
  id: string;
  name: string;
  mult: Partial<Stats>;          // ステ倍率
  command?: string;              // 固有コマンド（カテゴリid）
  unlocks: { lv: number; skill: string }[]; // ジョブLvで解放される技（固有コマンド内）
  learn: { lv: number; ability: string }[]; // ジョブLvで習得するサポートアビリティ
  weapons: WeaponType[];
  unlockFloor?: number;
  unlockRebirth?: number;
}

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  mult: Partial<Stats>;
  innateJob: string;
  limit: string;         // skill id
  join: { kind: 'initial' } | { kind: 'floor'; floor: number } | { kind: 'rebirth'; count: number };
}

export type MonsterRole = 'attacker' | 'blocker' | 'healer' | 'jammer' | 'support';
export interface MonsterDef {
  id: string;
  name: string;
  family: string;
  role: MonsterRole;
  mult: Partial<Stats>;
  resist?: Partial<Record<Element, number>>; // 倍率 0=無効 -1=吸収 0.5=半減 2=弱点
  skills: string[];       // 固有技（monster kind）
  captureRate: number;    // 基礎捕獲率
  material?: string;      // 固有ドロップ素材
  evolveTo?: string;
  boss?: boolean;
  color: string;          // プロト描画用
}

export interface SubArea { floors: [number, number]; pool: string[] }
export interface AreaDef {
  id: number;
  name: string;
  motif: string;
  floors: [number, number];
  subs: SubArea[];
  midBosses: string[];
  boss: string;
  itemPool: string[];
  key: string;            // 門の鍵（素材id）
}

export type LawTag = 'item' | 'magic' | 'physical' | 'fire' | 'heal' | 'monster' | 'flee' | 'status' | 'steal' | 'capture' | 'weak' | 'limit' | 'defend';
export interface LawDef { id: string; forbid: LawTag; favor: LawTag; name: string }

export interface BoardNode {
  id: string;
  name: string;
  cat: '基礎' | '成長' | '周回' | '収集' | '戦闘' | '解放';
  effect: { tag: string; value: number };
  cost: number;
  max: number;             // 重ね買い上限
  adj: string[];
  desc: string;
}
