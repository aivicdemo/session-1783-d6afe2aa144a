import { normalizeInterviewQuestions } from "../../src/logic/it-8-1-1-1";

describe("インタビュー質問項目標準化・回答フォーマット統一機能", () => {
  // SCEN-308
  test("複数の異なる言語・表記ゆれを含む質問項目が正規化されて統一される", () => {
    // 入力: 日本語、英語、中国語を含む複数の言語で記述された質問項目と表記ゆれ
    const input_interview_questions = [
      {
        question_id: "q1_jp",
        question_text: "ユーザーペインは何ですか？",
        language: "ja",
      },
      {
        question_id: "q1_en",
        question_text: "What is User Pain?",
        language: "en",
      },
      {
        question_id: "q1_zh",
        question_text: "用户痛点是什么？",
        language: "zh",
      },
      {
        question_id: "q2_jp_variant",
        question_text: "ユーザー痛みの原因は？",
        language: "ja",
      },
      {
        question_id: "q2_en",
        question_text: "What causes user pain?",
        language: "en",
      },
      {
        question_id: "q3_cooking_time_jp",
        question_text: "調理時間の制限はありますか？",
        language: "ja",
      },
      {
        question_id: "q3_cooking_time_en",
        question_text: "Do you have cooking time constraints?",
        language: "en",
      },
      {
        question_id: "q4_budget_jp",
        question_text: "食事予算の制約はありますか？",
        language: "ja",
      },
      {
        question_id: "q4_budget_en",
        question_text: "Are there budget constraints for meals?",
        language: "en",
      },
    ];

    // 呼び出し: インタビュー質問項目標準化機能
    const result = normalizeInterviewQuestions(input_interview_questions, "ja");

    // 期待結果1: 複数言語が統一言語（日本語）に正規化されている
    expect(result.normalized_questions).toBeDefined();
    expect(result.normalized_questions.length).toBeGreaterThan(0);

    // 期待結果2: すべての正規化済み質問が指定言語（日本語）で統一されている
    result.normalized_questions.forEach((q) => {
      expect(q.language).toBe("ja");
    });

    // 期待結果3: 表記ゆれが標準形式に統一されている
    // q1_jp, q1_en, q1_zh は同一意味のため、同じ canonical_id が付与される
    const q1_entries = result.normalized_questions.filter(
      (q) =>
        q.canonical_id ===
        result.normalized_questions.find((x) => x.original_question_id === "q1_jp")
          ?.canonical_id
    );
    expect(q1_entries.length).toBeGreaterThanOrEqual(3); // 最低3言語分が同じ canonical_id で統一

    // 期待結果4: 同一意味の質問項目に同じID/タグが付与されている
    const q1_by_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q1_jp"
    )?.canonical_id;
    const q2_variant_by_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q2_jp_variant"
    )?.canonical_id;

    // q1 と q2_variant は異なる意味（「ペインは何か」vs「ペインの原因は何か」）のため、異なる canonical_id
    expect(q1_by_canonical).not.toBe(q2_variant_by_canonical);

    // 期待結果5: 調理時間制限に関する質問が統一されている
    const cooking_time_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q3_cooking_time_jp"
    )?.canonical_id;
    const cooking_time_en_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q3_cooking_time_en"
    )?.canonical_id;
    expect(cooking_time_canonical).toBe(cooking_time_en_canonical);

    // 期待結果6: 予算制約に関する質問が統一されている
    const budget_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q4_budget_jp"
    )?.canonical_id;
    const budget_en_canonical = result.normalized_questions.find(
      (q) => q.original_question_id === "q4_budget_en"
    )?.canonical_id;
    expect(budget_canonical).toBe(budget_en_canonical);

    // 期待結果7: 統一されたフォーマットが回答入力画面用に正しく生成されている
    expect(result.standardized_format).toBeDefined();
    expect(result.standardized_format.response_template).toBeDefined();
    expect(result.standardized_format.response_template.length).toBeGreaterThan(
      0
    );

    // 期待結果8: 回答入力画面のテンプレートが標準言語（日本語）で統一されている
    result.standardized_format.response_template.forEach((template) => {
      expect(template.question_language).toBe("ja");
      expect(template.question_text).toBeDefined();
      expect(template.question_text.length).toBeGreaterThan(0);
    });

    // 期待結果9: 複数回の正規化処理において、同じ入力に対して一貫した統一結果が得られる
    const result_second_run = normalizeInterviewQuestions(
      input_interview_questions,
      "ja"
    );

    // 各質問の canonical_id が2回の実行で一致している
    for (let i = 0; i < result.normalized_questions.length; i++) {
      const original_id = result.normalized_questions[i].original_question_id;
      const first_canonical = result.normalized_questions[i].canonical_id;
      const second_canonical = result_second_run.normalized_questions.find(
        (q) => q.original_question_id === original_id
      )?.canonical_id;
      expect(first_canonical).toBe(second_canonical);
    }

    // 期待結果10: 正規化処理が成功し、結果の構造が完全である
    expect(result.normalization_status).toBe("success");
    expect(result.total_questions_input).toBe(9);
    expect(result.total_canonical_groups).toBeGreaterThan(0);

    // 期待結果11: 異なるカテゴリのペイン（ユーザーペイン、調理時間、予算）が
    // それぞれ異なる canonical_id グループに分類されている
    const unique_canonical_ids = new Set(
      result.normalized_questions.map((q) => q.canonical_id)
    );
    expect(unique_canonical_ids.size).toBeGreaterThanOrEqual(3); // 最低3つの異なるカテゴリ

    // 期待結果12: 統一フォーマットが一貫性チェックに合格している
    expect(result.format_consistency_check).toBe(true);
  });
});