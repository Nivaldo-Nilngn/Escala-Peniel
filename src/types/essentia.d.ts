// types/essentia.d.ts
declare module 'essentia.js' {
  export interface EssentiaWASM {
    arrayToVector: (array: Float32Array) => any;
    vectorToArray: (vector: any) => Float32Array;
    delete: (obj: any) => void;
    
    // Pitch detection algorithms
    PitchYin: (signal: any, sampleRate?: number) => any;
    PitchYinFFT: (spectrum: any, sampleRate?: number) => any;
    PitchMelodia: (signal: any) => any;
    
    // Spectral analysis
    Spectrum: (frame: any) => any;
    Windowing: (frame: any, type?: string) => any;
    HPCP: (spectrum: any, sampleRate?: number) => any;
    
    // Chord detection
    ChordsDetection: (pcp: any, sampleRate?: number) => any;
    ChordsDescriptors: (chords: any, key?: string, scale?: string) => any;
    
    // Key detection
    Key: (pcp: any) => any;
    KeyExtractor: (signal: any) => any;
    
    // Rhythm
    RhythmExtractor: (signal: any) => any;
    RhythmExtractor2013: (signal: any) => any;
    BeatTrackerDegara: (signal: any) => any;
    BeatTrackerMultiFeature: (signal: any) => any;
    Beatogram: (signal: any) => any;
    
    // Audio utilities
    MonoMixer: (left: any, right: any) => any;
    EqualLoudness: (signal: any) => any;
    
    // Frame cutting
    FrameGenerator: (signal: any, frameSize?: number, hopSize?: number) => any;
  }

  export default class Essentia {
    constructor(module?: any);
    
    // Core essentia.js methods
    arrayToVector(array: Float32Array): any;
    vectorToArray(vector: any): Float32Array;
    delete(obj: any): void;
    
    // Pitch detection
    PitchYin(signal: Float32Array, frameSize?: number, sampleRate?: number): {
      pitch: number;
      pitchConfidence: number;
    };
    
    PitchYinFFT(spectrum: Float32Array, frameSize?: number, sampleRate?: number): {
      pitch: number;
      pitchConfidence: number;
    };
    
    PitchMelodia(signal: Float32Array, sampleRate?: number): {
      pitch: Float32Array;
      pitchConfidence: Float32Array;
    };
    
    // Spectral analysis
    Spectrum(frame: Float32Array, size?: number): {
      spectrum: Float32Array;
    };
    
    Windowing(frame: Float32Array, size?: number, type?: string, zeroPadding?: number): {
      frame: Float32Array;
    };
    
    HPCP(spectrum: Float32Array, sampleRate?: number): {
      hpcp: Float32Array;
    };
    
    // Chord detection
    ChordsDetection(pcp: Float32Array, sampleRate?: number): {
      chords: string[];
      strength: Float32Array;
    };
    
    ChordsDescriptors(chords: string[], key?: string, scale?: string): {
      chordsHistogram: Float32Array;
      chordsNumberRate: number;
      chordsChangesRate: number;
    };
    
    // Key detection
    Key(pcp: Float32Array): {
      key: string;
      scale: string;
      strength: number;
    };
    
    KeyExtractor(signal: Float32Array, sampleRate?: number): {
      key: string;
      scale: string;
      strength: number;
    };
    
    // Rhythm
    RhythmExtractor(signal: Float32Array, sampleRate?: number): {
      bpm: number;
      beats: Float32Array;
      confidence: number;
    };
    
    RhythmExtractor2013(signal: Float32Array, sampleRate?: number): {
      bpm: number;
      ticks: Float32Array;
      estimates: Float32Array;
      bpmIntervals: Float32Array;
    };
    
    BeatTrackerDegara(signal: Float32Array, sampleRate?: number): {
      ticks: Float32Array;
    };
    
    BeatTrackerMultiFeature(signal: Float32Array, sampleRate?: number): {
      ticks: Float32Array;
      confidence: number;
    };
    
    Beatogram(signal: Float32Array, sampleRate?: number): {
      beatogram: Float32Array;
    };
    
    // Audio utilities
    MonoMixer(left: Float32Array, right: Float32Array): {
      audio: Float32Array;
    };
    
    EqualLoudness(signal: Float32Array, sampleRate?: number): {
      audio: Float32Array;
    };
    
    // Frame cutting
    FrameGenerator(signal: Float32Array, frameSize?: number, hopSize?: number): {
      frames: Float32Array[];
    };
    
    // Shutdown
    shutdown(): void;
  }
}
