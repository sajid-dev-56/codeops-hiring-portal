import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/candidate/login");

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col">
      <nav className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-brand-600">CodeOps Hiring</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/candidate"
                  className="border-brand-500 text-surface-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <span className="text-sm text-surface-500">{session.user.email}</span>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button
                  type="submit"
                  className="p-2 text-surface-400 hover:text-surface-500 transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
