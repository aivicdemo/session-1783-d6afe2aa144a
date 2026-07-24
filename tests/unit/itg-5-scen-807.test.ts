import { classifyRejectReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-807
  test('献立却下修正理由を定義済みカテゴリに自動分類し、失敗パターン集計用の分類タグを付与する', () => {
    // 複数の献立却下・修正理由サンプルデータを入力
    const input = [
      {
        reason_text: 'タンパク質が不足している',
        reason_id: 'reason_001',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        reason_text: '食材の入荷遅延により調達不可',
        reason_id: 'reason_002',
        timestamp: '2024-01-15T10:35:00Z',
      },
      {
        reason_text: '調理時間が60分を超過している',
        reason_id: 'reason_003',
        timestamp: '2024-01-15T10:40:00Z',
      },
      {
        reason_text: '予算超過により実施不可',
        reason_id: 'reason_004',
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        reason_text: 'その他の理由により却下',
        reason_id: 'reason_005',
        timestamp: '2024-01-15T10:50:00Z',
      },
      {
        reason_text: 'ビタミンCが基準値未満',
        reason_id: 'reason_006',
        timestamp: '2024-01-15T10:55:00Z',
      },
      {
        reason_text: '食材仕入元から納品できないとの連絡',
        reason_id: 'reason_007',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        reason_text: '',
        reason_id: 'reason_008',
        timestamp: '2024-01-15T11:05:00Z',
      },
      {
        reason_text: '!!!特殊文字###',
        reason_id: 'reason_009',
        timestamp: '2024-01-15T11:10:00Z',
      },
    ];

    // 自動分類処理を実行
    const result = classifyRejectReasons(input);

    // 栄養バランスカテゴリの検証
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual({
      reason_id: 'reason_001',
      reason_text: 'タンパク質が不足している',
      category: 'nutritional_balance',
      classification_tag: 'NB_001',
      confidence_score: 0.95,
      timestamp: '2024-01-15T10:30:00Z',
    });

    // 食材仕入カテゴリの検証
    expect(result[1]).toEqual({
      reason_id: 'reason_002',
      reason_text: '食材の入荷遅延により調達不可',
      category: 'ingredient_procurement',
      classification_tag: 'IP_001',
      confidence_score: 0.92,
      timestamp: '2024-01-15T10:35:00Z',
    });

    // 調理工程カテゴリの検証
    expect(result[2]).toEqual({
      reason_id: 'reason_003',
      reason_text: '調理時間が60分を超過している',
      category: 'cooking_process',
      classification_tag: 'CP_001',
      confidence_score: 0.88,
      timestamp: '2024-01-15T10:40:00Z',
    });

    // コストカテゴリの検証
    expect(result[3]).toEqual({
      reason_id: 'reason_004',
      reason_text: '予算超過により実施不可',
      category: 'cost',
      classification_tag: 'COST_001',
      confidence_score: 0.91,
      timestamp: '2024-01-15T10:45:00Z',
    });

    // その他カテゴリの検証
    expect(result[4]).toEqual({
      reason_id: 'reason_005',
      reason_text: 'その他の理由により却下',
      category: 'other',
      classification_tag: 'OTHER_001',
      confidence_score: 0.75,
      timestamp: '2024-01-15T10:50:00Z',
    });

    // 複数の栄養バランス理由が同じカテゴリに分類される場合、タグが統一されていることを確認
    expect(result[5]).toEqual({
      reason_id: 'reason_006',
      reason_text: 'ビタミンCが基準値未満',
      category: 'nutritional_balance',
      classification_tag: 'NB_001',
      confidence_score: 0.93,
      timestamp: '2024-01-15T10:55:00Z',
    });

    // 同じカテゴリ内で複数の理由が存在する場合のタグ統一確認
    expect(result[6]).toEqual({
      reason_id: 'reason_007',
      reason_text: '食材仕入元から納品できないとの連絡',
      category: 'ingredient_procurement',
      classification_tag: 'IP_001',
      confidence_score: 0.89,
      timestamp: '2024-01-15T11:00:00Z',
    });

    // 空文字列のエッジケース処理
    expect(result[7]).toEqual({
      reason_id: 'reason_008',
      reason_text: '',
      category: 'other',
      classification_tag: 'OTHER_001',
      confidence_score: 0.0,
      timestamp: '2024-01-15T11:05:00Z',
    });

    // 特殊文字のエッジケース処理
    expect(result[8]).toEqual({
      reason_id: 'reason_009',
      reason_text: '!!!特殊文字###',
      category: 'other',
      classification_tag: 'OTHER_001',
      confidence_score: 0.5,
      timestamp: '2024-01-15T11:10:00Z',
    });

    // 失敗パターン集計用のタグ毎集計検証
    const aggregation = result.reduce(
      (acc, item) => {
        const tag = item.classification_tag;
        if (!acc[tag]) {
          acc[tag] = {
            tag: tag,
            category: item.category,
            count: 0,
            avg_confidence: 0,
            reasons: [],
          };
        }
        acc[tag].count += 1;
        acc[tag].avg_confidence += item.confidence_score;
        acc[tag].reasons.push(item.reason_text);
        return acc;
      },
      {} as Record<
        string,
        {
          tag: string;
          category: string;
          count: number;
          avg_confidence: number;
          reasons: string[];
        }
      >
    );

    // 各タグの集計が正確であることを確認
    expect(aggregation['NB_001'].count).toBe(2);
    expect(aggregation['NB_001'].avg_confidence).toBeCloseTo(0.94, 1);
    expect(aggregation['NB_001'].category).toBe('nutritional_balance');

    expect(aggregation['IP_001'].count).toBe(2);
    expect(aggregation['IP_001'].avg_confidence).toBeCloseTo(0.905, 1);
    expect(aggregation['IP_001'].category).toBe('ingredient_procurement');

    expect(aggregation['CP_001'].count).toBe(1);
    expect(aggregation['CP_001'].avg_confidence).toBe(0.88);
    expect(aggregation['CP_001'].category).toBe('cooking_process');

    expect(aggregation['COST_001'].count).toBe(1);
    expect(aggregation['COST_001'].avg_confidence).toBe(0.91);
    expect(aggregation['COST_001'].category).toBe('cost');

    expect(aggregation['OTHER_001'].count).toBe(3);
    expect(aggregation['OTHER_001'].avg_confidence).toBeCloseTo(0.417, 1);
    expect(aggregation['OTHER_001'].category).toBe('other');

    // 総集計数が入力数と一致することを確認
    const total_classified = Object.values<any>(aggregation).reduce(
      (sum, item) => sum + item.count,
      0
    );
    expect(total_classified).toBe(9);
  });
});