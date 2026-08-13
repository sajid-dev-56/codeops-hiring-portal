"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800 p-4 flex flex-col gap-4 shadow-lg z-50 animate-in slide-in-from-top-2">
            <Link
              href="/careers"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-surface-900 dark:text-white p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors"
            >
              Careers
            </Link>
            <Link
              href="/learn"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-surface-900 dark:text-white p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors"
            >
              Academy
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-surface-900 dark:text-white p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors"
            >
              Login Portal
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
