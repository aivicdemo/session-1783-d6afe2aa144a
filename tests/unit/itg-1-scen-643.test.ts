import { describe, test, expect } from "@jest/globals";
import { generateInterviewTemplate } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-643
  test("インタビュー質問項目標準化機能 - 質問項目と回答フォーマットが統一された状態で標準化テンプレートが生成される", () => {
    const inputQuestions = [
      {
        questionId: "q001",
        questionText: "好きな食材は？",
        answerFormat: "freeText",
      },
      {
        questionId: "q002",
        questionText: "アレルギーはありますか？",
        answerFormat: "singleChoice",
      },
      {
        questionId: "q003",
        questionText: "食事の希望カロリーは？",
        answerFormat: "numericInput",
      },
    ];

    const result = generateInterviewTemplate(inputQuestions);

    expect(result).toEqual({
      templateId: expect.any(String),
      createdAt: expect.any(String),
      questions: [
        {
          questionId: "q001",
          questionText: "好きな食材は？",
          answerFormat: "freeText",
          answerDataType: "string",
          isRequired: true,
          displayOrder: 1,
        },
        {
          questionId: "q002",
          questionText: "アレルギーはありますか？",
          answerFormat: "singleChoice",
          answerDataType: "string",
          isRequired: true,
          displayOrder: 2,
        },
        {
          questionId: "q003",
          questionText: "食事の希望カロリーは？",
          answerFormat: "numericInput",
          answerDataType: "number",
          isRequired: true,
          displayOrder: 3,
        },
      ],
      totalQuestionCount: 3,
      isUnified: true,
    });

    expect(result.questions.length).toBe(3);

    expect(result.questions[0].displayOrder).toBe(1);
    expect(result.questions[1].displayOrder).toBe(2);
    expect(result.questions[2].displayOrder).toBe(3);

    expect(result.questions[0].answerFormat).toBe("freeText");
    expect(result.questions[1].answerFormat).toBe("singleChoice");
    expect(result.questions[2].answerFormat).toBe("numericInput");

    expect(result.questions[0].answerDataType).toBe("string");
    expect(result.questions[1].answerDataType).toBe("string");
    expect(result.questions[2].answerDataType).toBe("number");

    expect(result.questions.every((q) => q.isRequired === true)).toBe(true);

    expect(result.totalQuestionCount).toBe(3);
    expect(result.isUnified).toBe(true);
  });
});