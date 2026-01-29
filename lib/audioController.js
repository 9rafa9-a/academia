class AudioController {
    constructor() {
        this.ctx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    startContinuousTone(initialFreq = 200, type = 'sine') {
        if (!this.ctx || this.isMuted) return;

        // Resume context if suspended (browser auto-play policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.oscillator) this.stopContinuousTone();

        this.oscillator = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();

        this.oscillator.type = type;
        this.oscillator.frequency.setValueAtTime(initialFreq, this.ctx.currentTime);

        // Smooth attack
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        this.oscillator.start();
    }

    updateFrequency(freq) {
        if (this.oscillator && this.ctx) {
            // Smooth transition to new frequency to avoid audible clicking
            this.oscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
        }
    }

    modulateVolume(volume) {
        if (this.gainNode && this.ctx && !this.isMuted) {
            this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
        }
    }

    stopContinuousTone() {
        if (this.oscillator && this.gainNode) {
            try {
                // Smooth release
                const now = this.ctx.currentTime;
                this.gainNode.gain.cancelScheduledValues(now);
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
                this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                this.oscillator.stop(now + 0.1);
            } catch (e) {
                // Ignore if already stopped
            }
        }
        this.oscillator = null;
        this.gainNode = null;
    }

    playBeep(freq = 800, duration = 0.1, type = 'sine') {
        if (!this.ctx || this.isMuted) return;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopContinuousTone();
        }
        return this.isMuted;
    }
}

export const audioController = new AudioController();
