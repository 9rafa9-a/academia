'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
// Removed invalid import

export default function AttendanceHeatmap({ history }) {
    // Generate dates for the last ~100 days
    const days = useMemo(() => {
        const d = [];
        const today = new Date();
        // Go back 16 weeks (approx 4 months)
        for (let i = 16 * 7 - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            d.push(date);
        }
        return d;
    }, []);

    // Create a set of dates that have workouts
    const workoutDates = useMemo(() => {
        const set = new Set();
        history.forEach(session => {
            const dateStr = new Date(session.date).toDateString(); // "Wed Jan 29 2025"
            set.add(dateStr);
        });
        return set;
    }, [history]);

    return (
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Consistência (Últimos 4 meses)</h3>
            <div className="flex gap-1 min-w-max">
                {/* Organize by Weeks (Columns) */}
                {Array.from({ length: 16 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dayIndexTotal = weekIndex * 7 + dayIndex;
                            if (dayIndexTotal >= days.length) return null;

                            const date = days[dayIndexTotal];
                            const hasWorkout = workoutDates.has(date.toDateString());
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={dayIndexTotal}
                                    title={date.toLocaleDateString('pt-BR')}
                                    className={cn(
                                        "w-3 h-3 rounded-sm transition-all",
                                        hasWorkout ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" : "bg-slate-800/50",
                                        isToday && !hasWorkout && "border border-slate-600"
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <span>Menos</span>
                <div className="w-3 h-3 bg-slate-800/50 rounded-sm" />
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <span>Mais</span>
            </div>
        </div>
    );
}
