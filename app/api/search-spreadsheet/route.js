import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
    try {
        const { spreadsheetId, searchTerm } = await request.json();

        // リクエストの検証
        if (!spreadsheetId || !searchTerm) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'スプレッドシートIDと検索キーワードが必要です'
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
            ['https://www.googleapis.com/auth/spreadsheets.readonly']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        // スプレッドシートのシート一覧を取得
        const sheetsList = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets.properties'
        });

        const sheetNames = sheetsList.data.sheets.map(sheet => sheet.properties.title);

        // 検索結果を格納する配列
        const searchResults = [];

        // 各シートを左から順に検索
        for (const sheetName of sheetNames) {
            // シートデータを取得
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:Q` // A列からQ列までのデータを取得
            });

            const rows = response.data.values || [];

            // 各行をチェック (ヘッダー行をスキップ)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];

                // B列が「入金済み」の場合のみ処理
                if (row[1] === '入金済み') {
                    // G列(氏名), H列(会社名), Q列(電話番号)のいずれかが検索キーワードに一致するか確認
                    const name = row[6] || '';
                    const company = row[7] || '';
                    const phone = row[16] || '';

                    // 検索キーワードを含むかどうかチェック (大文字小文字を区別しない)
                    if (
                        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        phone.includes(searchTerm) // 電話番号は完全一致でチェック
                    ) {
                        searchResults.push({
                            sheetName,
                            rowIndex: i + 1, // 1-indexed for display
                            name,
                            company,
                            phone,
                            cellReference: `${sheetName}!A${i + 1}` // セル参照を保存
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            results: searchResults
        });
    } catch (error) {
        console.error('スプレッドシート検索エラー:', error);
        return NextResponse.json(
            {
                success: false,
                message: `スプレッドシートの検索中にエラーが発生しました: ${error.message}`
            },
            { status: 500 }
        );
    }
} 