import { detectMenuViolations } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-536: 新規入力された食事制限に抵触する過去献立を全て検出し一覧表示する
  test('新規食事制限条件に抵触する過去献立を全て検出する', () => {
    const past_menus = [
      {
        menu_id: 1,
        menu_name: '鶏肉と卵の親子丼',
        ingredients: ['鶏肉', '卵', '玉ねぎ', '米'],
        allergens: ['egg', 'chicken'],
        nutrition: {
          protein_g: 25,
          fat_g: 15,
          carb_g: 45,
          sodium_mg: 600
        }
      },
      {
        menu_id: 2,
        menu_name: 'えびのマヨネーズ和え',
        ingredients: ['えび', 'マヨネーズ', 'ブロッコリー'],
        allergens: ['shrimp', 'egg'],
        nutrition: {
          protein_g: 20,
          fat_g: 25,
          carb_g: 10,
          sodium_mg: 800
        }
      },
      {
        menu_id: 3,
        menu_name: 'サラダ',
        ingredients: ['レタス', 'トマト', 'キュウリ', 'ニンジン'],
        allergens: [],
        nutrition: {
          protein_g: 5,
          fat_g: 2,
          carb_g: 15,
          sodium_mg: 300
        }
      },
      {
        menu_id: 4,
        menu_name: 'そば',
        ingredients: ['そば粉', 'ねぎ', 'だし'],
        allergens: ['buckwheat', 'soy'],
        nutrition: {
          protein_g: 12,
          fat_g: 3,
          carb_g: 40,
          sodium_mg: 1200
        }
      },
      {
        menu_id: 5,
        menu_name: 'ピーナッツバター三角形',
        ingredients: ['ピーナッツバター', 'パン'],
        allergens: ['peanut', 'gluten'],
        nutrition: {
          protein_g: 10,
          fat_g: 16,
          carb_g: 30,
          sodium_mg: 500
        }
      }
    ];

    const new_restriction = {
      allergen_list: ['egg', 'shrimp'],
      sodium_max_mg: 700,
      forbidden_ingredients: ['えび']
    };

    const result = detectMenuViolations(past_menus, new_restriction);

    // 期待結果: menu_id 1, 2, 4 が抵触として検出される
    // menu_id 1: egg アレルギー抵触、sodium 600mg (ok)
    // menu_id 2: egg, shrimp アレルギー抵触、sodium 800mg (超過)、えび食材抵触
    // menu_id 3: 抵触なし
    // menu_id 4: sodium 1200mg (超過)
    // menu_id 5: 抵触なし

    expect(result.violation_count).toBe(3);
    expect(result.violations.length).toBe(3);

    // menu_id 1 の検出確認
    const violation_1 = result.violations.find((v) => v.menu_id === 1);
    expect(violation_1).toBeDefined();
    expect(violation_1?.menu_name).toBe('鶏肉と卵の親子丼');
    expect(violation_1?.violation_reasons).toContain('egg');
    expect(violation_1?.violation_details).toContain('アレルゲン');

    // menu_id 2 の検出確認
    const violation_2 = result.violations.find((v) => v.menu_id === 2);
    expect(violation_2).toBeDefined();
    expect(violation_2?.menu_name).toBe('えびのマヨネーズ和え');
    expect(violation_2?.violation_reasons).toContain('shrimp');
    expect(violation_2?.violation_reasons).toContain('sodium_exceeded');
    expect(violation_2?.violation_reasons).toContain('forbidden_ingredient');
    expect(violation_2?.violation_details).toContain('えび');

    // menu_id 4 の検出確認
    const violation_4 = result.violations.find((v) => v.menu_id === 4);
    expect(violation_4).toBeDefined();
    expect(violation_4?.menu_name).toBe('そば');
    expect(violation_4?.violation_reasons).toContain('sodium_exceeded');

    // menu_id 3, 5 は抵触なし
    const no_violation_3 = result.violations.find((v) => v.menu_id === 3);
    const no_violation_5 = result.violations.find((v) => v.menu_id === 5);
    expect(no_violation_3).toBeUndefined();
    expect(no_violation_5).toBeUndefined();

    // 各抵触レコードが詳細情報を保持していることを確認
    result.violations.forEach((violation) => {
      expect(violation.menu_id).toBeDefined();
      expect(violation.menu_name).toBeDefined();
      expect(violation.violation_reasons).toBeDefined();
      expect(Array.isArray(violation.violation_reasons)).toBe(true);
      expect(violation.violation_details).toBeDefined();
      expect(violation.violation_details.length).toBeGreaterThan(0);
    });

    // 戻り値に検出実行タイムスタンプが含まれることを確認
    expect(result.detection_timestamp).toBeDefined();
    expect(typeof result.detection_timestamp).toBe('string');

    // サマリー情報の検証
    expect(result.total_past_menus).toBe(5);
    expect(result.violation_count).toBe(3);
    expect(result.no_violation_count).toBe(2);
  });
});