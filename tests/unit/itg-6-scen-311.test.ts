import { extractAndClassifyPainFactors } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-311: [edge] インタビュー内容自動分類・ペイン要因抽出機能 - 複数のペイン要因が同時に言及されている記述において、各要因が正確に分解・分類される
  test('複数のペイン要因が同時に言及されている複文テキストから各要因が正確に分解・分類されること', () => {
    const interviewText =
      'システム導入後、操作が複雑で時間がかかり、スタッフの教育コストが増加し、顧客満足度が低下している';

    const result = extractAndClassifyPainFactors({
      interviewContent: interviewText,
      userId: 'user_test_001',
      interviewDate: '2024-01-15T10:00:00Z',
    });

    // (1) ユーザビリティペイン: 『操作が複雑である』
    expect(result.painFactors).toContainEqual(
      expect.objectContaining({
        category: 'usability',
        painDescription: '操作が複雑である',
        frequency: 1,
        impactScore: expect.any(Number),
      })
    );

    // (2) 効率性ペイン: 『処理時間がかかる』
    expect(result.painFactors).toContainEqual(
      expect.objectContaining({
        category: 'efficiency',
        painDescription: '処理時間がかかる',
        frequency: 1,
        impactScore: expect.any(Number),
      })
    );

    // (3) コストペイン: 『スタッフ教育コストが増加』
    expect(result.painFactors).toContainEqual(
      expect.objectContaining({
        category: 'cost',
        painDescription: 'スタッフ教育コストが増加',
        frequency: 1,
        impactScore: expect.any(Number),
      })
    );

    // (4) 品質・サービスペイン: 『顧客満足度が低下』
    expect(result.painFactors).toContainEqual(
      expect.objectContaining({
        category: 'quality_service',
        painDescription: '顧客満足度が低下',
        frequency: 1,
        impactScore: expect.any(Number),
      })
    );

    // 総要因数が 4 であること
    expect(result.painFactors.length).toBe(4);

    // 各要因が独立した単位として分類されていること（重複がないこと）
    const painDescriptions = result.painFactors.map(
      (pf) => pf.painDescription
    );
    const uniqueDescriptions = new Set(painDescriptions);
    expect(uniqueDescriptions.size).toBe(4);

    // 因果関係が正しく識別されていること
    expect(result.causalRelationships).toContainEqual(
      expect.objectContaining({
        cause: '操作が複雑である',
        effect: '処理時間がかかる',
        relationshipType: 'causes_delay',
      })
    );

    expect(result.causalRelationships).toContainEqual(
      expect.objectContaining({
        cause: '処理時間がかかる',
        effect: 'スタッフ教育コストが増加',
        relationshipType: 'increases_cost',
      })
    );

    expect(result.causalRelationships).toContainEqual(
      expect.objectContaining({
        cause: 'スタッフ教育コストが増加',
        effect: '顧客満足度が低下',
        relationshipType: 'decreases_satisfaction',
      })
    );

    // 因果関係数が 3 であること
    expect(result.causalRelationships.length).toBe(3);

    // 優先度マトリクスが生成されていること
    expect(result.priorityMatrix).toBeDefined();
    expect(result.priorityMatrix.highPriority).toContainEqual(
      expect.objectContaining({
        painDescription: expect.any(String),
        frequency: expect.any(Number),
        impactScore: expect.any(Number),
      })
    );

    // 優先度マトリクスに 4 つの要因がすべて配置されていること
    const allMatrixItems = [
      ...result.priorityMatrix.highPriority,
      ...result.priorityMatrix.mediumPriority,
      ...result.priorityMatrix.lowPriority,
    ];
    expect(allMatrixItems.length).toBe(4);

    // マトリックス内の要因がソースのペイン要因と整合していること
    allMatrixItems.forEach((matrixItem) => {
      expect(painDescriptions).toContain(matrixItem.painDescription);
    });

    // 処理結果にメタデータが含まれていること
    expect(result.metadata).toBeDefined();
    expect(result.metadata.totalFactorsExtracted).toBe(4);
    expect(result.metadata.totalCausalRelationships).toBe(3);
    expect(result.metadata.processingTimestampUtc).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});