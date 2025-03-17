'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDebugInfo() {
            try {
                setLoading(true);
                const response = await fetch('/api/debug-connection');
                if (!response.ok) {
                    throw new Error(`サーバーエラー: ${response.status}`);
                }
                const data = await response.json();
                setDebugInfo(data);
                // コンソールにも出力
                console.log('接続情報デバッグ:', data);
            } catch (err: any) {
                setError(err.message);
                console.error('デバッグエラー:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDebugInfo();
    }, []);

    return (
        <div className="container">
            <h1>接続デバッグ情報</h1>

            {loading && <p>情報を取得中...</p>}

            {error && (
                <div className="error-container">
                    <h3>エラーが発生しました</h3>
                    <p>{error}</p>
                </div>
            )}

            {debugInfo && (
                <div className="debug-info">
                    <h3>環境変数</h3>
                    <ul>
                        <li>Google Service Account Key: {debugInfo.hasGoogleServiceAccountKey ? '設定済み' : '未設定'}</li>
                        <li>Spreadsheet ID: {debugInfo.hasSpreadsheetId ? debugInfo.spreadsheetId : '未設定'}</li>
                        <li>OpenAI API Key: {debugInfo.apiKeys.hasOpenAI ? '設定済み' : '未設定'}</li>
                        <li>Node環境: {debugInfo.nodeEnv}</li>
                    </ul>

                    {debugInfo.serviceAccountInfo && (
                        <>
                            <h3>サービスアカウント情報</h3>
                            <ul>
                                <li>タイプ: {debugInfo.serviceAccountInfo.type}</li>
                                <li>プロジェクトID: {debugInfo.serviceAccountInfo.project_id}</li>
                                <li>クライアントメール: {debugInfo.serviceAccountInfo.client_email}</li>
                                <li>プライベートキー: {debugInfo.serviceAccountInfo.has_private_key ? '存在する' : '存在しない'}</li>
                            </ul>
                        </>
                    )}

                    {debugInfo.parseError && (
                        <div className="error-container">
                            <h3>JSON解析エラー</h3>
                            <p>{debugInfo.parseError.message}</p>
                        </div>
                    )}

                    {debugInfo.spreadsheetInfo && (
                        <>
                            <h3>スプレッドシート情報</h3>
                            <ul>
                                <li>タイトル: {debugInfo.spreadsheetInfo.title}</li>
                                <li>シート数: {debugInfo.spreadsheetInfo.sheets}</li>
                                <li>アクセス: {debugInfo.spreadsheetInfo.accessSuccess ? '成功' : '失敗'}</li>
                            </ul>
                        </>
                    )}

                    {debugInfo.spreadsheetError && (
                        <div className="error-container">
                            <h3>スプレッドシートアクセスエラー</h3>
                            <p>メッセージ: {debugInfo.spreadsheetError.message}</p>
                            <p>コード: {debugInfo.spreadsheetError.code}</p>
                            <pre>{JSON.stringify(debugInfo.spreadsheetError.details, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}

            <div className="button-group" style={{ marginTop: '20px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                >
                    情報を更新
                </button>
            </div>
        </div>
    );
}