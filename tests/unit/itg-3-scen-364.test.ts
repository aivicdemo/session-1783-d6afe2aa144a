import { classifyRejectReasonText } from '../../src/logic/it-1-br-3-2-1';

describe('献立却下・修正理由のテキスト自動分類機能', () => {
  // SCEN-364
  test('複数カテゴリに該当するテキストが信頼度スコアに基づいて最適カテゴリに分類される', () => {
    // 複数カテゴリに該当するテキスト（価格と調理時間の両要因を含む）
    const input_text =
      '価格が高く、調理時間が長い献立だったので却下しました';
    const input_user_id = 'user_20240115_001';
    const input_meal_plan_id = 'meal_plan_202401_week1';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 複数カテゴリに該当する場合、信頼度スコアが最も高いカテゴリが選択される
    // 想定: 「価格が高く」という表現から「コスト要因」カテゴリの信頼度が 0.85
    // 「調理時間が長い」という表現から「調理時間要因」カテゴリの信頼度が 0.75
    // 最高信頼度は「コスト要因」なので、そちらが選択される
    expect(result.selected_category).toBe('コスト要因');
    expect(result.confidence_score).toBe(0.85);

    // 分類結果に複数カテゴリの信頼度スコアが含まれることを確認
    expect(result.category_scores).toEqual({
      コスト要因: 0.85,
      調理時間要因: 0.75,
      栄養バランス要因: 0.1,
      アレルギー対応要因: 0.05,
    });

    // 分類メタデータの検証
    expect(result.user_id).toBe('user_20240115_001');
    expect(result.meal_plan_id).toBe('meal_plan_202401_week1');
    expect(result.input_text).toBe(input_text);
    expect(typeof result.classified_at).toBe('string');
  });

  test('信頼度スコアが同等の複数カテゴリが存在する場合、優先度ルールに基づいて最適カテゴリが決定される', () => {
    // 信頼度スコアが同等のテキスト
    const input_text = '調理が複雑で時間がかかり、コストも高かった';
    const input_user_id = 'user_20240115_002';
    const input_meal_plan_id = 'meal_plan_202401_week2';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 「調理時間要因」と「コスト要因」の信頼度スコアが同等（0.78）の場合
    // 優先度ルールにより「調理時間要因」が選択される（優先度順：調理時間 > コスト > 栄養 > アレルギー）
    expect(result.selected_category).toBe('調理時間要因');
    expect(result.confidence_score).toBe(0.78);

    // 同等スコアを持つカテゴリが複数存在することを確認
    expect(result.tied_categories).toEqual(['調理時間要因', 'コスト要因']);
    expect(result.priority_rule_applied).toBe(true);

    // 分類メタデータの検証
    expect(result.user_id).toBe('user_20240115_002');
    expect(result.meal_plan_id).toBe('meal_plan_202401_week2');
  });

  test('単一の高信頼度カテゴリに分類されるテキストは優先度ルール適用なしで処理される', () => {
    // 明確に一つのカテゴリに該当するテキスト
    const input_text =
      'アレルギーが含まれていたので却下しました。子どもが食べられません';
    const input_user_id = 'user_20240115_003';
    const input_meal_plan_id = 'meal_plan_202401_week3';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 明確にアレルギー対応要因に分類される
    expect(result.selected_category).toBe('アレルギー対応要因');
    expect(result.confidence_score).toBe(0.92);
    expect(result.priority_rule_applied).toBe(false);

    // 他のカテゴリの信頼度スコアが大幅に低い
    expect(result.category_scores).toEqual({
      アレルギー対応要因: 0.92,
      栄養バランス要因: 0.15,
      コスト要因: 0.08,
      調理時間要因: 0.05,
    });

    // 同等スコアを持つカテゴリが存在しないため、tied_categories は空配列
    expect(result.tied_categories).toEqual([]);
  });

  test('栄養バランス要因と他のカテゴリが同等スコアの場合、栄養バランス要因が優先度最上位として選択される', () => {
    // 栄養バランスと調理時間の両要因を含むテキスト
    const input_text =
      '栄養が偏っており、調理も手間がかかるので却下しました';
    const input_user_id = 'user_20240115_004';
    const input_meal_plan_id = 'meal_plan_202401_week4';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 栄養バランス要因と調理時間要因が同等スコア（0.82）の場合
    // 優先度ルール（優先度順：栄養 > 調理時間 > コスト > アレルギー）により「栄養バランス要因」が選択される
    expect(result.selected_category).toBe('栄養バランス要因');
    expect(result.confidence_score).toBe(0.82);
    expect(result.priority_rule_applied).toBe(true);
    expect(result.tied_categories).toEqual([
      '栄養バランス要因',
      '調理時間要因',
    ]);

    // 分類メタデータの検証
    expect(result.user_id).toBe('user_20240115_004');
  });

  test('低信頼度の複数カテゴリに該当するテキストでも、最高信頼度に基づいて分類される', () => {
    // どのカテゴリにも強く該当しないあいまいなテキスト
    const input_text = '献立が気に入りませんでした';
    const input_user_id = 'user_20240115_005';
    const input_meal_plan_id = 'meal_plan_202401_week5';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 全カテゴリの信頼度が低いが、最高スコアを持つカテゴリが選択される
    expect(result.selected_category).toBe('栄養バランス要因');
    expect(result.confidence_score).toBe(0.38);

    // 信頼度スコアの検証（全て低値）
    expect(result.category_scores.コスト要因).toBe(0.32);
    expect(result.category_scores.調理時間要因).toBe(0.35);
    expect(result.category_scores.栄養バランス要因).toBe(0.38);
    expect(result.category_scores.アレルギー対応要因).toBe(0.28);

    // 優先度ルール適用なし（最高スコアが明確に存在）
    expect(result.priority_rule_applied).toBe(false);
  });

  test('信頼度スコアが完全に同等の3カテゴリ以上の場合、最上位優先度のカテゴリが選択される', () => {
    // 複数カテゴリが同等スコアのテキスト
    const input_text = '調理が難しく、コストが高く、栄養も不十分でした';
    const input_user_id = 'user_20240115_006';
    const input_meal_plan_id = 'meal_plan_202401_week6';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 3つのカテゴリが同等スコア（0.79）で該当
    // 優先度ルール（優先度順：栄養 > 調理時間 > コスト > アレルギー）により「栄養バランス要因」が最上位
    expect(result.selected_category).toBe('栄養バランス要因');
    expect(result.confidence_score).toBe(0.79);
    expect(result.priority_rule_applied).toBe(true);
    expect(result.tied_categories).toEqual([
      '栄養バランス要因',
      '調理時間要因',
      'コスト要因',
    ]);

    // 分類メタデータの検証
    expect(result.user_id).toBe('user_20240115_006');
    expect(result.meal_plan_id).toBe('meal_plan_202401_week6');
    expect(result.input_text).toBe(input_text);
  });

  test('分類結果のスコアは0.0～1.0の範囲内であることが保証される', () => {
    const input_text = '様々な理由で却下しました';
    const input_user_id = 'user_20240115_007';
    const input_meal_plan_id = 'meal_plan_202401_week7';

    const result = classifyRejectReasonText({
      text: input_text,
      user_id: input_user_id,
      meal_plan_id: input_meal_plan_id,
    });

    // 全スコアが0.0～1.0範囲内であることを検証
    expect(result.confidence_score).toBeGreaterThanOrEqual(0.0);
    expect(result.confidence_score).toBeLessThanOrEqual(1.0);

    Object.values(result.category_scores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0.0);
      expect(score).toBeLessThanOrEqual(1.0);
    });
  });

  test('入力テキストが空または不正な場合、適切なエラーが発生する', () => {
    expect(() =>
      classifyRejectReasonText({
        text: '',
        user_id: 'user_20240115_008',
        meal_plan_id: 'meal_plan_202401_week8',
      })
    ).toThrow(/テキスト/);

    expect(() =>
      classifyRejectReasonText({
        text: '理由',
        user_id: '',
        meal_plan_id: 'meal_plan_202401_week8',
      })
    ).toThrow(/ユーザーID/);

    expect(() =>
      classifyRejectReasonText({
        text: '理由',
        user_id: 'user_20240115_008',
        meal_plan_id: '',
      })
    ).toThrow(/献立ID/);
  });
});