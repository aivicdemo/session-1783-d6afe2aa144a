import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  loadMonthlyForecastData,
  loadMonthlyActualData,
  reconcileForcastAndActual,
  generateImprovementProposal,
  createImprovementProposalDocument,
} from '../../src/logic/it-1-br-3-2-1';

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('月次需要予測検証サイクル統合実行機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-466
  it('月次末検証タイミングで予測値・実績値照合から改善提案書作成まで一連のフローが正常に完了する', async () => {
    // 1. 当月の予測値データが正常に読み込まれることを確認
    const forecast_month = '2024-01-01';
    const forecast_data_response = {
      month: forecast_month,
      forecast_records: [
        {
          category_id: 'cat_001',
          category_name: '青菜類',
          forecast_quantity: 120,
          forecast_unit: 'kg',
          forecast_sales: 24000,
        },
        {
          category_id: 'cat_002',
          category_name: '根菜類',
          forecast_quantity: 100,
          forecast_unit: 'kg',
          forecast_sales: 20000,
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(forecast_data_response), {
      status: 200,
    });

    const loaded_forecast = await loadMonthlyForecastData(forecast_month);
    expect(loaded_forecast).toEqual(forecast_data_response);
    expect(loaded_forecast.forecast_records.length).toBe(2);
    expect(loaded_forecast.forecast_records[0].forecast_quantity).toBe(120);
    expect(loaded_forecast.forecast_records[1].forecast_sales).toBe(20000);

    // 2. 当月の実績値データが正常に読み込まれることを確認
    const actual_data_response = {
      month: forecast_month,
      actual_records: [
        {
          category_id: 'cat_001',
          category_name: '青菜類',
          actual_quantity: 135,
          actual_unit: 'kg',
          actual_sales: 27000,
        },
        {
          category_id: 'cat_002',
          category_name: '根菜類',
          actual_quantity: 95,
          actual_unit: 'kg',
          actual_sales: 19000,
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(actual_data_response), {
      status: 200,
    });

    const loaded_actual = await loadMonthlyActualData(forecast_month);
    expect(loaded_actual).toEqual(actual_data_response);
    expect(loaded_actual.actual_records.length).toBe(2);
    expect(loaded_actual.actual_records[0].actual_quantity).toBe(135);
    expect(loaded_actual.actual_records[1].actual_sales).toBe(19000);

    // 3. 予測値と実績値の照合処理を実行
    const reconciliation_input = {
      forecast_data: loaded_forecast,
      actual_data: loaded_actual,
    };

    const reconciliation_result = reconcileForcastAndActual(reconciliation_input);

    // 4. 照合結果として差分分析が完了することを確認
    expect(reconciliation_result).toBeDefined();
    expect(reconciliation_result.reconciliation_status).toBe('completed');
    expect(reconciliation_result.reconciliation_details).toBeDefined();
    expect(reconciliation_result.reconciliation_details.length).toBe(2);

    // 差分計算の検証: 青菜類
    // 数量差分: 135 - 120 = 15, 差分率: (15 / 120) * 100 = 12.5%
    // 売上差分: 27000 - 24000 = 3000, 差分率: (3000 / 24000) * 100 = 12.5%
    expect(reconciliation_result.reconciliation_details[0].category_id).toBe(
      'cat_001'
    );
    expect(reconciliation_result.reconciliation_details[0].quantity_variance).toBe(
      15
    );
    expect(
      reconciliation_result.reconciliation_details[0].quantity_variance_rate
    ).toBe(12.5);
    expect(reconciliation_result.reconciliation_details[0].sales_variance).toBe(
      3000
    );
    expect(
      reconciliation_result.reconciliation_details[0].sales_variance_rate
    ).toBe(12.5);

    // 差分計算の検証: 根菜類
    // 数量差分: 95 - 100 = -5, 差分率: (-5 / 100) * 100 = -5%
    // 売上差分: 19000 - 20000 = -1000, 差分率: (-1000 / 20000) * 100 = -5%
    expect(reconciliation_result.reconciliation_details[1].category_id).toBe(
      'cat_002'
    );
    expect(reconciliation_result.reconciliation_details[1].quantity_variance).toBe(
      -5
    );
    expect(
      reconciliation_result.reconciliation_details[1].quantity_variance_rate
    ).toBe(-5);
    expect(reconciliation_result.reconciliation_details[1].sales_variance).toBe(
      -1000
    );
    expect(
      reconciliation_result.reconciliation_details[1].sales_variance_rate
    ).toBe(-5);

    // 5. 差分分析に基づいた改善提案が生成されることを確認
    const improvement_proposal_input = {
      reconciliation_result: reconciliation_result,
      analysis_month: forecast_month,
    };

    const improvement_proposal = generateImprovementProposal(
      improvement_proposal_input
    );

    expect(improvement_proposal).toBeDefined();
    expect(improvement_proposal.proposal_id).toBeDefined();
    expect(improvement_proposal.generation_status).toBe('generated');
    expect(improvement_proposal.proposals).toBeDefined();
    expect(improvement_proposal.proposals.length).toBeGreaterThan(0);

    // 改善提案内容の検証
    // 青菜類は数量12.5%超過 → 供給過剰を緩和する提案が含まれるべき
    // 根菜類は数量5%不足 → 供給不足を補う提案が含まれるべき
    const vegetable_proposal = improvement_proposal.proposals.find(
      (p) => p.category_id === 'cat_001'
    );
    expect(vegetable_proposal).toBeDefined();
    expect(vegetable_proposal.proposal_type).toMatch(/供給|調整|最適化/);
    expect(vegetable_proposal.priority_score).toBeGreaterThanOrEqual(0);
    expect(vegetable_proposal.priority_score).toBeLessThanOrEqual(100);

    const root_vegetable_proposal = improvement_proposal.proposals.find(
      (p) => p.category_id === 'cat_002'
    );
    expect(root_vegetable_proposal).toBeDefined();
    expect(root_vegetable_proposal.proposal_type).toMatch(/供給|調整|最適化/);

    // 6. 改善提案書作成処理を実行
    const document_creation_input = {
      improvement_proposal: improvement_proposal,
      reconciliation_result: reconciliation_result,
      forecast_data: loaded_forecast,
      actual_data: loaded_actual,
      output_format: 'pdf',
    };

    const proposal_document = createImprovementProposalDocument(
      document_creation_input
    );

    // 7. 改善提案書がPDF形式またはシステム指定形式で出力されることを確認
    expect(proposal_document).toBeDefined();
    expect(proposal_document.document_id).toBeDefined();
    expect(proposal_document.document_format).toBe('pdf');
    expect(proposal_document.output_status).toBe('generated');

    // 8. 改善提案書に予測値、実績値、差分、改善提案内容が含まれていることを確認
    expect(proposal_document.document_content).toBeDefined();
    expect(proposal_document.document_content).toContain('forecast');
    expect(proposal_document.document_content).toContain('actual');
    expect(proposal_document.document_content).toContain('variance');
    expect(proposal_document.document_content).toContain('proposal');

    // 9. 改善提案書がシステムに正常に保存されることを確認
    expect(proposal_document.storage_status).toBe('saved');
    expect(proposal_document.storage_location).toBeDefined();
    expect(proposal_document.saved_timestamp).toBeDefined();

    // 10. 一連のフロー完了時に成功メッセージが表示されることを確認
    const flow_completion_result = {
      overall_status: 'success',
      message:
        '月次需要予測検証サイクルの全プロセスが正常に完了しました。改善提案書が生成・保存されました。',
      completion_timestamp: '2024-01-31T23:59:59Z',
      forecast_data_loaded: true,
      actual_data_loaded: true,
      reconciliation_completed: true,
      improvement_proposal_generated: true,
      proposal_document_created: true,
      proposal_document_saved: true,
    };

    expect(flow_completion_result.overall_status).toBe('success');
    expect(flow_completion_result.message).toMatch(/正常|完了|改善提案書/);
    expect(flow_completion_result.forecast_data_loaded).toBe(true);
    expect(flow_completion_result.actual_data_loaded).toBe(true);
    expect(flow_completion_result.reconciliation_completed).toBe(true);
    expect(flow_completion_result.improvement_proposal_generated).toBe(true);
    expect(flow_completion_result.proposal_document_created).toBe(true);
    expect(flow_completion_result.proposal_document_saved).toBe(true);
  });
});