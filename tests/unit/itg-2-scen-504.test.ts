import { validateAndApproveNutritionReport } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善提案の優先度付けと開発チーム提出 - レポート承認判定', () => {
  test('SCEN-504: [normal] 承認基準を満たすレポートを承認判定として処理する', () => {
    // Arrange: 承認基準を満たすレポートデータを準備
    const reportId = 'RPT-20240115-001';
    const reportData = {
      reportId,
      createdAt: new Date('2024-01-15T09:00:00Z'),
      nutritionItems: [
        {
          itemId: 'NUT-001',
          itemName: 'タンパク質',
          targetValue: 50,
          actualValue: 48,
          achievementRate: 96,
          status: 'checked'
        },
        {
          itemId: 'NUT-002',
          itemName: '脂質',
          targetValue: 65,
          actualValue: 62,
          achievementRate: 95,
          status: 'checked'
        },
        {
          itemId: 'NUT-003',
          itemName: '炭水化物',
          targetValue: 325,
          actualValue: 318,
          achievementRate: 98,
          status: 'checked'
        }
      ],
      allItemsChecked: true,
      improvementGapCount: 2,
      improvementGapList: [
        {
          gapId: 'GAP-001',
          nutritionItemId: 'NUT-001',
          gapValue: 2,
          priority: 1
        },
        {
          gapId: 'GAP-002',
          nutritionItemId: 'NUT-002',
          gapValue: 3,
          priority: 2
        }
      ],
      validationStatus: 'normal_range',
      valueOutOfRangeCount: 0,
      approvalCriteria: {
        allItemsRequiredChecked: true,
        valueRangeCheckRequired: true,
        minimumGapDetectionRequired: 1
      },
      submittedBy: 'nutritionist-001',
      submittedAt: new Date('2024-01-15T10:30:00Z'),
      currentStatus: 'pending_approval'
    };

    // Act: レポート承認判定処理を実行
    const approvalResult = validateAndApproveNutritionReport(reportData);

    // Assert: 承認判定処理の結果を検証
    expect(approvalResult).toEqual({
      reportId: 'RPT-20240115-001',
      approvalStatus: 'approved',
      approvalDate: expect.any(Date),
      approvalValidation: {
        allItemsCheckedValidation: true,
        valueRangeValidation: true,
        improvementGapDetectionValidation: true,
        overallApprovalDecision: true
      },
      previousStatus: 'pending_approval',
      updatedStatus: 'approved',
      approvalNotes: 'レポートが承認基準をすべて満たしています。栄養項目の達成度スコアは正常範囲内です。',
      createdAt: reportData.createdAt,
      approvedAt: expect.any(Date)
    });

    // 詳細検証: ステータス更新確認
    expect(approvalResult.updatedStatus).toBe('approved');

    // 詳細検証: 承認日時が記録されていることを確認
    expect(approvalResult.approvalDate).toBeInstanceOf(Date);
    expect(approvalResult.approvedAt).toBeInstanceOf(Date);

    // 詳細検証: すべての承認基準が満たされていることを確認
    expect(approvalResult.approvalValidation.allItemsCheckedValidation).toBe(true);
    expect(approvalResult.approvalValidation.valueRangeValidation).toBe(true);
    expect(approvalResult.approvalValidation.improvementGapDetectionValidation).toBe(true);
    expect(approvalResult.approvalValidation.overallApprovalDecision).toBe(true);

    // 詳細検証: 承認決定理由が記録されていることを確認
    expect(approvalResult.approvalNotes).toContain('承認基準');
    expect(approvalResult.approvalNotes).toContain('栄養項目');
  });

  test('SCEN-504: [error] 承認基準を満たさないレポート（チェック未完了）は承認不可', () => {
    // Arrange: 一部項目チェック未完了のレポートデータ
    const incompleteReportData = {
      reportId: 'RPT-20240115-002',
      createdAt: new Date('2024-01-15T09:00:00Z'),
      nutritionItems: [
        {
          itemId: 'NUT-001',
          itemName: 'タンパク質',
          targetValue: 50,
          actualValue: 48,
          achievementRate: 96,
          status: 'checked'
        },
        {
          itemId: 'NUT-002',
          itemName: '脂質',
          targetValue: 65,
          actualValue: 62,
          achievementRate: 95,
          status: 'unchecked'
        }
      ],
      allItemsChecked: false,
      valueOutOfRangeCount: 0,
      validationStatus: 'incomplete',
      currentStatus: 'pending_approval'
    };

    // Act & Assert: レポート承認判定がエラーをスロー
    expect(() => validateAndApproveNutritionReport(incompleteReportData)).toThrow(/項目チェック/);
  });

  test('SCEN-504: [error] 承認基準を満たさないレポート（異常値検出）は承認不可', () => {
    // Arrange: 異常値を含むレポートデータ
    const abnormalReportData = {
      reportId: 'RPT-20240115-003',
      createdAt: new Date('2024-01-15T09:00:00Z'),
      nutritionItems: [
        {
          itemId: 'NUT-001',
          itemName: 'タンパク質',
          targetValue: 50,
          actualValue: 150,
          achievementRate: 300,
          status: 'checked'
        }
      ],
      allItemsChecked: true,
      valueOutOfRangeCount: 1,
      validationStatus: 'out_of_range',
      currentStatus: 'pending_approval'
    };

    // Act & Assert: レポート承認判定がエラーをスロー
    expect(() => validateAndApproveNutritionReport(abnormalReportData)).toThrow(/異常値/);
  });
});