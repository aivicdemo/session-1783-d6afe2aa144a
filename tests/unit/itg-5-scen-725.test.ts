import { evaluateTechnicalFeasibility } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善効果の週次集計と定量比較ダッシュボード", () => {
  // SCEN-725: [error] 技術実現性評価機能 - 評価基準が定義されていない状態で技術実現性評価を実行したとき、エラーが発生する
  test("should throw error when evaluation criteria are not defined", () => {
    const technologiesToEvaluate = [
      {
        technologyId: "tech-001",
        name: "献立生成アルゴリズムv2",
        description: "機械学習ベースの献立生成",
        estimatedImplementationDays: 14,
      },
      {
        technologyId: "tech-002",
        name: "栄養バランス最適化エンジン",
        description: "リニアプログラミングによる栄養最適化",
        estimatedImplementationDays: 21,
      },
    ];

    const evaluationCriteria = null;

    expect(() =>
      evaluateTechnicalFeasibility(technologiesToEvaluate, evaluationCriteria)
    ).toThrow(/評価基準/);
  });
});