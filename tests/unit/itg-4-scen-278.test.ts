import { assignExternalDataTrustScore } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-278: [error] 外部要因データ信頼度スコア付与・採用判定 - メタデータ欠落時のデフォルトスコア付与と警告発生
  test('メタデータ欠落時、デフォルト信頼度スコアを付与し警告ログを発生させる', () => {
    const externalDataWithMissingMetadata = {
      data_source_id: 'weather_api_001',
      timestamp: '2024-01-15T09:00:00Z',
      data_type: 'weather',
      temperature: 22.5,
      humidity: 65,
      // 意図的に欠落: data_quality_score, last_update_timestamp, source_reliability_rating
    };

    const warnings: Array<{ field: string; message: string }> = [];
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn((...args: unknown[]) => {
      const message = String(args[0]);
      if (message.includes('メタデータ欠落')) {
        warnings.push({
          field: message.match(/【(\w+)】/) ? message.match(/【(\w+)】/)[1] : 'unknown',
          message,
        });
      }
    });

    const result = assignExternalDataTrustScore(externalDataWithMissingMetadata as any);

    console.warn = originalConsoleWarn;

    // デフォルトスコアが 0.5 であることを確認
    expect(result.trust_score).toBe(0.5);

    // 警告が発生していることを確認
    expect(warnings.length).toBeGreaterThan(0);

    // 警告メッセージに欠落フィールド名が含まれていることを確認
    const warningMessages = warnings.map((w) => w.message).join(' ');
    expect(warningMessages).toMatch(/data_quality_score|last_update_timestamp|source_reliability_rating/);

    // 戻り値に警告フラグが設定されていることを確認
    expect(result.has_warnings).toBe(true);

    // 戻り値の警告リストに欠落フィールド情報が含まれていることを確認
    expect(result.warning_details).toBeDefined();
    expect(result.warning_details.length).toBeGreaterThan(0);
    expect(result.warning_details[0]).toMatch(/required.*missing|メタデータ欠落/i);
  });

  // SCEN-278の追加検証: 複数メタデータ欠落時の処理
  test('複数のメタデータが欠落している場合、デフォルトスコアと全欠落フィールド情報を返す', () => {
    const externalDataWithMultipleMissingFields = {
      data_source_id: 'event_info_002',
      // timestamp 欠落
      data_type: 'event',
      event_name: 'seasonal_sale',
      // data_quality_score 欠落
      // source_reliability_rating 欠落
    };

    const result = assignExternalDataTrustScore(externalDataWithMultipleMissingFields as any);

    // デフォルトスコアが 0.5 であることを確認
    expect(result.trust_score).toBe(0.5);

    // 警告フラグが立っていることを確認
    expect(result.has_warnings).toBe(true);

    // 欠落フィールドが複数記録されていることを確認
    expect(result.warning_details.length).toBeGreaterThanOrEqual(3);
  });

  // SCEN-278の追加検証: すべてのメタデータが揃っている場合の正常系
  test('すべてのメタデータが揃っている場合、計算されたスコアを返し警告を発生させない', () => {
    const completeExternalData = {
      data_source_id: 'weather_api_001',
      timestamp: '2024-01-15T09:00:00Z',
      data_type: 'weather',
      data_quality_score: 0.95,
      last_update_timestamp: '2024-01-15T08:55:00Z',
      source_reliability_rating: 0.9,
      temperature: 22.5,
      humidity: 65,
      update_frequency_hours: 1,
    };

    const result = assignExternalDataTrustScore(completeExternalData);

    // 計算されたスコアが 0.5 より大きいことを確認（デフォルトスコアではなく計算値）
    expect(result.trust_score).toBeGreaterThan(0.5);

    // 期待値: (data_quality_score + source_reliability_rating) / 2 = (0.95 + 0.9) / 2 = 0.925
    expect(result.trust_score).toBe(0.925);

    // 警告フラグが立っていないことを確認
    expect(result.has_warnings).toBe(false);

    // 警告詳細が空または未定義であることを確認
    expect(result.warning_details.length).toBe(0);
  });

  // SCEN-278の追加検証: デフォルトスコアが在庫最適化処理に採用されることを確認
  test('デフォルトスコアが付与されたデータは、在庫最適化判定に使用される', () => {
    const incompleteExternalData = {
      data_source_id: 'competitor_api_003',
      // メタデータ複数欠落
      data_type: 'competitor_strategy',
      strategy_name: 'price_reduction',
    };

    const result = assignExternalDataTrustScore(incompleteExternalData as any);

    // デフォルトスコア 0.5 が付与されていることを確認
    expect(result.trust_score).toBe(0.5);

    // スコアが在庫最適化の採用判定基準（例：0.6 以上で採用）に基づいて判定可能であることを確認
    const adoption_threshold = 0.6;
    const should_adopt = result.trust_score >= adoption_threshold;

    // このケースではスコアが閾値以下なので採用されないはず
    expect(should_adopt).toBe(false);

    // ただしシステムは警告とともに処理を継続していることを確認
    expect(result.has_warnings).toBe(true);
    expect(result.processing_status).toBe('continued_with_default');
  });
});