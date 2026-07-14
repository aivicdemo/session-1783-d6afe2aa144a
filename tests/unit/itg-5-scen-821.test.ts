import { detectAndResolveRuleVersionConflicts } from '../../src/logic/it-7-2-1';

describe('Rule Specification Version Management - Simultaneous Update Conflict Detection and Resolution', () => {
  // SCEN-821: [edge] ルール仕様書バージョン管理機能 - 同一時刻に複数のルール仕様書更新が発生した場合、バージョン番号の競合が適切に検出・解決される
  test('should detect and resolve version conflicts when multiple rule spec updates occur at identical timestamps', () => {
    const identicalTimestamp = new Date('2024-01-15T14:30:00.000Z');
    const baseRuleSpecId = 'RULE-SPEC-001';
    const currentVersion = '1.0';

    const simultaneousUpdateRequest1 = {
      ruleSpecId: baseRuleSpecId,
      currentVersion: currentVersion,
      newVersion: '1.1',
      ruleContent: {
        seasonalPattern: 'winter-produce-priority',
        discountThreshold: 15,
        saleStartDate: new Date('2024-01-01'),
        saleEndDate: new Date('2024-02-28'),
      },
      updatedBy: 'user-A',
      updatedAt: identicalTimestamp,
      conflictKey: `${baseRuleSpecId}:${identicalTimestamp.getTime()}`,
    };

    const simultaneousUpdateRequest2 = {
      ruleSpecId: baseRuleSpecId,
      currentVersion: currentVersion,
      newVersion: '1.1',
      ruleContent: {
        seasonalPattern: 'root-vegetables-priority',
        discountThreshold: 20,
        saleStartDate: new Date('2024-01-01'),
        saleEndDate: new Date('2024-03-31'),
      },
      updatedBy: 'user-B',
      updatedAt: identicalTimestamp,
      conflictKey: `${baseRuleSpecId}:${identicalTimestamp.getTime()}`,
    };

    const simultaneousUpdateRequest3 = {
      ruleSpecId: baseRuleSpecId,
      currentVersion: currentVersion,
      newVersion: '1.1',
      ruleContent: {
        seasonalPattern: 'citrus-fruits-priority',
        discountThreshold: 18,
        saleStartDate: new Date('2024-01-01'),
        saleEndDate: new Date('2024-04-30'),
      },
      updatedBy: 'user-C',
      updatedAt: identicalTimestamp,
      conflictKey: `${baseRuleSpecId}:${identicalTimestamp.getTime()}`,
    };

    const updateRequests = [
      simultaneousUpdateRequest1,
      simultaneousUpdateRequest2,
      simultaneousUpdateRequest3,
    ];

    const result = detectAndResolveRuleVersionConflicts({
      baseRuleSpecId: baseRuleSpecId,
      currentVersion: currentVersion,
      updateRequests: updateRequests,
      conflictResolutionStrategy: 'sequential-versioning',
    });

    // 競合が正確に検出されること
    expect(result.conflictDetected).toBe(true);
    expect(result.conflictCount).toBe(3);
    expect(result.conflictKey).toBe(`${baseRuleSpecId}:${identicalTimestamp.getTime()}`);

    // バージョン番号が連番で採番されること
    expect(result.generatedVersions).toHaveLength(3);
    expect(result.generatedVersions[0].versionNumber).toBe('1.1');
    expect(result.generatedVersions[1].versionNumber).toBe('1.2');
    expect(result.generatedVersions[2].versionNumber).toBe('1.3');

    // バージョン番号の順序が保証されていること
    expect(result.generatedVersions[0].sequenceOrder).toBe(1);
    expect(result.generatedVersions[1].sequenceOrder).toBe(2);
    expect(result.generatedVersions[2].sequenceOrder).toBe(3);

    // 競合フラグが適切に立てられていること
    expect(result.generatedVersions[0].conflictFlag).toBe(true);
    expect(result.generatedVersions[1].conflictFlag).toBe(true);
    expect(result.generatedVersions[2].conflictFlag).toBe(true);

    // ルール内容が期待値と一致していること
    expect(result.generatedVersions[0].ruleContent.seasonalPattern).toBe(
      'winter-produce-priority'
    );
    expect(result.generatedVersions[1].ruleContent.seasonalPattern).toBe(
      'root-vegetables-priority'
    );
    expect(result.generatedVersions[2].ruleContent.seasonalPattern).toBe(
      'citrus-fruits-priority'
    );

    expect(result.generatedVersions[0].ruleContent.discountThreshold).toBe(15);
    expect(result.generatedVersions[1].ruleContent.discountThreshold).toBe(20);
    expect(result.generatedVersions[2].ruleContent.discountThreshold).toBe(18);

    // 競合履歴ログに全ての更新リクエストが記録されていること
    expect(result.conflictHistoryLog).toHaveLength(3);
    expect(result.conflictHistoryLog[0].updateRequestId).toBe(
      simultaneousUpdateRequest1.conflictKey + ':user-A'
    );
    expect(result.conflictHistoryLog[1].updateRequestId).toBe(
      simultaneousUpdateRequest2.conflictKey + ':user-B'
    );
    expect(result.conflictHistoryLog[2].updateRequestId).toBe(
      simultaneousUpdateRequest3.conflictKey + ':user-C'
    );

    // 競合解決タイムスタンプが記録されていること
    expect(result.conflictResolvedAt).toEqual(expect.any(Date));
    expect(result.conflictResolvedAt.getTime()).toBeGreaterThanOrEqual(
      identicalTimestamp.getTime()
    );

    // 競合履歴ログに追跡可能な情報が含まれていること
    result.conflictHistoryLog.forEach((log, index) => {
      expect(log.versionGenerated).toBe(result.generatedVersions[index].versionNumber);
      expect(log.conflictDetectedAt).toEqual(identicalTimestamp);
      expect(log.resolvedVersionNumber).toBe(
        result.generatedVersions[index].versionNumber
      );
      expect(log.resolutionStrategy).toBe('sequential-versioning');
    });

    // 最終的なバージョン管理状態が一貫性のあること
    expect(result.ruleSpecFinalState).toBeDefined();
    expect(result.ruleSpecFinalState.ruleSpecId).toBe(baseRuleSpecId);
    expect(result.ruleSpecFinalState.latestVersion).toBe('1.3');
    expect(result.ruleSpecFinalState.totalVersionsGenerated).toBe(3);
    expect(result.ruleSpecFinalState.allVersionsResolved).toBe(true);

    // 全バージョンが記録ログに含まれていること
    expect(result.ruleSpecFinalState.versionHistory).toHaveLength(4); // 1.0 + 1.1, 1.2, 1.3
    expect(result.ruleSpecFinalState.versionHistory[0].versionNumber).toBe('1.0');
    expect(result.ruleSpecFinalState.versionHistory[1].versionNumber).toBe('1.1');
    expect(result.ruleSpecFinalState.versionHistory[2].versionNumber).toBe('1.2');
    expect(result.ruleSpecFinalState.versionHistory[3].versionNumber).toBe('1.3');

    // 競合フラグが新バージョンに正確に記録されていること
    expect(result.ruleSpecFinalState.versionHistory[1].hasConflict).toBe(true);
    expect(result.ruleSpecFinalState.versionHistory[2].hasConflict).toBe(true);
    expect(result.ruleSpecFinalState.versionHistory[3].hasConflict).toBe(true);

    // 競合解決の一貫性を確保するため、解決済みフラグが立てられていること
    expect(result.allConflictsResolved).toBe(true);
    expect(result.resolutionSuccessful).toBe(true);
  });
});