import { describePriorityMatrixPlacementForExternalFactorVariable } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-286
  test('外部要因変数の優先度マトリクス配置 - 影響度と実装難度が両方ともスケール最大値の場合に低優先度象限に正しく配置される', () => {
    const MAX_SCALE = 10;
    const MATRIX_MIDPOINT = 5;

    // 優先度マトリクス機能を初期化
    const matrixConfig = {
      maxImpactScore: MAX_SCALE,
      maxImplementationDifficulty: MAX_SCALE,
      quadrantMidpoint: MATRIX_MIDPOINT,
    };

    // 外部要因変数を作成
    const externalFactorVariable = {
      variableId: 'external_factor_001',
      variableName: '気象パターン_降水量',
      impactScore: MAX_SCALE, // 影響度をスケール最大値に設定
      implementationDifficulty: MAX_SCALE, // 実装難度をスケール最大値に設定
    };

    // 優先度マトリクスに外部要因変数を配置する計算ロジックを実行
    const placementResult = describePriorityMatrixPlacementForExternalFactorVariable({
      externalFactorVariable,
      matrixConfig,
    });

    // マトリクス上の配置座標を取得
    const { matrixCoordinate, quadrantClassification, priorityLevel } = placementResult;

    // 戻り値の座標情報を検証 - 影響度と実装難度が両方ともMAX_SCALE
    expect(matrixCoordinate.impactAxis).toBe(MAX_SCALE);
    expect(matrixCoordinate.difficultyAxis).toBe(MAX_SCALE);

    // 象限判定の結果が低優先度象限（右上象限：高難度・高影響度）に分類されていることを検証
    expect(quadrantClassification).toBe('low_priority');

    // 優先度レベルが低いことを検証
    expect(priorityLevel).toBeLessThan(MATRIX_MIDPOINT);

    // マトリクス上の位置が高難度・高影響度領域に位置することを確認
    expect(matrixCoordinate.impactAxis).toBeGreaterThanOrEqual(MATRIX_MIDPOINT);
    expect(matrixCoordinate.difficultyAxis).toBeGreaterThanOrEqual(MATRIX_MIDPOINT);

    // 配置結果がシステムの期待値フォーマットに準拠していることを確認
    expect(placementResult).toHaveProperty('matrixCoordinate');
    expect(placementResult).toHaveProperty('quadrantClassification');
    expect(placementResult).toHaveProperty('priorityLevel');
    expect(typeof placementResult.priorityLevel).toBe('number');
  });
});