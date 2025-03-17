'use client';

import { useState, useEffect } from 'react';
import ConfigurationForm from './components/ConfigurationForm';
import CameraComponent from './components/CameraComponent';
import TextExtractionDisplay from './components/TextExtractionDisplay';
import SearchResultsDisplay from './components/SearchResultsDisplay';

interface SearchResult {
  cellReference: string;
  sheetName: string;
  rowIndex: number;
  name: string;
  company: string;
  // 他にも使われているプロパティがあれば追加
}

export default function Home() {
  const SPREADSHEET_ID = '19iqgmNP3v_9AMMAx48f1_HhnMtgr5U4EWBhtS0vblCE';

  const [config, setConfig] = useState({
    spreadsheetId: SPREADSHEET_ID,
    searchTerm: ''
  });

  const [imageData, setImageData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // 設定変更時のハンドラ
  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
  };

  // 画像キャプチャ時のハンドラ
  const handleImageCapture = (imageSrc: string | null) => {
    setImageData(imageSrc);
    setExtractedText('');
    setError(null);
    setSearchResults([]);
    setSelectedResult(null);
  };

  // テキスト抽出処理
  const handleExtractText = async () => {
    if (!imageData) {
      setError('画像を撮影してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.success) {
        setExtractedText(data.text);
        // 抽出したテキストを検索キーワードとして設定
        setConfig({
          ...config,
          searchTerm: data.text
        });
      } else {
        throw new Error(data.message || 'テキスト抽出に失敗しました');
      }
    } catch (error: any) {
      console.error('テキスト抽出エラー:', error);
      setError(error.message || 'テキスト抽出中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 検索キーワードが変更されたときに自動検索
  useEffect(() => {
    if (config.searchTerm && config.searchTerm.trim().length > 0) {
      handleSearch();
    }
  }, [config.searchTerm]);

  // スプレッドシート検索処理
  const handleSearch = async () => {
    if (!config.searchTerm) {
      setSearchError('検索キーワードを入力してください');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch('/api/search-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          searchTerm: config.searchTerm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        throw new Error(data.message || '検索に失敗しました');
      }
    } catch (error: any) {
      console.error('検索エラー:', error);
      setSearchError(error.message || '検索中にエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 検索結果から選択したときのハンドラ
  const handleSelectResult = (result: any) => {
    setSelectedResult(result);
  };

  // スプレッドシートに転記
  const handleUpdateSpreadsheet = async () => {
    if (!extractedText) {
      setError('転記するテキストがありません');
      return;
    }

    if (!selectedResult) {
      setError('更新する行を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/update-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          cellReference: selectedResult.cellReference,
          text: extractedText,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'スプレッドシートの更新に失敗しました');
      }

      alert('スプレッドシートに転記しました');

      // 転記後に状態をリセット
      setSelectedResult(null);
      setSearchResults([]);
    } catch (error: any) {
      console.error('スプレッドシート更新エラー:', error);
      setError(error.message || 'スプレッドシート更新中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ConfigurationForm onConfigChange={handleConfigChange} />

      <CameraComponent onCapture={handleImageCapture} />

      {imageData && (
        <button className="btn btn-primary" onClick={handleExtractText} disabled={isLoading}>
          テキストを抽出
        </button>
      )}

      <TextExtractionDisplay
        text={extractedText}
        isLoading={isLoading}
        error={error}
      />

      {extractedText && (
        <div className="search-container">
          <button
            className="btn btn-info"
            onClick={handleSearch}
            disabled={isSearching || !config.searchTerm}
          >
            検索
          </button>

          <SearchResultsDisplay
            results={searchResults}
            isLoading={isSearching}
            error={searchError}
            onSelectResult={handleSelectResult}
          />

          {selectedResult && (
            <div className="selected-result">
              <h4>選択された行:</h4>
              <p>シート: {selectedResult.sheetName}, 行: {selectedResult.rowIndex}</p>
              <p>氏名: {selectedResult.name}, 会社名: {selectedResult.company}</p>

              <button
                className="btn btn-secondary"
                onClick={handleUpdateSpreadsheet}
                disabled={isLoading}
              >
                スプレッドシートに転記
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
