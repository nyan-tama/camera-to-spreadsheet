'use client';

export default function TextExtractionDisplay({ text, isLoading, error, orderNumber, deliveryDate }) {
    return (
        <div className="result-container">
            <h3>抽出結果:</h3>

            {isLoading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>テキストを抽出中...</p>
                </div>
            )}

            {error && (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                </div>
            )}

            {!isLoading && !error && text && (
                <div>
                    {orderNumber ? (
                        <div className="extracted-info">
                            <h4>注文番号:</h4>
                            <p>{orderNumber}</p>
                        </div>
                    ) : (
                        <div className="extracted-info">
                            <h4>注文番号:</h4>
                            <p className="text-muted">認識できませんでした</p>
                        </div>
                    )}

                    {deliveryDate && (
                        <div className="extracted-info">
                            <h4>お届け日時:</h4>
                            <p>{deliveryDate}</p>
                        </div>
                    )}

                    <h4>抽出されたテキスト:</h4>
                    <p>{text || '抽出されたテキストはありません'}</p>
                </div>
            )}

            {!isLoading && !error && !text && (
                <p>画像からテキストを抽出すると、ここに結果が表示されます。</p>
            )}
        </div>
    );
} 