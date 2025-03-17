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
            model: "gpt-4-vision-preview",
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

        return NextResponse.json({
            success: true,
            text: extractedText
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