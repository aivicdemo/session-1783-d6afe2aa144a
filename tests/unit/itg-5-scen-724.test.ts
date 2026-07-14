import { evaluateTechnicalFeasibility } from "../../src/logic/it-7-2-1";

describe("技術実現性評価機能 - 条件付き実装の分類と記録", () => {
  test("SCEN-724: 複雑な技術的制約条件を含む改善提案が条件付き実装に分類され、条件内容が正確に記録される", () => {
    // Setup: 複雑な技術的制約条件を含む改善提案の入力データ
    const improvement_proposal_input = {
      proposal_id: "PROP-20240715-001",
      proposal_title: "複数献立キャッシュによる生成速度の高速化",
      technical_constraints: [
        "既存献立生成アルゴリズムとの互換性確認が必須",
        "キャッシュメモリ使用量が全体の30%を超えないことを保証する必要がある",
        "複数の依存する外部データソース（気象API、イベント情報、流通業者価格データ）との同期タイミングを調整が必須"
      ],
      implementation_phase: "段階的実装が必要（Phase 1: 基本キャッシュ → Phase 2: 依存関係最適化 → Phase 3: メモリ監視）",
      dependency_list: [
        "献立生成エンジンv2.1以上",
        "外部データソース連携モジュール",
        "キャッシュ管理ライブラリ"
      ],
      description: "献立生成の高速化を実現するため、過去7日分の成功献立をメモリキャッシュに保持し、新規生成時の比較参照先として使用。ただし既存アルゴリズムとの整合性、メモリ制約、外部データ同期の複雑性から段階的実装が必須となる。各フェーズでの検証ポイントは以下の通り：フェーズ1では基本キャッシュロジックの動作確認、フェーズ2では依存関係の最適化、フェーズ3ではメモリ監視と自動削除ロジックの実装。"
    };

    // Execute: 技術実現性評価を実行
    const evaluation_result = evaluateTechnicalFeasibility(improvement_proposal_input);

    // Assertion 1: 評価結果の分類が「条件付き実装」であることを確認
    expect(evaluation_result.feasibility_classification).toBe("条件付き実装");

    // Assertion 2: 条件付き実装の詳細セクションが存在し、条件内容が記録されていることを確認
    expect(evaluation_result.conditional_implementation_details).toBeDefined();
    expect(evaluation_result.conditional_implementation_details.conditions_recorded).toBe(true);

    // Assertion 3: 記録された技術的制約条件の数が入力数と一致することを確認
    expect(
      evaluation_result.conditional_implementation_details.recorded_constraints.length
    ).toBe(improvement_proposal_input.technical_constraints.length);

    // Assertion 4: 各制約条件の内容が正確に記録されていることを確認
    expect(
      evaluation_result.conditional_implementation_details.recorded_constraints[0]
    ).toBe(
      "既存献立生成アルゴリズムとの互換性確認が必須"
    );
    expect(
      evaluation_result.conditional_implementation_details.recorded_constraints[1]
    ).toBe(
      "キャッシュメモリ使用量が全体の30%を超えないことを保証する必要がある"
    );
    expect(
      evaluation_result.conditional_implementation_details.recorded_constraints[2]
    ).toBe(
      "複数の依存する外部データソース（気象API、イベント情報、流通業者価格データ）との同期タイミングを調整が必須"
    );

    // Assertion 5: 段階的実装フェーズが記録されていることを確認
    expect(
      evaluation_result.conditional_implementation_details.implementation_phases
    ).toBe(
      "段階的実装が必要（Phase 1: 基本キャッシュ → Phase 2: 依存関係最適化 → Phase 3: メモリ監視）"
    );

    // Assertion 6: 依存関係リストが記録されていることを確認
    expect(
      evaluation_result.conditional_implementation_details.dependencies_recorded.length
    ).toBe(improvement_proposal_input.dependency_list.length);
    expect(
      evaluation_result.conditional_implementation_details.dependencies_recorded[0]
    ).toBe("献立生成エンジンv2.1以上");
    expect(
      evaluation_result.conditional_implementation_details.dependencies_recorded[1]
    ).toBe("外部データソース連携モジュール");
    expect(
      evaluation_result.conditional_implementation_details.dependencies_recorded[2]
    ).toBe("キャッシュ管理ライブラリ");

    // Assertion 7: 詳細説明が正確に保存されていることを確認
    expect(
      evaluation_result.conditional_implementation_details.description_stored
    ).toBe(true);
    expect(
      evaluation_result.conditional_implementation_details.stored_description
    ).toContain("過去7日分の成功献立をメモリキャッシュに保持");
    expect(
      evaluation_result.conditional_implementation_details.stored_description
    ).toContain("段階的実装が必須");

    // Assertion 8: 条件内容の永続化を確認（再度開いた場合も同じ内容が表示されることを検証）
    const reloaded_result = evaluateTechnicalFeasibility({
      ...improvement_proposal_input,
      proposal_id: improvement_proposal_input.proposal_id
    });

    expect(reloaded_result.feasibility_classification).toBe("条件付き実装");
    expect(
      reloaded_result.conditional_implementation_details.recorded_constraints
    ).toEqual(
      evaluation_result.conditional_implementation_details.recorded_constraints
    );
    expect(
      reloaded_result.conditional_implementation_details.implementation_phases
    ).toBe(
      evaluation_result.conditional_implementation_details.implementation_phases
    );
    expect(
      reloaded_result.conditional_implementation_details.dependencies_recorded
    ).toEqual(
      evaluation_result.conditional_implementation_details.dependencies_recorded
    );

    // Assertion 9: 条件内容の整合性チェック（入力と記録内容が一致）
    expect(
      JSON.stringify(
        evaluation_result.conditional_implementation_details.recorded_constraints.sort()
      )
    ).toBe(
      JSON.stringify(improvement_proposal_input.technical_constraints.sort())
    );

    // Assertion 10: システム保存タイムスタンプが設定されていることを確認
    expect(evaluation_result.conditional_implementation_details.saved_at).toBeDefined();
    expect(typeof evaluation_result.conditional_implementation_details.saved_at).toBe("string");

    // Assertion 11: 提案IDが正確に関連付けられていることを確認
    expect(evaluation_result.proposal_id).toBe(improvement_proposal_input.proposal_id);

    // Assertion 12: 条件付き実装フラグが true に設定されていることを確認
    expect(
      evaluation_result.conditional_implementation_details.is_conditional
    ).toBe(true);
  });
});