import { confirmEmergencyMeetingParticipants } from "../../src/logic/it-1-1-1";

describe("アルゴリズム改善レビュー会議参加者確認", () => {
  test("SCEN-586: 重大なアルゴリズム障害発生時、緊急会議参加者リストが正しく確定される", () => {
    // Precondition: 献立自動生成アプリにログイン、管理者権限、アルゴリズムエンジン障害状態設定
    const algorithmFailureDetected = true;
    const emergencyMeetingTriggered = true;

    // Input: 障害検出時の初期参加者情報
    const initialParticipantsInput = {
      developmentTeamLead: {
        id: "dev_lead_001",
        name: "山田太郎",
        email: "yamada.taro@company.com",
        phone: "+81-90-1234-5678",
        role: "開発チームリード",
      },
      qaResponsible: {
        id: "qa_resp_001",
        name: "鈴木花子",
        email: "suzuki.hanako@company.com",
        phone: "+81-90-2345-6789",
        role: "品質保証責任者",
      },
      productOwner: {
        id: "po_001",
        name: "佐藤次郎",
        email: "sato.jiro@company.com",
        phone: "+81-90-3456-7890",
        role: "プロダクト責任者",
      },
      algorithmExpert: {
        id: "algo_expert_001",
        name: "鈴木博士",
        email: "suzuki.hakase@company.com",
        phone: "+81-90-4567-8901",
        role: "アルゴリズム専門家",
      },
    };

    // Trigger: 緊急会議参加者確定処理を実行
    const result = confirmEmergencyMeetingParticipants({
      isAlgorithmFailureDetected: algorithmFailureDetected,
      isEmergencyMeetingTriggered: emergencyMeetingTriggered,
      initialParticipants: initialParticipantsInput,
    });

    // Assertion 1: 返却されたリストに必須参加者が全て含まれていること
    expect(result.confirmedParticipants).toHaveLength(4);

    // Assertion 2: 各参加者の必須情報が正確に保存されていること
    expect(result.confirmedParticipants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "dev_lead_001",
          name: "山田太郎",
          email: "yamada.taro@company.com",
          phone: "+81-90-1234-5678",
          role: "開発チームリード",
        }),
        expect.objectContaining({
          id: "qa_resp_001",
          name: "鈴木花子",
          email: "suzuki.hanako@company.com",
          phone: "+81-90-2345-6789",
          role: "品質保証責任者",
        }),
        expect.objectContaining({
          id: "po_001",
          name: "佐藤次郎",
          email: "sato.jiro@company.com",
          phone: "+81-90-3456-7890",
          role: "プロダクト責任者",
        }),
        expect.objectContaining({
          id: "algo_expert_001",
          name: "鈴木博士",
          email: "suzuki.hakase@company.com",
          phone: "+81-90-4567-8901",
          role: "アルゴリズム専門家",
        }),
      ])
    );

    // Assertion 3: 参加者リストに重複がないこと
    const participantIds = result.confirmedParticipants.map((p) => p.id);
    const uniqueParticipantIds = new Set(participantIds);
    expect(participantIds).toHaveLength(uniqueParticipantIds.size);

    // Assertion 4: 全ての参加者にメールアドレスが登録されていること
    result.confirmedParticipants.forEach((participant) => {
      expect(participant.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    // Assertion 5: 全ての参加者に電話番号が登録されていること
    result.confirmedParticipants.forEach((participant) => {
      expect(participant.phone).toMatch(/^\+81-\d{2}-\d{3,4}-\d{4}$/);
    });

    // Assertion 6: 確定ステータスがtrueであること
    expect(result.isConfirmed).toBe(true);

    // Assertion 7: 確定日時がISO 8601形式で記録されていること
    expect(result.confirmedAt).toBe("2024-12-19T14:30:00Z");

    // Assertion 8: 確定されたリストがデータベースに保存されたことを示すフラグ
    expect(result.isSavedToDatabase).toBe(true);

    // Assertion 9: 障害検出とロール管理が正しく連携されていること
    expect(result.emergencyMeetingStatus).toBe("participants_confirmed");

    // Assertion 10: 参加者全員が有効な状態で登録されていること
    result.confirmedParticipants.forEach((participant) => {
      expect(participant.isActive).toBe(true);
    });
  });
});