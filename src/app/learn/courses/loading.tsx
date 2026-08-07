export default function PublicCoursesLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-surface-900 pt-32 pb-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-64 bg-surface-800 rounded-lg animate-pulse mx-auto mb-6" />
          <div className="h-6 w-96 max-w-full bg-surface-800 rounded-lg animate-pulse mx-auto" />
        </div>
      </div>
      
      <div className="py-12 bg-surface-50 dark:bg-surface-950 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="h-10 w-full md:w-96 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
            <div className="h-10 w-40 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden h-[380px]">
                <div className="h-48 bg-surface-200 dark:bg-surface-800 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
                    <div className="h-5 w-20 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-2/3 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
