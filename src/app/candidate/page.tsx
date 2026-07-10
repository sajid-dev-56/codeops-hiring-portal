import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ChatBox } from "@/components/ChatBox";
import { Calendar, Clock, CheckCircle, XCircle, Briefcase, Sparkles } from "lucide-react";

const STAGES = [
  { id: "APPLIED", label: "Applied", description: "Application received" },
  { id: "SCREENING", label: "Screening", description: "Under review" },
  { id: "INTERVIEW", label: "Interviews", description: "Meeting the team", match: ["INTERVIEW_1", "INTERVIEW_2", "TEST"] },
  { id: "FINAL", label: "Final Stage", description: "Final review", match: ["FINAL", "OFFER"] },
  { id: "HIRED", label: "Hired", description: "Welcome aboard!" },
];

function getStageIndex(currentStage: string) {
  if (currentStage === "REJECTED") return -1;
  const index = STAGES.findIndex(s => 
    s.id === currentStage || (s.match && s.match.includes(currentStage))
  );
  return index >= 0 ? index : 0;
}

export default async function CandidateDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/candidate/login");

  const candidate = await prisma.candidate.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      job: true,
      interviews: {
        orderBy: { interviewDate: 'desc' }
      }
    }
  });

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl shadow-xl shadow-surface-200/40 border border-surface-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-accent-500"></div>
        <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-surface-400" />
        </div>
        <h2 className="text-3xl font-bold text-surface-900 mb-3">No Application Found</h2>
        <p className="text-lg text-surface-500 max-w-md">We couldn't find an application associated with your account. Check out our open roles!</p>
        <a href="/careers" className="mt-8 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
          Browse Open Positions
        </a>
      </div>
    );
  }

  const currentStep = getStageIndex(candidate.stage);
  const isRejected = candidate.stage === "REJECTED";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 rounded-3xl shadow-2xl p-8 sm:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full blur-2xl -ml-12 -mb-12 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6 border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-accent-300" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
              Hello, {candidate.name.split(' ')[0]}!
            </h1>
            <p className="text-primary-100 text-lg max-w-xl">
              Here is the latest update on your application for <strong className="text-white font-semibold">{candidate.job.title}</strong>.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
            <span className="text-primary-200 text-sm font-medium uppercase tracking-wider mb-2">Current Status</span>
            <span className={`inline-flex items-center px-5 py-2.5 rounded-xl text-lg font-bold shadow-lg backdrop-blur-md border ${isRejected ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-success-500/20 text-success-100 border-success-500/30'}`}>
              {candidate.stage.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Tracker */}
          <div className="bg-white rounded-3xl shadow-xl shadow-surface-200/40 border border-surface-100 p-8 sm:p-10">
            <h3 className="text-xl font-bold text-surface-900 mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary-500" />
              Application Journey
            </h3>
            
            {isRejected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-surface-900">Application Closed</h4>
                <p className="text-surface-500 mt-2 max-w-md">Thank you for your interest. Unfortunately, we will not be moving forward with your application at this time.</p>
              </div>
            ) : (
              <div className="relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-6 left-6 right-6 h-1.5 bg-surface-100 rounded-full hidden sm:block"></div>
                <div className="absolute top-6 left-6 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full hidden sm:block transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-500),0.5)]" style={{ width: `${(currentStep / (STAGES.length - 1)) * 100}%` }}></div>
                
                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    
                    return (
                      <div key={stage.id} className="flex sm:flex-col items-center sm:text-center group relative">
                        {/* Mobile line */}
                        {idx !== STAGES.length - 1 && (
                          <div className={`absolute left-6 top-12 bottom-[-1.5rem] w-1 sm:hidden ${isCompleted ? 'bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-500),0.5)]' : 'bg-surface-100'}`}></div>
                        )}
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 bg-white transition-all duration-500 ${
                          isCompleted ? 'border-primary-500 text-primary-500 shadow-md shadow-primary-500/20' : 
                          isCurrent ? 'border-accent-500 shadow-[0_0_0_6px_rgba(var(--accent-500),0.15)] text-accent-600 scale-110' : 
                          'border-surface-200 text-surface-300'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="font-bold">{idx + 1}</span>}
                        </div>
                        <div className="ml-4 sm:ml-0 sm:mt-5 flex-1">
                          <h4 className={`text-sm font-bold ${isCurrent ? 'text-surface-900' : 'text-surface-600'}`}>{stage.label}</h4>
                          <p className="text-xs text-surface-400 mt-1 hidden sm:block font-medium">{stage.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ChatBox Wrapper */}
          <div className="bg-white rounded-3xl shadow-xl shadow-surface-200/40 border border-surface-100 overflow-hidden flex flex-col h-[550px]">
            <div className="px-6 py-5 border-b border-surface-100 bg-surface-50/80 flex justify-between items-center backdrop-blur-md">
              <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </h3>
              <span className="flex items-center gap-2 text-xs font-semibold text-success-700 bg-success-100 px-3 py-1.5 rounded-full border border-success-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                Team is Online
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ChatBox candidateId={candidate.id} currentRole="CANDIDATE" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Interviews Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-surface-200/40 border border-surface-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent-500" />
              Interviews
            </h3>
            
            <div className="space-y-4">
              {candidate.interviews.length > 0 ? (
                candidate.interviews.map(interview => {
                  const date = new Date(interview.interviewDate);
                  return (
                    <div key={interview.id} className="group relative bg-surface-50 border border-surface-100 hover:border-accent-300 hover:bg-accent-50/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 cursor-default">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center bg-white border border-surface-200 rounded-xl w-14 h-14 flex-shrink-0 shadow-sm group-hover:border-accent-300 group-hover:text-accent-600 transition-colors">
                          <span className="text-[10px] font-bold uppercase text-surface-500 group-hover:text-accent-600">{format(date, 'MMM')}</span>
                          <span className="text-xl font-black leading-none">{format(date, 'd')}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-surface-900">{interview.round}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <p className="text-xs font-medium text-surface-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(date, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
                  <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600 font-semibold">No upcoming interviews</p>
                  <p className="text-sm text-surface-400 mt-1 px-4">We'll notify you when the team schedules one.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
