import { calculatePredictionAccuracy } from '../../src/logic/it-7-2-1';

describe('予測精度検証機能 - 精度率・乖離度・カテゴリ別誤差の算出', () => {
  // SCEN-749: [normal] 予測精度検証機能 - 予測値と実績値から精度率・乖離度・カテゴリ別誤差が正確に算出される
  test('予測値と実績値のペアから精度率・乖離度・カテゴリ別誤差を正確に算出し、ダッシュボード表示・エクスポート用データが一致する', () => {
    // テスト用のデータセット準備
    const predictionData = [
      {
        category: '野菜',
        predicted_quantity: 100,
        actual_quantity: 95,
        predicted_demand: 120,
        actual_demand: 118,
      },
      {
        category: '野菜',
        predicted_quantity: 80,
        actual_quantity: 85,
        predicted_demand: 95,
        actual_demand: 98,
      },
      {
        category: '肉類',
        predicted_quantity: 150,
        actual_quantity: 145,
        predicted_demand: 180,
        actual_demand: 175,
      },
      {
        category: '肉類',
        predicted_quantity: 120,
        actual_quantity: 130,
        predicted_demand: 140,
        actual_demand: 155,
      },
      {
        category: '乳製品',
        predicted_quantity: 60,
        actual_quantity: 62,
        predicted_demand: 70,
        actual_demand: 72,
      },
    ];

    // 期待値の計算
    // 精度率 = 1 - (平均絶対誤差 / 平均実績値) * 100
    // 野菜: |100-95|=5, |80-85|=5, 平均=5, 平均実績=(95+85)/2=90, 誤差率=(5/90)*100≈5.56%
    // 肉類: |150-145|=5, |120-130|=10, 平均=7.5, 平均実績=(145+130)/2=137.5, 誤差率=(7.5/137.5)*100≈5.45%
    // 乳製品: |60-62|=2, 平均=2, 平均実績=62, 誤差率=(2/62)*100≈3.23%
    // 全体: 全誤差=(5+5+5+10+2)=27, 全実績=(95+85+145+130+62)=517, 全誤差率=(27/517)*100≈5.22%
    // 精度率 = 100 - 5.22 = 94.78%

    // 乖離度（予測値と実績値の加重平均乖離）
    // 野菜（需要ベース）: |120-118|=2, |95-98|=3, 平均=2.5, 基準=(118+98)/2=108, 乖離率=(2.5/108)*100≈2.31%
    // 肉類（需要ベース）: |180-175|=5, |140-155|=15, 平均=10, 基準=(175+155)/2=165, 乖離率=(10/165)*100≈6.06%
    // 乳製品（需要ベース）: |70-72|=2, 基準=72, 乖離率=(2/72)*100≈2.78%
    // 全体乖離度: ((2+3+5+15+2)/(118+98+175+155+72))*100 = (27/618)*100 ≈ 4.37%

    // カテゴリ別誤差
    // 野菜: (5+5)/(90+0)*100 = 10/90 = 11.11%
    // 肉類: (5+10)/(137.5+0)*100 = 15/137.5 = 10.91%
    // 乳製品: (2)/(62)*100 = 2/62 = 3.23%

    const result = calculatePredictionAccuracy(predictionData);

    // 精度率の検証（3桁で丸める）
    expect(result.accuracy_rate).toBeCloseTo(94.78, 1);

    // 乖離度の検証（3桁で丸める）
    expect(result.deviation_rate).toBeCloseTo(4.37, 1);

    // カテゴリ別誤差の検証
    expect(result.category_errors).toEqual({
      野菜: expect.closeTo(11.11, 1),
      肉類: expect.closeTo(10.91, 1),
      乳製品: expect.closeTo(3.23, 1),
    });

    // ダッシュボード表示用オブジェクトの検証
    expect(result.dashboard_display).toEqual({
      accuracy_rate: expect.closeTo(94.78, 1),
      deviation_rate: expect.closeTo(4.37, 1),
      category_count: 3,
      total_records: 5,
      generated_at: expect.any(String),
    });

    // エクスポート用データの検証（ダッシュボード表示値と一致）
    expect(result.export_data).toEqual({
      accuracy_rate: expect.closeTo(94.78, 1),
      deviation_rate: expect.closeTo(4.37, 1),
      category_errors: {
        野菜: expect.closeTo(11.11, 1),
        肉類: expect.closeTo(10.91, 1),
        乳製品: expect.closeTo(3.23, 1),
      },
      timestamp: expect.any(String),
      data_source: '予測精度検証機能',
    });

    // ダッシュボード表示とエクスポートデータの値が一致していることを確認
    expect(result.dashboard_display.accuracy_rate).toBe(
      result.export_data.accuracy_rate
    );
    expect(result.dashboard_display.deviation_rate).toBe(
      result.export_data.deviation_rate
    );
  });
});