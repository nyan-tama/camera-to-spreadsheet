import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        // 環境変数の存在確認
        const debugInfo = {
            hasGoogleServiceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
            keyLength: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.length : 0,
            hasSpreadsheetId: !!process.env.SPREADSHEET_ID,
            spreadsheetId: process.env.SPREADSHEET_ID || '未設定',
            apiKeys: {
                hasOpenAI: !!process.env.OPENAI_API_KEY,
                openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
            },
            nodeEnv: process.env.NODE_ENV,
            serviceAccountKeyPreview: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
                ? `${process.env.GOOGLE_SERVICE_ACCOUNT_KEY.substring(0, 20)}...（長さ: ${process.env.GOOGLE_SERVICE_ACCOUNT_KEY.length}文字）`
                : '未設定'
        };

        // Google APIへの接続テスト
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
            try {
                // サービスアカウントキーのパース
                const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

                // キー情報の検証（プライベートキーは隠す）
                debugInfo.serviceAccountInfo = {
                    type: serviceAccountKey.type,
                    project_id: serviceAccountKey.project_id,
                    client_email: serviceAccountKey.client_email,
                    has_private_key: !!serviceAccountKey.private_key,
                    private_key_length: serviceAccountKey.private_key ? serviceAccountKey.private_key.length : 0
                };

                // Google API接続テスト
                const auth = new google.auth.GoogleAuth({
                    credentials: serviceAccountKey,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
                });

                // 認証情報取得テスト
                const client = await auth.getClient();
                debugInfo.authSuccess = !!client;

                // スプレッドシート接続テスト（設定されている場合のみ）
                if (process.env.SPREADSHEET_ID) {
                    const sheets = google.sheets({ version: 'v4', auth });
                    try {
                        const response = await sheets.spreadsheets.get({
                            spreadsheetId: process.env.SPREADSHEET_ID
                        });
                        debugInfo.spreadsheetInfo = {
                            title: response.data.properties.title,
                            locale: response.data.properties.locale,
                            sheets: response.data.sheets.length,
                            accessSuccess: true
                        };
                    } catch (sheetError) {
                        debugInfo.spreadsheetError = {
                            message: sheetError.message,
                            code: sheetError.code,
                            details: sheetError.response?.data?.error || '詳細情報なし'
                        };
                    }
                }
            } catch (parseError) {
                debugInfo.parseError = {
                    message: parseError.message,
                    isJsonError: parseError instanceof SyntaxError
                };
            }
        }

        return NextResponse.json(debugInfo);
    } catch (error) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
} 