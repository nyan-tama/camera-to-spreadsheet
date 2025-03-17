'use client';

export default function SearchResultsDisplay({ results, isLoading, error, onSelectResult }) {
    if (isLoading) {
        return (
            <div className="result-container">
                <h3>検索結果:</h3>
                <div className="loading">
                    <div className="spinner"></div>
                    <p>検索中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="result-container">
                <h3>検索結果:</h3>
                <div className="error-message">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="result-container">
                <h3>検索結果:</h3>
                <p>該当するデータが見つかりませんでした。</p>
            </div>
        );
    }

    return (
        <div className="result-container">
            <h3>検索結果:</h3>
            <div className="search-results">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>シート名</th>
                            <th>行</th>
                            <th>氏名</th>
                            <th>会社名</th>
                            <th>電話番号</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => (
                            <tr key={index}>
                                <td>{result.sheetName}</td>
                                <td>{result.rowIndex}</td>
                                <td>{result.name}</td>
                                <td>{result.company}</td>
                                <td>{result.phone}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => onSelectResult(result)}
                                    >
                                        選択
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 