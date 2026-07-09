import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg text-surface-900">
                CodeOps Hiring Portal
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/careers"
                className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
              >
                Careers
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
              >
                Login Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="text-sm text-surface-500">
                © {new Date().getFullYear()} CodeOps Hiring Portal. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-surface-400">
              <Link href="/careers" className="hover:text-primary-600 transition-colors">
                Open Positions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
