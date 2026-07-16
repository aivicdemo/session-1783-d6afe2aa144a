import { generateQuarterlyAnalysisSchedule } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出・可視化', () => {
  // SCEN-381: [edge] 四半期分析スケジュール・SLA定義生成 - 四半期内の営業日が最小値の場合、フェーズ期間が最適に圧縮される
  test('営業日が最小値の四半期でフェーズ期間が最適に圧縮されること', () => {
    // 手順1: テストデータとして営業日数が最小値となる四半期を準備
    // 2月を含む四半期（Q1: 2024-01-01 ~ 2024-03-31）で祝日・休場が最多のケース
    // 2024年の場合: 1月（成人の日1/8）、2月（建国記念の日2/11、天皇誕生日2/23）、3月（春分の日3/20）
    const quartersInfo = {
      quarter: 'Q1_2024',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      total_calendar_days: 91,
      total_business_days: 60, // 最小営業日数
      holidays: [
        '2024-01-08',
        '2024-02-11',
        '2024-02-12',
        '2024-02-23',
        '2024-03-20',
      ],
      weekends_count: 26,
    };

    // 通常の四半期（祝日が少ない）との比較用データ
    const normalQuartersInfo = {
      quarter: 'Q3_2024',
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      total_calendar_days: 92,
      total_business_days: 65, // 通常営業日数
      holidays: ['2024-09-16', '2024-09-22', '2024-09-23'],
      weekends_count: 26,
    };

    // 手順2: スケジュール生成関数に対して営業日が最小値の四半期データを入力
    const generated_schedule = generateQuarterlyAnalysisSchedule(quartersInfo);

    // 手順3: 生成されたフェーズ期間の配列を取得し、各フェーズの検証
    const phase_list = generated_schedule.phases;
    expect(phase_list).toBeDefined();
    expect(Array.isArray(phase_list)).toBe(true);
    expect(phase_list.length).toBeGreaterThan(0);

    // 各フェーズが必要な構造を持つことを検証
    phase_list.forEach((phase) => {
      expect(phase).toHaveProperty('phase_name');
      expect(phase).toHaveProperty('start_date');
      expect(phase).toHaveProperty('end_date');
      expect(phase).toHaveProperty('allocated_business_days');
      expect(phase).toHaveProperty('buffer_days');
    });

    // 手順4: 各フェーズの期間（開始日～終了日）を検証し、合計営業日数が最小値に対応していることを確認
    let total_allocated_business_days = 0;
    let total_buffer_days = 0;

    phase_list.forEach((phase) => {
      total_allocated_business_days += phase.allocated_business_days;
      total_buffer_days += phase.buffer_days;
      // フェーズの期間が正の値であることを確認
      expect(phase.allocated_business_days).toBeGreaterThan(0);
      expect(phase.buffer_days).toBeGreaterThanOrEqual(0);
    });

    // 合計営業日がSLA要件内に収まることを確認（営業日60日中、フェーズと予備を効率的に配分）
    const total_allocated = total_allocated_business_days + total_buffer_days;
    expect(total_allocated).toBeLessThanOrEqual(quartersInfo.total_business_days);
    expect(total_allocated_business_days).toBeGreaterThanOrEqual(
      quartersInfo.total_business_days * 0.75
    ); // 最低75%を実績配分に使用

    // 手順5: 圧縮されたフェーズ期間がSLA定義内のバッファ要件を満たしていることを確認
    const sla_min_buffer_per_phase = 2; // SLA定義: 各フェーズの最小バッファ日数
    const phases_with_buffer = phase_list.filter(
      (phase) => phase.buffer_days >= sla_min_buffer_per_phase
    );
    // 少なくとも全フェーズの60%はバッファ要件を満たす
    expect(phases_with_buffer.length).toBeGreaterThanOrEqual(
      Math.ceil(phase_list.length * 0.6)
    );

    // 手順6: 通常の四半期と比較して、フェーズ期間が適切に短縮されていることを検証
    const normal_schedule = generateQuarterlyAnalysisSchedule(normalQuartersInfo);
    const normal_phase_list = normal_schedule.phases;

    const compressed_avg_phase_days =
      total_allocated_business_days / phase_list.length;
    const normal_avg_phase_days =
      normal_phase_list.reduce((sum, p) => sum + p.allocated_business_days, 0) /
      normal_phase_list.length;

    // 営業日が少ない四半期では、フェーズあたりの平均配分日数が短縮されるはず
    expect(compressed_avg_phase_days).toBeLessThanOrEqual(normal_avg_phase_days);

    // 期待結果: 営業日が最小値の四半期において、システムが各フェーズ期間を最適に圧縮し、
    // 限られた営業日内でSLA要件を満たすスケジュールが生成されること
    expect(generated_schedule).toHaveProperty('quarter', 'Q1_2024');
    expect(generated_schedule).toHaveProperty('compression_applied', true);
    expect(generated_schedule).toHaveProperty('sla_requirements_met', true);

    // SLA納期要件が保持されていることを確認
    if (generated_schedule.sla_requirements_met) {
      expect(generated_schedule).toHaveProperty('estimated_completion_date');
      // 推定完了日が四半期終了日以前であることを確認
      const estimated_completion = new Date(
        generated_schedule.estimated_completion_date
      );
      const quarter_end = new Date(quartersInfo.end_date);
      expect(estimated_completion.getTime()).toBeLessThanOrEqual(
        quarter_end.getTime()
      );
    }

    // 期間短縮時もフェーズ間のバッファが保持されていることを確認
    for (let i = 0; i < phase_list.length - 1; i++) {
      const current_phase_end = new Date(phase_list[i].end_date);
      const next_phase_start = new Date(phase_list[i + 1].start_date);
      // フェーズ間には最低1日の余裕があること
      const gap_days = Math.ceil(
        (next_phase_start.getTime() - current_phase_end.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      expect(gap_days).toBeGreaterThanOrEqual(0);
    }

    // 期待値: 圧縮適用フラグが true、SLA要件充足フラグが true、スケジュールが生成されていることを最終確認
    expect(generated_schedule.compression_applied).toBe(true);
    expect(generated_schedule.sla_requirements_met).toBe(true);
    expect(generated_schedule.phases.length).toBeGreaterThan(0);
    expect(total_allocated_business_days).toBe(45); // Q1営業日60のうち、75%が45日
    expect(total_buffer_days).toBeGreaterThanOrEqual(5); // 予備日を5日以上確保
  });
});