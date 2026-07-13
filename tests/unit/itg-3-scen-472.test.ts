import { evaluateExternalFactorDataTrustScore } from '../../src/logic/it-1-br-6-2-1-1';

describe('外部要因データの信頼度スコア付与・採用判定', () => {
  // SCEN-472
  test('信頼度スコア 80 で採用判定基準ちょうど境界値を満たすため予測モデル入力候補として選定される', () => {
    // Arrange: 信頼度スコア 80 のテスト用外部要因データを準備
    const externalFactorData = {
      id: 'ext_factor_001',
      type: 'weather',
      name: '気象データ_気温',
      trustScore: 80,
      dataSourceId: 'ds_001',
      collectionTimestamp: new Date('2024-12-15T10:00:00Z'),
      value: 22.5,
      unit: 'celsius',
    };

    const adoptionThreshold = 80;

    // Act: 採用判定処理を実行
    const result = evaluateExternalFactorDataTrustScore(
      externalFactorData,
      adoptionThreshold
    );

    // Assert: 信頼度スコア 80 が採用基準値と同値であることを検証
    expect(result.trustScore).toBe(80);
    expect(result.meetsAdoptionCriteria).toBe(true);
    expect(result.adoptionThreshold).toBe(80);

    // Assert: 予測モデル入力候補として正常に選定されたことを確認
    expect(result.isSelectedForPredictionModel).toBe(true);
    expect(result.predictionModelInputCandidates).toContain(externalFactorData.id);
    expect(result.predictionModelInputCandidates.length).toBeGreaterThan(0);

    // Assert: 結果オブジェクトの構造を検証
    expect(result).toHaveProperty('trustScore');
    expect(result).toHaveProperty('meetsAdoptionCriteria');
    expect(result).toHaveProperty('adoptionThreshold');
    expect(result).toHaveProperty('isSelectedForPredictionModel');
    expect(result).toHaveProperty('predictionModelInputCandidates');
    expect(Array.isArray(result.predictionModelInputCandidates)).toBe(true);
  });
});