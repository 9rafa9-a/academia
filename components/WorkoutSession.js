'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MoreVertical, Timer, Weight, Info, StretchHorizontal, Save, Check, ArrowLeft, History, Edit, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveSessionAction, updateWorkoutAction } from '@/app/actions';

export default function WorkoutSession({ workout, warmup, lastWeights = {} }) {
    const [exercises, setExercises] = useState(
        workout.exercises.map(ex => ({
            ...ex,
            completed: false,
            weightUsed: '',
            imageUrl: ex.imageUrl || ''
        }))
    );

    const [isEditorMode, setIsEditorMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const isRafael = workout.userId === 'rafael';
    const themeColor = isRafael ? 'text-blue-400' : 'text-emerald-400';
    const accentColor = isRafael ? 'bg-blue-500' : 'bg-emerald-500';

    const toggleComplete = (index) => {
        if (isEditorMode) return;
        const newExercises = [...exercises];
        newExercises[index].completed = !newExercises[index].completed;
        setExercises(newExercises);
    };

    const updateField = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const handleFinish = async () => {
        setIsSaving(true);
        const sessionData = {
            userId: workout.userId,
            workoutId: workout.id,
            workoutName: workout.name,
            date: new Date().toISOString(),
            exercises: exercises.map(e => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                weight: e.weightUsed || e.weight || '-',
                completed: e.completed
            }))
        };

        try {
            await saveSessionAction(sessionData);
            setIsFinished(true);
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar treina!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEditor = async () => {
        setIsSaving(true);
        // Prepare data directly from `exercises` state as the new definition
        const newWorkoutData = {
            exercises: exercises.map(e => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                notes: e.notes,
                weight: e.weight || '',
                imageUrl: e.imageUrl || ''
            }))
        };

        try {
            await updateWorkoutAction(workout.id, newWorkoutData);
            setIsEditorMode(false);
        } catch (e) {
            console.error(e);
            alert("Erro ao atualizar treino!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                    <Check size={40} />
                </div>
                <h1 className="text-3xl font-bold text-white">Treino Concluído!</h1>
                <p className="text-slate-400">Bom trabalho. Os dados foram salvos.</p>
                <Link href={`/dashboard/${workout.userId}`} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-medium">
                    Voltar ao Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-48 relative">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <Link href={`/dashboard/${workout.userId}`} className="p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {isEditorMode ? "Editando Treino" : workout.name}
                </span>
                <button
                    onClick={() => setIsEditorMode(!isEditorMode)}
                    className={cn("p-2 -mr-2 transition-colors", isEditorMode ? "text-blue-400" : "text-slate-400 hover:text-white")}
                >
                    {isEditorMode ? <Check size={24} /> : <Edit size={24} />}
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Warmup Section for Rafael */}
                {!isEditorMode && warmup && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4 text-slate-300">
                            <StretchHorizontal size={20} className="text-blue-400" />
                            <h3 className="font-semibold">Aquecimento Postural</h3>
                        </div>
                        <div className="space-y-3">
                            {warmup.map((item, idx) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <div>
                                        <div className="text-slate-200 font-medium">{item.name}</div>
                                        <div className="text-slate-500">{item.sets} x {item.reps} • {item.notes}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 px-1">
                        <span className="font-medium text-slate-200">
                            {isEditorMode ? "Editar Exercícios" : "Checklist"}
                        </span>
                        {!isEditorMode && <span>{exercises.filter(e => e.completed).length}/{exercises.length}</span>}
                    </div>

                    {exercises.map((exercise, idx) => {
                        const lastWeight = lastWeights[exercise.name];

                        return (
                            <div key={idx} className={cn(
                                "rounded-xl p-4 transition-all relative overflow-hidden",
                                isEditorMode ? "bg-slate-900 border border-slate-700 border-dashed" :
                                    (exercise.completed ? "bg-green-500/20 border border-green-500/50" : "bg-slate-900 border border-slate-800")
                            )}>
                                {/* Visual "Done" Indicator Overlay for Green Row Effect */}
                                {!isEditorMode && exercise.completed && (
                                    <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                                )}

                                <div className="flex gap-4 relative z-10">
                                    {/* Checkbox Area (Hidden in Editor Mode) */}
                                    {!isEditorMode && (
                                        <div className="flex flex-col items-center pt-1">
                                            <button
                                                onClick={() => toggleComplete(idx)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                    exercise.completed ? "bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "border-slate-600 text-transparent hover:border-slate-500"
                                                )}
                                            >
                                                <Check size={16} strokeWidth={3} />
                                            </button>
                                            {idx !== exercises.length - 1 && <div className={cn("w-px h-full my-2", exercise.completed ? "bg-green-500/30" : "bg-slate-800")} />}
                                        </div>
                                    )}

                                    <div className="flex-1 pb-2">
                                        {/* Header: Name or Input */}
                                        <div className="flex justify-between items-start mb-2">
                                            {isEditorMode ? (
                                                <input
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-medium focus:border-blue-500 outline-none"
                                                    value={exercise.name}
                                                    onChange={(e) => updateField(idx, 'name', e.target.value)}
                                                    placeholder="Nome do Exercício"
                                                />
                                            ) : (
                                                <h3 className={cn("font-medium text-slate-100 leading-tight", exercise.completed && "text-slate-300 transition-colors")}>{exercise.name}</h3>
                                            )}
                                        </div>

                                        {/* Image Display */}
                                        {exercise.imageUrl && !isEditorMode && (
                                            <div className="mb-3 rounded-lg border border-slate-700/50 bg-black/40 relative resize-y overflow-auto min-h-[150px]" style={{ height: '300px' }}>
                                                <img
                                                    src={exercise.imageUrl}
                                                    alt={exercise.name}
                                                    className="w-full h-full object-contain mx-auto pointer-events-none"
                                                />
                                                <div className="absolute bottom-2 right-2 text-slate-500/50 pointer-events-none">
                                                    <StretchHorizontal size={16} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Image URL Input (Editor Mode) */}
                                        {isEditorMode && (
                                            <div className="flex items-center gap-2 mb-3 bg-slate-950 border border-slate-700 rounded px-2 py-1">
                                                <ImageIcon size={16} className="text-slate-500" />
                                                <input
                                                    className="w-full bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600"
                                                    value={exercise.imageUrl}
                                                    onChange={(e) => updateField(idx, 'imageUrl', e.target.value)}
                                                    placeholder="URL da Imagem/GIF"
                                                />
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {(exercise.notes || isEditorMode) && (
                                            <div className={cn("flex items-start gap-2 text-xs p-2 rounded mb-3", isEditorMode ? "bg-slate-950 border border-slate-700" : "bg-blue-500/10 text-blue-300")}>
                                                <Info size={14} className={cn("shrink-0 mt-0.5", isEditorMode && "text-slate-500")} />
                                                {isEditorMode ? (
                                                    <input
                                                        className="w-full bg-transparent outline-none text-slate-300 placeholder:text-slate-600"
                                                        value={exercise.notes}
                                                        onChange={(e) => updateField(idx, 'notes', e.target.value)}
                                                        placeholder="Observações / Dicas"
                                                    />
                                                ) : (
                                                    <span>{exercise.notes}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Sets */}
                                            <div className={cn("rounded-lg p-2 border text-center opacity-70", isEditorMode ? "bg-slate-950 border-slate-700" : "bg-slate-950 border-slate-800/50")}>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Séries</span>
                                                {isEditorMode ? (
                                                    <input
                                                        className="w-full bg-transparent text-center text-sm font-semibold text-white outline-none"
                                                        value={exercise.sets}
                                                        onChange={(e) => updateField(idx, 'sets', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-sm font-semibold text-slate-300">{exercise.sets}</div>
                                                )}
                                            </div>

                                            {/* Reps */}
                                            <div className={cn("rounded-lg p-2 border text-center opacity-70", isEditorMode ? "bg-slate-950 border-slate-700" : "bg-slate-950 border-slate-800/50")}>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Reps</span>
                                                {isEditorMode ? (
                                                    <input
                                                        className="w-full bg-transparent text-center text-sm font-semibold text-white outline-none"
                                                        value={exercise.reps}
                                                        onChange={(e) => updateField(idx, 'reps', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="text-sm font-semibold text-slate-300">{exercise.reps}</div>
                                                )}
                                            </div>

                                            {/* Weight (Editable by User usually, Editor Mode allows setting default) */}
                                            <div className={cn(
                                                "rounded-lg p-2 border text-center relative",
                                                !isEditorMode && "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
                                                isEditorMode ? "bg-slate-950 border-slate-700" : "bg-slate-950 border-slate-700/80"
                                            )}>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Carga (kg)</span>
                                                {isEditorMode ? (
                                                    <input
                                                        className="w-full bg-transparent text-center text-sm font-semibold text-white outline-none"
                                                        value={exercise.weight || ""}
                                                        onChange={(e) => updateField(idx, 'weight', e.target.value)}
                                                        placeholder="Padrão"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder={exercise.weight || "-"}
                                                        value={exercise.weightUsed}
                                                        onChange={(e) => updateField(idx, 'weightUsed', e.target.value)}
                                                        className="w-full bg-transparent text-center text-sm font-bold text-white outline-none placeholder:text-slate-600"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Last Session Weight Hint (Hide in Editor) */}
                                        {lastWeight && !isEditorMode && (
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400/80">
                                                <History size={12} />
                                                <span>Última sessão: <strong>{lastWeight}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Add Exercise Button (Editor Only) */}
                    {isEditorMode && (
                        <button
                            onClick={() => setExercises([...exercises, { name: '', sets: '3', reps: '10', notes: '', weight: '', imageUrl: '', completed: false, weightUsed: '' }])}
                            className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <Plus size={20} /> Adicionar Exercício
                        </button>
                    )}

                </div>
            </div>

            <div className="fixed bottom-6 left-6 right-6">
                {isEditorMode ? (
                    <button
                        onClick={handleSaveEditor}
                        disabled={isSaving}
                        className={cn("w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-lg flex items-center justify-center gap-2 bg-blue-600", isSaving && "opacity-70 cursor-not-allowed")}
                    >
                        {isSaving ? "Salvando Alterações..." : (
                            <>
                                <Save size={20} /> Salvar Edições
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        disabled={isSaving}
                        className={cn("w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-lg flex items-center justify-center gap-2", accentColor, isSaving && "opacity-70 cursor-not-allowed")}
                    >
                        {isSaving ? "Salvando..." : (
                            <>
                                <Save size={20} /> Finalizar Treino
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
