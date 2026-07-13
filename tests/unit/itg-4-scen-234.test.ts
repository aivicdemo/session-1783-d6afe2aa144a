import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  generateDemandPatternReport,
} from '../../src/logic/it-3-br-6-3-3';

const fetchMock = require('jest-fetch-mock');

describe('予測精度低下要因の可視化ダッシュボード', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-234
  test('[normal] 需要パターン定量化レポート生成機能 - 季節変動・曜日別・食材カテゴリ別の購買傾向が数値化されてレポートに含まれる', async () => {
    const reportRequest = {
      user_id: 'user_001',
      analysis_period_months: 12,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      analysis_targets: [
        'seasonal_variation',
        'day_of_week_pattern',
        'food_category_trend',
      ],
      export_formats: ['pdf', 'csv'],
    };

    const mockReportData = {
      report_id: 'report_20240115_001',
      user_id: 'user_001',
      generated_at: '2024-01-15T11:00:00Z',
      analysis_period: {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        months: 12,
      },
      seasonal_variation: {
        q1_purchase_volume: 4200,
        q1_yoy_change_rate: 8.5,
        q1_seasonal_index: 0.92,
        q2_purchase_volume: 5100,
        q2_yoy_change_rate: 12.3,
        q2_seasonal_index: 1.05,
        q3_purchase_volume: 4800,
        q3_yoy_change_rate: 5.7,
        q3_seasonal_index: 0.98,
        q4_purchase_volume: 6200,
        q4_yoy_change_rate: 15.2,
        q4_seasonal_index: 1.18,
      },
      day_of_week_pattern: {
        monday: {
          average_purchase_amount: 3200,
          standard_deviation: 450,
          purchase_count: 52,
        },
        tuesday: {
          average_purchase_amount: 3100,
          standard_deviation: 420,
          purchase_count: 52,
        },
        wednesday: {
          average_purchase_amount: 2950,
          standard_deviation: 380,
          purchase_count: 52,
        },
        thursday: {
          average_purchase_amount: 3050,
          standard_deviation: 400,
          purchase_count: 52,
        },
        friday: {
          average_purchase_amount: 3400,
          standard_deviation: 520,
          purchase_count: 52,
        },
        saturday: {
          average_purchase_amount: 4100,
          standard_deviation: 650,
          purchase_count: 52,
        },
        sunday: {
          average_purchase_amount: 3800,
          standard_deviation: 580,
          purchase_count: 52,
        },
      },
      food_category_trend: {
        vegetables: {
          purchase_amount: 18500,
          purchase_quantity: 2840,
          composition_ratio: 0.22,
        },
        meat: {
          purchase_amount: 22400,
          purchase_quantity: 1420,
          composition_ratio: 0.27,
        },
        seafood: {
          purchase_amount: 19200,
          purchase_quantity: 960,
          composition_ratio: 0.23,
        },
        dairy: {
          purchase_amount: 12800,
          purchase_quantity: 3200,
          composition_ratio: 0.15,
        },
        grains: {
          purchase_amount: 10300,
          purchase_quantity: 2060,
          composition_ratio: 0.13,
        },
      },
      visualization_charts: {
        seasonal_variation_chart: {
          chart_type: 'line',
          title: '季節変動トレンド',
          x_axis: ['Q1', 'Q2', 'Q3', 'Q4'],
          y_axis_values: [4200, 5100, 4800, 6200],
        },
        day_of_week_chart: {
          chart_type: 'bar',
          title: '曜日別平均購買量',
          x_axis: [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun',
          ],
          y_axis_values: [3200, 3100, 2950, 3050, 3400, 4100, 3800],
        },
        category_chart: {
          chart_type: 'pie',
          title: '食材カテゴリ別構成比',
          categories: [
            'vegetables',
            'meat',
            'seafood',
            'dairy',
            'grains',
          ],
          values: [0.22, 0.27, 0.23, 0.15, 0.13],
        },
      },
      export_urls: {
        pdf: 'https://example.com/reports/report_20240115_001.pdf',
        csv: 'https://example.com/reports/report_20240115_001.csv',
      },
      status: 'completed',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockReportData), {
      status: 200,
    });

    const result = await generateDemandPatternReport(reportRequest);

    expect(result.report_id).toBe('report_20240115_001');
    expect(result.user_id).toBe('user_001');
    expect(result.status).toBe('completed');

    expect(result.seasonal_variation.q1_purchase_volume).toBe(4200);
    expect(result.seasonal_variation.q1_yoy_change_rate).toBe(8.5);
    expect(result.seasonal_variation.q1_seasonal_index).toBe(0.92);
    expect(result.seasonal_variation.q2_purchase_volume).toBe(5100);
    expect(result.seasonal_variation.q2_yoy_change_rate).toBe(12.3);
    expect(result.seasonal_variation.q2_seasonal_index).toBe(1.05);
    expect(result.seasonal_variation.q3_purchase_volume).toBe(4800);
    expect(result.seasonal_variation.q3_yoy_change_rate).toBe(5.7);
    expect(result.seasonal_variation.q3_seasonal_index).toBe(0.98);
    expect(result.seasonal_variation.q4_purchase_volume).toBe(6200);
    expect(result.seasonal_variation.q4_yoy_change_rate).toBe(15.2);
    expect(result.seasonal_variation.q4_seasonal_index).toBe(1.18);

    expect(result.day_of_week_pattern.monday.average_purchase_amount).toBe(
      3200
    );
    expect(result.day_of_week_pattern.monday.standard_deviation).toBe(450);
    expect(result.day_of_week_pattern.monday.purchase_count).toBe(52);
    expect(result.day_of_week_pattern.tuesday.average_purchase_amount).toBe(
      3100
    );
    expect(result.day_of_week_pattern.tuesday.standard_deviation).toBe(420);
    expect(result.day_of_week_pattern.wednesday.average_purchase_amount).toBe(
      2950
    );
    expect(result.day_of_week_pattern.thursday.average_purchase_amount).toBe(
      3050
    );
    expect(result.day_of_week_pattern.friday.average_purchase_amount).toBe(
      3400
    );
    expect(result.day_of_week_pattern.saturday.average_purchase_amount).toBe(
      4100
    );
    expect(result.day_of_week_pattern.sunday.average_purchase_amount).toBe(
      3800
    );

    expect(result.food_category_trend.vegetables.purchase_amount).toBe(18500);
    expect(result.food_category_trend.vegetables.purchase_quantity).toBe(2840);
    expect(result.food_category_trend.vegetables.composition_ratio).toBe(0.22);

    expect(result.food_category_trend.meat.purchase_amount).toBe(22400);
    expect(result.food_category_trend.meat.purchase_quantity).toBe(1420);
    expect(result.food_category_trend.meat.composition_ratio).toBe(0.27);

    expect(result.food_category_trend.seafood.purchase_amount).toBe(19200);
    expect(result.food_category_trend.seafood.purchase_quantity).toBe(960);
    expect(result.food_category_trend.seafood.composition_ratio).toBe(0.23);

    expect(result.food_category_trend.dairy.purchase_amount).toBe(12800);
    expect(result.food_category_trend.dairy.purchase_quantity).toBe(3200);
    expect(result.food_category_trend.dairy.composition_ratio).toBe(0.15);

    expect(result.food_category_trend.grains.purchase_amount).toBe(10300);
    expect(result.food_category_trend.grains.purchase_quantity).toBe(2060);
    expect(result.food_category_trend.grains.composition_ratio).toBe(0.13);

    expect(result.visualization_charts.seasonal_variation_chart.chart_type).toBe(
      'line'
    );
    expect(result.visualization_charts.seasonal_variation_chart.title).toBe(
      '季節変動トレンド'
    );
    expect(
      result.visualization_charts.seasonal_variation_chart.y_axis_values
    ).toEqual([4200, 5100, 4800, 6200]);

    expect(result.visualization_charts.day_of_week_chart.chart_type).toBe(
      'bar'
    );
    expect(result.visualization_charts.day_of_week_chart.title).toBe(
      '曜日別平均購買量'
    );
    expect(
      result.visualization_charts.day_of_week_chart.y_axis_values
    ).toEqual([3200, 3100, 2950, 3050, 3400, 4100, 3800]);

    expect(result.visualization_charts.category_chart.chart_type).toBe('pie');
    expect(result.visualization_charts.category_chart.title).toBe(
      '食材カテゴリ別構成比'
    );
    expect(result.visualization_charts.category_chart.values).toEqual([
      0.22, 0.27, 0.23, 0.15, 0.13,
    ]);

    expect(result.export_urls.pdf).toBe(
      'https://example.com/reports/report_20240115_001.pdf'
    );
    expect(result.export_urls.csv).toBe(
      'https://example.com/reports/report_20240115_001.csv'
    );

    expect(result.analysis_period.start_date).toBe('2023-01-01');
    expect(result.analysis_period.end_date).toBe('2023-12-31');
    expect(result.analysis_period.months).toBe(12);
  });
});