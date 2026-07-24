import { classifyAndAggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定', () => {
  // SCEN-623
  test('献立却下修正理由のカテゴリ自動分類機能 - 複数の理由テキストが対応するカテゴリに自動分類され、各カテゴリの件数が正確に集計されること', () => {
    // ===== 前提条件 =====
    // 献立却下修正履歴データベースに複数の却下理由テキストを含む献立却下レコードが存在
    const rejectionRecords = [
      {
        recordId: 'reject_001',
        rejectionReasonText: 'タンパク質が足りない、栄養バランスが悪い',
        rejectedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        recordId: 'reject_002',
        rejectionReasonText: '子どもが好きじゃない料理が多すぎる',
        rejectedAt: new Date('2024-01-15T11:30:00Z'),
      },
      {
        recordId: 'reject_003',
        rejectionReasonText: 'カロリーが多すぎる、栄養目標を超えている',
        rejectedAt: new Date('2024-01-15T14:00:00Z'),
      },
      {
        recordId: 'reject_004',
        rejectionReasonText: '調理時間が1時間を超えてしまう',
        rejectedAt: new Date('2024-01-15T15:45:00Z'),
      },
      {
        recordId: 'reject_005',
        rejectionReasonText: '冷蔵庫に材料がない、在庫不足',
        rejectedAt: new Date('2024-01-15T16:20:00Z'),
      },
      {
        recordId: 'reject_006',
        rejectionReasonText: '娘がアレルギーの食材が含まれている',
        rejectedAt: new Date('2024-01-15T17:00:00Z'),
      },
      {
        recordId: 'reject_007',
        rejectionReasonText: '予算を大幅に超える、食材が高い',
        rejectedAt: new Date('2024-01-16T09:15:00Z'),
      },
      {
        recordId: 'reject_008',
        rejectionReasonText: '栄養バランスが全く考慮されていない',
        rejectedAt: new Date('2024-01-16T10:30:00Z'),
      },
      {
        recordId: 'reject_009',
        rejectionReasonText: '調理手順が複雑すぎて、実現できない',
        rejectedAt: new Date('2024-01-16T11:45:00Z'),
      },
      {
        recordId: 'reject_010',
        rejectionReasonText: '妻のリクエストが全く反映されていない',
        rejectedAt: new Date('2024-01-16T13:00:00Z'),
      },
    ];

    // ===== 処理実行 =====
    // 自動分類機能を実行して、却下レコードから修正理由テキストを抽出し、
    // 定義済みのカテゴリマッピングルールを適用する
    const classificationResult = classifyAndAggregateRejectionReasons(rejectionRecords);

    // ===== 期待値検証 =====
    // 1. 各理由テキストが対応するカテゴリに正確に自動分類されたことを確認
    expect(classificationResult).toEqual({
      categorizedRecords: [
        {
          recordId: 'reject_001',
          rejectionReasonText: 'タンパク質が足りない、栄養バランスが悪い',
          category: '栄養',
          rejectedAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          recordId: 'reject_002',
          rejectionReasonText: '子どもが好きじゃない料理が多すぎる',
          category: '好み',
          rejectedAt: new Date('2024-01-15T11:30:00Z'),
        },
        {
          recordId: 'reject_003',
          rejectionReasonText: 'カロリーが多すぎる、栄養目標を超えている',
          category: '栄養',
          rejectedAt: new Date('2024-01-15T14:00:00Z'),
        },
        {
          recordId: 'reject_004',
          rejectionReasonText: '調理時間が1時間を超えてしまう',
          category: '調理時間',
          rejectedAt: new Date('2024-01-15T15:45:00Z'),
        },
        {
          recordId: 'reject_005',
          rejectionReasonText: '冷蔵庫に材料がない、在庫不足',
          category: '食材在庫',
          rejectedAt: new Date('2024-01-15T16:20:00Z'),
        },
        {
          recordId: 'reject_006',
          rejectionReasonText: '娘がアレルギーの食材が含まれている',
          category: '食材制限',
          rejectedAt: new Date('2024-01-15T17:00:00Z'),
        },
        {
          recordId: 'reject_007',
          rejectionReasonText: '予算を大幅に超える、食材が高い',
          category: '予算',
          rejectedAt: new Date('2024-01-16T09:15:00Z'),
        },
        {
          recordId: 'reject_008',
          rejectionReasonText: '栄養バランスが全く考慮されていない',
          category: '栄養',
          rejectedAt: new Date('2024-01-16T10:30:00Z'),
        },
        {
          recordId: 'reject_009',
          rejectionReasonText: '調理手順が複雑すぎて、実現できない',
          category: '調理時間',
          rejectedAt: new Date('2024-01-16T11:45:00Z'),
        },
        {
          recordId: 'reject_010',
          rejectionReasonText: '妻のリクエストが全く反映されていない',
          category: '好み',
          rejectedAt: new Date('2024-01-16T13:00:00Z'),
        },
      ],
      aggregationByCategory: {
        '栄養': 3,
        '好み': 2,
        '調理時間': 2,
        '食材在庫': 1,
        '食材制限': 1,
        '予算': 1,
      },
      classificationAccuracy: 100,
      totalClassifiedRecords: 10,
      classificationTimestamp: expect.any(Date),
    });

    // 2. 分類精度が期待値以上（100%）であることを確認
    expect(classificationResult.classificationAccuracy).toBe(100);

    // 3. 全レコードが正確に分類されたことを確認（10件全て）
    expect(classificationResult.totalClassifiedRecords).toBe(10);

    // 4. カテゴリ別集計が正確であることを確認
    expect(classificationResult.aggregationByCategory).toEqual({
      '栄養': 3,
      '好み': 2,
      '調理時間': 2,
      '食材在庫': 1,
      '食材制限': 1,
      '予算': 1,
    });

    // 5. 各カテゴリの件数合計が全体件数と一致することを確認
    const totalCategorizedCount = Object.values<any>(classificationResult.aggregationByCategory).reduce(
      (sum, count) => sum + count,
      0
    );
    expect(totalCategorizedCount).toBe(10);

    // 6. 複数の理由テキストが同一カテゴリに正しく集約されていることを確認
    const nutritionRecords = classificationResult.categorizedRecords.filter(
      (record) => record.category === '栄養'
    );
    expect(nutritionRecords.length).toBe(3);
    expect(nutritionRecords.map((r) => r.recordId)).toEqual(['reject_001', 'reject_003', 'reject_008']);

    const preferenceRecords = classificationResult.categorizedRecords.filter(
      (record) => record.category === '好み'
    );
    expect(preferenceRecords.length).toBe(2);
    expect(preferenceRecords.map((r) => r.recordId)).toEqual(['reject_002', 'reject_010']);

    const cookingTimeRecords = classificationResult.categorizedRecords.filter(
      (record) => record.category === '調理時間'
    );
    expect(cookingTimeRecords.length).toBe(2);
    expect(cookingTimeRecords.map((r) => r.recordId)).toEqual(['reject_004', 'reject_009']);

    // 7. タイムスタンプが記録されていることを確認
    expect(classificationResult.classificationTimestamp).toBeInstanceOf(Date);
  });
});