import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignInButton } from '@/components/auth/SignInButton';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { ChatPanel } from '@/features/chat/ChatPanel';
import { MemoryPanel } from '@/features/memory/MemoryPanel';
import { FileWorkspace } from '@/features/files/FileWorkspace';
import { TaskManager } from '@/features/tasks/TaskManager';
import { AgentPanel } from '@/features/agents/AgentPanel';
import { CanvasWorkspace } from '@/features/canvas/CanvasWorkspace';
import { CodingAssistant } from '@/features/coding/CodingAssistant';
import { VoiceControl } from '@/features/voice/VoiceControl';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300">AdvutAI</p>
              <h1 className="text-4xl font-semibold text-white">Your Intelligent AI Workspace</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                A unified SaaS platform for chat, memory, file intelligence, agents, coding support, and life planning.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {session ? <SignOutButton /> : <SignInButton />}
              <Button type="button" variant="secondary">Try AI Prompt</Button>
            </div>
          </div>
        </header>

        {session ? (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <ChatPanel />
                <TaskManager />
              </div>
              <div className="space-y-6">
                <MemoryPanel />
                <FileWorkspace />
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <AgentPanel />
                <CodingAssistant />
              </div>
              <div className="space-y-6">
                <CanvasWorkspace />
                <VoiceControl />
              </div>
            </div>
          </>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-white">Secure your workspace</h2>
            <p className="mt-3 text-slate-300">Sign in to access personalized AI chats, memory, documents, and productivity tools.</p>
          </section>
        )}
      </div>
    </main>
  );
}
