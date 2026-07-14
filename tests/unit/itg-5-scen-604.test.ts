import { classifyUserPainFactors, generatePriorityMatrix } from '../../src/logic/it-7-3-1';

describe('献立生成フロー内の離脱ポイントと入力パターンからペイン要因を自動分類し、優先度マトリクスを生成', () => {
  // SCEN-604
  test('複数の離脱ポイントと入力パターンからペイン要因を自動分類し、優先度マトリクスを生成できる', () => {
    // テストデータ: 複数の離脱ポイントと対応する入力パターン
    const churnPointDataset = [
      {
        churnPointId: 'cp_001',
        churnPointName: '献立検索段階',
        inputPattern: 'complex_filter_ui',
        occurenceCount: 45,
      },
      {
        churnPointId: 'cp_002',
        churnPointName: '材料入力段階',
        inputPattern: 'high_input_load',
        occurenceCount: 67,
      },
      {
        churnPointId: 'cp_003',
        churnPointName: '調理手順確認段階',
        inputPattern: 'insufficient_info',
        occurenceCount: 28,
      },
      {
        churnPointId: 'cp_004',
        churnPointName: '栄養確認段階',
        inputPattern: 'complex_filter_ui',
        occurenceCount: 52,
      },
      {
        churnPointId: 'cp_005',
        churnPointName: '予算確認段階',
        inputPattern: 'high_input_load',
        occurenceCount: 38,
      },
    ];

    // ステップ1: ユーザーペイン要因自動分類機能を実行
    const classificationResult = classifyUserPainFactors({
      churnPoints: churnPointDataset,
    });

    // 期待: ペイン要因が正確に分類される
    expect(classificationResult).toBeDefined();
    expect(Array.isArray(classificationResult.painFactors)).toBe(true);
    expect(classificationResult.painFactors.length).toBeGreaterThan(0);

    // ステップ2: 分類されたペイン要因の構造を検証
    const painFactorsMap: Record<
      string,
      {
        painFactorId: string;
        painFactorName: string;
        importanceScore: number;
        frequencyScore: number;
      }
    > = {};

    classificationResult.painFactors.forEach(
      (factor: {
        painFactorId: string;
        painFactorName: string;
        importanceScore: number;
        frequencyScore: number;
      }) => {
        expect(factor.painFactorId).toBeDefined();
        expect(factor.painFactorName).toBeDefined();
        expect(typeof factor.importanceScore).toBe('number');
        expect(typeof factor.frequencyScore).toBe('number');
        expect(factor.importanceScore).toBeGreaterThanOrEqual(1);
        expect(factor.importanceScore).toBeLessThanOrEqual(10);
        expect(factor.frequencyScore).toBeGreaterThanOrEqual(1);
        expect(factor.frequencyScore).toBeLessThanOrEqual(10);

        painFactorsMap[factor.painFactorId] = factor;
      }
    );

    // 期待: 主要なペイン要因が分類される
    // "UIの複雑性" は complex_filter_ui パターン（cp_001, cp_004）から抽出
    // "入力負荷" は high_input_load パターン（cp_002, cp_005）から抽出
    // "情報不足" は insufficient_info パターン（cp_003）から抽出
    expect(Object.keys(painFactorsMap).length).toBeGreaterThanOrEqual(3);

    // ステップ3: 優先度マトリクス生成機能を実行
    const matrixResult = generatePriorityMatrix({
      painFactors: classificationResult.painFactors,
    });

    // 期待: マトリクスが生成される
    expect(matrixResult).toBeDefined();
    expect(matrixResult.quadrantI).toBeDefined();
    expect(matrixResult.quadrantII).toBeDefined();
    expect(matrixResult.quadrantIII).toBeDefined();
    expect(matrixResult.quadrantIV).toBeDefined();

    // ステップ4: 各象限への分類を検証
    // QuadrantI: 高重要度（>5）& 高頻度（>5）
    matrixResult.quadrantI.forEach(
      (factor: { importanceScore: number; frequencyScore: number }) => {
        expect(factor.importanceScore).toBeGreaterThan(5);
        expect(factor.frequencyScore).toBeGreaterThan(5);
      }
    );

    // QuadrantII: 高重要度（>5）& 低頻度（<=5）
    matrixResult.quadrantII.forEach(
      (factor: { importanceScore: number; frequencyScore: number }) => {
        expect(factor.importanceScore).toBeGreaterThan(5);
        expect(factor.frequencyScore).toBeLessThanOrEqual(5);
      }
    );

    // QuadrantIII: 低重要度（<=5）& 低頻度（<=5）
    matrixResult.quadrantIII.forEach(
      (factor: { importanceScore: number; frequencyScore: number }) => {
        expect(factor.importanceScore).toBeLessThanOrEqual(5);
        expect(factor.frequencyScore).toBeLessThanOrEqual(5);
      }
    );

    // QuadrantIV: 低重要度（<=5）& 高頻度（>5）
    matrixResult.quadrantIV.forEach(
      (factor: { importanceScore: number; frequencyScore: number }) => {
        expect(factor.importanceScore).toBeLessThanOrEqual(5);
        expect(factor.frequencyScore).toBeGreaterThan(5);
      }
    );

    // ステップ5: マトリクス構造の整合性検証
    const totalFactorsInMatrix =
      matrixResult.quadrantI.length +
      matrixResult.quadrantII.length +
      matrixResult.quadrantIII.length +
      matrixResult.quadrantIV.length;

    expect(totalFactorsInMatrix).toBe(classificationResult.painFactors.length);

    // ステップ6: マトリクスメタデータの検証
    expect(matrixResult.totalFactorsClassified).toBe(
      classificationResult.painFactors.length
    );
    expect(matrixResult.highPriorityCount).toBe(matrixResult.quadrantI.length);
    expect(matrixResult.mediumHighPriorityCount).toBe(
      matrixResult.quadrantII.length
    );
    expect(matrixResult.lowPriorityCount).toBe(matrixResult.quadrantIII.length);
    expect(matrixResult.emergentIssueCount).toBe(matrixResult.quadrantIV.length);

    // ステップ7: 出力形式の検証
    expect(matrixResult.formatVersion).toBe('1.0');
    expect(matrixResult.generatedAt).toBeDefined();
    expect(typeof matrixResult.generatedAt).toBe('string');

    // ステップ8: 分類結果の期待値を具体的に検証
    // 離脱ポイント総数は 5
    expect(churnPointDataset.length).toBe(5);

    // complex_filter_ui パターンの発生頻度: 45 + 52 = 97
    // high_input_load パターンの発生頻度: 67 + 38 = 105
    // insufficient_info パターンの発生頻度: 28
    // UI複雑性の重要度スコアは高い (7以上)
    // 入力負荷の重要度スコアは高い (8以上)
    // 情報不足の重要度スコアは中程度 (5-6)
    // UI複雑性の頻度スコアは高い (8以上、97/(45+67+28+52+38) = 97/230 ≈ 42%なので高)
    // 入力負荷の頻度スコアは高い (9以上、105/230 ≈ 46%なので高)
    // 情報不足の頻度スコアは中程度 (28/230 ≈ 12%なので低-中)

    const uiComplexityFactor = classificationResult.painFactors.find(
      (f: { painFactorName: string }) =>
        f.painFactorName.includes('UI') || f.painFactorName.includes('複雑')
    );
    if (uiComplexityFactor) {
      expect(uiComplexityFactor.importanceScore).toBeGreaterThanOrEqual(7);
      expect(uiComplexityFactor.frequencyScore).toBeGreaterThanOrEqual(8);
    }

    const inputLoadFactor = classificationResult.painFactors.find(
      (f: { painFactorName: string }) =>
        f.painFactorName.includes('入力') || f.painFactorName.includes('負荷')
    );
    if (inputLoadFactor) {
      expect(inputLoadFactor.importanceScore).toBeGreaterThanOrEqual(8);
      expect(inputLoadFactor.frequencyScore).toBeGreaterThanOrEqual(9);
    }

    // ステップ9: QuadrantI が最優先の要因を含むことを検証
    expect(matrixResult.quadrantI.length).toBeGreaterThan(0);
    const highPriorityFactorNames = matrixResult.quadrantI.map(
      (f: { painFactorName: string }) => f.painFactorName
    );
    expect(highPriorityFactorNames.length).toBeGreaterThan(0);
  });
});