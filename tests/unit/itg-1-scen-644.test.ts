import { standardizeInterviewQuestions } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-644: [error] インタビュー質問項目標準化機能 - 市場分析・競合分析データが未完了の場合に標準化処理がスキップされる
  test("市場分析・競合分析データが未完了の場合、標準化処理がスキップされてエラーが発生する", () => {
    const incompleteMarketAnalysisData = {
      marketAnalysisCompleted: false,
      competitiveAnalysisCompleted: false,
      marketTrends: [],
      competitorFeatures: [],
      interviewQuestions: [
        {
          id: "q001",
          category: "food_restriction",
          text: "どの食材を避けていますか?",
          standardized: false,
        },
        {
          id: "q002",
          category: "cooking_time",
          text: "調理に使える時間は?",
          standardized: false,
        },
        {
          id: "q003",
          category: "budget_constraint",
          text: "月の食費予算はいくらですか?",
          standardized: false,
        },
      ],
      timestamp: new Date("2025-06-15T10:00:00Z"),
      userId: "user_001",
    };

    expect(() =>
      standardizeInterviewQuestions(incompleteMarketAnalysisData)
    ).toThrow(/市場分析/);
  });

  test("市場分析のみ完了し競合分析が未完了の場合、標準化処理がスキップされてエラーが発生する", () => {
    const partialAnalysisData = {
      marketAnalysisCompleted: true,
      competitiveAnalysisCompleted: false,
      marketTrends: [
        {
          trend: "healthy_meal",
          relevance: 0.85,
        },
      ],
      competitorFeatures: [],
      interviewQuestions: [
        {
          id: "q001",
          category: "food_restriction",
          text: "どの食材を避けていますか?",
          standardized: false,
        },
        {
          id: "q002",
          category: "cooking_time",
          text: "調理に使える時間は?",
          standardized: false,
        },
      ],
      timestamp: new Date("2025-06-15T10:00:00Z"),
      userId: "user_002",
    };

    expect(() =>
      standardizeInterviewQuestions(partialAnalysisData)
    ).toThrow(/競合分析/);
  });

  test("市場分析・競合分析の両方が完了している場合、標準化処理が正常に実行される", () => {
    const completeAnalysisData = {
      marketAnalysisCompleted: true,
      competitiveAnalysisCompleted: true,
      marketTrends: [
        {
          trend: "healthy_meal",
          relevance: 0.85,
        },
        {
          trend: "time_saving",
          relevance: 0.78,
        },
      ],
      competitorFeatures: [
        {
          competitorId: "comp_001",
          feature: "meal_time_estimation",
          coverage: 0.92,
        },
        {
          competitorId: "comp_002",
          feature: "allergen_detection",
          coverage: 0.88,
        },
      ],
      interviewQuestions: [
        {
          id: "q001",
          category: "food_restriction",
          text: "どの食材を避けていますか?",
          standardized: false,
        },
        {
          id: "q002",
          category: "cooking_time",
          text: "調理に使える時間は?",
          standardized: false,
        },
        {
          id: "q003",
          category: "budget_constraint",
          text: "月の食費予算はいくらですか?",
          standardized: false,
        },
      ],
      timestamp: new Date("2025-06-15T10:00:00Z"),
      userId: "user_003",
    };

    const result = standardizeInterviewQuestions(completeAnalysisData);

    expect(result).toEqual({
      interviewQuestionsStandardized: true,
      standardizedQuestions: [
        {
          id: "q001",
          category: "food_restriction",
          text: "どの食材を避けていますか?",
          standardized: true,
          standardizedFormat: "single_select",
          optionSource: "market_analysis",
        },
        {
          id: "q002",
          category: "cooking_time",
          text: "調理に使える時間は?",
          standardized: true,
          standardizedFormat: "range_input",
          optionSource: "competitive_analysis",
        },
        {
          id: "q003",
          category: "budget_constraint",
          text: "月の食費予算はいくらですか?",
          standardized: true,
          standardizedFormat: "numeric_input",
          optionSource: "market_analysis",
        },
      ],
      responseRecordFormat: {
        fieldName: "user_response",
        dataType: "string | number | array",
        mandatory: true,
        validationRule: "defined_per_question",
      },
      processingStatus: "completed",
      completedAt: new Date("2025-06-15T10:00:00Z"),
      userId: "user_003",
    });
  });

  test("市場分析・競合分析が完了していても、インタビュー質問が空配列の場合、標準化処理は空結果を返す", () => {
    const emptyQuestionsData = {
      marketAnalysisCompleted: true,
      competitiveAnalysisCompleted: true,
      marketTrends: [
        {
          trend: "healthy_meal",
          relevance: 0.85,
        },
      ],
      competitorFeatures: [
        {
          competitorId: "comp_001",
          feature: "meal_time_estimation",
          coverage: 0.92,
        },
      ],
      interviewQuestions: [],
      timestamp: new Date("2025-06-15T10:00:00Z"),
      userId: "user_004",
    };

    const result = standardizeInterviewQuestions(emptyQuestionsData);

    expect(result).toEqual({
      interviewQuestionsStandardized: true,
      standardizedQuestions: [],
      responseRecordFormat: {
        fieldName: "user_response",
        dataType: "string | number | array",
        mandatory: true,
        validationRule: "defined_per_question",
      },
      processingStatus: "completed",
      completedAt: new Date("2025-06-15T10:00:00Z"),
      userId: "user_004",
    });
  });

  test("市場分析・競合分析が両方未完了の場合、複合エラーメッセージで処理がスキップされる", () => {
    const neitherCompletedData = {
      marketAnalysisCompleted: false,
      competitiveAnalysisCompleted: false,
      marketTrends: [],
      competitorFeatures: [],
      interviewQuestions: [
        {
          id: "q001",
          category: "food_restriction",
          text: "どの食材を避けていますか?",
          standardized: false,
        },
      ],
      timestamp: new Date("2025-06-15T10:00:00Z"),
      userId: "user_005",
    };

    expect(() =>
      standardizeInterviewQuestions(neitherCompletedData)
    ).toThrow(/市場分析|競合分析/);
  });
});