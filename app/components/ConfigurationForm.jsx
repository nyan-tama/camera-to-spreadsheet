'use client';

import { useState } from 'react';

export default function ConfigurationForm({ onConfigChange }) {
    // スプレッドシートIDを固定
    const SPREADSHEET_ID = '19iqgmNP3v_9AMMAx48f1_HhnMtgr5U4EWBhtS0vblCE';

    const [config, setConfig] = useState({
        spreadsheetId: SPREADSHEET_ID,
        searchTerm: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newConfig = { ...config, [name]: value };
        setConfig(newConfig);

        // 親コンポーネントに変更を通知
        if (onConfigChange) {
            onConfigChange(newConfig);
        }
    };

    return (
        <div>
            <div className="form-group">
                <p className="form-info">スプレッドシートID: {SPREADSHEET_ID}</p>
            </div>

            <div className="form-group">
                <label htmlFor="searchTerm" className="form-label">検索キーワード (抽出テキスト自動入力):</label>
                <input
                    type="text"
                    id="searchTerm"
                    name="searchTerm"
                    className="form-control"
                    value={config.searchTerm}
                    onChange={handleChange}
                    placeholder="氏名/会社名/電話番号"
                />
                <p className="form-text">※テキスト抽出後に自動入力されます</p>
            </div>
        </div>
    );
} 