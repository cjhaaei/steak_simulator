import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-noto' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const SITE_TITLE = '스테이크 굽기 단면 시뮬레이터 | 굽기·레스팅 시간 계산기'
const SITE_DESCRIPTION =
  '고기 부위와 두께, 원하는 굽기(레어~웰던)를 고르면 스테이크 굽는 시간과 레스팅 시간을 추천하고, 속살 단면이 익어가는 모습을 시뮬레이션으로 보여줍니다. 더블 레스팅 비교 지원.'

export const metadata: Metadata = {
  metadataBase: new URL('https://steaksimulator.vercel.app'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    '스테이크 굽기',
    '스테이크 굽는 시간',
    '스테이크 레스팅',
    '미디엄 레어',
    '더블 레스팅',
    '스테이크 시뮬레이터',
    'steak doneness',
    'steak resting time',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: '스테이크 굽기 단면 시뮬레이터',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'ko_KR',
  },
  // 구글 서치 콘솔 / 네이버 서치어드바이저 소유권 확인 코드
  verification: {
    google: 'w68YPXySaKu2ArpaVAZEumvqwBXHt7bFjmMutGD6CDs',
    other: { 'naver-site-verification': '715f6b5494615010c0117c4ef9fc822a716bc10a' },
  },
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`dark ${notoSansKr.variable} ${geistMono.variable}`}>
      <body className="bg-zinc-950 font-sans text-zinc-100 antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
