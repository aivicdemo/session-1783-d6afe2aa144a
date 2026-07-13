import {
  recordImprovementProposalDecision,
} from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案却下・保留理由の構造化記録機能", () => {
  // SCEN-542
  test("改善提案の却下・保留判定時に理由とカテゴリが構造化されて記録される", () => {
    // 前置条件: 改善提案が存在し、却下または保留の判定が必要な状態
    const improvement_proposal_id = "PROP-20240115-001";
    const decision_type = "REJECT"; // "REJECT" または "HOLD"
    const reason_text =
      "技術的実現性に課題があり、現在のマイクロサービス構成では対応困難";
    const reason_category_id = "CAT-TECH-001";
    const reason_category_name = "技術実現性課題";
    const recorded_timestamp = new Date("2024-01-15T14:30:00Z");

    // テスト実行: 却下理由とカテゴリを記録
    const decision_record_reject = recordImprovementProposalDecision({
      improvement_proposal_id,
      decision_type,
      reason_text,
      reason_category_id,
      reason_category_name,
      recorded_timestamp,
    });

    // 期待結果: 却下の理由が正常に構造化されて記録されている
    expect(decision_record_reject).toEqual({
      improvement_proposal_id: "PROP-20240115-001",
      decision_type: "REJECT",
      reason_text:
        "技術的実現性に課題があり、現在のマイクロサービス構成では対応困難",
      reason_category_id: "CAT-TECH-001",
      reason_category_name: "技術実現性課題",
      recorded_timestamp: new Date("2024-01-15T14:30:00Z"),
      record_status: "STRUCTURED",
      schema_validation_passed: true,
      data_integrity_check_passed: true,
    });

    // 前置条件: 保留判定の改善提案が存在する状態
    const improvement_proposal_id_hold = "PROP-20240115-002";
    const decision_type_hold = "HOLD";
    const reason_text_hold =
      "スプリント容量不足により、次回スプリント（Sprint-25）への延期を提案";
    const reason_category_id_hold = "CAT-CAPACITY-002";
    const reason_category_name_hold = "スプリント容量不足";
    const recorded_timestamp_hold = new Date("2024-01-15T14:45:00Z");

    // テスト実行: 保留理由とカテゴリを記録
    const decision_record_hold = recordImprovementProposalDecision({
      improvement_proposal_id: improvement_proposal_id_hold,
      decision_type: decision_type_hold,
      reason_text: reason_text_hold,
      reason_category_id: reason_category_id_hold,
      reason_category_name: reason_category_name_hold,
      recorded_timestamp: recorded_timestamp_hold,
    });

    // 期待結果: 保留の理由が正常に構造化されて記録されている
    expect(decision_record_hold).toEqual({
      improvement_proposal_id: "PROP-20240115-002",
      decision_type: "HOLD",
      reason_text:
        "スプリント容量不足により、次回スプリント（Sprint-25）への延期を提案",
      reason_category_id: "CAT-CAPACITY-002",
      reason_category_name: "スプリント容量不足",
      recorded_timestamp: new Date("2024-01-15T14:45:00Z"),
      record_status: "STRUCTURED",
      schema_validation_passed: true,
      data_integrity_check_passed: true,
    });

    // 追加検証: 記録されたデータが完全性を満たしている
    expect(decision_record_reject).toHaveProperty("improvement_proposal_id");
    expect(decision_record_reject).toHaveProperty("decision_type");
    expect(decision_record_reject).toHaveProperty("reason_text");
    expect(decision_record_reject).toHaveProperty("reason_category_id");
    expect(decision_record_reject).toHaveProperty("reason_category_name");
    expect(decision_record_reject).toHaveProperty("recorded_timestamp");
    expect(decision_record_reject).toHaveProperty("record_status");
    expect(decision_record_reject).toHaveProperty("schema_validation_passed");
    expect(decision_record_reject).toHaveProperty("data_integrity_check_passed");

    // 追加検証: カテゴリIDが正しい形式で格納されている
    expect(decision_record_reject.reason_category_id).toMatch(/^CAT-/);
    expect(decision_record_hold.reason_category_id).toMatch(/^CAT-/);

    // 追加検証: decision_type が有効な値（REJECT または HOLD）
    expect(decision_record_reject.decision_type).toMatch(/^(REJECT|HOLD)$/);
    expect(decision_record_hold.decision_type).toMatch(/^(REJECT|HOLD)$/);

    // 追加検証: タイムスタンプが ISO 8601 形式
    expect(decision_record_reject.recorded_timestamp.toISOString()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(decision_record_hold.recorded_timestamp.toISOString()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );

    // 追加検証: record_status が STRUCTURED で設定されている
    expect(decision_record_reject.record_status).toBe("STRUCTURED");
    expect(decision_record_hold.record_status).toBe("STRUCTURED");

    // 追加検証: スキーマ検証と整合性チェックが両方パスしている
    expect(decision_record_reject.schema_validation_passed).toBe(true);
    expect(decision_record_reject.data_integrity_check_passed).toBe(true);
    expect(decision_record_hold.schema_validation_passed).toBe(true);
    expect(decision_record_hold.data_integrity_check_passed).toBe(true);

    // 追加検証: 理由テキストが空でなく、一定の文字数以上
    expect(decision_record_reject.reason_text.length).toBeGreaterThanOrEqual(
      10
    );
    expect(decision_record_hold.reason_text.length).toBeGreaterThanOrEqual(10);

    // 追加検証: 理由カテゴリ名が空でない
    expect(decision_record_reject.reason_category_name.length).toBeGreaterThan(
      0
    );
    expect(decision_record_hold.reason_category_name.length).toBeGreaterThan(0);

    // エラーケース: 理由テキストが空文字列の場合、例外をスロー
    expect(() =>
      recordImprovementProposalDecision({
        improvement_proposal_id: "PROP-20240115-003",
        decision_type: "REJECT",
        reason_text: "",
        reason_category_id: "CAT-TECH-001",
        reason_category_name: "技術実現性課題",
        recorded_timestamp: new Date("2024-01-15T15:00:00Z"),
      })
    ).toThrow(/理由テキスト/);

    // エラーケース: reason_category_id が無効な形式の場合、例外をスロー
    expect(() =>
      recordImprovementProposalDecision({
        improvement_proposal_id: "PROP-20240115-004",
        decision_type: "REJECT",
        reason_text: "技術的な課題がある",
        reason_category_id: "INVALID-FORMAT",
        reason_category_name: "技術実現性課題",
        recorded_timestamp: new Date("2024-01-15T15:00:00Z"),
      })
    ).toThrow(/カテゴリID/);

    // エラーケース: decision_type が無効な値の場合、例外をスロー
    expect(() =>
      recordImprovementProposalDecision({
        improvement_proposal_id: "PROP-20240115-005",
        decision_type: "INVALID",
        reason_text: "無効な判定種別",
        reason_category_id: "CAT-TECH-001",
        reason_category_name: "技術実現性課題",
        recorded_timestamp: new Date("2024-01-15T15:00:00Z"),
      })
    ).toThrow(/判定種別/);

    // エラーケース: improvement_proposal_id が空の場合、例外をスロー
    expect(() =>
      recordImprovementProposalDecision({
        improvement_proposal_id: "",
        decision_type: "REJECT",
        reason_text: "提案IDが空",
        reason_category_id: "CAT-TECH-001",
        reason_category_name: "技術実現性課題",
        recorded_timestamp: new Date("2024-01-15T15:00:00Z"),
      })
    ).toThrow(/提案ID/);

    // エラーケース: recorded_timestamp が無効な場合、例外をスロー
    expect(() =>
      recordImprovementProposalDecision({
        improvement_proposal_id: "PROP-20240115-006",
        decision_type: "REJECT",
        reason_text: "タイムスタンプが無効",
        reason_category_id: "CAT-TECH-001",
        reason_category_name: "技術実現性課題",
        recorded_timestamp: new Date("Invalid"),
      })
    ).toThrow(/タイムスタンプ/);
  });
});