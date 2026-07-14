import { notifyDevelopmentTeamOfPriorityProposals } from "../../src/logic/it-7-2-1";

describe("栄養士改善提案の優先度通知機能", () => {
  test("SCEN-573: 通知対象の開発チーム情報が不正な場合、エラーが発生して通知送信が失敗する", () => {
    const validProposal = {
      proposalId: "PROP-001",
      title: "栄養基準値の最適化",
      priority: 85,
      businessValue: 90,
      technicalDifficulty: 60,
      userImpact: 75,
      estimatedImplementationHours: 40,
      expectedEffectScore: 0.8,
      affectedNutrientItems: ["calcium", "protein"],
      affectedUserSegments: ["working_couple", "homemaker"],
      affectedDietaryRestrictionTypes: ["allergy", "time_constraint"],
      createdAt: new Date("2024-01-15T10:00:00Z"),
      createdByNutritionistId: "NUT-001",
    };

    // ケース1: teamInfo が null
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: null as any,
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース2: teamInfo が undefined
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: undefined as any,
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース3: teamInfo が空オブジェクト
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: {} as any,
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース4: teamInfo.teamId が空文字列
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: {
          teamId: "",
          teamName: "Development Team A",
          memberEmails: ["dev1@example.com", "dev2@example.com"],
          slackChannelId: "C123456",
        },
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース5: teamInfo.teamName が空文字列
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: {
          teamId: "TEAM-001",
          teamName: "",
          memberEmails: ["dev1@example.com"],
          slackChannelId: "C123456",
        },
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース6: teamInfo.memberEmails が空配列
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: {
          teamId: "TEAM-001",
          teamName: "Development Team A",
          memberEmails: [],
          slackChannelId: "C123456",
        },
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース7: teamInfo.memberEmails に無効なメールアドレスが含まれている
    expect(() => {
      notifyDevelopmentTeamOfPriorityProposals({
        proposal: validProposal,
        teamInfo: {
          teamId: "TEAM-001",
          teamName: "Development Team A",
          memberEmails: ["invalid-email", "dev2@example.com"],
          slackChannelId: "C123456",
        },
        notificationChannels: ["email", "slack"],
      });
    }).toThrow(/チーム情報/);

    // ケース8: 正常なチーム情報での成功ケース
    const result = notifyDevelopmentTeamOfPriorityProposals({
      proposal: validProposal,
      teamInfo: {
        teamId: "TEAM-001",
        teamName: "Development Team A",
        memberEmails: ["dev1@example.com", "dev2@example.com"],
        slackChannelId: "C123456",
      },
      notificationChannels: ["email", "slack"],
    });

    expect(result).toEqual({
      success: true,
      notificationId: expect.any(String),
      sentAt: expect.any(Date),
      sentToEmails: ["dev1@example.com", "dev2@example.com"],
      sentToSlackChannelId: "C123456",
      proposalPriority: 85,
      estimatedImplementationHours: 40,
      expectedEffectScore: 0.8,
    });

    expect(result.success).toBe(true);
    expect(result.sentToEmails).toHaveLength(2);
    expect(result.sentToEmails).toContain("dev1@example.com");
    expect(result.sentToEmails).toContain("dev2@example.com");
    expect(result.sentToSlackChannelId).toBe("C123456");
    expect(result.proposalPriority).toBe(85);
    expect(result.estimatedImplementationHours).toBe(40);
    expect(result.expectedEffectScore).toBe(0.8);
  });
});