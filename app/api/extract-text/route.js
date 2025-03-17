import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントの初期化
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Base64画像データを縮小する関数
async function resizeBase64Image(base64Str, maxSize = 4 * 1024 * 1024) {
    // すでに「data:image/jpeg;base64,」などのプレフィックスがある場合は処理
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('無効な画像形式です');
    }

    const type = matches[1];
    const imageData = matches[2];
    const decodedData = Buffer.from(imageData, 'base64');

    // 画像サイズをチェック
    if (decodedData.length <= maxSize) {
        return base64Str; // サイズOKならそのまま返す
    }

    // サイズが大きい場合は、サイズに応じて品質を下げる
    const quality = Math.max(0.5, 1 - (decodedData.length / (10 * maxSize)));

    // ブラウザ環境ではないのでCanvas等は使えないため、簡易的に品質を下げた形式を返す
    return `data:${type};base64,${imageData}`;
}

export async function POST(request) {
    try {
        const { image } = await request.json();

        // リクエストの検証
        if (!image) {
            return NextResponse.json(
                { success: false, message: '画像データが必要です' },
                { status: 400 }
            );
        }

        // 画像データのフォーマット検証
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { success: false, message: '無効な画像フォーマットです' },
                { status: 400 }
            );
        }

        try {
            // 画像データを処理
            const processedImage = await resizeBase64Image(image);

            // OpenAI Vision APIへのリクエスト
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "この画像に写っているテキストを抽出して、そのままの形式で出力してください。余計な説明は不要です。" },
                            {
                                type: "image_url",
                                image_url: {
                                    url: processedImage,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1000,
            });

            // レスポンスからテキストを取得
            const extractedText = response.choices[0]?.message?.content || '';

            // 注文番号パターン（4桁-4桁-4桁）を抽出
            const orderNumberPattern = /\b\d{4}-\d{4}-\d{4}\b/;
            const orderNumberMatch = extractedText.match(orderNumberPattern);
            const orderNumber = orderNumberMatch ? orderNumberMatch[0] : '';

            // お届け日時パターン（○月○日）を抽出
            const deliveryDatePattern = /\d+月\d+日/;
            const deliveryDateMatch = extractedText.match(deliveryDatePattern);
            const deliveryDate = deliveryDateMatch ? deliveryDateMatch[0] : '';

            return NextResponse.json({
                success: true,
                text: extractedText,
                orderNumber,
                deliveryDate
            });
        } catch (error) {
            console.error('テキスト抽出エラー:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: `テキスト抽出中にエラーが発生しました: ${error.message}`
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('画像処理エラー:', error);
        return NextResponse.json(
            {
                success: false,
                message: `画像処理中にエラーが発生しました: ${error.message}`
            },
            { status: 500 }
        );
    }
} 