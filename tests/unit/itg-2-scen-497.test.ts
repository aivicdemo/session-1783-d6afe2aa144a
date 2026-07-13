import { generateDeveloperNotification } from '../../src/logic/it-1-br-2-1-2-1';

describe('開発チーム通知生成 - 必須フィールド検証', () => {
  // SCEN-497
  test('必須フィールド欠落時に通知生成エラーを返す', () => {
    // ハッピーパス: 全必須フィールド入力 → 通知生成成功
    const validNotificationInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: 'appDevelopmentTeam',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    const validResult = generateDeveloperNotification(validNotificationInput);
    expect(validResult.isError).toBe(false);
    expect(validResult.notificationId).toBeDefined();
    expect(validResult.sentAt).toBeDefined();

    // エラーケース1: 通知タイトル欠落
    const missingTitleInput = {
      notificationTitle: '',
      destinationTeam: 'appDevelopmentTeam',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(missingTitleInput)).toThrow(/通知タイトル/);

    // エラーケース2: 宛先チーム欠落
    const missingDestinationInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: '',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(missingDestinationInput)).toThrow(/宛先チーム/);

    // エラーケース3: 優先度欠落
    const missingPriorityInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: 'appDevelopmentTeam',
      priority: '',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(missingPriorityInput)).toThrow(/優先度/);

    // エラーケース4: 提案説明欠落
    const missingDescriptionInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: 'appDevelopmentTeam',
      priority: 'high',
      proposalDescription: '',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(missingDescriptionInput)).toThrow(/提案説明/);

    // エラーケース5: 提案者欠落
    const missingProposerInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: 'appDevelopmentTeam',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: '',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(missingProposerInput)).toThrow(/提案者/);

    // エラーケース6: 実装予定日欠落
    const missingDateInput = {
      notificationTitle: '栄養基準ロジック改善提案',
      destinationTeam: 'appDevelopmentTeam',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '',
    };

    expect(() => generateDeveloperNotification(missingDateInput)).toThrow(/実装予定日/);

    // エラーケース7: 複数フィールド欠落 → 最初の欠落フィールドをエラーとして返す
    const multipleFieldsMissingInput = {
      notificationTitle: '',
      destinationTeam: '',
      priority: 'high',
      proposalDescription: '月次検証で栄養項目Aの達成度が50%以下のため改善が必要',
      proposedBy: 'nutritionist_001',
      targetImplementationDate: '2024-02-28',
    };

    expect(() => generateDeveloperNotification(multipleFieldsMissingInput)).toThrow(/通知タイトル/);

    // エラーオブジェクト検証: 欠落フィールド名と統一メッセージを含む
    let errorThrown = false;
    let errorMessage = '';
    try {
      generateDeveloperNotification(missingTitleInput);
    } catch (error: any) {
      errorThrown = true;
      errorMessage = error.message;
    }

    expect(errorThrown).toBe(true);
    expect(errorMessage).toMatch(/必須フィールドが不足しています/);
    expect(errorMessage).toMatch(/通知タイトル/);
  });
});