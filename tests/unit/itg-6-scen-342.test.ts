import { extractFlowExitPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成フロー離脱ポイント抽出・分析機能', () => {
  // SCEN-342
  test('複数の離脱ポイント（3つ以上）が検出された場合に全て可視化される', () => {
    const testInputData = {
      flowSteps: [
        {
          stepId: 'step_1_initial',
          stepName: '献立条件入力',
          totalUsers: 500,
          completionCount: 480,
          exitCount: 20,
        },
        {
          stepId: 'step_2_dietary_restriction',
          stepName: '食事制限入力',
          totalUsers: 480,
          completionCount: 450,
          exitCount: 30,
        },
        {
          stepId: 'step_3_budget_setting',
          stepName: '予算設定',
          totalUsers: 450,
          completionCount: 410,
          exitCount: 40,
        },
        {
          stepId: 'step_4_cooking_time',
          stepName: '調理時間選択',
          totalUsers: 410,
          completionCount: 380,
          exitCount: 30,
        },
        {
          stepId: 'step_5_confirm',
          stepName: '最終確認',
          totalUsers: 380,
          completionCount: 360,
          exitCount: 20,
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    const result = extractFlowExitPoints(testInputData);

    // 検出された離脱ポイントが3つ以上存在すること
    expect(result.exitPointsDetected.length).toBeGreaterThanOrEqual(3);

    // 検出された全離脱ポイントが期待値に一致すること（予算設定が最大離脱数40）
    const exitPointsByExitCount = result.exitPointsDetected.sort(
      (a, b) => b.exitCount - a.exitCount
    );

    expect(exitPointsByExitCount[0].stepId).toBe('step_3_budget_setting');
    expect(exitPointsByExitCount[0].stepName).toBe('予算設定');
    expect(exitPointsByExitCount[0].exitCount).toBe(40);
    expect(exitPointsByExitCount[0].exitRate).toBe(8.888888888888889);

    expect(exitPointsByExitCount[1].stepId).toBe('step_2_dietary_restriction');
    expect(exitPointsByExitCount[1].stepName).toBe('食事制限入力');
    expect(exitPointsByExitCount[1].exitCount).toBe(30);
    expect(exitPointsByExitCount[1].exitRate).toBe(6.25);

    expect(exitPointsByExitCount[2].stepId).toBe('step_4_cooking_time');
    expect(exitPointsByExitCount[2].stepName).toBe('調理時間選択');
    expect(exitPointsByExitCount[2].exitCount).toBe(30);
    expect(exitPointsByExitCount[2].exitRate).toBe(7.317073170731707);

    expect(exitPointsByExitCount[3].stepId).toBe('step_1_initial');
    expect(exitPointsByExitCount[3].stepName).toBe('献立条件入力');
    expect(exitPointsByExitCount[3].exitCount).toBe(20);
    expect(exitPointsByExitCount[3].exitRate).toBe(4.0);

    expect(exitPointsByExitCount[4].stepId).toBe('step_5_confirm');
    expect(exitPointsByExitCount[4].stepName).toBe('最終確認');
    expect(exitPointsByExitCount[4].exitCount).toBe(20);
    expect(exitPointsByExitCount[4].exitRate).toBe(5.263157894736842);

    // 可視化データが生成されていること
    expect(result.visualizationElements).toBeDefined();
    expect(result.visualizationElements.chartData).toBeDefined();
    expect(result.visualizationElements.tableData).toBeDefined();

    // チャートデータに全離脱ポイントが含まれること
    expect(result.visualizationElements.chartData.length).toBe(5);
    expect(result.visualizationElements.chartData[0].label).toBe('予算設定');
    expect(result.visualizationElements.chartData[0].value).toBe(40);

    // テーブルデータに全離脱ポイントの詳細情報が含まれること
    expect(result.visualizationElements.tableData.length).toBe(5);

    const tableFirstRow = result.visualizationElements.tableData[0];
    expect(tableFirstRow.stepName).toBe('予算設定');
    expect(tableFirstRow.exitCount).toBe(40);
    expect(tableFirstRow.exitRate).toBe(8.888888888888889);
    expect(tableFirstRow.userImpactLevel).toBe('high');

    // 離脱ポイントが離脱数の多い順にソート済みであること
    for (let i = 0; i < result.visualizationElements.tableData.length - 1; i++) {
      expect(
        result.visualizationElements.tableData[i].exitCount
      ).toBeGreaterThanOrEqual(
        result.visualizationElements.tableData[i + 1].exitCount
      );
    }

    // 可視化要素の描画状態が正常（isRendered = true）であること
    expect(result.visualizationElements.isRendered).toBe(true);

    // 全離脱ポイントがビジュアル上で識別可能であること
    expect(result.visualizationElements.elementsCount).toBe(5);

    // 分析メタデータが含まれていること
    expect(result.metadata).toBeDefined();
    expect(result.metadata.totalFlowCompletions).toBe(360);
    expect(result.metadata.totalExitCount).toBe(140);
    expect(result.metadata.overallExitRate).toBe(28.0);
    expect(result.metadata.analysisStartDate).toBe('2024-01-01T00:00:00Z');
    expect(result.metadata.analysisEndDate).toBe('2024-01-31T23:59:59Z');
  });
});