'use client';

import { Trophy, Medal, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Scoreboard({ scores }) {
    // scores = { rafael: 1200, julyana: 1500 }
    const total = scores.rafael + scores.julyana;
    const rafaelPercent = total === 0 ? 50 : (scores.rafael / total) * 100;
    const julyanaPercent = total === 0 ? 50 : (scores.julyana / total) * 100;

    const leader = scores.rafael > scores.julyana ? 'rafael' : (scores.julyana > scores.rafael ? 'julyana' : 'tie');

    return (
        <div className="w-full max-w-sm mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-6 relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
                    <Trophy size={14} /> Ranking Semanal
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tight">CLÁSSICO DE GIGANTES</h2>
            </div>

            {/* Avatars & Scores */}
            <div className="flex justify-between items-end mb-4 relative z-10 px-2">
                {/* Rafael */}
                <div className="flex flex-col items-center">
                    <div className={cn("relative w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 bg-blue-500/10 transition-all", leader === 'rafael' ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110" : "border-slate-700 opacity-80")}>
                        {leader === 'rafael' && <Crown size={20} className="absolute -top-3 text-amber-400 fill-amber-400 animate-bounce" />}
                        <span className="text-2xl">🦁</span>
                    </div>
                    <span className={cn("font-bold text-lg", leader === 'rafael' ? "text-blue-400" : "text-slate-500")}>{scores.rafael}</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Rafael</span>
                </div>

                {/* VS */}
                <div className="pb-8 text-slate-700 font-black text-xl italic opacity-50">VS</div>

                {/* Julyana */}
                <div className="flex flex-col items-center">
                    <div className={cn("relative w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 bg-emerald-500/10 transition-all", leader === 'julyana' ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110" : "border-slate-700 opacity-80")}>
                        {leader === 'julyana' && <Crown size={20} className="absolute -top-3 text-amber-400 fill-amber-400 animate-bounce" />}
                        <span className="text-2xl">🌸</span>
                    </div>
                    <span className={cn("font-bold text-lg", leader === 'julyana' ? "text-emerald-400" : "text-slate-500")}>{scores.julyana}</span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Julyana</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex relative z-10 ring-2 ring-slate-900">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${rafaelPercent}%` }}
                />
                <div
                    className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${julyanaPercent}%` }}
                />

                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-900/50 -translate-x-1/2" />
            </div>

            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
    );
}
