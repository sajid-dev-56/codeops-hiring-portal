import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/candidate/login");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white flex flex-col font-sans selection:bg-primary-500/30 transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link href="/candidate" className="flex items-center gap-3 group">
                <Image src="/logo.png" alt="CodeOps Pro Logo" width={48} height={48} priority fetchPriority="high" className="h-12 w-auto object-contain dark:bg-white dark:p-1 dark:rounded-md" />
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300">
                  CodeOps
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-surface-100/50 dark:bg-surface-800/50 backdrop-blur-md rounded-full border border-surface-200 dark:border-surface-700">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{session.user.email}</span>
              </div>
              
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
