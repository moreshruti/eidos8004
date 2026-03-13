import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-c1 flex items-center justify-center">
      <div className="text-center">
        <div className="construction-grid w-32 h-32 mx-auto mb-8 border border-c3 flex items-center justify-center">
          <span className="text-4xl font-pixel text-c5">404</span>
        </div>
        <h1 className="text-xl font-pixel uppercase text-c11 mb-2">Page Not Found</h1>
        <p className="text-sm text-c7 font-mono mb-8">This route does not exist.</p>
        <Link
          href="/"
          className="border border-c3 text-c9 hover:text-c12 hover:border-c5 font-mono uppercase tracking-wider px-6 py-2 text-xs transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
