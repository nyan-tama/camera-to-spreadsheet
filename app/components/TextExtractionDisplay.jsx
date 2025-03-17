'use client';

export default function TextExtractionDisplay({ text, isLoading, error }) {
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
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && text && (
                <div className="text-result">
                    <p>{text}</p>
                </div>
            )}

            {!isLoading && !error && !text && (
                <p>画像からテキストを抽出すると、ここに結果が表示されます。</p>
            )}
        </div>
    );
} 