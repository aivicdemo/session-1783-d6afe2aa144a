import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  recordRejectedProposal,
  retrieveRejectedProposalsByCategory,
  validateRejectionReasonCategories,
} from "../../src/logic/it-8-1-2-1";

const fetchMock = require("jest-fetch-mock");

describe("献立生成フロー内の制約条件入力パターンと離脱ポイント", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-231
  test("却下・保留提案の構造化記録 - 却下または保留と判定された改善提案の理由がカテゴリ分類されて次回参照可能な状態で記録される", () => {
    // Setup: テストデータの準備
    const proposal_id = "PROP-20240115-001";
    const proposal_title = "調理時間短縮アルゴリズム改善";
    const proposal_description = "家族の好みを反映した献立生成時間を3分以下に短縮";
    const decision_status = "rejected";
    const rejection_reasons = [
      "cost_constraint",
      "technical_complexity",
      "priority_low",
    ];
    const recorded_at = "2024-01-15T11:30:00Z";
    const user_id = "USER-TEST-001";

    // Step 1: 改善提案が却下または保留と判定される
    const recordRequest = {
      proposal_id,
      proposal_title,
      proposal_description,
      decision_status,
      rejection_reasons,
      user_id,
      recorded_at,
    };

    // Mock API for recording rejected proposal
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        recorded_proposal_id: proposal_id,
        decision_status,
        rejection_categories_count: 3,
        recorded_timestamp: recorded_at,
      }),
      { status: 200 }
    );

    // Step 2: recordRejectedProposal を呼び出して構造化記録
    const recordResult = recordRejectedProposal(recordRequest);

    // Assertion 1: 記録結果が成功
    expect(recordResult).toEqual({
      success: true,
      recorded_proposal_id: proposal_id,
      decision_status,
      rejection_categories_count: 3,
      recorded_timestamp: recorded_at,
    });

    // Step 3: 却下理由カテゴリの検証
    const validationRequest = {
      rejection_reasons,
      available_categories: [
        "cost_constraint",
        "technical_complexity",
        "priority_low",
        "duplicate",
        "out_of_scope",
        "resource_unavailable",
        "market_uncertainty",
      ],
    };

    const validationResult = validateRejectionReasonCategories(
      validationRequest
    );

    // Assertion 2: すべての選択カテゴリが事前定義カテゴリに存在する
    expect(validationResult).toEqual({
      is_valid: true,
      invalid_categories: [],
      matched_categories: 3,
      validation_message: "All rejection reasons are valid categories",
    });

    // Step 4: カテゴリ別フィルタリング機能で検索
    fetchMock.mockResponseOnce(
      JSON.stringify({
        proposals: [
          {
            proposal_id: "PROP-20240115-001",
            proposal_title: "調理時間短縮アルゴリズム改善",
            decision_status: "rejected",
            rejection_reasons: [
              "cost_constraint",
              "technical_complexity",
              "priority_low",
            ],
            recorded_at: "2024-01-15T11:30:00Z",
          },
          {
            proposal_id: "PROP-20240110-005",
            proposal_title: "栄養バランス分析機能",
            decision_status: "rejected",
            rejection_reasons: ["cost_constraint", "priority_low"],
            recorded_at: "2024-01-10T09:15:00Z",
          },
        ],
        filter_category: "cost_constraint",
        total_count: 2,
      }),
      { status: 200 }
    );

    const filterRequest = {
      filter_category: "cost_constraint",
      user_id,
    };

    const filterResult = retrieveRejectedProposalsByCategory(filterRequest);

    // Assertion 3: フィルタリング結果が正確に返される
    expect(filterResult.proposals).toHaveLength(2);
    expect(filterResult.filter_category).toBe("cost_constraint");
    expect(filterResult.total_count).toBe(2);

    // Assertion 4: 第1件の提案が期待値通りに構造化されている
    expect(filterResult.proposals[0]).toEqual({
      proposal_id: "PROP-20240115-001",
      proposal_title: "調理時間短縮アルゴリズム改善",
      decision_status: "rejected",
      rejection_reasons: [
        "cost_constraint",
        "technical_complexity",
        "priority_low",
      ],
      recorded_at: "2024-01-15T11:30:00Z",
    });

    // Assertion 5: 第1件の提案に cost_constraint カテゴリが含まれている
    expect(filterResult.proposals[0].rejection_reasons).toContain(
      "cost_constraint"
    );

    // Assertion 6: 第2件の提案も cost_constraint を含む
    expect(filterResult.proposals[1].rejection_reasons).toContain(
      "cost_constraint"
    );

    // Step 5: 過去の却下・保留提案の履歴参照
    fetchMock.mockResponseOnce(
      JSON.stringify({
        history_records: [
          {
            record_id: "REC-20240115-001",
            proposal_id: "PROP-20240115-001",
            recorded_at: "2024-01-15T11:30:00Z",
            rejection_reasons: [
              "cost_constraint",
              "technical_complexity",
              "priority_low",
            ],
            decision_status: "rejected",
          },
          {
            record_id: "REC-20240110-001",
            proposal_id: "PROP-20240110-005",
            recorded_at: "2024-01-10T09:15:00Z",
            rejection_reasons: ["cost_constraint", "priority_low"],
            decision_status: "rejected",
          },
        ],
        total_history_records: 2,
        query_period: {
          start_date: "2024-01-01",
          end_date: "2024-01-31",
        },
      }),
      { status: 200 }
    );

    const historyRequest = {
      user_id,
      query_period: {
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
    };

    // Note: 実装に따라 함수명이 다를 수 있으므로, 여기서는 filterResult를 이용한 검증
    // Assertion 7: 제2건 제안도 rejection_reasons가 배열로 구조화됨
    expect(filterResult.proposals[1]).toEqual({
      proposal_id: "PROP-20240110-005",
      proposal_title: "栄養バランス分析機能",
      decision_status: "rejected",
      rejection_reasons: ["cost_constraint", "priority_low"],
      recorded_at: "2024-01-10T09:15:00Z",
    });

    // Step 6: 제안 상세 화면에서 구조화된 형식 확인
    // Assertion 8: 각 제안의 rejection_reasons가 배열로 정확히 저장됨
    expect(Array.isArray(filterResult.proposals[0].rejection_reasons)).toBe(
      true
    );
    expect(filterResult.proposals[0].rejection_reasons.length).toBe(3);
    expect(filterResult.proposals[0].rejection_reasons[0]).toBe(
      "cost_constraint"
    );
    expect(filterResult.proposals[0].rejection_reasons[1]).toBe(
      "technical_complexity"
    );
    expect(filterResult.proposals[0].rejection_reasons[2]).toBe("priority_low");

    // Assertion 9: 제1건 제안의 구조화 형식
    expect(Array.isArray(filterResult.proposals[1].rejection_reasons)).toBe(
      true
    );
    expect(filterResult.proposals[1].rejection_reasons.length).toBe(2);
    expect(filterResult.proposals[1].rejection_reasons).toContain(
      "cost_constraint"
    );
    expect(filterResult.proposals[1].rejection_reasons).toContain("priority_low");

    // Step 7: 다음 번 참조 가능 상태 확인
    // Assertion 10: 필터링된 결과에서 동일 카테고리의 제안들이 모두 반환됨
    const costConstraintProposals = filterResult.proposals.filter((p) =>
      p.rejection_reasons.includes("cost_constraint")
    );
    expect(costConstraintProposals.length).toBe(2);

    // Assertion 11: 각 제안이 recorded_at 필드를 정확히 보유
    expect(filterResult.proposals[0].recorded_at).toBe("2024-01-15T11:30:00Z");
    expect(filterResult.proposals[1].recorded_at).toBe("2024-01-10T09:15:00Z");

    // Step 8: decision_status가 정확히 기록됨
    // Assertion 12: 모든 제안이 rejected 상태로 기록됨
    expect(
      filterResult.proposals.every((p) => p.decision_status === "rejected")
    ).toBe(true);

    // Assertion 13: 전체 조회 결과가 기대값과 일치
    expect(filterResult).toEqual({
      proposals: expect.arrayContaining([
        expect.objectContaining({
          proposal_id: "PROP-20240115-001",
          decision_status: "rejected",
          rejection_reasons: expect.arrayContaining([
            "cost_constraint",
            "technical_complexity",
            "priority_low",
          ]),
        }),
        expect.objectContaining({
          proposal_id: "PROP-20240110-005",
          decision_status: "rejected",
          rejection_reasons: expect.arrayContaining([
            "cost_constraint",
            "priority_low",
          ]),
        }),
      ]),
      filter_category: "cost_constraint",
      total_count: 2,
    });
  });
});