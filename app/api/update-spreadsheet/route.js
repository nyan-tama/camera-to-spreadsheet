import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
    try {
        const { spreadsheetId, cellReference, text } = await request.json();

        // リクエストの検証
        if (!spreadsheetId || !cellReference || !text) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'スプレッドシートID、セル参照、およびテキストが必要です'
                },
                { status: 400 }
            );
        }

        // サービスアカウント認証情報の取得
        let serviceAccountKey;
        try {
            serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        } catch (error) {
            console.error('サービスアカウントキーの解析エラー:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'サービスアカウントキーの設定に問題があります'
                },
                { status: 500 }
            );
        }

        // Google APIクライアントの設定
        const auth = new google.auth.JWT(
            serviceAccountKey.client_email,
            null,
            serviceAccountKey.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        // 更新する列を特定 (例えばメモ欄の列など)
        // 例: cellReference = "Sheet1!A5" から "Sheet1!R5" (R列がメモ欄と仮定)
        const parts = cellReference.split('!');
        const sheetName = parts[0];
        const rowRef = parts[1].replace(/[A-Z]/g, ''); // 数字部分のみ抽出
        const memoCell = `${sheetName}!R${rowRef}`; // R列（メモ欄）を指定

        // スプレッドシートの更新
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: memoCell, // メモ欄に更新
            valueInputOption: 'RAW',
            requestBody: {
                values: [[text]], // セル値として設定
            },
        });

        return NextResponse.json({
            success: true,
            message: 'スプレッドシートが更新されました'
        });
    } catch (error) {
        console.error('スプレッドシート更新エラー:', error);
        return NextResponse.json(
            {
                success: false,
                message: `スプレッドシートの更新中にエラーが発生しました: ${error.message}`
            },
            { status: 500 }
        );
    }
} 