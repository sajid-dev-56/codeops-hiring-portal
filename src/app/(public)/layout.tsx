import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl sticky top-0 z-50 border-b border-surface-200 dark:border-surface-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="CodeOps Pro Logo" width={48} height={48} priority fetchPriority="high" className="h-12 w-auto object-contain " />
              <span className="font-bold text-lg text-surface-900 dark:text-white transition-colors duration-300">
                <span className="hidden sm:inline">CodeOps Hiring Portal</span>
                <span className="sm:hidden">CodeOps</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/careers"
                className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Careers
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Login Portal
              </Link>
              <div className="h-4 w-px bg-surface-200 dark:bg-surface-700 hidden sm:block"></div>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="CodeOps Pro Logo" width={24} height={24} className="h-6 w-auto object-contain grayscale opacity-70 " />
              <span className="text-sm text-surface-500 dark:text-surface-400">
                © {new Date().getFullYear()} CodeOps Hiring Portal. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-surface-400 dark:text-surface-500">
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
