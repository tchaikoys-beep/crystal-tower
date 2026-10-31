# バッチ10：1001〜2000階（エリア11〜16、FF11〜16）。データ（areas2.ts）・仮スプライト・プロンプト（batch10.md）
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'public', 'sprites')
# エリア: (id, 名前, モチーフ, 背景の英語, 敵[...], 中ボス[...], ボス)
# 敵: (id, 名前, family, role, mult, skills, 捕獲率, 色, 耐性, 素材, 仮スプライト元, 色相, 英語)
# 中ボス/ボス: (id, 名前, family, role, mult, skills, 色, 耐性, 仮元(boss_), 色相, 英語)
E = lambda i, n, f, r, m, sk, cap, col, res, mat, st, hue, d: dict(id=i, name=n, family=f, role=r, mult=m, skills=sk, captureRate=cap, color=col, resist=res, material=mat, standin=st, hue=hue, desc=d)
B = lambda i, n, f, r, m, sk, col, res, st, hue, d: dict(id=i, name=n, family=f, role=r, mult=m, skills=sk, captureRate=0, color=col, resist=res, material='orichalcum', standin=st, hue=hue, desc=d, boss=True)
AREAS = [
  dict(id=11, name='ヴァナ・ディール', motif='FF11', floors=[1001, 1100], bg='a misty jungle ruin of Vana\'diel from Final Fantasy XI with ancient stone pillars and glowing crystals',
    enemies=[
      E('yagudo', 'ヤグード', 'bird', 'jammer', {'hp': 1.4, 'mag': 1.5, 'spd': 1.2}, ['silence_song', 'curse', 'wing_attack'], 0.12, '#cb7', None, 'phoenix_feather', 'griffin', 40, 'YAGUDO from Final Fantasy XI, a beastman like an upright bird-priest with brown feathers and tattered robes'),
      E('quadav', 'クゥダフ', 'beast', 'blocker', {'hp': 2.4, 'str': 1.5, 'vit': 1.9, 'spd': 0.7}, ['shell_guard', 'quake_stomp', 'mighty_guard'], 0.1, '#5a7', {'earth': 0.5}, 'dragon_fang', 'adamantoise10', 110, 'QUADAV from Final Fantasy XI, a turtle-like beastman with a green shell, standing upright with a club'),
      E('orc11', 'オーク', 'beast', 'attacker', {'hp': 1.8, 'str': 1.7, 'vit': 1.2, 'spd': 1.0}, ['brave_slash_m', 'quake_stomp', 'bite'], 0.12, '#a75', None, 'goblin_ear', 'goblin', 20, 'ORC from Final Fantasy XI, a hulking armored pig-faced beastman with a great axe'),
      E('goblin_smithy', 'ゴブリンスミシー', 'beast', 'jammer', {'hp': 1.3, 'str': 1.2, 'mag': 1.3, 'spd': 1.3}, ['goblin_punch', 'self_destruct', 'blind_dust'], 0.18, '#8a6', None, 'goblin_ear', 'black_goblin', 100, 'GOBLIN SMITHY from Final Fantasy XI, a goblin in a leather mask and goggles carrying a huge backpack and a hammer'),
      E('crawler11', 'クロウラー', 'beast', 'blocker', {'hp': 2.2, 'str': 1.3, 'vit': 1.6, 'spd': 0.6}, ['poison_breath', 'shell_guard', 'sleep_gas'], 0.15, '#9b6', {'poison': 0}, 'slime_jelly', 'land_crawler', 90, 'CRAWLER from Final Fantasy XI, a huge green caterpillar with many legs and a horned head'),
      E('uragnite', 'ウラグナイト', 'aquatic', 'blocker', {'hp': 2.0, 'vit': 2.2, 'mag': 1.3, 'spd': 0.7}, ['aqua_breath', 'shell_guard', 'poison_breath'], 0.12, '#79a', {'water': 0.5, 'thunder': 2}, 'slime_jelly', 'sahagin', 200, 'URAGNITE from Final Fantasy XI, a large hermit-crab-like creature with a spiral shell and tentacles'),
      E('wyvern11', 'ワイバーン', 'dragon', 'attacker', {'hp': 2.2, 'str': 1.7, 'mag': 1.3, 'spd': 1.3}, ['flame', 'wing_attack', 'dark_wave'], 0.08, '#c66', {'fire': 0.5}, 'dragon_fang', 'red_dragon', 20, 'WYVERN from Final Fantasy XI, a lean red two-legged dragon with large wings, mid-roar'),
      E('corse', 'コース', 'undead', 'jammer', {'hp': 1.7, 'mag': 1.7, 'spr': 1.4, 'spd': 1.0}, ['curse', 'drain_touch', 'dark_flare'], 0.08, '#a9c', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'vampire', 260, 'CORSE from Final Fantasy XI, an undead sorcerer in a purple robe with a skull face and floating pose'),
      E('tonberry11', 'トンベリ（FF11）', 'demon', 'attacker', {'hp': 2.0, 'str': 1.8, 'spd': 0.7}, ['grudge', 'bone_throw', 'curse'], 0.1, '#4a6', None, 'magicite', 'tonberry', 120, 'TONBERRY from Final Fantasy XI, a green hooded creature with a lantern and a butcher knife, glowing eyes'),
    ],
    mid=[
      B('genbu', '玄武', 'beast', 'blocker', {'hp': 9, 'str': 1.5, 'vit': 2.2, 'mag': 1.5}, ['tidal_wave', 'mighty_guard', 'quake_stomp'], '#386', {'water': -1, 'thunder': 2}, 'kraken', 100, 'GENBU from Final Fantasy XI, a giant divine black tortoise with a snake tail and a stone-like shell'),
      B('seiryu', '青龍', 'dragon', 'attacker', {'hp': 8, 'str': 1.7, 'mag': 1.9, 'spd': 1.3}, ['thunder_breath', 'wing_attack', 'megaflare'], '#36c', {'wind': -1, 'earth': 2}, 'tiamat', 200, 'SEIRYU from Final Fantasy XI, a long serpentine azure dragon coiling through storm clouds'),
      B('diabolos_boss', 'ディアボロス', 'demon', 'jammer', {'hp': 9, 'mag': 2.0, 'spr': 1.6, 'spd': 1.2}, ['dark_flare', 'sleep_gas', 'gravija'], '#536', {'dark': -1, 'holy': 2}, 'cloud_of_darkness', 280, 'DIABOLOS from Final Fantasy XI, a dark winged demon lord with a horned head and tattered black wings'),
    ],
    boss=B('shadow_lord', '闇の王', 'boss', 'attacker', {'hp': 16, 'str': 1.9, 'vit': 1.6, 'mag': 1.8, 'spr': 1.5, 'spd': 1.2}, ['dark_flare', 'brave_slash_m', 'gravija', 'curse'], '#324', {'dark': 0, 'holy': 1.5}, 'garland', 250, 'SHADOW LORD from Final Fantasy XI, a towering armored dark knight with a horned helm wreathed in black flames')),
  dict(id=12, name='イヴァリース', motif='FF12', floors=[1101, 1200], bg='the sandy ruins and sky-pirate airship docks of Rabanastre from Final Fantasy XII under a golden sunset',
    enemies=[
      E('werewolf12', 'ウェアウルフ', 'beast', 'attacker', {'hp': 1.8, 'str': 1.7, 'spd': 1.4}, ['bite', 'brave_slash_m', 'quake_stomp'], 0.12, '#776', None, 'wolf_fang', 'silver_wolf', 30, 'WEREWOLF from Final Fantasy XII, a muscular upright wolf-man with grey fur and claws'),
      E('cockatrice', 'コカトリス', 'bird', 'jammer', {'hp': 1.3, 'mag': 1.3, 'spd': 1.5}, ['stone_gaze', 'wing_attack', 'blind_dust'], 0.2, '#db6', None, 'phoenix_feather', 'chocobo', 60, 'COCKATRICE from Final Fantasy XII, a plump round yellow bird with a red comb and tiny wings'),
      E('sleipnir', 'スレイプニル', 'beast', 'attacker', {'hp': 1.9, 'str': 1.6, 'spd': 1.6}, ['quake_stomp', 'thunder_breath', 'bite'], 0.1, '#99a', {'thunder': 0.5}, 'wolf_fang', 'unicorn', 220, 'SLEIPNIR from Final Fantasy XII, a grey armored warhorse with glowing eyes and a spiked mane'),
      E('bangaa_bandit', 'バンガの山賊', 'human', 'attacker', {'hp': 1.9, 'str': 1.6, 'vit': 1.2, 'spd': 1.1}, ['brave_slash_m', 'blind_dust', 'grudge'], 0.08, '#b86', None, 'orichalcum', 'soldier', 30, 'BANGAA BANDIT from Final Fantasy XII, a lizard-like bangaa warrior with a bandana and a scimitar'),
      E('tyrant12', 'ティラント', 'dragon', 'attacker', {'hp': 2.6, 'str': 1.9, 'vit': 1.3, 'spd': 0.9}, ['bite', 'flame', 'quake_stomp'], 0.06, '#885', None, 'dragon_fang', 'tyrannosaur', 60, 'TYRANT from Final Fantasy XII, a huge two-legged dinosaur-dragon with a crested head and small arms'),
      E('elder_wyrm', 'エルダーウィルム', 'dragon', 'blocker', {'hp': 3.0, 'str': 1.6, 'vit': 1.8, 'mag': 1.5, 'spd': 0.6}, ['poison_breath', 'self_heal', 'mighty_guard'], 0.05, '#686', {'poison': 0, 'earth': 0.5}, 'dragon_fang', 'shell_dragon', 110, 'ELDER WYRM from Final Fantasy XII, an ancient moss-covered dragon with a tree growing on its back'),
      E('skull_defender', 'スカルディフェンダー', 'undead', 'blocker', {'hp': 2.3, 'str': 1.5, 'vit': 1.7}, ['brave_slash_m', 'shell_guard', 'curse'], 0.08, '#ccb', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'forbidden', 60, 'SKULL DEFENDER from Final Fantasy XII, an undead knight skeleton in rusted armor with a tower shield'),
      E('mandragora12', 'マンドラゴラ・プリンス', 'plant', 'jammer', {'hp': 1.4, 'mag': 1.5, 'spd': 1.3}, ['sleep_gas', 'silence_song', 'needles'], 0.2, '#9c4', {'poison': 0, 'fire': 2}, 'slime_jelly', 'mandragora', 60, 'MANDRAGORA PRINCE from Final Fantasy XII, a small round root creature with a crown of leaves and a mischievous face'),
      E('garchimacera', 'ガーキマセラ', 'demon', 'attacker', {'hp': 1.8, 'str': 1.5, 'mag': 1.5, 'spd': 1.4}, ['dark_wave', 'blaster', 'wing_attack'], 0.08, '#657', {'dark': 0.5}, 'magicite', 'gargoyle', 250, 'GARCHIMACERA from Final Fantasy XII, a lean purple gargoyle-demon with bat wings and glowing eyes'),
    ],
    mid=[
      B('demon_wall', 'デモンズウォール', 'demon', 'blocker', {'hp': 10, 'str': 1.6, 'vit': 2.4, 'mag': 1.6}, ['quake_stomp', 'curse', 'stone_gaze'], '#776', {'earth': 0}, 'soulcage', 30, 'DEMON WALL from Final Fantasy XII, a massive carved stone wall with a demonic face and arms'),
      B('hydro', 'ハイドロ', 'dragon', 'attacker', {'hp': 9, 'str': 1.8, 'mag': 1.6, 'spd': 1.1}, ['tidal_wave', 'poison_breath', 'bite'], '#486', {'water': -1, 'thunder': 2}, 'kraken', 140, 'HYDRO from Final Fantasy XII, a multi-headed green hydra dragon rising from water'),
      B('judge_gabranth', 'ジャッジ・ガブラス', 'human', 'attacker', {'hp': 9, 'str': 2.0, 'vit': 1.7, 'spd': 1.3}, ['brave_slash_m', 'dark_wave', 'blaster'], '#556', None, 'gilgamesh', 220, 'JUDGE GABRANTH from Final Fantasy XII, an imperial judge magister in ornate dark full plate with a horned helm, twin blades'),
    ],
    boss=B('the_undying', '不滅なるもの', 'boss', 'attacker', {'hp': 17, 'str': 1.8, 'vit': 1.6, 'mag': 2.0, 'spr': 1.6, 'spd': 1.2}, ['megaflare', 'gravija', 'holy_light', 'dark_flare'], '#a86', {'holy': 0.5, 'dark': 0.5}, 'zeromus', 40, 'THE UNDYING from Final Fantasy XII, a golden-armored winged demigod fused with machinery, wreathed in light')),
  dict(id=13, name='コクーン', motif='FF13', floors=[1201, 1300], bg='the crystalline futuristic city of Cocoon from Final Fantasy XIII with neon lights and floating structures',
    enemies=[
      E('psicom_soldier', 'PSICOM兵', 'human', 'attacker', {'hp': 1.6, 'str': 1.5, 'spd': 1.2}, ['laser', 'blind_dust', 'brave_slash_m'], 0.1, '#889', None, 'orichalcum', 'soldier', 200, 'PSICOM SOLDIER from Final Fantasy XIII, a futuristic soldier in white and grey armor with a rifle'),
      E('pantheron', 'パンテロン', 'beast', 'attacker', {'hp': 1.7, 'str': 1.6, 'spd': 1.5}, ['bite', 'blaster', 'quake_stomp'], 0.15, '#a86', None, 'wolf_fang', 'coeurl', 40, 'PANTHERON from Final Fantasy XIII, a sleek bioweapon panther with armored plates and glowing lines'),
      E('cie_th', 'シ骸', 'undead', 'blocker', {'hp': 2.5, 'str': 1.5, 'vit': 1.6, 'spd': 0.6}, ['curse', 'drain_touch', 'quake_stomp'], 0.06, '#669', {'holy': 2, 'dark': -1, 'poison': 0}, 'magicite', 'zombie', 230, 'CIE\'TH from Final Fantasy XIII, a crystallized undead monster with a hunched body and glowing crystal growths'),
      E('adamanchelid', 'アダマンケリド', 'beast', 'blocker', {'hp': 3.0, 'str': 1.6, 'vit': 2.2, 'spd': 0.5}, ['quake_stomp', 'shell_guard', 'mighty_guard'], 0.08, '#897', {'earth': 0.5}, 'dragon_fang', 'adamantoise10', 30, 'ADAMANCHELID from Final Fantasy XIII, a young adamantoise: a colossal armored tortoise with pillar legs'),
      E('manasvin', 'マナスヴィン', 'machine', 'attacker', {'hp': 2.2, 'str': 1.6, 'mag': 1.4}, ['laser', 'thunder_breath', 'self_destruct'], 0.06, '#a99', {'thunder': 2, 'poison': 0}, 'orichalcum', 'air_buster', 10, 'MANASVIN WARMECH from Final Fantasy XIII, a bipedal war mech with a cannon and glowing core'),
      E('cryohedron', 'クライオヘドロン', 'elemental', 'attacker', {'hp': 1.3, 'mag': 1.7, 'spd': 1.3}, ['ice_breath', 'self_destruct', 'blind_dust'], 0.15, '#9df', {'ice': -1, 'fire': 2}, 'fire_shard', 'bomb', 190, 'CRYOHEDRON from Final Fantasy XIII, a floating geometric ice crystal creature with a glowing core'),
      E('ochu13', 'オチュー', 'plant', 'jammer', {'hp': 2.4, 'mag': 1.4, 'vit': 1.4, 'spd': 0.8}, ['bad_breath', 'poison_breath', 'needles'], 0.1, '#6a5', {'poison': 0, 'fire': 2}, 'slime_jelly', 'malboro', 30, 'OCHU from Final Fantasy XIII, a large plant monster with a bulbous body, tentacle vines and a toothy maw'),
      E('zwerg', 'ズヴェルグ', 'machine', 'jammer', {'hp': 1.5, 'mag': 1.5, 'spd': 1.4}, ['laser', 'sleep_gas', 'silence_song'], 0.12, '#7ab', {'thunder': 2, 'poison': 0}, 'orichalcum', 'sweeper', 150, 'ZWERG SCANDROID from Final Fantasy XIII, a small hovering scout drone with spider-like legs'),
      E('behemoth13', 'ベヒーモス（FF13）', 'beast', 'attacker', {'hp': 2.6, 'str': 1.9, 'vit': 1.3, 'spd': 1.0}, ['meteor_strike', 'brave_slash_m', 'quake_stomp'], 0.06, '#a4a', None, 'dragon_fang', 'behemoth9', 300, 'BEHEMOTH from Final Fantasy XIII, a horned purple beast standing upright wielding a huge crystal sword'),
    ],
    mid=[
      B('anima', 'アニマ', 'machine', 'jammer', {'hp': 9, 'mag': 2.0, 'spr': 1.6}, ['laser', 'curse', 'gravija'], '#558', None, 'soulcage', 200, 'ANIMA from Final Fantasy XIII, a fal\'Cie: a massive mechanical god-like construct with glowing tendrils'),
      B('bahamut13', 'バハムート（FF13）', 'dragon', 'attacker', {'hp': 10, 'str': 1.9, 'mag': 1.9, 'spd': 1.3}, ['megaflare', 'wing_attack', 'dark_wave'], '#446', None, 'tiamat', 220, 'BAHAMUT from Final Fantasy XIII, a sleek dark-blue mechanical-looking dragon eidolon with blade wings'),
      B('barthandelus', 'バルトアンデルス', 'demon', 'jammer', {'hp': 11, 'mag': 2.2, 'spr': 1.8, 'spd': 1.1}, ['dark_flare', 'holy_light', 'curse', 'ultima_blast'], '#cb9', {'holy': 0.5, 'dark': 0.5}, 'goddess', 40, 'BARTHANDELUS from Final Fantasy XIII, a fal\'Cie with a giant ornate face surrounded by a wheel of smaller faces'),
    ],
    boss=B('orphan', 'オーファン', 'boss', 'jammer', {'hp': 17, 'str': 1.7, 'vit': 1.5, 'mag': 2.2, 'spr': 1.8, 'spd': 1.2}, ['ultima_blast', 'heartless_angel', 'gravija', 'holy_light'], '#dcb', {'holy': 0.5, 'dark': 0.5}, 'goddess', 300, 'ORPHAN from Final Fantasy XIII, a fal\'Cie resembling a golden ornate shield-like body with a face at the center and wing-like arms')),
  dict(id=14, name='エオルゼア', motif='FF14', floors=[1301, 1400], bg='the crystal-lit cavern of the Crystal Tower from Final Fantasy XIV with blue crystals and Allagan machinery',
    enemies=[
      E('coblyn', 'コブラン', 'amorph', 'blocker', {'hp': 2.0, 'vit': 2.5, 'mag': 1.2, 'spd': 0.7}, ['shell_guard', 'quake_stomp', 'self_heal'], 0.15, '#a97', {'earth': 0.5}, 'mithril', 'flan', 40, 'COBLYN from Final Fantasy XIV, a small rock-and-ore creature like a crystal-studded blob with a mouth'),
      E('spriggan', 'スプリガン', 'beast', 'jammer', {'hp': 1.4, 'str': 1.3, 'spd': 1.4, 'luck': 1.3}, ['goblin_punch', 'blind_dust', 'grudge'], 0.2, '#886', None, 'magicite', 'goblin', 60, 'SPRIGGAN from Final Fantasy XIV, a small furry imp-like creature carrying a crystal as big as itself'),
      E('ziz', 'ジズ', 'bird', 'attacker', {'hp': 1.6, 'str': 1.5, 'spd': 1.6}, ['wing_attack', 'blind_dust', 'thunder_breath'], 0.15, '#dca', None, 'phoenix_feather', 'griffin', 40, 'ZIZ from Final Fantasy XIV, a large hawk-like bird with a long beak and bright plumage'),
      E('voidsent', '妖異', 'demon', 'attacker', {'hp': 1.9, 'str': 1.5, 'mag': 1.7, 'spd': 1.2}, ['dark_wave', 'dark_flare', 'curse'], 0.08, '#536', {'dark': -1, 'holy': 2}, 'magicite', 'deathgaze', 270, 'VOIDSENT from Final Fantasy XIV, a horned shadowy demon with purple energy and clawed hands'),
      E('goobbue', 'グゥーブー', 'beast', 'blocker', {'hp': 2.8, 'str': 1.6, 'vit': 1.7, 'spd': 0.6}, ['quake_stomp', 'bad_breath', 'self_heal'], 0.1, '#7a6', None, 'slime_jelly', 'hecatoncheir', 110, 'GOOBBUE from Final Fantasy XIV, a huge green moss-covered beast with a wide mouth and plants growing on its back'),
      E('salamander14', 'サラマンダー', 'aquatic', 'attacker', {'hp': 1.9, 'str': 1.5, 'mag': 1.4, 'spd': 1.1}, ['flame', 'aqua_breath', 'bite'], 0.12, '#c85', {'fire': 0.5, 'water': 0.5}, 'dragon_fang', 'aps', 20, 'SALAMANDER from Final Fantasy XIV, a large orange amphibian lizard with a flame-colored crest'),
      E('imp14', 'インプ', 'demon', 'jammer', {'hp': 1.2, 'mag': 1.5, 'spd': 1.5}, ['sleep_gas', 'silence_song', 'blaster'], 0.2, '#86a', None, 'magicite', 'imp8', 260, 'IMP from Final Fantasy XIV, a small winged purple imp with a trident and a grin'),
      E('ascian_shade', 'アシエンの影', 'demon', 'jammer', {'hp': 1.8, 'mag': 1.8, 'spr': 1.5, 'spd': 1.1}, ['dark_flare', 'gravija', 'curse'], 0.05, '#324', {'dark': -1, 'holy': 2}, 'magicite', 'vampire', 280, 'ASCIAN SHADE from Final Fantasy XIV, a hooded black-robed figure with a glowing red mask, floating'),
      E('morbol14', 'モルボル（FF14）', 'plant', 'jammer', {'hp': 2.4, 'mag': 1.5, 'vit': 1.3}, ['bad_breath', 'poison_breath', 'drain_touch'], 0.1, '#5a4', {'poison': 0, 'fire': 2}, 'slime_jelly', 'malboro', 10, 'MORBOL from Final Fantasy XIV, a green tentacled plant monster with a huge maw of teeth and many eyes'),
    ],
    mid=[
      B('ifrit14', 'イフリート（蛮神）', 'elemental', 'attacker', {'hp': 9, 'str': 1.9, 'mag': 1.9, 'spd': 1.2}, ['flame', 'meteor_strike', 'megaflare'], '#c53', {'fire': -1, 'ice': 2, 'water': 2}, 'bomb_king', 0, 'IFRIT primal from Final Fantasy XIV, a horned fire demon with blazing fur and massive claws'),
      B('titan14', 'タイタン（蛮神）', 'giant', 'blocker', {'hp': 11, 'str': 2.0, 'vit': 2.2, 'spd': 0.7}, ['quake_stomp', 'mighty_guard', 'meteor_strike'], '#a85', {'earth': -1, 'wind': 2}, 'titan', 20, 'TITAN primal from Final Fantasy XIV, a colossal rock-skinned giant with glowing cracks and a crystal heart'),
      B('garuda14', 'ガルーダ（蛮神）', 'bird', 'jammer', {'hp': 8, 'mag': 2.0, 'spd': 1.6}, ['wing_attack', 'blind_dust', 'thunder_breath', 'tidal_wave'], '#6b8', {'wind': -1, 'earth': 2}, 'garuda', 120, 'GARUDA primal from Final Fantasy XIV, a green-skinned winged harpy queen with feathered arms and talons'),
    ],
    boss=B('bahamut_prime', 'バハムート・プライム', 'boss', 'attacker', {'hp': 18, 'str': 2.0, 'vit': 1.7, 'mag': 2.1, 'spr': 1.6, 'spd': 1.3}, ['megaflare', 'dark_flare', 'wing_attack', 'gravija'], '#a63', {'dark': 0.5}, 'shinryu', 20, 'BAHAMUT PRIME from Final Fantasy XIV, an immense dark-red dragon with glowing orange veins and massive wings')),
  dict(id=15, name='ルシス', motif='FF15', floors=[1401, 1500], bg='a dusk highway and rocky plains of Lucis from Final Fantasy XV with a distant crystal city and purple sky',
    enemies=[
      E('garula', 'ガルラ', 'beast', 'blocker', {'hp': 2.6, 'str': 1.6, 'vit': 1.6, 'spd': 0.6}, ['quake_stomp', 'bite', 'shell_guard'], 0.15, '#a87', None, 'wolf_fang', 'behemoth9', 30, 'GARULA from Final Fantasy XV, a huge shaggy brown mammoth-boar beast with big tusks'),
      E('sabertusk', 'セイバータスク', 'beast', 'attacker', {'hp': 1.6, 'str': 1.6, 'spd': 1.6}, ['bite', 'blind_dust', 'brave_slash_m'], 0.18, '#b96', None, 'wolf_fang', 'wolf', 40, 'SABERTUSK from Final Fantasy XV, a tan wolf-like beast with saber fangs and a ridge of spines'),
      E('magitek_trooper', '魔導兵', 'machine', 'attacker', {'hp': 2.0, 'str': 1.6, 'vit': 1.3}, ['laser', 'brave_slash_m', 'thunder_breath'], 0.08, '#766', {'thunder': 2, 'poison': 0}, 'orichalcum', 'proto_armor', 350, 'MAGITEK TROOPER from Final Fantasy XV, a dark red-eyed robotic soldier in imperial armor with an axe'),
      E('ronin', 'ローニン', 'undead', 'attacker', {'hp': 2.2, 'str': 1.9, 'spd': 1.2}, ['brave_slash_m', 'curse', 'drain_touch'], 0.06, '#434', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'forbidden', 280, 'RONIN daemon from Final Fantasy XV, a tall ghostly samurai in black armor with a long katana, shadowy'),
      E('red_giant', 'レッドジャイアント', 'giant', 'attacker', {'hp': 3.2, 'str': 2.1, 'vit': 1.5, 'spd': 0.6}, ['flame', 'brave_slash_m', 'quake_stomp'], 0.05, '#b33', {'fire': 0.5}, 'orichalcum', 'iron_giant2', 350, 'RED GIANT daemon from Final Fantasy XV, a huge armored giant with a flaming red body and a giant sword'),
      E('naga15', 'ナーガ', 'demon', 'jammer', {'hp': 2.0, 'mag': 1.7, 'spd': 1.2}, ['lamia_kiss', 'poison_breath', 'curse'], 0.08, '#5a9', {'poison': 0}, 'magicite', 'lamia_queen', 140, 'NAGA daemon from Final Fantasy XV, a giant serpent-woman with a long scaled tail and wild hair'),
      E('bandersnatch', 'バンダースナッチ', 'beast', 'attacker', {'hp': 2.8, 'str': 1.9, 'spd': 1.1}, ['bite', 'quake_stomp', 'meteor_strike'], 0.06, '#776', None, 'dragon_fang', 'behemoth9', 200, 'BANDERSNATCH from Final Fantasy XV, a massive grey-brown wolf-like beast with a long snout and heavy claws'),
      E('coeurl15', 'クァール（FF15）', 'beast', 'jammer', {'hp': 1.7, 'str': 1.4, 'mag': 1.5, 'spd': 1.5}, ['blaster', 'bite', 'thunder_breath'], 0.12, '#a8a', {'thunder': 0.5}, 'wolf_fang', 'coeurl', 300, 'COEURL from Final Fantasy XV, a sleek black-purple panther with long whisker tendrils crackling with electricity'),
      E('mindflayer15', 'マインドフレア（FF15）', 'demon', 'jammer', {'hp': 1.8, 'mag': 1.8, 'spr': 1.4}, ['mind_blast', 'sleep_gas', 'dark_flare'], 0.06, '#468', {'dark': 0.5}, 'magicite', 'mindflayer', 180, 'MINDFLAYER daemon from Final Fantasy XV, a hooded tentacle-faced sorcerer in a dark robe with a glowing orb'),
    ],
    mid=[
      B('aranea', 'アラネア', 'human', 'attacker', {'hp': 8, 'str': 2.0, 'vit': 1.5, 'spd': 1.5}, ['brave_slash_m', 'wing_attack', 'meteor_strike'], '#a66', None, 'gilgamesh', 350, 'ARANEA HIGHWIND from Final Fantasy XV, a dragoon commodore in red and black armor with a spear, silver hair'),
      B('deadeye', 'デッドアイ', 'beast', 'attacker', {'hp': 10, 'str': 2.1, 'vit': 1.6}, ['bite', 'quake_stomp', 'poison_breath'], '#776', None, 'catoblepas', 60, 'DEADEYE from Final Fantasy XV, a gigantic one-eyed behemoth with a scarred face and huge horns'),
      B('ravus', 'レイヴス', 'human', 'attacker', {'hp': 9, 'str': 2.0, 'mag': 1.7, 'spd': 1.3}, ['brave_slash_m', 'holy_light', 'dark_wave'], '#ddd', {'holy': 0.5}, 'sephiroth', 60, 'RAVUS NOX FLEURET from Final Fantasy XV, a tall white-haired commander in a white and black coat with a magitek arm and a sword'),
    ],
    boss=B('ardyn', 'アーデン', 'boss', 'jammer', {'hp': 17, 'str': 1.9, 'vit': 1.6, 'mag': 2.1, 'spr': 1.7, 'spd': 1.3}, ['dark_flare', 'brave_slash_m', 'heartless_angel', 'curse'], '#634', {'dark': 0, 'holy': 1.5}, 'kefka', 320, 'ARDYN IZUNIA from Final Fantasy XV, a man with wavy maroon hair and a fedora in a black coat, surrounded by black daemon smoke')),
  dict(id=16, name='ヴァリスゼア', motif='FF16', floors=[1501, 1600], bg='a windswept crystal-choked battlefield of Valisthea from Final Fantasy XVI with a dark Mothercrystal looming',
    enemies=[
      E('akashic_soldier', 'アカシックの兵', 'undead', 'attacker', {'hp': 2.0, 'str': 1.7, 'spd': 1.1}, ['brave_slash_m', 'curse', 'grudge'], 0.08, '#777', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'soldier', 0, 'AKASHIC SOLDIER from Final Fantasy XVI, a greyed crystallized soldier in armor with glowing cracks, mindless'),
      E('wyvern16', 'ワイバーン（FF16）', 'dragon', 'attacker', {'hp': 2.4, 'str': 1.8, 'spd': 1.4}, ['wing_attack', 'flame', 'bite'], 0.08, '#876', None, 'dragon_fang', 'red_dragon', 40, 'WYVERN from Final Fantasy XVI, a brown leathery two-legged dragon with ragged wings and a hooked beak'),
      E('gigas16', 'ギガース（FF16）', 'giant', 'attacker', {'hp': 3.0, 'str': 2.0, 'vit': 1.5, 'spd': 0.6}, ['quake_stomp', 'brave_slash_m', 'meteor_strike'], 0.05, '#998', None, 'orichalcum', 'hecatoncheir', 0, 'GIGAS from Final Fantasy XVI, a grey-skinned cyclops-like giant with a huge club and tusks'),
      E('flan16', 'フラン（FF16）', 'amorph', 'blocker', {'hp': 2.2, 'vit': 3.5, 'mag': 1.6, 'spr': 0.5}, ['aqua_breath', 'thunder_breath', 'white_wind'], 0.1, '#89c', {'thunder': 0.5}, 'slime_jelly', 'flan', 200, 'FLAN from Final Fantasy XVI, a tall wobbling blue gelatinous monster with a gaping mouth'),
      E('coeurl16', 'クァール（FF16）', 'beast', 'attacker', {'hp': 1.9, 'str': 1.7, 'spd': 1.6}, ['bite', 'blaster', 'thunder_breath'], 0.1, '#c96', {'thunder': 0.5}, 'wolf_fang', 'coeurl', 20, 'COEURL from Final Fantasy XVI, a lean spotted panther with long whiskers and a crackling aura'),
      E('aevis', 'エイビス', 'dragon', 'attacker', {'hp': 2.4, 'str': 1.8, 'mag': 1.4, 'spd': 1.3}, ['wing_attack', 'ice_breath', 'dark_wave'], 0.07, '#8a9', None, 'dragon_fang', 'blue_dragon', 120, 'AEVIS from Final Fantasy XVI, a swift feathered dragon-bird hybrid with a long neck and sharp beak'),
      E('chimera16', 'キマイラ（FF16）', 'beast', 'attacker', {'hp': 2.8, 'str': 1.8, 'mag': 1.8, 'spd': 1.1}, ['flame', 'thunder_breath', 'megaflare'], 0.05, '#a74', None, 'dragon_fang', 'chimera_brain', 30, 'CHIMERA from Final Fantasy XVI, a three-headed beast with lion, goat and serpent heads and dark wings'),
      E('adamantoise16', 'アダマンタイマイ（FF16）', 'beast', 'blocker', {'hp': 3.4, 'str': 1.6, 'vit': 2.4, 'spd': 0.5}, ['quake_stomp', 'shell_guard', 'mighty_guard'], 0.06, '#786', {'earth': 0}, 'dragon_fang', 'adamantoise10', 60, 'ADAMANTOISE from Final Fantasy XVI, a mountainous armored tortoise with a spiked shell'),
      E('ahriman16', 'アーリマン（FF16）', 'demon', 'jammer', {'hp': 1.7, 'mag': 1.8, 'spd': 1.4}, ['stone_gaze', 'blind_dust', 'dark_flare'], 0.08, '#766', {'dark': 0.5}, 'magicite', 'ahriman', 20, 'AHRIMAN from Final Fantasy XVI, a floating one-eyed demon with bat wings and a toothy grin'),
    ],
    mid=[
      B('benedikta_garuda', 'ガルーダ（ベネディクタ）', 'bird', 'jammer', {'hp': 9, 'mag': 2.0, 'spd': 1.7}, ['wing_attack', 'blind_dust', 'tidal_wave', 'thunder_breath'], '#6a8', {'wind': -1, 'earth': 2}, 'garuda', 140, 'GARUDA Eikon from Final Fantasy XVI, a towering green-feathered winged goddess with long talons and a wild mane'),
      B('hugo_titan', 'タイタン（フーゴ）', 'giant', 'blocker', {'hp': 12, 'str': 2.2, 'vit': 2.3, 'spd': 0.7}, ['quake_stomp', 'meteor_strike', 'mighty_guard'], '#875', {'earth': -1, 'wind': 2}, 'titan', 30, 'TITAN Eikon from Final Fantasy XVI, a gargantuan earthen giant with rocky skin and many arms'),
      B('barnabas_odin', 'オーディン（バルナバス）', 'human', 'attacker', {'hp': 10, 'str': 2.4, 'vit': 1.6, 'spd': 1.4}, ['brave_slash_m', 'dark_wave', 'gravija'], '#223', {'dark': 0.5}, 'sephiroth', 230, 'ODIN Eikon from Final Fantasy XVI, a dark armored knight on a black six-legged horse with a long blade Zantetsuken'),
    ],
    boss=B('ultima16', 'アルティマ', 'boss', 'jammer', {'hp': 20, 'str': 2.0, 'vit': 1.8, 'mag': 2.4, 'spr': 1.9, 'spd': 1.3}, ['ultima_blast', 'holy_light', 'gravija', 'megaflare'], '#eef', {'holy': 0.5, 'dark': 0.5}, 'cloud_of_darkness', 60, 'ULTIMA from Final Fantasy XVI, a winged angelic being in white and gold with a serene face and blue crystal wings')),
]
BASE_E = "16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature."
BASE_BG = "16-bit SNES-era JRPG pixel art battle background in the style of mid-1990s Japanese RPGs, limited palette, crisp pixels, no anti-aliasing, no characters, no text, no watermark, 256x224 aspect (wider than tall)."
def shift(img, hue_deg):
    img = img.convert('RGBA'); a = img.getchannel('A'); hsv = img.convert('RGB').convert('HSV'); px = hsv.load(); w, hh = hsv.size; target = int(hue_deg * 255 / 360)
    for y in range(hh):
        for x in range(w):
            h, s, v = px[x, y]
            if v < 60: continue
            px[x, y] = ((target if s < 50 else (h + target) % 256), (110 if s < 50 else s), v)
    out = hsv.convert('RGBA'); out.putalpha(a); return out
made = 0; mons = []; areas = []; md = []
for a in AREAS:
    md.append(f"## エリア{a['id']} {a['name']}（{a['motif']}）\n")
    # 背景
    md.append(f"### bg_area{a['id']}\n```\nImage name: bg_area{a['id']}. Reply with this image name as the first line of your answer.\n\n{BASE_BG}\n\nBattle background of {a['bg']}. Horizon around the upper third, ground plane at the bottom for characters to stand on.\n```\n")
    dst = os.path.join(OUT, f"bg_area{a['id']}.png")
    if not os.path.exists(dst):
        src = os.path.join(OUT, f"bg_area{((a['id'] - 1) % 10) + 1}.png"); im = Image.open(src).convert('RGB'); shift(im, (a['id'] * 50) % 360).convert('RGB').save(dst); made += 1
    for m in a['enemies'] + a['mid'] + [a['boss']]:
        boss = m.get('boss', False); pre = 'boss_' if boss else 'enemy_'
        md.append(f"### {pre}{m['id']}（{m['name']}）\n```\nImage name: {pre}{m['id']}. Reply with this image name as the first line of your answer.\n\n{BASE_E}\n\n{'Boss' if boss else 'Battle'} sprite of a {m['desc']}, facing RIGHT, single idle pose. Enemy sprite, no background elements. Should read clearly at {'112x112' if boss else '64x64'} pixels. Match the exact pixel style and proportions of the attached reference sprite.\n```\n")
        dst = os.path.join(OUT, f"{pre}{m['id']}.png")
        if not os.path.exists(dst):
            src = os.path.join(OUT, f"{pre}{m['standin']}.png"); shift(Image.open(src), m['hue']).save(dst); made += 1
        mons.append({k: m[k] for k in ['id', 'name', 'family', 'role', 'mult', 'skills', 'captureRate', 'color', 'resist', 'material'] } | ({'boss': True} if boss else {}))
    ids = [e['id'] for e in a['enemies']]
    areas.append({'id': a['id'], 'name': a['name'], 'motif': a['motif'], 'floors': a['floors'], 'subs': [{'floors': [a['floors'][0], a['floors'][0] + 49], 'pool': ids[:5]}, {'floors': [a['floors'][0] + 50, a['floors'][1]], 'pool': ids[4:]}], 'midBosses': [m['id'] for m in a['mid']], 'boss': a['boss']['id'], 'itemPool': [], 'key': 'orichalcum'})
open(os.path.join(ROOT, 'src', 'data', 'areas2.ts'), 'w').write("// 自動生成：art/batch10_data.py（エリア11〜16）\nexport const MONSTERS2: any[] = " + json.dumps(mons, ensure_ascii=False, indent=0) + ";\nexport const AREAS2: any[] = " + json.dumps(areas, ensure_ascii=False, indent=0) + ";\n")
total = sum(len(a['enemies']) + len(a['mid']) + 2 for a in AREAS)
open(os.path.join(HERE, 'batch10.md'), 'w').write(f"# バッチ10：1001〜2000階 エリア11〜16（{total}枚：敵54・中ボス18・ボス6・背景6）\n\n- 敵・ボスはクラウドの画像を参照添付。背景は添付不要\n- 届くまでは既存スプライトの色替えが仮表示。同名で上書きされる\n\n" + "\n".join(md))
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(mons), 'monsters;', made, 'placeholders;', total, 'prompts;', len(names), 'registered')
