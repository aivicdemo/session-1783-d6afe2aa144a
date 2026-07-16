import { generatePainPriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('ペイン要因の優先度マトリクス生成機能', () => {
  // SCEN-321
  test('食材制限・調理時間・予算制約の発生頻度と影響度から正しく4象限に分類される', () => {
    // テスト環境初期化: ペイン要因データセット準備
    const painFactors = [
      {
        factorId: 'pf-001',
        factorName: '食材制限',
        occurrenceFrequency: 'high',
        impactLevel: 'high',
        occurrenceScore: 85,
        impactScore: 90,
      },
      {
        factorId: 'pf-002',
        factorName: '調理時間',
        occurrenceFrequency: 'high',
        impactLevel: 'low',
        occurrenceScore: 78,
        impactScore: 35,
      },
      {
        factorId: 'pf-003',
        factorName: '予算制約',
        occurrenceFrequency: 'low',
        impactLevel: 'high',
        occurrenceScore: 42,
        impactScore: 88,
      },
      {
        factorId: 'pf-004',
        factorName: 'その他要因',
        occurrenceFrequency: 'low',
        impactLevel: 'low',
        occurrenceScore: 28,
        impactScore: 22,
      },
    ];

    // マトリクス生成処理を実行
    const result = generatePainPriorityMatrix({
      painFactors,
      occurrenceThreshold: 50,
      impactThreshold: 50,
    });

    // 第1象限（発生頻度高×影響度高）に食材制限が分類されていることを確認
    expect(result.quadrant1).toHaveLength(1);
    expect(result.quadrant1[0].factorName).toBe('食材制限');
    expect(result.quadrant1[0].quadrantPosition).toBe(1);

    // 第2象限（発生頻度高×影響度低）に調理時間が分類されていることを確認
    expect(result.quadrant2).toHaveLength(1);
    expect(result.quadrant2[0].factorName).toBe('調理時間');
    expect(result.quadrant2[0].quadrantPosition).toBe(2);

    // 第3象限（発生頻度低×影響度高）に予算制約が分類されていることを確認
    expect(result.quadrant3).toHaveLength(1);
    expect(result.quadrant3[0].factorName).toBe('予算制約');
    expect(result.quadrant3[0].quadrantPosition).toBe(3);

    // 第4象限（発生頻度低×影響度低）に他のペイン要因が分類されていることを確認
    expect(result.quadrant4).toHaveLength(1);
    expect(result.quadrant4[0].factorName).toBe('その他要因');
    expect(result.quadrant4[0].quadrantPosition).toBe(4);

    // 生成されたマトリクスの軸ラベルが正しく設定されていることを確認
    expect(result.xAxisLabel).toBe('発生頻度');
    expect(result.yAxisLabel).toBe('影響度');

    // 象限表示が正しく設定されていることを確認
    expect(result.quadrant1Label).toBe('高優先度（頻出・高影響）');
    expect(result.quadrant2Label).toBe('中優先度（頻出・低影響）');
    expect(result.quadrant3Label).toBe('中優先度（低頻度・高影響）');
    expect(result.quadrant4Label).toBe('低優先度（低頻度・低影響）');

    // マトリクスの総ペイン要因数が正確に4であることを確認
    const totalFactorsInMatrix =
      result.quadrant1.length +
      result.quadrant2.length +
      result.quadrant3.length +
      result.quadrant4.length;
    expect(totalFactorsInMatrix).toBe(4);

    // 各象限の優先度スコアが正しく計算されていることを確認
    // 第1象限: (発生頻度スコア + 影響度スコア) / 2 = (85 + 90) / 2 = 87.5
    expect(result.quadrant1[0].priorityScore).toBe(87.5);

    // 第2象限: (発生頻度スコア + 影響度スコア) / 2 = (78 + 35) / 2 = 56.5
    expect(result.quadrant2[0].priorityScore).toBe(56.5);

    // 第3象限: (発生頻度スコア + 影響度スコア) / 2 = (42 + 88) / 2 = 65
    expect(result.quadrant3[0].priorityScore).toBe(65);

    // 第4象限: (発生頻度スコア + 影響度スコア) / 2 = (28 + 22) / 2 = 25
    expect(result.quadrant4[0].priorityScore).toBe(25);

    // マトリクスのメタデータが正しく生成されていることを確認
    expect(result.generatedAt).toBeDefined();
    expect(typeof result.generatedAt).toBe('string');
    expect(result.totalFactorsAnalyzed).toBe(4);
  });
});