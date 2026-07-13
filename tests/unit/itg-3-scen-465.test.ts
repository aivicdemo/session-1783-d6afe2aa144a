import { judgeVariablePriorityForProposal } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-465
  test("相関分析結果データが存在しない場合にエラーで承認フロー送付が中止される", () => {
    const correlationAnalysisResults: Array<{
      externalFactorId: string;
      variableName: string;
      correlationCoefficient: number;
    }> = [];

    const externalFactorVariables = [
      {
        variableId: "weather_temp",
        variableName: "気温",
        impactScore: 85,
        implementationDifficulty: 2,
      },
      {
        variableId: "event_sale",
        variableName: "セール",
        impactScore: 72,
        implementationDifficulty: 3,
      },
    ];

    expect(() =>
      judgeVariablePriorityForProposal(
        correlationAnalysisResults,
        externalFactorVariables
      )
    ).toThrow(/相関分析結果/);
  });
});