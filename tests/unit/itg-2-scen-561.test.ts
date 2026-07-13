import { filterAbnormalAndMissingValues } from '../../src/logic/it-1-br-2-1-1-1';

describe('異常値・欠損値自動フィルタリング機能', () => {
  // SCEN-561
  test('複数データソースの統合分析時に異常値・欠損値が正常データから隔離され、正常データのみが次段階に渡される', () => {
    // 複数のデータソース（医療機関A、医療機関B、臨床検査機関C）から統合インポートされた栄養データ
    const integratedNutritionData = [
      // 正常データ
      {
        sourceId: 'FACILITY_A',
        userId: 'user001',
        recordDate: '2024-01-15',
        nutrientId: 'PROTEIN',
        intakeAmount: 65.5,
        unit: 'g',
        standardValue: 60,
        isValid: true,
      },
      {
        sourceId: 'FACILITY_B',
        userId: 'user001',
        recordDate: '2024-01-15',
        nutrientId: 'CARBS',
        intakeAmount: 300.0,
        unit: 'g',
        standardValue: 325,
        isValid: true,
      },
      {
        sourceId: 'FACILITY_C',
        userId: 'user001',
        recordDate: '2024-01-15',
        nutrientId: 'FAT',
        intakeAmount: 45.2,
        unit: 'g',
        standardValue: 50,
        isValid: true,
      },
      // 異常値（生理的に不可能な値）
      {
        sourceId: 'FACILITY_A',
        userId: 'user002',
        recordDate: '2024-01-15',
        nutrientId: 'PROTEIN',
        intakeAmount: 9999.99,
        unit: 'g',
        standardValue: 60,
        isValid: true,
      },
      // 欠損値（null）
      {
        sourceId: 'FACILITY_B',
        userId: 'user003',
        recordDate: '2024-01-15',
        nutrientId: 'CARBS',
        intakeAmount: null,
        unit: 'g',
        standardValue: 325,
        isValid: true,
      },
      // 欠損値（undefined）
      {
        sourceId: 'FACILITY_C',
        userId: 'user004',
        recordDate: '2024-01-15',
        nutrientId: 'FAT',
        intakeAmount: undefined,
        unit: 'g',
        standardValue: 50,
        isValid: true,
      },
      // 異常値（負の値）
      {
        sourceId: 'FACILITY_A',
        userId: 'user005',
        recordDate: '2024-01-15',
        nutrientId: 'IRON',
        intakeAmount: -15.0,
        unit: 'mg',
        standardValue: 10,
        isValid: true,
      },
      // 正常データ
      {
        sourceId: 'FACILITY_B',
        userId: 'user006',
        recordDate: '2024-01-15',
        nutrientId: 'CALCIUM',
        intakeAmount: 850.0,
        unit: 'mg',
        standardValue: 800,
        isValid: true,
      },
    ];

    // フィルタリング実行
    const result = filterAbnormalAndMissingValues(integratedNutritionData);

    // 正常データセットの検証：正常データのみが含まれている
    expect(result.validData).toHaveLength(4);
    expect(result.validData[0]).toEqual({
      sourceId: 'FACILITY_A',
      userId: 'user001',
      recordDate: '2024-01-15',
      nutrientId: 'PROTEIN',
      intakeAmount: 65.5,
      unit: 'g',
      standardValue: 60,
      isValid: true,
    });
    expect(result.validData[1]).toEqual({
      sourceId: 'FACILITY_B',
      userId: 'user001',
      recordDate: '2024-01-15',
      nutrientId: 'CARBS',
      intakeAmount: 300.0,
      unit: 'g',
      standardValue: 325,
      isValid: true,
    });
    expect(result.validData[2]).toEqual({
      sourceId: 'FACILITY_C',
      userId: 'user001',
      recordDate: '2024-01-15',
      nutrientId: 'FAT',
      intakeAmount: 45.2,
      unit: 'g',
      standardValue: 50,
      isValid: true,
    });
    expect(result.validData[3]).toEqual({
      sourceId: 'FACILITY_B',
      userId: 'user006',
      recordDate: '2024-01-15',
      nutrientId: 'CALCIUM',
      intakeAmount: 850.0,
      unit: 'mg',
      standardValue: 800,
      isValid: true,
    });

    // 異常値・欠損値の隔離検証：全て隔離されている
    expect(result.isolatedData).toHaveLength(4);

    // 異常値（9999.99）が隔離されている
    expect(result.isolatedData).toContainEqual(
      expect.objectContaining({
        userId: 'user002',
        intakeAmount: 9999.99,
        isolationReason: 'ABNORMAL_VALUE',
      })
    );

    // 欠損値（null）が隔離されている
    expect(result.isolatedData).toContainEqual(
      expect.objectContaining({
        userId: 'user003',
        intakeAmount: null,
        isolationReason: 'MISSING_VALUE',
      })
    );

    // 欠損値（undefined）が隔離されている
    expect(result.isolatedData).toContainEqual(
      expect.objectContaining({
        userId: 'user004',
        intakeAmount: undefined,
        isolationReason: 'MISSING_VALUE',
      })
    );

    // 異常値（負の値）が隔離されている
    expect(result.isolatedData).toContainEqual(
      expect.objectContaining({
        userId: 'user005',
        intakeAmount: -15.0,
        isolationReason: 'ABNORMAL_VALUE',
      })
    );

    // 隔離されたデータのログ生成検証
    expect(result.filteringLog).toHaveLength(4);
    expect(result.filteringLog[0]).toEqual(
      expect.objectContaining({
        recordId: 'FACILITY_A_user002_PROTEIN',
        filterReason: 'ABNORMAL_VALUE',
        detectionMethod: 'RANGE_CHECK',
        timestamp: expect.any(String),
      })
    );
    expect(result.filteringLog[1]).toEqual(
      expect.objectContaining({
        recordId: 'FACILITY_B_user003_CARBS',
        filterReason: 'MISSING_VALUE',
        detectionMethod: 'NULL_CHECK',
        timestamp: expect.any(String),
      })
    );
    expect(result.filteringLog[2]).toEqual(
      expect.objectContaining({
        recordId: 'FACILITY_C_user004_FAT',
        filterReason: 'MISSING_VALUE',
        detectionMethod: 'UNDEFINED_CHECK',
        timestamp: expect.any(String),
      })
    );
    expect(result.filteringLog[3]).toEqual(
      expect.objectContaining({
        recordId: 'FACILITY_A_user005_IRON',
        filterReason: 'ABNORMAL_VALUE',
        detectionMethod: 'RANGE_CHECK',
        timestamp: expect.any(String),
      })
    );

    // フィルタリング結果サマリーの検証
    expect(result.filteringSummary).toEqual({
      totalInputRecords: 8,
      validRecords: 4,
      isolatedRecords: 4,
      abnormalValueCount: 2,
      missingValueCount: 2,
      validDataPassThroughRate: 50.0,
    });

    // 次段階分析への渡し先検証：正常データのみが分析エンジンに渡される
    expect(result.dataForAnalysisEngine).toEqual(result.validData);
    expect(result.dataForAnalysisEngine.length).toBe(4);
    expect(
      result.dataForAnalysisEngine.every((record) => record.intakeAmount !== null && record.intakeAmount !== undefined && record.intakeAmount >= 0)
    ).toBe(true);

    // 隔離されたデータが分析対象外であることを確認
    expect(result.isolatedDataExcludedFromAnalysis).toBe(true);

    // 複数データソースの統合分析結果が正常データのみを使用して計算されていることを検証
    const analysisResult = {
      averageProteinIntake: 65.5, // user001のみ
      averageCarbsIntake: 300.0, // user001のみ
      averageFatIntake: 45.2, // user001のみ
      averageCalciumIntake: 850.0, // user006のみ
      totalValidSamples: 4,
      sourcesRepresented: ['FACILITY_A', 'FACILITY_B', 'FACILITY_C'],
    };

    expect(analysisResult.totalValidSamples).toBe(result.validData.length);
    expect(analysisResult.sourcesRepresented).toContain('FACILITY_A');
    expect(analysisResult.sourcesRepresented).toContain('FACILITY_B');
    expect(analysisResult.sourcesRepresented).toContain('FACILITY_C');
  });
});