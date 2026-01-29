import Link from 'next/link';
import { getWorkouts, DAILY_PROTOCOL, getHistory } from '@/lib/db';
import { ChevronLeft, Dumbbell, Calendar, ChevronRight, Activity, Flame, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReportButton from '@/components/ReportButton';
import AttendanceCard from '@/components/AttendanceCard';
import AttendanceHeatmap from '@/components/AttendanceHeatmap';
import NewWorkoutButton from '@/components/NewWorkoutButton';

export default async function Dashboard({ params }) {
    const { user } = await params;
    const workouts = await getWorkouts(user);
    const history = await getHistory(user);

    const isRafael = user === 'rafael';
    const themeColor = isRafael ? 'text-blue-400' : 'text-emerald-400';
    const borderColor = isRafael ? 'border-blue-500/20' : 'border-emerald-500/20';
    const hoverBorderColor = isRafael ? 'hover:border-blue-500/50' : 'hover:border-emerald-500/50';

    return (
        <div className="min-h-screen p-6 pb-20">
            <header className="flex items-center justify-between mb-8">
                <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-medium text-slate-200 capitalise">Olá, <span className={cn("font-bold capitalize", themeColor)}>{user}</span></h1>
                <Link href={`/dashboard/${user}/history`} className="text-slate-400 hover:text-white" title="Histórico">
                    <HistoryIcon size={24} />
                </Link>
            </header>

            <div className="space-y-8">
                {/* Stats & Reports Row */}
                <div className="grid grid-cols-2 gap-4">
                    <AttendanceCard history={history} />
                    <ReportButton history={history} userName={user} />
                </div>

                {/* Heatmap Section */}
                <AttendanceHeatmap history={history} />

                {/* Daily Protocol Section for Rafael */}
                {isRafael && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-400">
                            <Flame size={20} />
                            <h2 className="text-lg font-bold">Protocolo Diário</h2>
                        </div>

                        {DAILY_PROTOCOL.map((item, idx) => (
                            <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                <h3 className="text-amber-200 font-semibold mb-1">{item.name}</h3>
                                <div className="text-sm text-amber-500/80 mb-2">{item.frequency}</div>
                                <p className="text-sm text-slate-300 mb-2">{item.execution}</p>
                                <div className="text-xs font-mono bg-amber-950/50 text-amber-300 p-2 rounded-lg inline-block">
                                    {item.volume}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Dumbbell size={20} className="text-slate-100" />
                        <h2 className="text-2xl font-bold text-white">Seus Treinos</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Selecione o treino de hoje</p>
                    {/* Detect duplicates by checking for repeated names */}
                    {workouts.length !== new Set(workouts.map(w => w.name)).size && (
                        <form action={async () => {
                            'use server';
                            const { cleanupDuplicatesAction } = await import('@/app/actions');
                            await cleanupDuplicatesAction(user);
                        }} className="mt-2">
                            <button type="submit" className="text-xs text-amber-500 underline hover:text-amber-400">
                                ⚠️ Detectamos duplicados. Clique para limpar.
                            </button>
                        </form>
                    )}
                </div>

                <div className="grid gap-4">
                    {workouts.map((workout) => (
                        <Link
                            key={workout.id}
                            href={`/workout/${workout.id}`}
                            className={cn(
                                "group relative bg-slate-900/50 border rounded-2xl p-5 transition-all active:scale-[0.98]",
                                borderColor,
                                hoverBorderColor
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={cn("p-2 rounded-lg bg-slate-800", themeColor)}>
                                    <Activity size={20} />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white mb-1">
                                {workout.name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">
                                {workout.description}
                            </p>

                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                <ChevronRight />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {workouts.length === 0 && (
                <form action={async () => {
                    'use server';
                    const { restoreDefaultsAction } = await import('@/app/actions');
                    await restoreDefaultsAction(user);
                }} className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-center">
                    <h3 className="text-slate-200 font-semibold mb-2">Sua lista está vazia</h3>
                    <p className="text-slate-500 text-sm mb-4">Deseja restaurar os treinos originais?</p>
                    <button type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition">
                        Restaurar Treinos Padrão
                    </button>
                </form>
            )}

            <NewWorkoutButton userId={user} />
        </div>
    );
}
