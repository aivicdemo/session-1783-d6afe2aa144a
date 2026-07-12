import { validateScheduleSetup } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-701
  test("前四半期の成果物が確定していない場合にスケジュール設定がエラーで遮断される", () => {
    const scheduleInput = {
      phaseName: "Q1 ユーザー行動分析",
      startDateTime: new Date("2024-04-01T09:00:00Z"),
      endDateTime: new Date("2024-04-30T17:00:00Z"),
      assignedTeamMembers: ["PM001", "PM002"],
    };

    const previousQuarterDeliverables = {
      isConfirmed: false,
      confirmationDate: null,
      deliverableItems: [],
    };

    expect(() =>
      validateScheduleSetup(scheduleInput, previousQuarterDeliverables)
    ).toThrow(/前四半期の成果物/);
  });
});