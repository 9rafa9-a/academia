'use client';

import { Plus } from 'lucide-react';
import { createWorkoutAction } from '@/app/actions';
import { useTransition } from 'react';

export default function NewWorkoutButton({ userId }) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(() => {
            createWorkoutAction(userId);
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 z-50"
            title="Adicionar Novo Treino"
        >
            {isPending ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Plus size={24} />
            )}
        </button>
    );
}
