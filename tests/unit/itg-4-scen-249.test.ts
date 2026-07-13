import { detectSLADelayAndExecuteAlternativeProcess } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  // SCEN-249
  test("SLA遅延検知・代替処理機能 - 前のステップからの経過時間が不正な値の場合にエラーを返す", () => {
    // 正常な入力データ（基準値として使用）
    const valid_user_id = "user_001";
    const valid_analysis_period = "2024-01-01T00:00:00Z";
    const valid_sla_threshold_hours = 24;

    // ケース1: 経過時間が負の数の場合
    const elapsed_time_negative = -5;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_negative,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース2: 経過時間がNaNの場合
    const elapsed_time_nan = NaN;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_nan,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース3: 経過時間がnullの場合
    const elapsed_time_null = null as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_null,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース4: 経過時間がundefinedの場合
    const elapsed_time_undefined = undefined as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_undefined,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース5: 経過時間が文字列の場合
    const elapsed_time_string = "invalid_time" as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_string,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース6: 経過時間がInfinityの場合
    const elapsed_time_infinity = Infinity as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_infinity,
        valid_sla_threshold_hours
      )
    ).toThrow(/経過時間/);

    // ケース7: SLA閾値が負の数の場合
    const elapsed_time_valid = 12;
    const sla_threshold_negative = -5;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_valid,
        sla_threshold_negative
      )
    ).toThrow(/閾値/);

    // ケース8: SLA閾値がnullの場合
    const sla_threshold_null = null as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_valid,
        sla_threshold_null
      )
    ).toThrow(/閾値/);

    // ケース9: SLA閾値がundefinedの場合
    const sla_threshold_undefined = undefined as any;
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        valid_analysis_period,
        elapsed_time_valid,
        sla_threshold_undefined
      )
    ).toThrow(/閾値/);

    // ケース10: ユーザーIDが空文字列の場合
    const user_id_empty = "";
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        user_id_empty,
        valid_analysis_period,
        elapsed_time_valid,
        valid_sla_threshold_hours
      )
    ).toThrow(/ユーザー/);

    // ケース11: 分析期間が無効な日時フォーマットの場合
    const invalid_analysis_period = "invalid-date";
    expect(() =>
      detectSLADelayAndExecuteAlternativeProcess(
        valid_user_id,
        invalid_analysis_period,
        elapsed_time_valid,
        valid_sla_threshold_hours
      )
    ).toThrow(/分析期間/);

    // ケース12: 正常な入力で処理が成功する場合（SLA以内）
    const elapsed_time_within_sla = 12;
    const result_within_sla = detectSLADelayAndExecuteAlternativeProcess(
      valid_user_id,
      valid_analysis_period,
      elapsed_time_within_sla,
      valid_sla_threshold_hours
    );
    expect(result_within_sla).toEqual({
      is_sla_exceeded: false,
      elapsed_time_hours: 12,
      sla_threshold_hours: 24,
      alternative_process_triggered: false,
      status: "normal",
    });

    // ケース13: 正常な入力で処理が成功する場合（SLA超過）
    const elapsed_time_exceeds_sla = 30;
    const result_exceeds_sla = detectSLADelayAndExecuteAlternativeProcess(
      valid_user_id,
      valid_analysis_period,
      elapsed_time_exceeds_sla,
      valid_sla_threshold_hours
    );
    expect(result_exceeds_sla).toEqual({
      is_sla_exceeded: true,
      elapsed_time_hours: 30,
      sla_threshold_hours: 24,
      alternative_process_triggered: true,
      status: "sla_exceeded_with_alternative",
    });

    // ケース14: SLA閾値と経過時間が等しい場合（境界値）
    const elapsed_time_equal_sla = 24;
    const result_equal_sla = detectSLADelayAndExecuteAlternativeProcess(
      valid_user_id,
      valid_analysis_period,
      elapsed_time_equal_sla,
      valid_sla_threshold_hours
    );
    expect(result_equal_sla).toEqual({
      is_sla_exceeded: false,
      elapsed_time_hours: 24,
      sla_threshold_hours: 24,
      alternative_process_triggered: false,
      status: "normal",
    });
  });
});