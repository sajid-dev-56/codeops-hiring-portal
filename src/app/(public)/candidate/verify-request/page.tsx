"use client";

import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 backdrop-blur-md py-8 px-4 shadow-xl shadow-brand-500/5 sm:rounded-2xl sm:px-10 border border-white/20 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 mb-2">Check your email</h2>
          <p className="text-sm text-surface-500 mb-6">
            A sign in link has been sent to your email address. Please click the link to access your candidate portal.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
