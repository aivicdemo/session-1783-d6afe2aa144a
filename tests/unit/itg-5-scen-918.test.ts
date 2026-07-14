import { classifyRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-918
  test('却下修正理由の自動カテゴリ分類機能 - 重複する理由テキストが検出され重複フラグが付与される', () => {
    const inputReasons = [
      {
        id: 'reason_001',
        text: '栄養バランスが子どもの基準に合っていない',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 'reason_002',
        text: '栄養バランスが子どもの基準に合っていない',
        timestamp: '2024-01-15T10:35:00Z',
      },
      {
        id: 'reason_003',
        text: '調理時間が45分を超過している',
        timestamp: '2024-01-15T10:40:00Z',
      },
      {
        id: 'reason_004',
        text: '調理時間が45分を超過している',
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        id: 'reason_005',
        text: '調理時間が45分を超過している',
        timestamp: '2024-01-15T10:50:00Z',
      },
      {
        id: 'reason_006',
        text: '冷蔵庫に鶏肉がない',
        timestamp: '2024-01-15T10:55:00Z',
      },
    ];

    const result = classifyRejectionReasons(inputReasons);

    // 全理由がカテゴリ分類される
    expect(result.classified_reasons).toHaveLength(6);

    // 栄養バランス関連の重複検出
    const nutritionReasons = result.classified_reasons.filter(
      (r) => r.category === '栄養バランス'
    );
    expect(nutritionReasons).toHaveLength(2);
    expect(nutritionReasons[0].has_duplicate).toBe(true);
    expect(nutritionReasons[1].has_duplicate).toBe(true);
    expect(nutritionReasons[0].duplicate_group_id).toBe(
      nutritionReasons[1].duplicate_group_id
    );
    expect(nutritionReasons[0].duplicate_count).toBe(2);
    expect(nutritionReasons[1].duplicate_count).toBe(2);

    // 調理時間関連の重複検出（3件が同一）
    const cookingTimeReasons = result.classified_reasons.filter(
      (r) => r.category === '調理時間'
    );
    expect(cookingTimeReasons).toHaveLength(3);
    expect(cookingTimeReasons[0].has_duplicate).toBe(true);
    expect(cookingTimeReasons[1].has_duplicate).toBe(true);
    expect(cookingTimeReasons[2].has_duplicate).toBe(true);
    expect(cookingTimeReasons[0].duplicate_group_id).toBe(
      cookingTimeReasons[1].duplicate_group_id
    );
    expect(cookingTimeReasons[1].duplicate_group_id).toBe(
      cookingTimeReasons[2].duplicate_group_id
    );
    expect(cookingTimeReasons[0].duplicate_count).toBe(3);

    // 食材在庫関連は重複なし
    const inventoryReasons = result.classified_reasons.filter(
      (r) => r.category === '食材在庫'
    );
    expect(inventoryReasons).toHaveLength(1);
    expect(inventoryReasons[0].has_duplicate).toBe(false);
    expect(inventoryReasons[0].duplicate_group_id).toBeNull();
    expect(inventoryReasons[0].duplicate_count).toBe(1);

    // 集計結果の検証
    expect(result.duplication_summary.total_reasons).toBe(6);
    expect(result.duplication_summary.duplicated_reasons_count).toBe(5);
    expect(result.duplication_summary.unique_reasons_count).toBe(1);
    expect(result.duplication_summary.duplicate_groups_count).toBe(2);

    // カテゴリ別の重複統計
    const categoryStats = result.duplication_summary.by_category;
    expect(categoryStats['栄養バランス'].total).toBe(2);
    expect(categoryStats['栄養バランス'].duplicated_count).toBe(2);
    expect(categoryStats['調理時間'].total).toBe(3);
    expect(categoryStats['調理時間'].duplicated_count).toBe(3);
    expect(categoryStats['食材在庫'].total).toBe(1);
    expect(categoryStats['食材在庫'].duplicated_count).toBe(0);
  });
});