import { CalendarCheck } from 'lucide-react';

export default function AttendanceCard({ history }) {
    const totalWorkouts = history.length;
    // Calculate sessions this week? For simplicity, just total.

    return (
        <div className="flex flex-col items-center gap-1 p-4 bg-slate-800/50 rounded-xl border border-slate-700 w-full">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <CalendarCheck size={24} />
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
                <span className="text-xs font-medium text-slate-400">Treinos Feitos</span>
            </div>
        </div>
    );
}
