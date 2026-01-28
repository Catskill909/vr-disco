import * as THREE from 'three';

export class AudioSystem {
    constructor(config) {
        this.streamURL = config.audio.streamURL;
        this.fftSize = config.audio.fftSize || 2048;
        this.isPlaying = false;
        this.dataArray = null;
        this.analyser = null;
        this.audioContext = null;
        this.audioElement = null;
    }

    init() {
        // Create an invisible HTML Audio Element for streaming
        // We use HTML Audio because it handles streaming buffering better than raw XHR
        this.audioElement = document.createElement('audio');
        this.audioElement.src = this.streamURL;
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.loop = true; // Use loop if testing short clips, otherwise stream continues

        // User interaction is required to start audio context
        // We'll hook this up to the first click/VR entry

        console.log("Audio System Initialized");
    }

    startAudio() {
        if (this.isPlaying) return;

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Connect Audio Element to Web Audio API
            const track = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;

            track.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Buffer for data
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.audioElement.play().then(() => {
            this.isPlaying = true;
            console.log("Audio playing");
        }).catch(e => {
            console.error("Audio play failed (waiting for interaction):", e);
        });
    }

    stopAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }

    getFrequencyData() {
        if (this.analyser && this.isPlaying) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }

    // Get average volume for basic pulsing
    getAverageVolume() {
        if (!this.analyser || !this.isPlaying) return 0;

        const data = this.getFrequencyData();
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum / data.length;
    }
}
