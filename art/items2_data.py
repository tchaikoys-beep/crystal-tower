# 装備＋100：エリア1〜10に各10点。武器6（刀・斧・弓・鞭・拳・杖/ロッド/短剣/槍/剣を回す）＋防具・アクセ4。生成物 src/data/items2.ts
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
WP = {1: 20, 2: 32, 3: 42, 4: 55, 5: 68, 6: 82, 7: 95, 8: 106, 9: 120, 10: 138, 11: 156, 12: 175, 13: 195, 14: 216, 15: 238, 16: 262}      # 武器基礎攻撃
BD = {1: 11, 2: 18, 3: 26, 4: 36, 5: 44, 6: 48, 7: 56, 8: 61, 9: 67, 10: 75, 11: 83, 12: 91, 13: 100, 14: 109, 15: 118, 16: 128}         # 体防御基礎
TM = {'gun': 1.0, 'book': 0.45, 'sword': 1.0, 'katana': 1.05, 'axe': 1.18, 'spear': 1.0, 'bow': 0.95, 'fist': 0.95, 'whip': 0.85, 'dagger': 0.8, 'staff': 0.4, 'rod': 0.35}
PRICE = {1: 400, 2: 1200, 3: 2600, 4: 4200, 5: 6500, 6: 9000, 7: 12000, 8: 15000, 9: 19000, 10: 24000, 11: 30000, 12: 37000, 13: 45000, 14: 54000, 15: 64000, 16: 75000}
# (area, id, 名前, kind, wtype|None, 倍率(武器)/防御倍率(防具), stats, element, learn(ability or skill), set)
W = lambda a, i, n, wt, m=1.0, st=None, el=None, learn=None, s=None: (a, i, n, 'weapon', wt, m, st, el, learn, s)
S = lambda a, i, n, m=1.0, st=None, learn=None, s=None: (a, i, n, 'shield', None, m, st, None, learn, s)
H = lambda a, i, n, m=1.0, st=None, learn=None, s=None: (a, i, n, 'head', None, m, st, None, learn, s)
B = lambda a, i, n, m=1.0, st=None, learn=None, s=None: (a, i, n, 'body', None, m, st, None, learn, s)
A = lambda a, i, n, st=None, learn=None, s=None, m=0: (a, i, n, 'acc', None, m, st, None, learn, s)
ab = lambda k: ('ability', k); sk = lambda k: ('skill', k)
L = [
  # ---- エリア1 コーネリア
  W(1, 'kotetsu', 'こてつ', 'katana', 1.0, None, None, sk('mineuchi')), W(1, 'hand_axe', 'ハンドアックス', 'axe', 0.9, None, None, ab('str10')),
  W(1, 'short_bow', 'ショートボウ', 'bow', 0.85, None, None, ab('eva10')), W(1, 'chain_whip', 'チェーンウィップ', 'whip', 1.0, None, None, sk('slow_dance')),
  W(1, 'oak_staff', '樫の杖', 'staff', 1.0, {'spr': 4, 'mp': 6}, None, sk('mix_potion')), W(1, 'ice_rod', '氷のロッド', 'rod', 1.0, {'mag': 8}, 'ice', sk('blizzara')),
  S(1, 'wooden_shield', '木の盾', 0.6, None, ab('res_sleep')), H(1, 'feather_cap', '羽根つき帽子', 0.5, {'spd': 3}, ab('dash')),
  B(1, 'kenpo_gi', '拳法着', 0.7, {'str': 3, 'spd': 3}, ab('counter')), A(1, 'bronze_bangle', 'ブロンズバングル', {'vit': 4}, ab('hp10')),
  # ---- エリア2 パラメキア
  W(2, 'kikuichimonji', '菊一文字', 'katana', 1.0, None, None, ab('crit10')), W(2, 'ogre_killer', 'オーガキラー', 'axe', 1.0, None, None, sk('crush')),
  W(2, 'killer_bow', 'キラーボウ', 'bow', 1.0, None, None, sk('poison_arrow')), W(2, 'thunder_whip', '雷の鞭', 'whip', 1.0, None, 'thunder', sk('tempting_tango')),
  W(2, 'poison_knuckle', 'ポイズンナックル', 'fist', 1.0, None, 'poison', ab('res_poison')), W(2, 'trident', 'トライデント', 'spear', 1.0, None, 'water', sk('lancet')),
  S(2, 'ice_shield', '氷の盾', 0.7, None, ab('res_ice')), H(2, 'bandana', 'バンダナ', 0.45, {'luck': 4, 'spd': 2}, ab('steal_up')),
  B(2, 'silk_robe', '絹のローブ', 0.55, {'mag': 4, 'spr': 4}, ab('mp10')), A(2, 'earth_bell', '大地のベル', {'vit': 3}, sk('terrain')),
  # ---- エリア3 浮遊大陸（たまねぎ装備）
  W(3, 'onion_sword', 'オニオンソード', 'sword', 1.0, None, None, ab('hp20'), 'onion'), W(3, 'blood_lance', 'ブラッドランス', 'spear', 1.0, None, 'dark', ab('vamp5')),
  W(3, 'wind_bow', '風切りの弓', 'bow', 1.0, None, 'wind', sk('wind_slash')), W(3, 'kotetsu2', '虎徹', 'katana', 1.0, None, None, sk('zeninage')),
  W(3, 'rune_staff', 'ルーンの杖', 'staff', 1.0, {'spr': 10, 'mp': 20}, None, ab('half_mp')), W(3, 'flame_whip', 'フレイムウィップ', 'whip', 1.0, None, 'fire', sk('mystery_waltz')),
  S(3, 'onion_shield', 'オニオンシールド', 0.7, None, ab('auto_protect'), 'onion'), H(3, 'onion_helm', 'オニオンヘルム', 0.55, None, ab('res_blind'), 'onion'),
  B(3, 'onion_armor', 'オニオンアーマー', 1.0, None, ab('hp20'), 'onion'), A(3, 'rune_bell', 'ルーンのベル', {'mag': 6}, ab('terrain_mastery')),
  # ---- エリア4 月
  W(4, 'murasame', '村雨', 'katana', 1.0, None, 'water', ab('eva10')), W(4, 'rune_axe', 'ルーンアクス', 'axe', 1.0, {'mag': 6}, None, ab('mag10')),
  W(4, 'artemis_bow', 'アルテミスの弓', 'bow', 1.0, None, None, sk('rapid_fire')), W(4, 'cat_claws', 'キャットクロー', 'fist', 1.0, {'spd': 6}, None, ab('multi10')),
  W(4, 'wizard_staff', '賢者の杖', 'staff', 1.0, {'mag': 10, 'spr': 10}, None, sk('curaja')), W(4, 'lunar_rod', '月のロッド', 'rod', 1.0, {'mag': 14}, 'holy', sk('raise')),
  S(4, 'aegis_shield', 'イージスの盾', 0.75, {'spr': 6}, ab('magic_barrier')), H(4, 'black_cowl', '黒頭巾', 0.5, {'spd': 6}, ab('first_strike')),
  B(4, 'lunar_mail', '月光の鎧', 1.0, {'spr': 6}, ab('auto_shell')), A(4, 'angel_ring', '天使の指輪', {'spr': 6}, ab('auto_regen')),
  # ---- エリア5 次元の狭間（源氏の残り）
  W(5, 'masamune5', '正宗', 'katana', 1.05, {'spd': 6}, None, ab('auto_haste')), W(5, 'gigant_axe', 'ギガントアクス', 'axe', 1.0, None, None, sk('earthshatter')),
  W(5, 'yoichi_bow', '与一の弓', 'bow', 1.0, {'luck': 6}, None, ab('crit10')), W(5, 'dragon_whisker', '竜のひげ', 'whip', 1.0, None, None, sk('sword_dance')),
  W(5, 'sage_staff', '賢者のロッド', 'rod', 1.0, {'mag': 16, 'spr': 8}, None, sk('smn_titan')), W(5, 'air_knife', 'エアナイフ', 'dagger', 1.0, {'spd': 6}, 'wind', sk('gaia_quake')),
  S(5, 'genji_shield2', '源氏の小手', 0.5, {'str': 6}, ab('two_handed'), 'genji'), H(5, 'thornlet', 'いばらの冠', 0.6, {'str': 8, 'mag': 8}, ab('desperate')),
  B(5, 'bone_mail', 'ボーンメイル', 1.1, None, ab('res_dark')), A(5, 'reflect_ring', 'リフレクトリング', {'spr': 8}, ab('magic_barrier')),
  # ---- エリア6 瓦礫の世界
  W(6, 'kazekiri', '風切り', 'katana', 1.0, None, 'wind', sk('iainuki')), W(6, 'bone_club', 'ボーンクラブ', 'axe', 1.0, None, 'dark', ab('vamp5')),
  W(6, 'elfin_bow', 'エルフィンボウ', 'bow', 1.0, {'spd': 6}, None, ab('eva10')), W(6, 'morning_star', 'モーニングスター', 'whip', 1.0, None, None, ab('str10')),
  W(6, 'holy_rod', 'ホーリーロッド', 'rod', 1.0, {'mag': 18}, 'holy', sk('holy')), W(6, 'man_eater', 'マンイーター', 'dagger', 1.0, None, None, ab('crit10')),
  S(6, 'paladin_shield', 'パラディンシールド', 0.75, {'spr': 8}, ab('res_holy')), H(6, 'red_cap', '赤い帽子', 0.5, {'hp': 30}, ab('hp30')),
  B(6, 'minerva_bustier2', 'タビー', 0.9, {'spd': 8}, ab('spd10')), A(6, 'hero_ring2', '勇者の指輪', {'str': 8, 'mag': 8}, ab('abp_up')),
  # ---- エリア7 ミッドガル
  W(7, 'yoshiyuki', '吉行', 'katana', 1.0, None, None, sk('zantetsuken')), W(7, 'hardedge', 'ハードブレイカー', 'sword', 1.0, None, None, ab('two_handed')),
  W(7, 'crossbow7', 'ミスリルクロー', 'fist', 1.0, None, None, ab('counter')), W(7, 'guard_stick', 'ガードスティック', 'staff', 1.0, {'vit': 10, 'spr': 10}, None, ab('auto_protect')),
  W(7, 'motor_drive', 'モータードライブ', 'fist', 1.0, {'str': 6}, 'thunder', sk('aura_cannon')), W(7, 'yukihira', '雪平', 'katana', 1.0, None, 'ice', ab('res_ice')),
  S(7, 'shinra_alpha_shield', '神羅の盾', 0.7, None, ab('res_thunder')), H(7, 'wizard_hat', 'ウィザードハット', 0.5, {'mag': 12}, ab('doublecast')),
  B(7, 'shinra_alpha', '神羅甲型防護服', 1.0, {'vit': 6}, ab('auto_potion')), A(7, 'champion_belt', 'チャンピオンベルト', {'str': 10, 'vit': 6}, ab('limit_up')),
  # ---- エリア8 アルティミシア城
  W(8, 'lionheart', 'ライオンハート', 'sword', 1.05, {'str': 8}, None, ab('limit_up')), W(8, 'shear_trigger', 'シアートリガー', 'bow', 1.0, None, None, ab('first_strike')),
  W(8, 'save_the_queen', 'セイブザクイーン', 'whip', 1.0, {'mag': 10}, None, ab('auto_shell')), W(8, 'ehrgeiz', 'エルガイズ', 'fist', 1.0, None, None, sk('smn_odin')),
  W(8, 'valiant', 'ヴァリアント', 'bow', 1.0, {'luck': 10}, None, ab('rare_up')), W(8, 'punishment', 'パニッシュメント', 'sword', 1.0, None, 'dark', ab('desperate')),
  S(8, 'adamantine_shield', 'アダマンタインの盾', 0.8, None, ab('hp30')), H(8, 'orihalcon_helm', 'オリハルコンヘルム', 0.6, None, ab('res_paralyze')),
  B(8, 'maximillian', 'マクシミリアン', 1.1, None, ab('auto_protect')), A(8, 'power_wrist', 'パワーリスト', {'str': 12}, ab('str10')),
  # ---- エリア9 テラ
  W(9, 'masamune9', 'マサムネ', 'katana', 1.05, None, None, ab('counter')), W(9, 'defender9', 'ディフェンダー', 'sword', 1.0, {'vit': 10}, None, ab('cover')),
  W(9, 'dragon_hair', '竜のひげ・極', 'whip', 1.0, None, None, sk('jitterbug')), W(9, 'avenger', 'アベンジャー', 'fist', 1.0, None, None, ab('desperate')),
  W(9, 'mace_of_zeus', 'ゼウスのメイス', 'rod', 1.0, {'mag': 22}, None, sk('smn_bahamut')), W(9, 'angel_flute', '天使の笛', 'staff', 1.0, {'spr': 20, 'mp': 40}, None, sk('hero_song')),
  S(9, 'genji_shield9', '源氏の盾・改', 0.8, None, ab('multi10'), 'genji'), H(9, 'golden_hairpin', '金のかんざし', 0.5, {'mag': 10, 'spr': 10}, ab('half_mp')),
  B(9, 'brave_suit', 'ブレイブスーツ', 1.0, {'str': 8}, ab('auto_regen')), A(9, 'pumice_piece', '軽石のかけら', {'spr': 10}, ab('res_wind')),
  # ---- エリア10 ザナルカンド
  W(10, 'brotherhood', 'ブラザーフッド', 'sword', 1.0, {'str': 10}, 'water', ab('hp30')), W(10, 'nirvana', 'ニルヴァーナ', 'staff', 1.0, {'mag': 20, 'spr': 20}, None, sk('smn_leviathan')),
  W(10, 'godhand', 'ゴッドハンド', 'fist', 1.05, {'str': 10}, None, ab('multi10')), W(10, 'onion_knight10', 'オニオンナイト', 'rod', 1.0, {'mag': 26}, None, ab('doublecast')),
  W(10, 'world_champion', 'ワールドチャンピオン', 'axe', 1.05, None, None, ab('limit_up')), W(10, 'masamune10', '正宗・極', 'katana', 1.1, {'spd': 10}, None, ab('auto_haste')),
  S(10, 'crystal_shield10', 'ザナルカンドの盾', 0.8, None, ab('ribbon')), H(10, 'crown10', '王冠', 0.6, {'mag': 12, 'spr': 12}, ab('mp20')),
  B(10, 'zanarkand_robe', '召喚士のローブ', 0.9, {'mag': 16, 'spr': 16}, ab('half_mp')), A(10, 'moogle_badge', 'モーグリバッジ', {'luck': 14}, ab('drop_up')),
]
L += [
  W(1, 'pistol', 'ピストル', 'gun', 0.9, None, None, sk('vital_shot')), W(1, 'spell_book', '魔法の書', 'book', 1.0, {'mag': 6, 'spr': 4}, None, sk('chapter_water')),
  W(3, 'rifle', 'ライフル', 'gun', 1.0, None, None, ab('first_strike')), W(3, 'grimoire', 'グリモワール', 'book', 1.0, {'mag': 12, 'spr': 6}, None, sk('math_cure')),
  W(5, 'blaster_gun', 'ブラスター', 'gun', 1.0, None, 'thunder', sk('thunder_shot')), W(5, 'tome_of_wisdom', '叡智の書', 'book', 1.0, {'mag': 16, 'spr': 12}, None, ab('mp20')),
  W(7, 'death_penalty', 'デスペナルティ', 'gun', 1.05, {'luck': 8}, None, sk('death_arrow')), W(7, 'necronomicon', 'ネクロノミコン', 'book', 1.0, {'mag': 22}, 'dark', sk('chapter_dark')),
  W(9, 'outsider_gun', 'アウトサイダー', 'gun', 1.05, {'str': 8}, None, ab('crit10')), W(9, 'book_of_ages', '永劫の書', 'book', 1.0, {'mag': 26, 'spr': 16}, None, ab('doublecast')),
  W(10, 'omega_gun', 'オメガバスター', 'gun', 1.1, None, None, sk('ultima_shot')), W(10, 'akashic_record', 'アカシャの記録', 'book', 1.05, {'mag': 30, 'spr': 20}, None, sk('forbidden_chapter')),
]
# ---- 装備＋40：セット2種（盗賊・魔導師）＋新ジョブ向けの固定装備
L += [
  W(1, 'thief_knife', '盗賊のナイフ', 'dagger', 1.0, {'luck': 4}, None, sk('smoke_bomb'), 'thief'), B(1, 'thief_vest', '盗賊のベスト', 0.65, {'spd': 3}, ab('treasure'), 'thief'),
  H(1, 'thief_bandana', '盗賊のバンダナ', 0.45, {'luck': 3}, ab('steal_up'), 'thief'), H(1, 'mage_hat', '魔導師の帽子', 0.45, {'mag': 5}, ab('mp10'), 'mage'),
  B(2, 'mage_robe', '魔導師のローブ', 0.6, {'mag': 6, 'spr': 4}, ab('mag10'), 'mage'), W(2, 'mage_rod', '魔導師のロッド', 'rod', 1.0, {'mag': 10}, None, sk('quake'), 'mage'),
  A(2, 'mage_ring', '魔導師の指輪', {'mag': 5, 'mp': 20}, ab('half_mp'), 'mage'), A(2, 'thief_boots', '盗賊の靴', {'spd': 5}, ab('first_strike'), 'thief'),
  B(3, 'dancer_dress', '踊り子の衣装', 0.6, {'spd': 6, 'luck': 4}, sk('heal_dance')), A(3, 'geo_bell', '風水士のベル', {'mag': 6}, sk('stalactite')),
  H(3, 'kabuto', '兜', 0.6, {'str': 4}, sk('kotetsu_slash')), B(3, 'gunner_coat', 'ガンナーコート', 0.7, {'luck': 5}, sk('fire_shot')),
  B(4, 'assassin_cloak', '暗殺者の外套', 0.65, {'spd': 8}, sk('rock_seal')), B(4, 'holy_mail', '聖騎士の鎧', 1.0, {'spr': 6}, sk('holy_blade')),
  H(4, 'scholar_glasses', '学者のめがね', 0.4, {'mag': 8, 'spr': 6}, sk('chapter_wind')), H(4, 'bard_hat', '吟遊詩人の帽子', 0.45, {'spr': 6, 'mp': 20}, sk('swift_song')),
  H(5, 'dark_helm', '暗黒兜', 0.6, {'str': 6}, sk('darkness')), A(5, 'juggler_gloves', '道化の手袋', {'luck': 8, 'spd': 4}, sk('juggling')),
  W(5, 'rapier', 'レイピア', 'sword', 0.95, {'spd': 8}, None, sk('flurry_thrust')), A(5, 'sniper_scope', '狙撃鏡', {'luck': 6}, sk('snipe')),
  H(6, 'bishop_mitre', '司教冠', 0.5, {'spr': 10}, sk('holy_wind')), H(6, 'mog_helm', 'モグヘルム', 0.6, {'vit': 6, 'luck': 4}, sk('mog_guard')),
  W(6, 'element_rod', '精霊のロッド', 'rod', 1.0, {'mag': 16}, None, sk('spirit_ward')), A(6, 'gadget_belt', 'からくりベルト', {'luck': 8}, sk('heal_device')),
  W(7, 'nameless_katana', '無銘の大刀', 'katana', 1.05, None, None, sk('crescent_slash')), A(7, 'abacus', '算術のそろばん', {'mag': 10}, sk('math_fire')),
  H(7, 'illusion_hat', '幻術師の帽子', 0.5, {'mag': 12}, sk('star_fall')), B(7, 'dark_armor', '暗黒鎧', 1.05, {'str': 6}, sk('soul_eater')),
  H(8, 'paladin_helm', '聖騎士の兜', 0.65, {'spr': 8}, sk('saint_cross')), W(8, 'yaksha_dagger', '夜叉の短剣', 'dagger', 1.05, {'spd': 8}, 'dark', sk('yaksha')),
  H(8, 'gunner_goggles', 'ガンナーゴーグル', 0.5, {'luck': 8}, sk('double_shot')), A(8, 'bard_cape', '吟遊詩人のマント', {'spr': 10, 'mp': 40}, sk('angel_song')),
  W(9, 'sniper_bow', '狙撃弓', 'bow', 1.05, {'luck': 10}, None, sk('twin_shot')), B(9, 'bishop_robe', '司教のローブ', 0.75, {'spr': 14, 'mag': 8}, sk('judgment')),
  B(9, 'swordmaster_armor', '剣聖の胴', 1.0, {'str': 8, 'spd': 4}, sk('musou')), A(9, 'dancer_shoes', '踊り子の靴', {'spd': 12}, sk('death_dance')),
  B(10, 'omega_armor', 'オメガの鎧', 1.15, {'vit': 10}, ab('ribbon')), W(10, 'illusion_rod', '幻術師のロッド', 'rod', 1.05, {'mag': 28}, None, sk('prominence')),
  W(10, 'mog_sword', 'モグソード', 'sword', 1.05, {'luck': 10}, 'holy', sk('ultima_charge')), A(10, 'elemental_ring', '精霊の指輪', {'mag': 14, 'spr': 10}, sk('spirit_wrath')),
]
# ---- 1001階以降の専用装備（エリア11〜16、各8点）
L += [
  # 11 ヴァナ・ディール（FF11）
  W(11, 'kikoku', '鬼哭', 'katana', 1.05, {'spd': 10}, 'dark', ab('vamp5')), W(11, 'sphairai', 'スファライ', 'fist', 1.05, {'str': 12}, None, ab('multi10')),
  W(11, 'annihilator', 'アニヒレーター', 'gun', 1.05, {'luck': 10}, None, sk('double_shot')), W(11, 'bravura', 'ブラビューラ', 'axe', 1.05, {'str': 14}, None, ab('desperate')),
  S(11, 'koenig_shield', 'ケーニヒシールド', 0.85, {'vit': 10}, ab('auto_protect')), H(11, 'hecatomb_cap', 'ヘカトンキャップ', 0.6, {'str': 10}, ab('crit10')),
  B(11, 'adaman_hauberk', 'アダマンホーバーク', 1.1, {'vit': 12}, ab('hp30')), A(11, 'rajas_ring', 'ラージャスリング', {'str': 12, 'luck': 12}, ab('first_strike')),
  # 12 イヴァリース（FF12）
  W(12, 'tournesol', 'トゥルヌソル', 'sword', 1.1, {'str': 12}, None, ab('two_handed')), W(12, 'zodiac_spear', 'ゾディアックスピア', 'spear', 1.15, None, None, sk('holy_dive')),
  W(12, 'masamune12', 'マサムネ（FF12）', 'katana', 1.1, {'spd': 12}, None, ab('counter')), W(12, 'fomalhaut', 'フォーマルハウト', 'gun', 1.1, None, None, ab('crit10')),
  H(12, 'grand_helm', 'グランドヘルム', 0.65, {'vit': 10}, ab('res_paralyze')), S(12, 'ensanguined_shield', '血塗られた盾', 1.0, {'str': 10}, ab('desperate')),
  B(12, 'rubber_suit', 'ラバースーツ', 0.95, {'spd': 10}, ab('res_thunder')), A(12, 'germinas_boots', 'ジェルミナスブーツ', {'spd': 16}, ab('spd10')),
  # 13 コクーン（FF13）
  W(13, 'omega_weapon13', 'オメガウェポン', 'sword', 1.1, {'str': 14, 'mag': 14}, None, ab('limit_up')), W(13, 'kain_lance', 'カインの槍', 'spear', 1.1, {'spd': 10}, None, sk('wyvern_dive')),
  W(13, 'punisher13', 'パニッシャー', 'gun', 1.1, None, None, sk('ultima_shot')), W(13, 'total_eclipses', 'トータルエクリプス', 'axe', 1.1, {'hp': 100}, None, ab('hp30')),
  S(13, 'imperial_armguard', 'インペリアルアームガード', 0.85, {'spr': 10}, ab('magic_barrier')), H(13, 'tetradic_crown', 'テトラクラウン', 0.6, {'spr': 12}, ab('res_fire')),
  A(13, 'wurtzite_bangle', 'ウルツァイトバングル', {'hp': 300, 'vit': 10}, ab('hp30')), A(13, 'genji_glove13', '源氏の小手（FF13）', {'str': 14}, ab('multi10'), 'genji'),
  # 14 エオルゼア（FF14）
  W(14, 'curtana', 'クルタナ', 'sword', 1.1, {'vit': 12}, 'holy', ab('cover')), W(14, 'gae_bolg', 'ゲイボルグ', 'spear', 1.1, {'str': 14}, None, sk('dragon_heart')),
  W(14, 'yoshimitsu', 'ヨシミツ', 'katana', 1.1, {'spd': 14}, None, sk('issen')), W(14, 'stardust_rod', 'スターダストロッド', 'rod', 1.1, {'mag': 36}, None, sk('meteorite')),
  W(14, 'omnilex', 'オムニレクス', 'book', 1.1, {'mag': 32, 'spr': 22}, None, sk('forbidden_chapter')), S(14, 'holy_shield14', 'ホーリーシールド', 0.9, {'spr': 12}, ab('res_dark')),
  B(14, 'allagan_armor', 'アラグの鎧', 1.1, {'str': 10, 'vit': 10}, ab('auto_shell')), A(14, 'allagan_tomestone', 'アラグの石碑', {'mag': 10, 'spr': 10}, ab('exp_up')),
  # 15 ルシス（FF15）
  W(15, 'ultima_blade15', 'アルティマブレード', 'sword', 1.15, {'str': 16}, None, sk('climhazzard')), W(15, 'zwill_crossblades', 'ツヴィルクロスブレード', 'dagger', 1.15, {'spd': 16}, None, sk('phantom_steal')),
  W(15, 'flayer', 'フレイヤー', 'spear', 1.1, None, None, sk('spear_thrust')), W(15, 'cerberus_rifle', 'ケルベロス', 'gun', 1.15, {'luck': 12}, None, sk('death_arrow')),
  B(15, 'kingly_raiment', '王の衣', 1.0, {'str': 12, 'mag': 12, 'spd': 8}, ab('auto_haste')), B(15, 'magitek_suit', '魔導スーツ', 1.15, {'vit': 14}, ab('res_thunder')),
  A(15, 'oracle_coin', '神凪の昇天コイン', {'luck': 20}, ab('rare_up')), A(15, 'safety_bit', 'セーフティビット', {'spr': 12}, ab('ribbon')),
  # 16 ヴァリスゼア（FF16）
  W(16, 'gotterdammerung', 'ゴットデメルング', 'sword', 1.2, {'str': 20}, None, ab('limit_up')), W(16, 'invictus', 'インヴィクタス', 'sword', 1.1, {'str': 14, 'vit': 10}, 'fire', ab('desperate')),
  W(16, 'zantetsuken16', 'ザンテツケン', 'katana', 1.2, {'spd': 14}, 'dark', sk('zantetsuken')), W(16, 'titan_gauntlets', 'タイタンのガントレット', 'fist', 1.15, {'str': 18, 'vit': 10}, 'earth', sk('titan_smash')),
  B(16, 'dominant_cloak', 'ドミナントの外套', 1.05, {'str': 10, 'mag': 16}, ab('half_mp')), H(16, 'crown_of_ultima', 'アルティマの冠', 0.7, {'mag': 20, 'spr': 20}, ab('doublecast')),
  A(16, 'ouroboros_belt', 'ウロボロスベルト', {'hp': 400, 'vit': 12}, ab('auto_regen')), A(16, 'genji_earrings16', '源氏の耳飾り', {'spd': 12}, ab('eva10'), 'genji'),
]
assert len(L) == 200, len(L)
out = []
for (a, i, n, kind, wt, m, st, el, learn, s) in L:
    it = {'id': i, 'name': n, 'kind': kind, 'price': PRICE[a], 'area': a}
    if kind == 'weapon': it['wtype'] = wt; it['power'] = round(WP[a] * TM[wt] * m)
    elif kind == 'shield': it['def'] = round(BD[a] * m); it['mdef'] = round(BD[a] * m * 0.4)
    elif kind == 'head': it['def'] = round(BD[a] * m); it['mdef'] = round(BD[a] * m * 0.5)
    elif kind == 'body': it['def'] = round(BD[a] * m); it['mdef'] = round(BD[a] * m * 0.3)
    if st: it['stats'] = st
    if el: it['element'] = el
    if learn: it['learn'] = {learn[0]: learn[1], 'ap': 80 + a * 25}
    if s: it['set'] = s
    out.append(it)
open(os.path.join(ROOT, 'src', 'data', 'items2.ts'), 'w').write("// 自動生成：art/items2_data.py（装備＋100）\nimport type { BaseItem } from '../core/types';\nexport const ITEMS2: BaseItem[] = " + json.dumps(out, ensure_ascii=False, indent=0) + " as BaseItem[];\n")
print(len(out), 'items')
