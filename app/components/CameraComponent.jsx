'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

export default function CameraComponent({ onCapture }) {
    const webcamRef = useRef(null);
    const [imageData, setImageData] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    // 高解像度カメラ設定（1:1比率維持）
    const videoConstraints = {
        width: { ideal: 1080 }, // 720→1080に向上
        height: { ideal: 1080 }, // 同じく1080に
        facingMode: "environment",
        aspectRatio: 1, // 1:1比率を維持
        advanced: [
            { exposureMode: "auto" },
            { focusMode: "continuous" }
        ]
    };

    // カメラで画像を撮影
    const handleCapture = useCallback(() => {
        if (webcamRef.current) {
            try {
                // 高解像度キャプチャ設定
                const imageSrc = webcamRef.current.getScreenshot({
                    width: 1080,   // 720→1080に向上
                    height: 1080,  // 同じく1080に
                    quality: 0.95  // 高品質維持
                });
                if (imageSrc) {
                    setImageData(imageSrc);
                    if (onCapture) {
                        onCapture(imageSrc);
                    }
                } else {
                    setCameraError('画像の撮影に失敗しました');
                }
            } catch (error) {
                console.error('撮影エラー:', error);
                setCameraError('画像の撮影に失敗しました: ' + error.message);
            }
        }
    }, [webcamRef, onCapture]);

    // 撮影をリセット
    const handleReset = () => {
        setImageData(null);
        setCameraError(null);
        if (onCapture) {
            onCapture(null);
        }
    };

    // カメラエラーハンドリング
    const handleCameraError = (error) => {
        console.error('カメラエラー:', error);
        setCameraError('カメラへのアクセスに失敗しました。ブラウザの設定でカメラへのアクセスを許可してください。');
    };

    return (
        <div className="camera-component">
            {cameraError && (
                <div className="error-container">
                    <p className="error-message">{cameraError}</p>
                </div>
            )}

            <div className="camera-container">
                {!imageData ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMediaError={handleCameraError}
                        className="webcam-video"
                    />
                ) : (
                    <img
                        src={imageData}
                        alt="撮影画像"
                        className="captured-image"
                    />
                )}
            </div>

            <div className="button-group">
                {!imageData ? (
                    <button className="btn btn-primary" onClick={handleCapture}>
                        撮影する
                    </button>
                ) : (
                    <button className="btn btn-secondary" onClick={handleReset}>
                        リセット
                    </button>
                )}
            </div>
        </div>
    );
} 