import { generateQuarterlyAnalysisSchedule } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出・可視化機能', () => {
  // SCEN-382
  test('前四半期の分析成果物が確定していない場合、アラート通知が発生する', () => {
    const input = {
      current_quarter: '2024-Q1',
      previous_quarter_completion_status: false,
      analysis_phase_definitions: [
        {
          phase_id: 'P1',
          phase_name: 'セグメント分類基準定義',
          start_date: '2024-01-01',
          end_date: '2024-01-15',
          deliverable: 'セグメント分類基準',
          sla_days: 14,
        },
        {
          phase_id: 'P2',
          phase_name: 'セグメント別利用パターン抽出・集計',
          start_date: '2024-01-16',
          end_date: '2024-02-15',
          deliverable: 'セグメント別利用データ集計結果',
          sla_days: 30,
        },
        {
          phase_id: 'P3',
          phase_name: '調理時間短縮実現度比較分析',
          start_date: '2024-02-16',
          end_date: '2024-03-15',
          deliverable: '調理時間短縮実現度分析レポート',
          sla_days: 28,
        },
      ],
    };

    expect(() => {
      generateQuarterlyAnalysisSchedule(input);
    }).toThrow(/前四半期の分析成果物が確定していません/);
  });

  test('前四半期の分析成果物が確定している場合、スケジュール生成が成功する', () => {
    const input = {
      current_quarter: '2024-Q1',
      previous_quarter_completion_status: true,
      analysis_phase_definitions: [
        {
          phase_id: 'P1',
          phase_name: 'セグメント分類基準定義',
          start_date: '2024-01-01',
          end_date: '2024-01-15',
          deliverable: 'セグメント分類基準',
          sla_days: 14,
        },
        {
          phase_id: 'P2',
          phase_name: 'セグメント別利用パターン抽出・集計',
          start_date: '2024-01-16',
          end_date: '2024-02-15',
          deliverable: 'セグメント別利用データ集計結果',
          sla_days: 30,
        },
      ],
    };

    const result = generateQuarterlyAnalysisSchedule(input);

    expect(result).toEqual({
      schedule_id: expect.any(String),
      quarter: '2024-Q1',
      status: 'generated',
      phases: expect.arrayContaining([
        expect.objectContaining({
          phase_id: 'P1',
          phase_name: 'セグメント分類基準定義',
          start_date: '2024-01-01',
          end_date: '2024-01-15',
          sla_days: 14,
        }),
        expect.objectContaining({
          phase_id: 'P2',
          phase_name: 'セグメント別利用パターン抽出・集計',
          start_date: '2024-01-16',
          end_date: '2024-02-15',
          sla_days: 30,
        }),
      ]),
      generated_at: expect.any(String),
    });
  });
});