'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { audioController } from '@/lib/audioController';
import { cn } from '@/lib/utils';

// Default cadence if none provided
const DEFAULT_CADENCE = { concentric: 1.0, peakHold: 0.5, eccentric: 2.0, baseHold: 0.5, restTime: 60 };

export default function CadenceVisualizer({ exercise, currentSet, totalSets, onComplete, onClose }) {
    const cadence = exercise.cadence || DEFAULT_CADENCE;
    const totalRepTime = cadence.concentric + cadence.peakHold + cadence.eccentric + cadence.baseHold;

    // Parse reps (handle "10 (cada)", "8-10", "15 + 15" formats)
    const parseReps = (repsStr) => {
        const str = String(repsStr);
        // Handle sum "15 + 15"
        if (str.includes('+')) {
            return str.split('+').reduce((acc, val) => {
                const match = val.match(/\d+/);
                return acc + (match ? parseInt(match[0]) : 0);
            }, 0);
        }
        const match = str.match(/\d+/);
        return match ? parseInt(match[0]) : 10;
    };
    const targetReps = parseReps(exercise.reps);
    const totalSetTime = totalRepTime * targetReps;

    const [isRunning, setIsRunning] = useState(false);
    const [currentRep, setCurrentRep] = useState(0);
    const [currentPhase, setCurrentPhase] = useState('ready'); // ready, concentric, peak, eccentric, base, complete
    const [phaseProgress, setPhaseProgress] = useState(0); // 0-1 within current phase
    const [totalTUT, setTotalTUT] = useState(0); // Time Under Tension accumulated
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 100 }); // SVG coordinates
    const [isMuted, setIsMuted] = useState(false);

    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const phaseStartRef = useRef(null);

    // Phase durations in order
    const phases = [
        { name: 'concentric', duration: cadence.concentric, label: 'SUBINDO', color: 'text-red-500' },
        {
            name: 'peak',
            duration: cadence.peakHold,
            label: exercise.name.includes('Remada') ? 'ESMAGUE!' : 'SEGURE!',
            color: 'text-emerald-400'
        },
        { name: 'eccentric', duration: cadence.eccentric, label: 'DESCENDO', color: 'text-emerald-500' },
        {
            name: 'base',
            duration: cadence.baseHold,
            label: (cadence.baseHold >= 2 || (exercise.name.includes('Supino') && cadence.baseHold >= 1)) ? 'ALONGUE!' : 'BASE',
            color: (cadence.baseHold >= 2 || (exercise.name.includes('Supino') && cadence.baseHold >= 1)) ? 'text-amber-400' : 'text-blue-400'
        },
    ].filter(p => p.duration > 0);

    const getCurrentPhaseInfo = () => phases.find(p => p.name === currentPhase) || { label: 'PRONTO', color: 'text-slate-400' };

    // Calculate dot position based on phase and progress
    const calculateDotPosition = useCallback((phase, progress) => {
        const width = 280;
        const height = 100;
        const padding = 20;

        // Calculate time offsets for x position
        let timeOffset = 0;
        for (const p of phases) {
            if (p.name === phase) break;
            timeOffset += p.duration;
        }
        const currentPhaseDuration = phases.find(p => p.name === phase)?.duration || 0;
        const currentTimeInCycle = timeOffset + (progress * currentPhaseDuration);
        const x = padding + (currentTimeInCycle / totalRepTime) * (width - 2 * padding);

        // Calculate Y based on phase
        let y;
        if (phase === 'concentric') {
            y = height - padding - (progress * (height - 2 * padding)); // Goes up
        } else if (phase === 'peak') {
            y = padding; // Stays at top
        } else if (phase === 'eccentric') {
            y = padding + (progress * (height - 2 * padding)); // Goes down
        } else if (phase === 'base') {
            y = height - padding; // Stays at bottom
        } else {
            y = height - padding; // Default at bottom
        }

        return { x, y };
    }, [phases, totalRepTime]);

    // Generate SVG path for the wave
    const generateWavePath = useCallback(() => {
        const width = 280;
        const height = 100;
        const padding = 20;

        let path = `M ${padding} ${height - padding}`; // Start at bottom left
        let currentX = padding;

        phases.forEach(phase => {
            const segmentWidth = (phase.duration / totalRepTime) * (width - 2 * padding);

            if (phase.name === 'concentric') {
                // Curve up
                path += ` C ${currentX + segmentWidth / 2} ${height - padding}, ${currentX + segmentWidth / 2} ${padding}, ${currentX + segmentWidth} ${padding}`;
            } else if (phase.name === 'peak') {
                // Flat at top
                path += ` L ${currentX + segmentWidth} ${padding}`;
            } else if (phase.name === 'eccentric') {
                // Curve down
                path += ` C ${currentX + segmentWidth / 2} ${padding}, ${currentX + segmentWidth / 2} ${height - padding}, ${currentX + segmentWidth} ${height - padding}`;
            } else if (phase.name === 'base') {
                // Flat at bottom
                path += ` L ${currentX + segmentWidth} ${height - padding}`;
            }
            currentX += segmentWidth;
        });

        return path;
    }, [phases, totalRepTime]);

    // Audio Logic
    const animate = useCallback((timestamp) => {
        if (!phaseStartRef.current) phaseStartRef.current = timestamp;

        const currentPhaseObj = phases.find(p => p.name === currentPhase);
        if (!currentPhaseObj) return;

        const elapsed = (timestamp - phaseStartRef.current) / 1000; // seconds
        const progress = Math.min(elapsed / currentPhaseObj.duration, 1);

        setPhaseProgress(progress);
        setDotPosition(calculateDotPosition(currentPhase, progress));
        setTotalTUT(prev => prev + 0.016);

        // --- AUDIO MODULATION ---
        if (isRunning && !audioController.isMuted) {
            let freq = 0;
            let vol = 0.1;

            if (currentPhase === 'concentric') {
                // Rising: 200Hz -> 600Hz
                freq = 200 + (progress * 400);
            } else if (currentPhase === 'eccentric') {
                // Falling: 300Hz -> 100Hz (Calm descent)
                freq = 300 - (progress * 200);
            } else if (currentPhase === 'peak') {
                // High Tension Pulse: 600Hz
                freq = 600;
                vol = 0.1 + (Math.sin(elapsed * 15) * 0.02); // Fast shimmer
            } else if (currentPhase === 'base') {
                if (currentPhaseObj.label === 'ALONGUE!') {
                    // Deep tension: 80Hz + wobble
                    freq = 80 + (Math.sin(elapsed * 5) * 10);
                    vol = 0.15;
                } else {
                    // Rest: 100Hz quiet
                    freq = 100;
                    vol = 0.05;
                }
            }
            audioController.updateFrequency(freq);
            audioController.modulateVolume(vol);
        }
        // ------------------------

        if (progress >= 1) {
            // HAPTIC FEEDBACK ON PHASE CHANGE
            if (navigator.vibrate) navigator.vibrate(50);

            // Move to next phase
            const currentIndex = phases.findIndex(p => p.name === currentPhase);
            if (currentIndex < phases.length - 1) {
                setCurrentPhase(phases[currentIndex + 1].name);
                phaseStartRef.current = null;
            } else {
                // Rep complete
                if (currentRep < targetReps - 1) {
                    // Stronger haptic for rep complete
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    setCurrentRep(prev => prev + 1);
                    setCurrentPhase(phases[0].name);
                    phaseStartRef.current = null;
                } else {
                    // Set complete
                    audioController.stopContinuousTone(); // Stop sound
                    setIsRunning(false);
                    setCurrentPhase('complete');
                    onComplete && onComplete(cadence.restTime);
                    return;
                }
            }
        }

        if (isRunning) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [currentPhase, currentRep, targetReps, phases, calculateDotPosition, isRunning, onComplete, cadence.restTime]);

    useEffect(() => {
        if (isRunning && currentPhase !== 'ready' && currentPhase !== 'complete') {
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRunning, currentPhase, animate]);

    const handleStart = () => {
        audioController.init();
        audioController.startContinuousTone();
        setIsRunning(true);
        setCurrentPhase(phases[0].name);
        setCurrentRep(0);
        setTotalTUT(0);
        phaseStartRef.current = null;
    };

    const handlePause = () => {
        setIsRunning(prev => {
            if (prev) audioController.stopContinuousTone();
            else audioController.startContinuousTone();
            return !prev;
        });
    };

    const handleReset = () => {
        audioController.stopContinuousTone();
        setIsRunning(false);
        setCurrentPhase('ready');
        setCurrentRep(0);
        setPhaseProgress(0);
        setTotalTUT(0);
        setDotPosition({ x: 20, y: 80 });
        phaseStartRef.current = null;
    };

    const handleToggleMute = () => {
        const newState = audioController.toggleMute();
        setIsMuted(newState);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => audioController.stopContinuousTone();
    }, []);

    const phaseInfo = getCurrentPhaseInfo();
    const wavePath = generateWavePath();

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div>
                    <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
                    <p className="text-sm text-slate-400">Série {currentSet} de {totalSets}</p>
                </div>
                <button onClick={handleToggleMute} className="p-2 text-slate-400 hover:text-white mr-2">
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                {/* ECG Wave */}
                <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <svg viewBox="0 0 280 100" className="w-full h-32">
                        {/* Grid lines */}
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="280" height="100" fill="url(#grid)" />

                        {/* Wave path */}
                        <path
                            d={wavePath}
                            fill="none"
                            stroke="url(#waveGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Gradient for wave */}
                        <defs>
                            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="30%" stopColor="#22c55e" />
                                <stop offset="70%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>

                        {/* Animated dot */}
                        <circle
                            cx={dotPosition.x}
                            cy={dotPosition.y}
                            r="8"
                            className={cn(
                                "transition-colors duration-200",
                                currentPhase === 'concentric' ? "fill-red-500" :
                                    currentPhase === 'eccentric' || currentPhase === 'peak' ? "fill-emerald-500" :
                                        "fill-blue-500"
                            )}
                        />
                        <circle
                            cx={dotPosition.x}
                            cy={dotPosition.y}
                            r="12"
                            className="fill-none stroke-white/30 animate-ping"
                            style={{ animationDuration: '1s' }}
                        />
                    </svg>
                </div>

                {/* Phase Indicator */}
                <div className="text-center space-y-2">
                    <div className={cn("text-4xl font-black tracking-wider", phaseInfo.color)}>
                        {currentPhase === 'ready' ? 'PRONTO?' :
                            currentPhase === 'complete' ? 'COMPLETO!' :
                                phaseInfo.label}
                    </div>
                    {currentPhase !== 'ready' && currentPhase !== 'complete' && (
                        <div className="text-6xl font-mono font-bold text-white tabular-nums">
                            {((phases.find(p => p.name === currentPhase)?.duration || 0) * (1 - phaseProgress)).toFixed(1)}s
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {currentPhase !== 'ready' && currentPhase !== 'complete' && (
                    <div className="w-full max-w-sm">
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-100",
                                    currentPhase === 'concentric' ? "bg-red-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${phaseProgress * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
                        <div className="text-sm text-slate-400 mb-1">Rep</div>
                        <div className="text-2xl font-bold text-white">
                            {currentRep + 1} <span className="text-slate-500">/ {targetReps}</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
                        <div className="text-sm text-slate-400 mb-1">TUT Total</div>
                        <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                            {Math.floor(totalTUT)}s <span className="text-slate-500">/ {Math.floor(totalSetTime)}s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-slate-800">
                <div className="flex gap-4 max-w-sm mx-auto">
                    <button
                        onClick={handleReset}
                        className="p-4 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>

                    {currentPhase === 'ready' ? (
                        <button
                            onClick={handleStart}
                            className="flex-1 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Play size={24} /> INICIAR SÉRIE
                        </button>
                    ) : currentPhase === 'complete' ? (
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            PRÓXIMA SÉRIE
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className={cn(
                                "flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform",
                                isRunning ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                            )}
                        >
                            {isRunning ? <><Pause size={24} /> PAUSAR</> : <><Play size={24} /> CONTINUAR</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
