import { deduplicateInterviewQuestions } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能 - インタビュー質問項目標準化", () => {
  // SCEN-645: [edge] インタビュー質問項目標準化機能 - 回答項目の重複排除が適切に行われ、質問数が最適化される
  test("should deduplicate interview questions and optimize question count", () => {
    // ハッピーパス: 重複を含むインタビュー質問セットを標準化して重複排除し、質問数が最適化される
    const inputQuestions = [
      {
        questionId: "q1",
        questionText: "週の献立生成にかかる時間は？",
        answerOptions: [
          { optionId: "opt1", optionText: "30分以内", isSelected: false },
          { optionId: "opt2", optionText: "30分以内", isSelected: false }, // 重複
          { optionId: "opt3", optionText: "1時間程度", isSelected: false },
          { optionId: "opt4", optionText: "1時間程度", isSelected: false }, // 重複
          { optionId: "opt5", optionText: "2時間以上", isSelected: false },
        ],
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        questionId: "q2",
        questionText: "家族の食事制限条件の管理は困難か？",
        answerOptions: [
          { optionId: "opt6", optionText: "非常に困難", isSelected: false },
          { optionId: "opt7", optionText: "非常に困難", isSelected: false }, // 重複
          { optionId: "opt8", optionText: "やや困難", isSelected: false },
          { optionId: "opt9", optionText: "困難ではない", isSelected: false },
        ],
        createdAt: "2024-01-15T10:15:00Z",
      },
      {
        questionId: "q3",
        questionText: "献立生成時の優先条件は？",
        answerOptions: [
          {
            optionId: "opt10",
            optionText: "栄養バランス重視",
            isSelected: false,
          },
          {
            optionId: "opt11",
            optionText: "栄養バランス重視",
            isSelected: false,
          }, // 重複
          {
            optionId: "opt12",
            optionText: "栄養バランス重視",
            isSelected: false,
          }, // 重複
          { optionId: "opt13", optionText: "予算重視", isSelected: false },
          { optionId: "opt14", optionText: "調理時間短縮", isSelected: false },
        ],
        createdAt: "2024-01-15T10:30:00Z",
      },
    ];

    const expectedOriginalOptionCount = 14; // opt1～opt14の合計
    const expectedDuplicateCount = 5; // opt2, opt4, opt7, opt11, opt12
    const expectedOptimizedOptionCount = 9; // 14 - 5

    const result = deduplicateInterviewQuestions(inputQuestions);

    // 元の質問数が保持されている（質問自体は削除しない）
    expect(result.deduplicatedQuestions.length).toBe(3);

    // 質問q1の回答項目が正しく重複排除された
    expect(result.deduplicatedQuestions[0].questionId).toBe("q1");
    expect(result.deduplicatedQuestions[0].answerOptions.length).toBe(3); // 30分以内, 1時間程度, 2時間以上
    expect(
      result.deduplicatedQuestions[0].answerOptions.map((opt) => opt.optionText)
    ).toEqual(["30分以内", "1時間程度", "2時間以上"]);

    // 質問q2の回答項目が正しく重複排除された
    expect(result.deduplicatedQuestions[1].questionId).toBe("q2");
    expect(result.deduplicatedQuestions[1].answerOptions.length).toBe(3); // 非常に困難, やや困難, 困難ではない
    expect(
      result.deduplicatedQuestions[1].answerOptions.map((opt) => opt.optionText)
    ).toEqual(["非常に困難", "やや困難", "困難ではない"]);

    // 質問q3の回答項目が正しく重複排除された
    expect(result.deduplicatedQuestions[2].questionId).toBe("q3");
    expect(result.deduplicatedQuestions[2].answerOptions.length).toBe(3); // 栄養バランス重視, 予算重視, 調理時間短縮
    expect(
      result.deduplicatedQuestions[2].answerOptions.map((opt) => opt.optionText)
    ).toEqual([
      "栄養バランス重視",
      "予算重視",
      "調理時間短縮",
    ]);

    // 統計情報が正確に計算されている
    expect(result.statisticsInfo.originalOptionCount).toBe(
      expectedOriginalOptionCount
    );
    expect(result.statisticsInfo.duplicateCount).toBe(expectedDuplicateCount);
    expect(result.statisticsInfo.optimizedOptionCount).toBe(
      expectedOptimizedOptionCount
    );

    // 質問数は変わらない（重複排除は回答項目レベル）
    expect(result.statisticsInfo.originalQuestionCount).toBe(3);
    expect(result.statisticsInfo.optimizedQuestionCount).toBe(3);

    // 重複排除率が正確に計算されている（5 / 14 ≈ 0.357 = 35.7%）
    expect(result.statisticsInfo.deduplicationRatePercent).toBeCloseTo(
      35.71,
      1
    );

    // 重複情報が記録されている
    expect(result.duplicationDetails.length).toBe(3); // 3つの質問で重複が検出
    expect(result.duplicationDetails[0].questionId).toBe("q1");
    expect(result.duplicationDetails[0].duplicateGroupsDetected).toBe(2); // 「30分以内」と「1時間程度」
    expect(result.duplicationDetails[0].duplicateCountInQuestion).toBe(2); // opt2, opt4

    expect(result.duplicationDetails[1].questionId).toBe("q2");
    expect(result.duplicationDetails[1].duplicateCountInQuestion).toBe(1); // opt7

    expect(result.duplicationDetails[2].questionId).toBe("q3");
    expect(result.duplicationDetails[2].duplicateGroupsDetected).toBe(1); // 「栄養バランス重視」
    expect(result.duplicationDetails[2].duplicateCountInQuestion).toBe(2); // opt11, opt12

    // 処理完了タイムスタンプが記録されている
    expect(result.processedAt).toBeDefined();
    expect(typeof result.processedAt).toBe("string");

    // 最適化前後の質問セットの統計
    expect(result.qualityMetrics.optionsPerQuestionBefore).toEqual([5, 4, 5]);
    expect(result.qualityMetrics.optionsPerQuestionAfter).toEqual([3, 3, 3]);
  });

  test("should handle empty answer options without error", () => {
    // エッジケース: 回答項目が空の質問が含まれている場合
    const inputQuestionsEmpty = [
      {
        questionId: "q1",
        questionText: "テスト質問",
        answerOptions: [],
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];

    const result = deduplicateInterviewQuestions(inputQuestionsEmpty);

    expect(result.deduplicatedQuestions.length).toBe(1);
    expect(result.deduplicatedQuestions[0].answerOptions.length).toBe(0);
    expect(result.statisticsInfo.originalOptionCount).toBe(0);
    expect(result.statisticsInfo.optimizedOptionCount).toBe(0);
    expect(result.statisticsInfo.duplicateCount).toBe(0);
  });

  test("should preserve question metadata during deduplication", () => {
    // ハッピーパス: 質問メタデータ（タイムスタンプなど）が保持される
    const inputQuestions = [
      {
        questionId: "q_preserve_test",
        questionText: "メタデータ保持テスト",
        answerOptions: [
          { optionId: "opt1", optionText: "回答A", isSelected: false },
          { optionId: "opt2", optionText: "回答A", isSelected: false },
        ],
        createdAt: "2024-01-15T11:30:45Z",
      },
    ];

    const result = deduplicateInterviewQuestions(inputQuestions);

    expect(result.deduplicatedQuestions[0].questionId).toBe("q_preserve_test");
    expect(result.deduplicatedQuestions[0].questionText).toBe(
      "メタデータ保持テスト"
    );
    expect(result.deduplicatedQuestions[0].createdAt).toBe(
      "2024-01-15T11:30:45Z"
    );
  });

  test("should handle questions with no duplicates correctly", () => {
    // ハッピーパス: 重複がない質問セットは変わらない
    const inputQuestionsNoDuplicate = [
      {
        questionId: "q1",
        questionText: "重複なしテスト",
        answerOptions: [
          { optionId: "opt1", optionText: "回答A", isSelected: false },
          { optionId: "opt2", optionText: "回答B", isSelected: false },
          { optionId: "opt3", optionText: "回答C", isSelected: false },
        ],
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];

    const result = deduplicateInterviewQuestions(inputQuestionsNoDuplicate);

    expect(result.deduplicatedQuestions[0].answerOptions.length).toBe(3);
    expect(result.statisticsInfo.duplicateCount).toBe(0);
    expect(result.statisticsInfo.deduplicationRatePercent).toBe(0);
    expect(result.duplicationDetails.length).toBe(0);
  });

  test("should throw error when input is null or undefined", () => {
    // エラーケース: 無効な入力
    expect(() => deduplicateInterviewQuestions(null as any)).toThrow(
      /インタビュー質問/
    );
    expect(() => deduplicateInterviewQuestions(undefined as any)).toThrow(
      /インタビュー質問/
    );
  });

  test("should throw error when question has invalid structure", () => {
    // エラーケース: 質問オブジェクトが不正な構造
    const invalidInput = [
      {
        questionId: "q1",
        // questionText が missing
        answerOptions: [],
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];

    expect(() => deduplicateInterviewQuestions(invalidInput as any)).toThrow(
      /質問テキスト/
    );
  });
});