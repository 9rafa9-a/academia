import { getHistory } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Trash2, Calendar, Clock, Trophy } from 'lucide-react';
import { deleteSessionAction } from '@/app/actions';

export default async function HistoryPage({ params }) {
    const { user } = params;
    const history = await getHistory(user);

    // Sort by date descending
    const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/${user}`} className="p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Histórico de Treinos</h1>
            </div>

            {sortedHistory.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">
                    <p>Nenhum treino registrado ainda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedHistory.map((session) => (
                        <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-slate-200">{session.workoutName}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(session.date).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <form action={async () => {
                                'use server';
                                await deleteSessionAction(session.id, user);
                            }}>
                                <button
                                    type="submit"
                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                    title="Excluir Treino"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
