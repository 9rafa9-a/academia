'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RestTimer({ duration = 60, onComplete, onSkip }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isComplete, setIsComplete] = useState(false);
    const audioRef = useRef(null);
    const intervalRef = useRef(null);

    // Create audio context for beep
    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            // Double beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 300);
        } catch (e) {
            console.log('Audio not available:', e);
        }
    };

    // Also try vibration
    const vibrate = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsComplete(true);
                    playBeep();
                    vibrate();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleSkip = () => {
        clearInterval(intervalRef.current);
        onSkip && onSkip();
    };

    const handleContinue = () => {
        onComplete && onComplete();
    };

    const progress = ((duration - timeLeft) / duration) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center">
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(100,116,139,0.2)"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={isComplete ? "#22c55e" : "#3b82f6"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        className="transition-all duration-1000"
                    />
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn(
                        "text-6xl font-mono font-bold tabular-nums",
                        isComplete ? "text-emerald-400" : "text-white"
                    )}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                    {isComplete && (
                        <div className="text-emerald-400 font-medium mt-2 animate-pulse">
                            DESCANSO COMPLETO!
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
                {isComplete ? "Hora de Treinar!" : "Descanse"}
            </h2>
            <p className="text-slate-500 mb-8">
                {isComplete ? "Próxima série esperando..." : "Recupere o fôlego"}
            </p>

            {/* Actions */}
            <button
                onClick={isComplete ? handleContinue : handleSkip}
                className={cn(
                    "px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 active:scale-95 transition-transform",
                    isComplete
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
            >
                {isComplete ? (
                    <><Play size={20} /> PRÓXIMA SÉRIE</>
                ) : (
                    <><SkipForward size={20} /> Pular Descanso</>
                )}
            </button>
        </div>
    );
}
