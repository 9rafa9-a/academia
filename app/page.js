import Link from 'next/link';
import { cn } from '@/lib/utils';
import Scoreboard from '@/components/Scoreboard';
import { getScore } from '@/lib/db';

export default async function Home() {
  const rafaelScore = await getScore('rafael');
  const julyanaScore = await getScore('julyana');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 space-y-12">
      <div className="text-center space-y-4 w-full">
        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-8">
          Gym Tracker
        </h1>

        <Scoreboard scores={{ rafael: rafaelScore, julyana: julyanaScore }} />

        <p className="text-slate-400 pt-4">Quem vai treinar hoje?</p>
      </div>

      <div className="grid gap-6 w-full max-w-xs">
        <Link
          href="/dashboard/rafael"
          className="group relative flex items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95"
        >
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 group-hover:bg-blue-500/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Rafael</h2>
            <p className="text-sm text-slate-500">Acessar treinos</p>
          </div>
          <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
            →
          </div>
        </Link>

        {/* Julyana Card */}
        <Link
          href="/dashboard/julyana"
          className="group relative flex items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-colors">
            {/* Flower icon for Julyana */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5" />
              <path d="M12 7.5V3.5" />
              <path d="M12 16.5v4" />
              <path d="M7.5 12H3.5" />
              <path d="M16.5 12h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Julyana</h2>
            <p className="text-sm text-slate-500">Acessar treinos</p>
          </div>
          <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400">
            →
          </div>
        </Link>
      </div>
    </div>
  );
}
