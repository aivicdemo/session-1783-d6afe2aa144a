import { prioritizeImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案優先度付け機能', () => {
  // SCEN-394: [error] 改善提案優先度付け機能 - 改善提案データが不正な場合にエラーが返却される
  test('不正な改善提案データに対して適切なエラーメッセージが返却される', () => {
    // ハッピーパス: 正規のデータが処理できることを確認
    const validProposals = [
      {
        proposal_id: 'PROP-001',
        title: 'タンパク質摂取量の基準値調整',
        description: '高齢者向けのタンパク質推奨量を25g/日から30g/日に引き上げる',
        business_value_score: 8,
        technical_difficulty_score: 5,
        user_impact_score: 7,
        affected_nutrient_items: ['タンパク質'],
        affected_user_segments: ['高齢者'],
        affected_restriction_types: ['低タンパク食'],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    const result = prioritizeImprovementProposals(validProposals);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].proposal_id).toBe('PROP-001');
    expect(typeof result[0].priority_score).toBe('number');
    expect(typeof result[0].priority_rank).toBe('string');

    // エラーケース1: 必須フィールドが空の場合
    const missingRequiredField = [
      {
        proposal_id: '',
        title: 'タンパク質摂取量の基準値調整',
        description: '高齢者向けのタンパク質推奨量を25g/日から30g/日に引き上げる',
        business_value_score: 8,
        technical_difficulty_score: 5,
        user_impact_score: 7,
        affected_nutrient_items: ['タンパク質'],
        affected_user_segments: ['高齢者'],
        affected_restriction_types: ['低タンパク食'],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(missingRequiredField)).toThrow(/proposal_id/);

    // エラーケース2: 数値フィールドが範囲外の場合
    const outOfRangeScore = [
      {
        proposal_id: 'PROP-002',
        title: 'カルシウム摂取量の基準値調整',
        description: 'カルシウム推奨量を800mg/日から1000mg/日に引き上げる',
        business_value_score: 15,
        technical_difficulty_score: 5,
        user_impact_score: 7,
        affected_nutrient_items: ['カルシウム'],
        affected_user_segments: ['女性'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(outOfRangeScore)).toThrow(/business_value_score/);

    // エラーケース3: 日時フィールドが不正な場合
    const invalidTimestamp = [
      {
        proposal_id: 'PROP-003',
        title: '塩分摂取量の基準値調整',
        description: '塩分推奨量を6g/日から5g/日に引き下げる',
        business_value_score: 8,
        technical_difficulty_score: 5,
        user_impact_score: 7,
        affected_nutrient_items: ['ナトリウム'],
        affected_user_segments: ['全年代'],
        affected_restriction_types: ['低塩食'],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: 'invalid-date-string',
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(invalidTimestamp)).toThrow(/submission_timestamp/);

    // エラーケース4: 配列フィールドが空の場合
    const emptyArrayField = [
      {
        proposal_id: 'PROP-004',
        title: 'ビタミンD摂取量の基準値調整',
        description: 'ビタミンD推奨量を10μgから15μgに引き上げる',
        business_value_score: 7,
        technical_difficulty_score: 4,
        user_impact_score: 6,
        affected_nutrient_items: [],
        affected_user_segments: ['高齢者'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(emptyArrayField)).toThrow(/affected_nutrient_items/);

    // エラーケース5: 不正なステータス値の場合
    const invalidStatus = [
      {
        proposal_id: 'PROP-005',
        title: '鉄分摂取量の基準値調整',
        description: '女性の鉄分推奨量を7mg/日から8mg/日に引き上げる',
        business_value_score: 6,
        technical_difficulty_score: 3,
        user_impact_score: 8,
        affected_nutrient_items: ['鉄'],
        affected_user_segments: ['女性'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'invalid_status_value'
      }
    ];

    expect(() => prioritizeImprovementProposals(invalidStatus)).toThrow(/status/);

    // エラーケース6: データ型が不正な場合（文字列が期待される場所に数値）
    const invalidDataType = [
      {
        proposal_id: 12345,
        title: 'ビタミンB12摂取量の基準値調整',
        description: 'ビタミンB12推奨量を2μgから2.4μgに引き上げる',
        business_value_score: 5,
        technical_difficulty_score: 4,
        user_impact_score: 6,
        affected_nutrient_items: ['ビタミンB12'],
        affected_user_segments: ['全年代'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(invalidDataType)).toThrow(/proposal_id/);

    // エラーケース7: nutritionist_id が不正な形式の場合
    const invalidNutritionistId = [
      {
        proposal_id: 'PROP-006',
        title: '亜鉛摂取量の基準値調整',
        description: '男性の亜鉛推奨量を9mg/日から10mg/日に引き上げる',
        business_value_score: 5,
        technical_difficulty_score: 3,
        user_impact_score: 5,
        affected_nutrient_items: ['亜鉛'],
        affected_user_segments: ['男性'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: '',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(invalidNutritionistId)).toThrow(/submitted_by_nutritionist_id/);

    // エラーケース8: technical_difficulty_score が負の数の場合
    const negativeScore = [
      {
        proposal_id: 'PROP-007',
        title: 'マグネシウム摂取量の基準値調整',
        description: '女性のマグネシウム推奨量を270mg/日から300mg/日に引き上げる',
        business_value_score: 6,
        technical_difficulty_score: -1,
        user_impact_score: 7,
        affected_nutrient_items: ['マグネシウム'],
        affected_user_segments: ['女性'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(negativeScore)).toThrow(/technical_difficulty_score/);

    // エラーケース9: user_impact_score が0～10範囲を超える場合
    const excessiveScore = [
      {
        proposal_id: 'PROP-008',
        title: 'リン摂取量の基準値調整',
        description: 'リン推奨量を700mg/日から800mg/日に引き上げる',
        business_value_score: 5,
        technical_difficulty_score: 4,
        user_impact_score: 11,
        affected_nutrient_items: ['リン'],
        affected_user_segments: ['全年代'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(excessiveScore)).toThrow(/user_impact_score/);

    // エラーケース10: 複数提案が混在し1つが不正な場合
    const mixedValidInvalid = [
      {
        proposal_id: 'PROP-009',
        title: '葉酸摂取量の基準値調整',
        description: '女性の葉酸推奨量を200μgから240μgに引き上げる',
        business_value_score: 7,
        technical_difficulty_score: 3,
        user_impact_score: 8,
        affected_nutrient_items: ['葉酸'],
        affected_user_segments: ['女性'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      },
      {
        proposal_id: 'PROP-010',
        title: '食物繊維摂取量の基準値調整',
        description: '食物繊維推奨量が不適切',
        business_value_score: 8,
        technical_difficulty_score: 5,
        user_impact_score: 9,
        affected_nutrient_items: null,
        affected_user_segments: ['全年代'],
        affected_restriction_types: [],
        submitted_by_nutritionist_id: 'NUT-001',
        submission_timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'prioritization_pending'
      }
    ];

    expect(() => prioritizeImprovementProposals(mixedValidInvalid)).toThrow(/affected_nutrient_items/);
  });
});