import { detectDataInconsistency } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出機能', () => {
  test('SCEN-335: インタビュー記録とログデータの矛盾検出 - null/空データ入力エラーハンドリング', () => {
    // ケース1: インタビュー記録がnull
    expect(() => {
      detectDataInconsistency({
        interview_records: null,
        log_data: [
          {
            user_id: 'usr_001',
            feature_name: 'meal_generation',
            action_type: 'click',
            timestamp: '2024-01-15T10:30:00Z',
            session_id: 'sess_001'
          }
        ]
      });
    }).toThrow(/インタビュー記録/);

    // ケース2: ログデータが空配列
    expect(() => {
      detectDataInconsistency({
        interview_records: {
          user_id: 'usr_001',
          pain_factors: ['cooking_time', 'budget'],
          interview_date: '2024-01-10',
          summary: 'User struggles with meal planning'
        },
        log_data: []
      });
    }).toThrow(/ログデータ/);

    // ケース3: インタビュー記録が空オブジェクト
    expect(() => {
      detectDataInconsistency({
        interview_records: {},
        log_data: [
          {
            user_id: 'usr_001',
            feature_name: 'meal_generation',
            action_type: 'click',
            timestamp: '2024-01-15T10:30:00Z',
            session_id: 'sess_001'
          }
        ]
      });
    }).toThrow(/インタビュー記録/);

    // ケース4: ログデータがnull
    expect(() => {
      detectDataInconsistency({
        interview_records: {
          user_id: 'usr_001',
          pain_factors: ['cooking_time'],
          interview_date: '2024-01-10',
          summary: 'Time constraint issue'
        },
        log_data: null
      });
    }).toThrow(/ログデータ/);

    // ケース5: 両方が空オブジェクト/空配列
    expect(() => {
      detectDataInconsistency({
        interview_records: {},
        log_data: []
      });
    }).toThrow(/入力データ/);

    // ケース6: 正常系 - 一致するデータ
    const valid_result = detectDataInconsistency({
      interview_records: {
        user_id: 'usr_002',
        pain_factors: ['cooking_time', 'budget'],
        interview_date: '2024-01-12',
        summary: 'Prefers quick meals with budget constraints'
      },
      log_data: [
        {
          user_id: 'usr_002',
          feature_name: 'meal_generation',
          action_type: 'submit',
          timestamp: '2024-01-12T14:00:00Z',
          session_id: 'sess_002'
        },
        {
          user_id: 'usr_002',
          feature_name: 'budget_filter',
          action_type: 'apply',
          timestamp: '2024-01-12T14:05:00Z',
          session_id: 'sess_002'
        }
      ]
    });

    expect(valid_result).toEqual({
      has_inconsistency: false,
      inconsistency_details: [],
      confidence_score: 0.95,
      data_quality_status: 'valid'
    });

    // ケース7: ユーザーIDが不一致の場合の矛盾検出
    const inconsistent_result = detectDataInconsistency({
      interview_records: {
        user_id: 'usr_003',
        pain_factors: ['cooking_time'],
        interview_date: '2024-01-14',
        summary: 'Fast meal preference'
      },
      log_data: [
        {
          user_id: 'usr_004',
          feature_name: 'meal_generation',
          action_type: 'submit',
          timestamp: '2024-01-14T15:00:00Z',
          session_id: 'sess_003'
        }
      ]
    });

    expect(inconsistent_result).toEqual({
      has_inconsistency: true,
      inconsistency_details: [
        {
          type: 'user_id_mismatch',
          interview_user_id: 'usr_003',
          log_user_id: 'usr_004',
          severity: 'high'
        }
      ],
      confidence_score: 0.45,
      data_quality_status: 'warning'
    });

    // ケース8: 日付が大きく乖離している場合
    const date_divergence_result = detectDataInconsistency({
      interview_records: {
        user_id: 'usr_005',
        pain_factors: ['shopping_difficulty'],
        interview_date: '2024-01-01',
        summary: 'Shopping experience issues'
      },
      log_data: [
        {
          user_id: 'usr_005',
          feature_name: 'meal_generation',
          action_type: 'click',
          timestamp: '2024-02-15T10:00:00Z',
          session_id: 'sess_004'
        }
      ]
    });

    expect(date_divergence_result).toEqual({
      has_inconsistency: true,
      inconsistency_details: [
        {
          type: 'date_gap_exceeds_threshold',
          interview_date: '2024-01-01',
          last_log_date: '2024-02-15',
          gap_days: 45,
          severity: 'medium'
        }
      ],
      confidence_score: 0.60,
      data_quality_status: 'caution'
    });
  });
});