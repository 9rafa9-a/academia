'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MoreVertical, Timer, Weight, Info, StretchHorizontal, Save, Check, ArrowLeft, History, Edit, Image as ImageIcon, Trash2, Plus, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveSessionAction, updateWorkoutAction, deleteWorkoutAction } from '@/app/actions';
import CadenceVisualizer from './CadenceVisualizer';
import RestTimer from './RestTimer';

export default function WorkoutSession({ workout, warmup, lastWeights = {} }) {
    const [exercises, setExercises] = useState(
        workout.exercises.map(ex => ({
            ...ex,
            completed: false,
            weightUsed: '',
            imageUrl: ex.imageUrl || ''
        }))
    );

    // Sync only when entering/exiting editor or initial load if data changed
    useEffect(() => {
        setExercises(prev => {
            // Merge existing local state (like completed checkboxes) with new definition
            return workout.exercises.map((ex, i) => ({
                ...ex,
                completed: prev[i]?.completed || false,
                weightUsed: prev[i]?.weightUsed || '',
                // Fix: Fallback to local image URL if server's is empty (prevents flashing on save)
                imageUrl: ex.imageUrl || prev[i]?.imageUrl || ''
            }));
        });
    }, [workout]);

    const [isEditorMode, setIsEditorMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Cadence Visualizer state
    const [cadenceExercise, setCadenceExercise] = useState(null);
    const [cadenceSet, setCadenceSet] = useState(1);
    const [restDuration, setRestDuration] = useState(null);

    // Session TUT tracking for gamification
    const [sessionTUT, setSessionTUT] = useState({ total: 0, byExercise: {} });

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
        // Prepare data: Merge existing workout details with new exercises list
        const newWorkoutData = {
            ...workout, // Include name, description, color, userId, etc.
            exercises: exercises.map(e => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                notes: e.notes,
                weight: e.weight || '',
                imageUrl: e.imageUrl || ''
            }))
        };
        // Clean up internal ID from data payload if present
        delete newWorkoutData.id;

        try {
            await updateWorkoutAction(workout.id, newWorkoutData, workout.userId);
            setIsEditorMode(false);
        } catch (e) {
            console.error(e);
            alert("Erro ao atualizar treino!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isFinished) {
        // Calculate classification based on TUT
        const expectedTUT = exercises.reduce((acc, ex) => {
            const cadence = ex.cadence || { concentric: 1, peakHold: 0.5, eccentric: 2, baseHold: 0.5 };
            const repTime = cadence.concentric + cadence.peakHold + cadence.eccentric + cadence.baseHold;
            const reps = parseInt(String(ex.reps).match(/\d+/)?.[0] || '10');
            return acc + (repTime * reps * ex.sets);
        }, 0);
        const tutRatio = expectedTUT > 0 ? sessionTUT.total / expectedTUT : 0;

        let badge = { emoji: '⚡', name: 'Speedy', desc: 'Treino rápido - tente manter a cadência' };
        if (tutRatio >= 0.95) badge = { emoji: '🎯', name: 'Sniper', desc: 'Cadência perfeita!' };
        else if (tutRatio >= 0.80) badge = { emoji: '🛡️', name: 'Tank', desc: 'Execução sólida' };

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        };

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                    <Check size={40} />
                </div>
                <h1 className="text-3xl font-bold text-white">Treino Concluído!</h1>

                {/* TUT Score Badge */}
                {sessionTUT.total > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
                        <div className="text-6xl">{badge.emoji}</div>
                        <div className="text-xl font-bold text-white">{badge.name}</div>
                        <p className="text-slate-400 text-sm">{badge.desc}</p>

                        <div className="border-t border-slate-800 pt-4 mt-4">
                            <div className="text-sm text-slate-500 mb-1">Tempo Sob Tensão</div>
                            <div className="text-3xl font-bold text-emerald-400">{formatTime(sessionTUT.total)}</div>
                        </div>

                        {/* Per-exercise breakdown */}
                        {Object.keys(sessionTUT.byExercise).length > 0 && (
                            <div className="space-y-2 text-left">
                                {Object.entries(sessionTUT.byExercise).map(([name, tut]) => (
                                    <div key={name} className="flex justify-between text-sm">
                                        <span className="text-slate-400 truncate max-w-[180px]">{name}</span>
                                        <span className="text-slate-300 font-mono">{formatTime(tut)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <Link href={`/dashboard/${workout.userId}`} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-medium mt-4">
                    Voltar ao Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-96 relative">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-800">
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

                                        {/* Cadence Start Button (only if exercise has cadence data) */}
                                        {exercise.cadence && !isEditorMode && !exercise.completed && (
                                            <button
                                                onClick={() => {
                                                    setCadenceExercise(exercise);
                                                    setCadenceSet(1);
                                                }}
                                                className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 active:scale-95 transition-all"
                                            >
                                                <Play size={16} /> Iniciar Série com Cadência
                                            </button>
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

                    {/* SPACER: Allow scrolling past the fixed footer */}
                    <div className="h-64"></div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
                {isEditorMode ? (
                    <div className="flex gap-4">
                        <button
                            onClick={async () => {
                                if (confirm('Tem certeza que deseja excluir ESTE TREINO? Isso não pode ser desfeito.')) {
                                    await deleteWorkoutAction(workout.id, workout.userId);
                                }
                            }}
                            disabled={isSaving}
                            className="flex-1 py-4 rounded-2xl font-bold text-red-500 bg-red-500/10 border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} /> Excluir
                        </button>
                        <button
                            onClick={handleSaveEditor}
                            disabled={isSaving}
                            className={cn("flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 bg-blue-600", isSaving && "opacity-70 cursor-not-allowed")}
                        >
                            {isSaving ? "Salvando..." : (
                                <>
                                    <Save size={20} /> Salvar Edições
                                </>
                            )}
                        </button>
                    </div>
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

            {/* Cadence Visualizer Modal */}
            {cadenceExercise && (
                <CadenceVisualizer
                    exercise={cadenceExercise}
                    currentSet={cadenceSet}
                    totalSets={cadenceExercise.sets}
                    onComplete={(data) => {
                        // Accumulate TUT from this set
                        if (data.tut) {
                            setSessionTUT(prev => ({
                                total: prev.total + data.tut,
                                byExercise: {
                                    ...prev.byExercise,
                                    [data.exerciseName]: (prev.byExercise[data.exerciseName] || 0) + data.tut
                                }
                            }));
                        }
                        if (data.restTime > 0) setRestDuration(data.restTime);
                        setCadenceExercise(null);
                    }}
                    onClose={() => {
                        // If more sets remain, increment
                        if (cadenceSet < cadenceExercise.sets) {
                            setCadenceSet(prev => prev + 1);
                            // Start rest timer if time > 0
                            const rTime = cadenceExercise.cadence?.restTime !== undefined ? cadenceExercise.cadence.restTime : 60;
                            if (rTime > 0) setRestDuration(rTime);
                            setCadenceExercise(null);
                        } else {
                            // All sets done, mark exercise complete
                            const idx = exercises.findIndex(e => e.name === cadenceExercise.name);
                            if (idx !== -1) {
                                const newExercises = [...exercises];
                                newExercises[idx].completed = true;
                                setExercises(newExercises);
                            }
                            setCadenceExercise(null);
                        }
                    }}
                />
            )}

            {/* Rest Timer Modal */}
            {restDuration && (
                <RestTimer
                    duration={restDuration}
                    onComplete={() => {
                        setRestDuration(null);
                        // Reopen cadence for next set if applicable
                        // (The cadenceExercise was already cleared, so user taps again)
                    }}
                    onSkip={() => setRestDuration(null)}
                />
            )}
        </div>
    );
}
