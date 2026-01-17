import './globals.css'

export const metadata = {
  title: 'PRS Calculator - Polygenic Risk Score',
  description: 'Calculate your genetic risk for multiple diseases using validated PGS Catalog scores',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
