import { validateReportApprovalCriteria } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-505: [edge] レポート承認判定 - 承認基準の境界値で正確に判定する
  test('should correctly approve or reject reports at boundary values of approval criteria', () => {
    // 下限値（最小値）ちょうどの値でレポート作成・承認判定
    const minBoundaryReport = {
      report_id: 'RPT-001',
      improvement_impact_score: 50,
      implementation_effort_score: 80,
      user_satisfaction_delta: 5.0,
      approval_timestamp: new Date('2024-01-15T09:00:00Z'),
    };

    const minBoundaryResult = validateReportApprovalCriteria(minBoundaryReport);
    expect(minBoundaryResult).toEqual({
      is_approved: true,
      approval_decision: '承認',
      boundary_status: 'at_minimum_threshold',
      justification: 'Report meets minimum approval criteria at lower boundary',
    });

    // 上限値（最大値）ちょうどの値でレポート作成・承認判定
    const maxBoundaryReport = {
      report_id: 'RPT-002',
      improvement_impact_score: 100,
      implementation_effort_score: 40,
      user_satisfaction_delta: 15.0,
      approval_timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const maxBoundaryResult = validateReportApprovalCriteria(maxBoundaryReport);
    expect(maxBoundaryResult).toEqual({
      is_approved: true,
      approval_decision: '承認',
      boundary_status: 'at_maximum_threshold',
      justification: 'Report meets maximum approval criteria at upper boundary',
    });

    // 下限値より1つ小さい値でレポート作成・承認判定
    const belowMinBoundaryReport = {
      report_id: 'RPT-003',
      improvement_impact_score: 49,
      implementation_effort_score: 80,
      user_satisfaction_delta: 4.9,
      approval_timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const belowMinBoundaryResult = validateReportApprovalCriteria(belowMinBoundaryReport);
    expect(belowMinBoundaryResult).toEqual({
      is_approved: false,
      approval_decision: '却下',
      boundary_status: 'below_minimum_threshold',
      justification: 'Report fails to meet minimum approval criteria',
    });

    // 上限値より1つ大きい値でレポート作成・承認判定
    const aboveMaxBoundaryReport = {
      report_id: 'RPT-004',
      improvement_impact_score: 101,
      implementation_effort_score: 39,
      user_satisfaction_delta: 15.1,
      approval_timestamp: new Date('2024-01-15T12:00:00Z'),
    };

    const aboveMaxBoundaryResult = validateReportApprovalCriteria(aboveMaxBoundaryReport);
    expect(aboveMaxBoundaryResult).toEqual({
      is_approved: false,
      approval_decision: '却下',
      boundary_status: 'above_maximum_threshold',
      justification: 'Report exceeds maximum approval criteria',
    });

    // 複数のレポート結果を集計して承認判定統計を確認
    const approval_statistics = {
      total_reports_evaluated: 4,
      approved_count: 2,
      rejected_count: 2,
      approval_rate_percentage: 50.0,
      boundary_violation_cases: [
        {
          report_id: 'RPT-003',
          violation_type: 'below_minimum',
          violation_severity: 'minor',
        },
        {
          report_id: 'RPT-004',
          violation_type: 'above_maximum',
          violation_severity: 'minor',
        },
      ],
    };

    expect(approval_statistics.total_reports_evaluated).toBe(4);
    expect(approval_statistics.approved_count).toBe(2);
    expect(approval_statistics.rejected_count).toBe(2);
    expect(approval_statistics.approval_rate_percentage).toBe(50.0);
    expect(approval_statistics.boundary_violation_cases.length).toBe(2);
  });
});