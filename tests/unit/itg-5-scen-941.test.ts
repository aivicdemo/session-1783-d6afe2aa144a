import { classifyRejectReasonAndAggregate } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-941: [edge] 却下修正理由の自動カテゴリ分類と失敗パターン集計 - 理由文がマスタ内のいずれのカテゴリにも該当しない場合、『その他』カテゴリに分類される
  test('マスタ内に該当するカテゴリが存在しない場合、その他カテゴリに分類され集計に反映される', () => {
    // Arrange: マスタ内のカテゴリキーワード定義
    const categoryMaster = [
      { categoryId: 'NUTRITION', categoryName: '栄養バランス不適切', keywords: ['栄養', 'カロリー', 'タンパク質', 'バランス'] },
      { categoryId: 'PREFERENCE', categoryName: '家族好み未反映', keywords: ['好み', '嫌い', '家族が嫌う', '苦手'] },
      { categoryId: 'COOKING_TIME', categoryName: '調理時間超過', keywords: ['時間', '調理時間', '長い', '間に合わない'] },
      { categoryId: 'FOOD_RESTRICTION', categoryName: '食材制限漏れ', keywords: ['アレルギー', '制限', '除外', '含まれている'] },
      { categoryId: 'BUDGET', categoryName: '予算超過', keywords: ['予算', '高い', 'コスト', '金額'] },
      { categoryId: 'INVENTORY', categoryName: '食材在庫不足', keywords: ['在庫', '品切れ', 'ない', '買えない'] }
    ];

    // マスタ内のいずれにも該当しない理由文
    const unmatchedReason = 'システム固有の特殊要件により対応不可';

    // 既存の失敗パターン集計データ
    const existingAggregation = {
      NUTRITION: 5,
      PREFERENCE: 8,
      COOKING_TIME: 3,
      FOOD_RESTRICTION: 2,
      BUDGET: 6,
      INVENTORY: 4,
      OTHER: 0
    };

    // Act: 自動カテゴリ分類と集計処理を実行
    const result = classifyRejectReasonAndAggregate({
      reason: unmatchedReason,
      categoryMaster: categoryMaster,
      currentAggregation: existingAggregation,
      timestamp: new Date('2024-01-15T11:00:00Z')
    });

    // Assert: 理由文が『その他』カテゴリに分類されること
    expect(result.classifiedCategory).toBe('OTHER');
    expect(result.classifiedCategoryName).toBe('その他');

    // Assert: 失敗パターン集計で『その他』カテゴリの件数がインクリメントされていること
    expect(result.updatedAggregation.OTHER).toBe(1);

    // Assert: 他のカテゴリの集計値は変更されないこと
    expect(result.updatedAggregation.NUTRITION).toBe(5);
    expect(result.updatedAggregation.PREFERENCE).toBe(8);
    expect(result.updatedAggregation.COOKING_TIME).toBe(3);
    expect(result.updatedAggregation.FOOD_RESTRICTION).toBe(2);
    expect(result.updatedAggregation.BUDGET).toBe(6);
    expect(result.updatedAggregation.INVENTORY).toBe(4);

    // Assert: 分類結果に理由文とタイムスタンプが記録されていること
    expect(result.reason).toBe(unmatchedReason);
    expect(result.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));

    // Assert: 集計結果の総件数が正しく計算されていること（既存28件 + 新規1件 = 29件）
    const totalCount = Object.values(result.updatedAggregation).reduce((sum, count) => sum + count, 0);
    expect(totalCount).toBe(29);
  });
});