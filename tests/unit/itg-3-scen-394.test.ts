import { calculateMonthlyCostReductionWithFallback } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('月次食費削減効果集計機能 - 価格データ連携エラーハンドリング', () => {
  test('SCEN-394: 価格データ連携が失敗した場合に代替提案ロジックが動作する', async () => {
    fetchMock.resetMocks();

    // 価格データ連携APIがエラー（ステータス500）を返す
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

    // 前月のキャッシュデータ
    const previous_month_price_data = {
      item_id: 'ITEM_001',
      item_name: '鶏胸肉',
      previous_month_price: 150,
      unit: '100g',
      price_history: [140, 150, 160],
    };

    const current_month_purchase_records = [
      {
        purchase_id: 'PUR_001',
        item_id: 'ITEM_001',
        quantity: 500,
        unit_price: 180,
        purchase_date: '2024-01-15',
      },
      {
        purchase_id: 'PUR_002',
        item_id: 'ITEM_002',
        item_name: 'キャベツ',
        quantity: 2000,
        unit_price: 120,
        purchase_date: '2024-01-18',
      },
    ];

    const monthly_budget = 30000;
    const current_month_cost = 32500;

    // 代替提案ロジックが前月データを使用した場合の期待結果
    // 削減提案: 鶏胸肉の単価を150（前月平均）に抑える場合
    // 削減効果 = (180 - 150) × (500/100) = 30 × 5 = 150円
    // 合計食費 = 32500 - 150 = 32350円（超過額: 2350円）

    const result = await calculateMonthlyCostReductionWithFallback(
      current_month_purchase_records,
      monthly_budget,
      previous_month_price_data,
      current_month_cost
    );

    // エラーハンドリングが正常に機能し、代替提案が生成されることを確認
    expect(result).toEqual({
      status: 'fallback_applied',
      error_message: '価格データの取得に失敗しました。前月のデータを参考に提案を表示しています',
      original_cost: 32500,
      fallback_proposed_cost: 32350,
      reduction_amount: 150,
      reduction_percentage: 0.46,
      proposal_items: [
        {
          item_id: 'ITEM_001',
          item_name: '鶏胸肉',
          quantity: 500,
          current_unit_price: 180,
          fallback_unit_price: 150,
          potential_reduction: 150,
          unit: '100g',
        },
      ],
      budget_status: 'exceeded',
      budget_exceeded_amount: 2350,
      fallback_data_used: true,
      cache_timestamp: previous_month_price_data.price_history,
      notification_message: '価格データの取得に失敗しました。前月のデータを参考に提案を表示しています',
    });

    // システムログにエラーと代替ロジック実行の記録がある
    expect(result.status).toBe('fallback_applied');
    expect(result.fallback_data_used).toBe(true);

    // ユーザー通知メッセージが正しく生成されている
    expect(result.notification_message).toMatch(/価格データの取得に失敗/);
    expect(result.notification_message).toMatch(/前月のデータ/);

    // 削減提案が正しく計算されている
    expect(result.reduction_amount).toBe(150);
    expect(result.fallback_proposed_cost).toBe(32350);

    // 超過状態が正しく判定されている
    expect(result.budget_status).toBe('exceeded');
    expect(result.budget_exceeded_amount).toBe(2350);
  });
});