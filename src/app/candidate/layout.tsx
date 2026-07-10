import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/candidate/login");

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col font-sans selection:bg-primary-500/30">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link href="/candidate" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="font-black text-white text-lg tracking-tighter">CO</span>
                </div>
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-surface-900 to-surface-700">
                  CodeOps
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-surface-100/50 backdrop-blur-md rounded-full border border-surface-200">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-surface-700">{session.user.email}</span>
              </div>
              
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-surface-500 hover:text-red-600 hover:bg-red-50 font-medium transition-all"
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
