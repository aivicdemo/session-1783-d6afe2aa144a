import { generateQuarterlyAnalysisScheduleWithSLA } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出・可視化機能', () => {
  // SCEN-380: [normal] 四半期分析スケジュール・SLA定義生成
  test('should generate quarterly analysis schedule with SLA definitions for all phases with correct execution periods and final deadline within quarter', () => {
    const quarter_start_date = new Date('2024-01-01T00:00:00Z');
    const quarter_end_date = new Date('2024-03-31T23:59:59Z');

    const analysis_phases = [
      {
        phase_id: 'req_definition',
        phase_name: '要件定義',
        duration_days: 5,
        sla_processing_time_minutes: 120,
        sla_accuracy_percentage: 95,
        sla_availability_percentage: 99.5
      },
      {
        phase_id: 'data_collection',
        phase_name: 'データ収集',
        duration_days: 15,
        sla_processing_time_minutes: 480,
        sla_accuracy_percentage: 98,
        sla_availability_percentage: 99.8
      },
      {
        phase_id: 'analysis_execution',
        phase_name: '分析実行',
        duration_days: 20,
        sla_processing_time_minutes: 1440,
        sla_accuracy_percentage: 99,
        sla_availability_percentage: 99.9
      },
      {
        phase_id: 'report_creation',
        phase_name: 'レポート作成',
        duration_days: 10,
        sla_processing_time_minutes: 360,
        sla_accuracy_percentage: 97,
        sla_availability_percentage: 99.7
      }
    ];

    const result = generateQuarterlyAnalysisScheduleWithSLA({
      quarter_start_date,
      quarter_end_date,
      analysis_phases
    });

    // Verify that result contains schedule information
    expect(result).toHaveProperty('schedule_phases');
    expect(Array.isArray(result.schedule_phases)).toBe(true);
    expect(result.schedule_phases.length).toBe(4);

    // Verify Phase 1: 要件定義 (5 days)
    const phase_1 = result.schedule_phases[0];
    expect(phase_1.phase_id).toBe('req_definition');
    expect(phase_1.phase_name).toBe('要件定義');
    expect(phase_1.start_date).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(phase_1.end_date).toEqual(new Date('2024-01-05T23:59:59Z'));
    expect(phase_1.planned_duration_days).toBe(5);

    // Verify Phase 2: データ収集 (15 days)
    const phase_2 = result.schedule_phases[1];
    expect(phase_2.phase_id).toBe('data_collection');
    expect(phase_2.phase_name).toBe('データ収集');
    expect(phase_2.start_date).toEqual(new Date('2024-01-06T00:00:00Z'));
    expect(phase_2.end_date).toEqual(new Date('2024-01-20T23:59:59Z'));
    expect(phase_2.planned_duration_days).toBe(15);

    // Verify Phase 3: 分析実行 (20 days)
    const phase_3 = result.schedule_phases[2];
    expect(phase_3.phase_id).toBe('analysis_execution');
    expect(phase_3.phase_name).toBe('分析実行');
    expect(phase_3.start_date).toEqual(new Date('2024-01-21T00:00:00Z'));
    expect(phase_3.end_date).toEqual(new Date('2024-02-09T23:59:59Z'));
    expect(phase_3.planned_duration_days).toBe(20);

    // Verify Phase 4: レポート作成 (10 days)
    const phase_4 = result.schedule_phases[3];
    expect(phase_4.phase_id).toBe('report_creation');
    expect(phase_4.phase_name).toBe('レポート作成');
    expect(phase_4.start_date).toEqual(new Date('2024-02-10T00:00:00Z'));
    expect(phase_4.end_date).toEqual(new Date('2024-02-19T23:59:59Z'));
    expect(phase_4.planned_duration_days).toBe(10);

    // Verify total planned duration is 50 days (5 + 15 + 20 + 10)
    const total_duration = result.schedule_phases.reduce(
      (sum, phase) => sum + phase.planned_duration_days,
      0
    );
    expect(total_duration).toBe(50);

    // Verify final deadline
    expect(result).toHaveProperty('final_deadline_date');
    expect(result.final_deadline_date).toEqual(new Date('2024-02-19T23:59:59Z'));

    // Verify final deadline is within quarter
    expect(result.final_deadline_date.getTime()).toBeLessThanOrEqual(quarter_end_date.getTime());

    // Verify SLA definitions for each phase
    expect(result).toHaveProperty('sla_definitions');
    expect(Array.isArray(result.sla_definitions)).toBe(true);
    expect(result.sla_definitions.length).toBe(4);

    // Verify SLA for Phase 1: 要件定義
    const sla_phase_1 = result.sla_definitions[0];
    expect(sla_phase_1.phase_id).toBe('req_definition');
    expect(sla_phase_1.sla_processing_time_minutes).toBe(120);
    expect(sla_phase_1.sla_accuracy_percentage).toBe(95);
    expect(sla_phase_1.sla_availability_percentage).toBe(99.5);

    // Verify SLA for Phase 2: データ収集
    const sla_phase_2 = result.sla_definitions[1];
    expect(sla_phase_2.phase_id).toBe('data_collection');
    expect(sla_phase_2.sla_processing_time_minutes).toBe(480);
    expect(sla_phase_2.sla_accuracy_percentage).toBe(98);
    expect(sla_phase_2.sla_availability_percentage).toBe(99.8);

    // Verify SLA for Phase 3: 分析実行
    const sla_phase_3 = result.sla_definitions[2];
    expect(sla_phase_3.phase_id).toBe('analysis_execution');
    expect(sla_phase_3.sla_processing_time_minutes).toBe(1440);
    expect(sla_phase_3.sla_accuracy_percentage).toBe(99);
    expect(sla_phase_3.sla_availability_percentage).toBe(99.9);

    // Verify SLA for Phase 4: レポート作成
    const sla_phase_4 = result.sla_definitions[3];
    expect(sla_phase_4.phase_id).toBe('report_creation');
    expect(sla_phase_4.sla_processing_time_minutes).toBe(360);
    expect(sla_phase_4.sla_accuracy_percentage).toBe(97);
    expect(sla_phase_4.sla_availability_percentage).toBe(99.7);

    // Verify all SLA accuracy percentages meet or exceed industry standard minimum of 95%
    result.sla_definitions.forEach((sla) => {
      expect(sla.sla_accuracy_percentage).toBeGreaterThanOrEqual(95);
    });

    // Verify all SLA availability percentages meet or exceed industry standard minimum of 99%
    result.sla_definitions.forEach((sla) => {
      expect(sla.sla_availability_percentage).toBeGreaterThanOrEqual(99);
    });

    // Verify schedule consistency across different quarter patterns
    expect(result).toHaveProperty('schedule_consistency_verified');
    expect(result.schedule_consistency_verified).toBe(true);

    // Verify CSV export format capability
    expect(result).toHaveProperty('csv_export_available');
    expect(result.csv_export_available).toBe(true);

    // Verify CSV content contains all schedule and SLA data
    if (result.csv_export_data) {
      expect(typeof result.csv_export_data).toBe('string');
      expect(result.csv_export_data).toContain('phase_id');
      expect(result.csv_export_data).toContain('phase_name');
      expect(result.csv_export_data).toContain('start_date');
      expect(result.csv_export_data).toContain('end_date');
      expect(result.csv_export_data).toContain('sla_processing_time_minutes');
      expect(result.csv_export_data).toContain('sla_accuracy_percentage');
      expect(result.csv_export_data).toContain('sla_availability_percentage');
      expect(result.csv_export_data).toContain('req_definition');
      expect(result.csv_export_data).toContain('data_collection');
      expect(result.csv_export_data).toContain('analysis_execution');
      expect(result.csv_export_data).toContain('report_creation');
    }

    // Verify boundary condition: all phases completed within quarter
    const latest_phase_end = result.schedule_phases.reduce((latest, phase) => {
      return phase.end_date.getTime() > latest.getTime() ? phase.end_date : latest;
    }, new Date('2000-01-01'));

    expect(latest_phase_end.getTime()).toBeLessThanOrEqual(quarter_end_date.getTime());

    // Verify no phase overlap
    for (let i = 0; i < result.schedule_phases.length - 1; i++) {
      const current_end = result.schedule_phases[i].end_date.getTime();
      const next_start = result.schedule_phases[i + 1].start_date.getTime();
      expect(next_start).toBeGreaterThan(current_end);
    }

    // Verify result contains validation status
    expect(result).toHaveProperty('validation_status');
    expect(result.validation_status).toBe('valid');
  });
});