import { classifyInterviewContent } from '../../src/logic/it-8-1-1-1';

describe('インタビュー内容自動分類・ペイン要因抽出機能', () => {
  // SCEN-310
  test('入力されるインタビュー記録がテキスト化されていない音声ファイルの場合、形式エラーが返される', () => {
    const audioFileInput = {
      fileName: 'interview_001.mp3',
      fileType: 'audio/mpeg',
      fileContent: new ArrayBuffer(1024),
      uploadedAt: '2024-01-15T10:30:00Z',
    };

    expect(() => classifyInterviewContent(audioFileInput)).toThrow(/形式/);
  });

  test('入力されるインタビュー記録がテキスト化されていないwavファイルの場合、形式エラーが返される', () => {
    const audioFileInput = {
      fileName: 'interview_002.wav',
      fileType: 'audio/wav',
      fileContent: new ArrayBuffer(2048),
      uploadedAt: '2024-01-15T11:00:00Z',
    };

    expect(() => classifyInterviewContent(audioFileInput)).toThrow(/形式/);
  });

  test('入力されるインタビュー記録がテキスト化されていないm4aファイルの場合、形式エラーが返される', () => {
    const audioFileInput = {
      fileName: 'interview_003.m4a',
      fileType: 'audio/mp4',
      fileContent: new ArrayBuffer(1536),
      uploadedAt: '2024-01-15T11:30:00Z',
    };

    expect(() => classifyInterviewContent(audioFileInput)).toThrow(/形式/);
  });

  test('入力されるインタビュー記録がテキスト形式（txt）の場合、正常に分類処理が実行される', () => {
    const textFileInput = {
      fileName: 'interview_001.txt',
      fileType: 'text/plain',
      fileContent: 'ユーザーは食材制限があり、調理時間が限定されているとのこと。予算も気になっているそうです。',
      uploadedAt: '2024-01-15T10:30:00Z',
    };

    const result = classifyInterviewContent(textFileInput);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'success',
        fileName: 'interview_001.txt',
        classification: expect.any(Array),
      })
    );

    expect(result.classification).toContainEqual(
      expect.objectContaining({
        painFactor: expect.stringMatching(/食材制限|調理時間|予算/),
        frequency: expect.any(Number),
        impact: expect.any(Number),
      })
    );
  });

  test('入力されるインタビュー記録がPDF形式の場合、正常に分類処理が実行される', () => {
    const pdfFileInput = {
      fileName: 'interview_report.pdf',
      fileType: 'application/pdf',
      fileContent: '%PDF-1.4 ユーザーは毎日30分以内で調理を完了する必要がある。',
      uploadedAt: '2024-01-15T11:00:00Z',
    };

    const result = classifyInterviewContent(pdfFileInput);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'success',
        fileName: 'interview_report.pdf',
        classification: expect.any(Array),
      })
    );

    expect(result.classification.length).toBeGreaterThan(0);
  });

  test('入力されるインタビュー記録がdocx形式の場合、正常に分類処理が実行される', () => {
    const docxFileInput = {
      fileName: 'interview_notes.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileContent: 'PK...',
      uploadedAt: '2024-01-15T11:30:00Z',
    };

    const result = classifyInterviewContent(docxFileInput);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'success',
        fileName: 'interview_notes.docx',
        classification: expect.any(Array),
      })
    );

    expect(result.classification).toBeDefined();
  });

  test('形式エラーのレスポンスボディにはエラーコード\'INVALID_FILE_FORMAT\'が含まれる', () => {
    const audioFileInput = {
      fileName: 'interview_004.mp3',
      fileType: 'audio/mpeg',
      fileContent: new ArrayBuffer(512),
      uploadedAt: '2024-01-15T12:00:00Z',
    };

    try {
      classifyInterviewContent(audioFileInput);
      fail('エラーがスローされるべき');
    } catch (error: any) {
      expect(error).toEqual(
        expect.objectContaining({
          errorCode: 'INVALID_FILE_FORMAT',
          message: expect.stringMatching(/テキスト化されたファイル/),
        })
      );
    }
  });

  test('形式エラーのメッセージに許可されたファイル形式（txt, pdf, docx）が記載される', () => {
    const audioFileInput = {
      fileName: 'interview_005.wav',
      fileType: 'audio/wav',
      fileContent: new ArrayBuffer(768),
      uploadedAt: '2024-01-15T12:30:00Z',
    };

    try {
      classifyInterviewContent(audioFileInput);
      fail('エラーがスローされるべき');
    } catch (error: any) {
      expect(error.message).toMatch(/txt|pdf|docx/);
    }
  });

  test('複数の音声ファイル形式（mp3, wav, m4a）に対してすべてエラーとなる', () => {
    const audioFormats = [
      { fileName: 'int_001.mp3', fileType: 'audio/mpeg' },
      { fileName: 'int_002.wav', fileType: 'audio/wav' },
      { fileName: 'int_003.m4a', fileType: 'audio/mp4' },
    ];

    audioFormats.forEach((format) => {
      const input = {
        ...format,
        fileContent: new ArrayBuffer(1024),
        uploadedAt: '2024-01-15T13:00:00Z',
      };

      expect(() => classifyInterviewContent(input)).toThrow(/形式/);
    });
  });
});