import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  calculateMonthlySavingsEffect,
  extractLowestPriceVendor,
  aggregateSavingsReport,
} from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-393: [normal] 月次食費削減効果集計機能 - 流通業者・スーパーの価格データ連携により最適な購入先が提案される
  test('SCEN-393: 複数スーパーの価格データから最安購入先を抽出し月間削減効果を集計する', () => {
    // ===== Setup: 複数のスーパー（A店、B店、C店）の同一商品に対する価格データを入力 =====
    const price_data = [
      {
        item_id: 'item_001',
        item_name: 'トマト',
        vendor_a_price: 150,
        vendor_a_name: 'スーパーA',
        vendor_b_price: 140,
        vendor_b_name: 'スーパーB',
        vendor_c_price: 160,
        vendor_c_name: 'スーパーC',
        monthly_quantity: 10,
      },
      {
        item_id: 'item_002',
        item_name: '鶏肉',
        vendor_a_price: 900,
        vendor_a_name: 'スーパーA',
        vendor_b_price: 950,
        vendor_b_name: 'スーパーB',
        vendor_c_price: 800,
        vendor_c_name: 'スーパーC',
        monthly_quantity: 5,
      },
      {
        item_id: 'item_003',
        item_name: '玉ねぎ',
        vendor_a_price: 80,
        vendor_a_name: 'スーパーA',
        vendor_b_price: 75,
        vendor_b_name: 'スーパーB',
        vendor_c_price: 90,
        vendor_c_name: 'スーパーC',
        monthly_quantity: 15,
      },
    ];

    // ===== Step 1: システムが各商品について価格が最も低い購入先を抽出 =====
    const lowest_price_vendors = extractLowestPriceVendor(price_data);

    // 期待値: 各商品の最安購入先
    const expected_lowest_vendors = [
      {
        item_id: 'item_001',
        item_name: 'トマト',
        recommended_vendor: 'スーパーB',
        lowest_price: 140,
        monthly_quantity: 10,
      },
      {
        item_id: 'item_002',
        item_name: '鶏肉',
        recommended_vendor: 'スーパーC',
        lowest_price: 800,
        monthly_quantity: 5,
      },
      {
        item_id: 'item_003',
        item_name: '玉ねぎ',
        recommended_vendor: 'スーパーB',
        lowest_price: 75,
        monthly_quantity: 15,
      },
    ];

    expect(lowest_price_vendors).toEqual(expected_lowest_vendors);

    // ===== Step 2: 各商品の削減額を計算 =====
    // トマト: max(150, 140, 160) - 140 = 160 - 140 = 20円 × 10個 = 200円
    // 鶏肉: max(900, 950, 800) - 800 = 950 - 800 = 150円 × 5個 = 750円
    // 玉ねぎ: max(80, 75, 90) - 75 = 90 - 75 = 15円 × 15個 = 225円
    const expected_item_savings = [
      {
        item_id: 'item_001',
        item_name: 'トマト',
        recommended_vendor: 'スーパーB',
        current_max_price: 160,
        lowest_price: 140,
        price_difference: 20,
        monthly_quantity: 10,
        item_savings_amount: 200,
      },
      {
        item_id: 'item_002',
        item_name: '鶏肉',
        recommended_vendor: 'スーパーC',
        current_max_price: 950,
        lowest_price: 800,
        price_difference: 150,
        monthly_quantity: 5,
        item_savings_amount: 750,
      },
      {
        item_id: 'item_003',
        item_name: '玉ねぎ',
        recommended_vendor: 'スーパーB',
        current_max_price: 90,
        lowest_price: 75,
        price_difference: 15,
        monthly_quantity: 15,
        item_savings_amount: 225,
      },
    ];

    const monthly_savings_calculation = calculateMonthlySavingsEffect(
      lowest_price_vendors,
      price_data,
    );

    expect(monthly_savings_calculation).toEqual(expected_item_savings);

    // ===== Step 3: 複数商品の購入先最適化による月間削減金額を集計 =====
    // 総削減額: 200 + 750 + 225 = 1,175円
    const expected_total_monthly_savings = 1175;

    // ===== Step 4: 削減効果レポートを生成 =====
    const savings_report = aggregateSavingsReport(monthly_savings_calculation);

    // 期待値: 削減効果レポート
    const expected_savings_report = {
      report_period: 'monthly',
      report_month: expect.any(String),
      total_monthly_savings_amount: expected_total_monthly_savings,
      savings_by_item: expected_item_savings,
      item_count: 3,
      vendor_recommendations: [
        {
          vendor_name: 'スーパーB',
          recommended_items: ['item_001', 'item_003'],
          item_names: ['トマト', '玉ねぎ'],
        },
        {
          vendor_name: 'スーパーC',
          recommended_items: ['item_002'],
          item_names: ['鶏肉'],
        },
      ],
    };

    // ===== Verification: レポートに各商品の推奨購入先、価格差、削減額が記載されているか検証 =====
    expect(savings_report.report_period).toBe('monthly');
    expect(savings_report.total_monthly_savings_amount).toBe(
      expected_total_monthly_savings,
    );
    expect(savings_report.item_count).toBe(3);

    // 各商品の削減情報を検証
    expect(savings_report.savings_by_item).toHaveLength(3);
    expect(savings_report.savings_by_item[0]).toEqual({
      item_id: 'item_001',
      item_name: 'トマト',
      recommended_vendor: 'スーパーB',
      current_max_price: 160,
      lowest_price: 140,
      price_difference: 20,
      monthly_quantity: 10,
      item_savings_amount: 200,
    });

    expect(savings_report.savings_by_item[1]).toEqual({
      item_id: 'item_002',
      item_name: '鶏肉',
      recommended_vendor: 'スーパーC',
      current_max_price: 950,
      lowest_price: 800,
      price_difference: 150,
      monthly_quantity: 5,
      item_savings_amount: 750,
    });

    expect(savings_report.savings_by_item[2]).toEqual({
      item_id: 'item_003',
      item_name: '玉ねぎ',
      recommended_vendor: 'スーパーB',
      current_max_price: 90,
      lowest_price: 75,
      price_difference: 15,
      monthly_quantity: 15,
      item_savings_amount: 225,
    });

    // 推奨購入先が正確に集計されているか検証
    expect(savings_report.vendor_recommendations).toHaveLength(2);

    const vendor_b_rec = savings_report.vendor_recommendations.find(
      (v) => v.vendor_name === 'スーパーB',
    );
    expect(vendor_b_rec).toBeDefined();
    expect(vendor_b_rec?.recommended_items).toEqual(['item_001', 'item_003']);
    expect(vendor_b_rec?.item_names).toEqual(['トマト', '玉ねぎ']);

    const vendor_c_rec = savings_report.vendor_recommendations.find(
      (v) => v.vendor_name === 'スーパーC',
    );
    expect(vendor_c_rec).toBeDefined();
    expect(vendor_c_rec?.recommended_items).toEqual(['item_002']);
    expect(vendor_c_rec?.item_names).toEqual(['鶏肉']);
  });
});