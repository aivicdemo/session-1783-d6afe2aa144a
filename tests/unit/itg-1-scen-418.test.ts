import { validateSatisfactionScore } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("献立提案後の家族成員による食事評価入力機能", () => {
  test("SCEN-418: [error] 満足度スコア範囲検証機能 - 満足度スコアに小数値3.5が入力された場合、整数範囲外として警告が表示される", () => {
    const input_score_decimal = 3.5;

    const result = validateSatisfactionScore(input_score_decimal);

    expect(result.is_valid).toBe(false);
    expect(result.error_message).toMatch(/整数/);
    expect(result.field_status).toBe("error");
    expect(result.should_block_submission).toBe(true);
  });
});