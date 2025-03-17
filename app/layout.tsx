import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'テキスト抽出アプリケーション',
  description: '画像からテキストを抽出してGoogleスプレッドシートに転記するアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="container">
          <header>
            <h1>テキスト抽出アプリケーション</h1>
          </header>
          <main>{children}</main>
          <footer>
            <p>© {new Date().getFullYear()} テキスト抽出アプリケーション</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
