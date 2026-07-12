import { detectRegressionAndBlockDeploy } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-429
  test('回帰テスト自動実行機能 - 精度低下が検出された場合、エラーを返してデプロイを中止する', () => {
    const baseline_accuracy_percent = 85;
    const current_accuracy_percent = 78;
    const accuracy_threshold_percent = 5;

    const test_result_input = {
      baseline_accuracy_percent,
      current_accuracy_percent,
      accuracy_threshold_percent,
    };

    // エラーケース：精度がベースラインより指定閾値以上低下した場合
    expect(() =>
      detectRegressionAndBlockDeploy(test_result_input)
    ).toThrow(/精度低下/);

    // ハッピーパス：精度低下が許容範囲内の場合
    const input_within_threshold = {
      baseline_accuracy_percent: 85,
      current_accuracy_percent: 82,
      accuracy_threshold_percent: 5,
    };

    const result = detectRegressionAndBlockDeploy(input_within_threshold);
    expect(result).toEqual({
      can_deploy: true,
      regression_detected: false,
      accuracy_drop_percent: 3,
    });

    // ハッピーパス：精度が向上した場合
    const input_improved = {
      baseline_accuracy_percent: 85,
      current_accuracy_percent: 92,
      accuracy_threshold_percent: 5,
    };

    const result_improved = detectRegressionAndBlockDeploy(input_improved);
    expect(result_improved).toEqual({
      can_deploy: true,
      regression_detected: false,
      accuracy_drop_percent: -7,
    });

    // エラーケース：精度がベースラインと同等だが閾値ちょうどで低下した場合
    const input_boundary = {
      baseline_accuracy_percent: 85,
      current_accuracy_percent: 80,
      accuracy_threshold_percent: 5,
    };

    expect(() =>
      detectRegressionAndBlockDeploy(input_boundary)
    ).toThrow(/精度低下/);

    // ハッピーパス：閾値の直下で低下した場合（許容範囲）
    const input_just_below_boundary = {
      baseline_accuracy_percent: 85,
      current_accuracy_percent: 80.5,
      accuracy_threshold_percent: 5,
    };

    const result_just_below = detectRegressionAndBlockDeploy(
      input_just_below_boundary
    );
    expect(result_just_below).toEqual({
      can_deploy: true,
      regression_detected: false,
      accuracy_drop_percent: 4.5,
    });
  });
});