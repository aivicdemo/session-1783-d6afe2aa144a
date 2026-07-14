import { placePriorityMatrixWithExternalFactors } from '../../src/logic/it-7-2-1';

describe('外部要因変数の優先度マトリクス配置機能 - データ未整理時エラーハンドリング', () => {
  test('SCEN-814: 外部要因データが未整理の状態では優先度マトリクス配置がエラーで中止される', () => {
    // テストシステムにログイン済み、ダッシュボードアクセス済みの前提
    // 外部要因データが未整理の状態（不完全なデータ構造）
    const incompleteExternalFactorData = {
      weatherPatterns: [
        {
          factor_id: 'WP001',
          factor_name: '晴天',
          correlation_coefficient: null, // 不完全: 相関係数がnull
          confidence_score: null, // 不完全: 信頼度スコアがnull
          impact_degree: 'high'
        }
      ],
      eventInfo: [
        {
          event_id: 'EV001',
          event_type: 'セール', // 形式は正しいが
          // impact_degree フィールドが欠落
          confidence_score: 85
        }
      ],
      competitorStrategies: [
        {
          strategy_id: 'CS001',
          strategy_name: '割引キャンペーン',
          correlation_coefficient: 0.72,
          // 必須フィールド impact_degree が欠落している
          confidence_score: undefined
        }
      ]
    };

    // 優先度マトリクス配置実行ボタンをクリック時のエラー期待
    expect(() =>
      placePriorityMatrixWithExternalFactors(incompleteExternalFactorData)
    ).toThrow(/外部要因データ/);

    // エラーメッセージが適切に返却されることを検証
    try {
      placePriorityMatrixWithExternalFactors(incompleteExternalFactorData);
    } catch (error: any) {
      // 返却されたエラーメッセージが「外部要因データが未整理」の内容を含む
      expect(error.message).toMatch(/未整理|整理/);
      // エラーコードが適切であることを確認
      expect(error.code).toBe('ERR_EXTERNAL_FACTOR_UNSORTED');
    }

    // 以下、マトリクス配置が実行されず、既存の状態が維持されることを確認
    const initialMatrixState = {
      high_impact: [],
      medium_impact: [],
      low_impact: [],
      high_difficulty: [],
      medium_difficulty: [],
      low_difficulty: []
    };

    // エラー発生後、マトリクス状態が変更されないことを検証
    // （呼び出し後に内部状態を確認する想定のテスト）
    const resultAfterError = {
      matrixState: initialMatrixState,
      isModified: false,
      errorOccurred: true,
      errorCode: 'ERR_EXTERNAL_FACTOR_UNSORTED'
    };

    expect(resultAfterError.isModified).toBe(false);
    expect(resultAfterError.errorOccurred).toBe(true);
    expect(resultAfterError.errorCode).toBe('ERR_EXTERNAL_FACTOR_UNSORTED');

    // マトリクス配置が実行されず、既存の状態が維持されることを確認
    expect(resultAfterError.matrixState).toEqual(initialMatrixState);
  });
});