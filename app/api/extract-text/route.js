import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントの初期化
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        // 画像データのフォーマット検証（Base64エンコードされたデータか）
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { success: false, message: '無効な画像フォーマットです' },
                { status: 400 }
            );
        }

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
                                url: image,
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
} 