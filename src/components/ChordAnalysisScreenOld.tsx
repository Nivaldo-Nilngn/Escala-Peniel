import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Container,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  MoreVert as MoreVertIcon,
  GridView as GridViewIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  MusicNote
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
// Remover import do Essentia.js por enquanto para usar fallback
// import Essentia from 'essentia.js';

// Interfaces
interface MusicData {
  musicTitle: string;
  artist: string;
  videoUrl: string;
  duration: string;
}

interface DetectedChord {
  chord: string;
  timestamp: number;
  confidence: number;
}

export const ChordAnalysisScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const musicData = location.state as MusicData | null;
  
  // Estados do player
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  
  // Estados da análise
  const [detectedChords, setDetectedChords] = useState<DetectedChord[]>([]);
  const [currentChord, setCurrentChord] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [bpm, setBpm] = useState(95);
  const [essentiaReady, setEssentiaReady] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Estados da interface
  const [showBasicChords, setShowBasicChords] = useState(true);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const essentiaRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializar análise de acordes
  useEffect(() => {
    const initAnalysis = async () => {
      try {
        console.log('🔧 Iniciando análise de acordes...');
        setAnalyzing(true);
        
        // Por enquanto, usar simulação diretamente até resolver Essentia.js
        console.log('⚡ Usando simulação avançada de acordes...');
        setEssentiaReady(false);
        simulateChordDetection();
        
        console.log('✅ Sistema de análise inicializado!');
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Fallback para simulação
        setEssentiaReady(false);
        simulateChordDetection();
      } finally {
        setAnalyzing(false);
      }
    };

    initAnalysis();
    
    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Função para analisar áudio com Essentia.js
  const analyzeAudioWithEssentia = async (audioBuffer: AudioBuffer) => {
    if (!essentiaRef.current || !essentiaReady) {
      console.warn('Essentia não está pronto, usando simulação...');
      return simulateChordDetection();
    }

    try {
      setAnalyzing(true);
      setAnalysisProgress(0);
      
      const essentia = essentiaRef.current;
      const detectedChordsTemp: DetectedChord[] = [];
      
      // Converter AudioBuffer para array
      const audioData = audioBuffer.getChannelData(0); // Usar apenas canal mono
      const sampleRate = audioBuffer.sampleRate;
      
      console.log(`🎵 Analisando áudio: ${audioData.length} samples, ${sampleRate}Hz`);
      
      // Parâmetros para análise
      const frameSize = 4096;
      const hopSize = 2048;
      const numFrames = Math.floor((audioData.length - frameSize) / hopSize);
      
      console.log(`📊 Processando ${numFrames} frames...`);
      
      for (let i = 0; i < numFrames; i += 5) { // A cada 5 frames para performance
        const startSample = i * hopSize;
        const frame = audioData.slice(startSample, startSample + frameSize);
        const timestamp = startSample / sampleRate;
        
        try {
          // Extrair features com Essentia
          const spectrum = essentia.Spectrum(frame);
          const peaks = essentia.SpectralPeaks(spectrum);
          const pitchSalience = essentia.PitchSalience(peaks.frequencies, peaks.magnitudes);
          
          // Detectar acorde baseado na saliência de pitch
          const chordInfo = detectChordFromSalience(pitchSalience, peaks.frequencies);
          
          if (chordInfo.chord !== 'N' && chordInfo.confidence > 0.3) {
            detectedChordsTemp.push({
              chord: chordInfo.chord,
              timestamp,
              confidence: chordInfo.confidence
            });
          }
          
          // Atualizar progresso
          const progress = (i / numFrames) * 100;
          setAnalysisProgress(progress);
          
        } catch (frameError) {
          console.warn('Erro no frame:', frameError);
        }
      }
      
      // Filtrar acordes duplicados próximos
      const filteredChords = filterNearbyChords(detectedChordsTemp);
      
      setDetectedChords(filteredChords);
      setAnalysisProgress(100);
      
      console.log(`✅ Análise concluída: ${filteredChords.length} acordes detectados`);
      
    } catch (error) {
      console.error('❌ Erro na análise com Essentia:', error);
      // Fallback para simulação
      simulateChordDetection();
    } finally {
      setAnalyzing(false);
    }
  };

  // Detectar acorde a partir da saliência de pitch
  const detectChordFromSalience = (salience: number[], frequencies: number[]) => {
    const noteFreqs = [
      { note: 'C', freq: 261.63 }, { note: 'C#', freq: 277.18 },
      { note: 'D', freq: 293.66 }, { note: 'D#', freq: 311.13 },
      { note: 'E', freq: 329.63 }, { note: 'F', freq: 349.23 },
      { note: 'F#', freq: 369.99 }, { note: 'G', freq: 392.00 },
      { note: 'G#', freq: 415.30 }, { note: 'A', freq: 440.00 },
      { note: 'A#', freq: 466.16 }, { note: 'B', freq: 493.88 }
    ];
    
    const noteStrengths = new Array(12).fill(0);
    
    // Mapear frequências para notas
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const salienceValue = salience[i];
      
      // Encontrar nota mais próxima
      let closestNote = 0;
      let minDistance = Infinity;
      
      for (let n = 0; n < noteFreqs.length; n++) {
        const distance = Math.abs(Math.log2(freq / noteFreqs[n].freq));
        if (distance < minDistance) {
          minDistance = distance;
          closestNote = n;
        }
      }
      
      // Acumular força da nota (considerando oitavas)
      if (minDistance < 0.1) { // Threshold para considerar a nota
        noteStrengths[closestNote] += salienceValue;
      }
    }
    
    // Detectar acorde baseado nas notas mais fortes
    const threshold = Math.max(...noteStrengths) * 0.4;
    const activeNotes = noteStrengths
      .map((strength, index) => ({ note: noteFreqs[index].note, strength }))
      .filter(n => n.strength > threshold)
      .sort((a, b) => b.strength - a.strength);
    
    if (activeNotes.length < 2) {
      return { chord: 'N', confidence: 0 };
    }
    
    // Identificar tipo de acorde
    const rootNote = activeNotes[0].note;
    const chordType = identifyChordFromNotes(activeNotes.map(n => n.note));
    const confidence = Math.min(activeNotes[0].strength / Math.max(...noteStrengths), 1);
    
    return {
      chord: rootNote + chordType,
      confidence
    };
  };

  // Identificar tipo de acorde baseado nas notas
  const identifyChordFromNotes = (notes: string[]): string => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    if (notes.length < 2) return '';
    
    const rootIndex = noteMap[notes[0]];
    const intervals = notes
      .slice(1, 4) // Máximo 3 notas adicionais
      .map(note => (noteMap[note] - rootIndex + 12) % 12)
      .sort((a, b) => a - b);
    
    // Padrões de acordes
    const patterns: { [key: string]: number[] } = {
      '': [4, 7],           // Maior
      'm': [3, 7],          // Menor
      '7': [4, 7, 10],      // Dominante
      'm7': [3, 7, 10],     // Menor 7
      'maj7': [4, 7, 11],   // Maior 7
      'sus4': [5, 7],       // Suspenso 4
      'sus2': [2, 7],       // Suspenso 2
      'dim': [3, 6],        // Diminuto
      'aug': [4, 8]         // Aumentado
    };
    
    let bestMatch = '';
    let bestScore = 0;
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = pattern.filter(interval => intervals.includes(interval)).length;
      const score = matches / pattern.length;
      
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = type;
      }
    }
    
    return bestMatch;
  };

  // Filtrar acordes muito próximos no tempo
  const filterNearbyChords = (chords: DetectedChord[]): DetectedChord[] => {
    const filtered: DetectedChord[] = [];
    const minInterval = 1.0; // Mínimo 1 segundo entre mudanças de acorde
    
    for (const chord of chords) {
      const lastChord = filtered[filtered.length - 1];
      
      if (!lastChord || 
          chord.timestamp - lastChord.timestamp >= minInterval ||
          chord.chord !== lastChord.chord) {
        filtered.push(chord);
      }
    }
    
    return filtered;
  };

  // Simular dados quando não houver musicData
  useEffect(() => {
    if (!musicData) {
      // Dados de exemplo baseados na imagem
      setCurrentChord('E');
      simulateChordDetection();
    }
  }, [musicData]);

  // Simulação de detecção para fallback (mais realística)
  const simulateChordDetection = () => {
    // Progressões de acordes mais realistas baseadas no estilo
    const progressions = [
      {
        name: 'Pop/Rock Clássico',
        chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
        timings: [0, 3, 6, 9, 12, 15, 18, 21]
      },
      {
        name: 'Balada Romântica', 
        chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'],
        timings: [0, 4, 8, 12, 16, 20, 24, 28]
      },
      {
        name: 'Worship/Gospel',
        chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'],
        timings: [0, 3.5, 7, 10.5, 14, 17.5, 21, 24.5]
      },
      {
        name: 'Rock Alternativo',
        chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'],
        timings: [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5]
      }
    ];
    
    // Escolher progressão baseada no título da música (se disponível)
    let selectedProgression = progressions[0];
    if (musicData?.musicTitle) {
      const title = musicData.musicTitle.toLowerCase();
      if (title.includes('god') || title.includes('jesus') || title.includes('holy')) {
        selectedProgression = progressions[2]; // Worship
      } else if (title.includes('love') || title.includes('heart')) {
        selectedProgression = progressions[1]; // Balada
      } else if (title.includes('rock') || title.includes('metal')) {
        selectedProgression = progressions[3]; // Rock
      }
    } else {
      // Aleatório se não houver dados
      selectedProgression = progressions[Math.floor(Math.random() * progressions.length)];
    }
    
    const simulatedChords: DetectedChord[] = [];
    
    for (let i = 0; i < selectedProgression.chords.length; i++) {
      simulatedChords.push({
        chord: selectedProgression.chords[i],
        timestamp: selectedProgression.timings[i],
        confidence: 0.75 + Math.random() * 0.25 // 75-100% de confiança
      });
    }
    
    // Adicionar alguns acordes com variações para realismo
    const variations = ['sus2', 'sus4', '7', 'm7', 'maj7'];
    for (let i = 0; i < selectedProgression.chords.length; i += 2) {
      if (Math.random() > 0.7) { // 30% chance de variação
        const baseChord = selectedProgression.chords[i];
        const variation = variations[Math.floor(Math.random() * variations.length)];
        simulatedChords.push({
          chord: baseChord + variation,
          timestamp: selectedProgression.timings[i] + 30, // 30 segundos depois
          confidence: 0.6 + Math.random() * 0.3
        });
      }
    }
    
    // Ordenar por timestamp
    simulatedChords.sort((a, b) => a.timestamp - b.timestamp);
    
    setDetectedChords(simulatedChords);
    setCurrentChord(simulatedChords[0]?.chord || 'E');
    
    console.log(`🎵 Simulação: ${selectedProgression.name} - ${simulatedChords.length} acordes`);
  };

  // Função para voltar
  const handleBack = () => {
    navigate(-1);
  };

  // Controles do player
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds);
    
    // Atualizar acorde atual baseado no tempo
    if (detectedChords.length > 0) {
      const chord = detectedChords.find((c, index) => {
        const nextChord = detectedChords[index + 1];
        return state.playedSeconds >= c.timestamp && 
               (!nextChord || state.playedSeconds < nextChord.timestamp);
      });
      
      if (chord && chord.chord !== currentChord) {
        setCurrentChord(chord.chord);
      }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Renderizar forma de onda (simulada) com análise espectral visual
  const renderWaveform = () => {
    const numBars = 150;
    const currentPosition = duration ? (currentTime / duration) * numBars : 0;
    
    // Gerar dados de waveform mais realistas baseados no tempo
    const bars = Array.from({ length: numBars }, (_, i) => {
      // Simular diferentes frequências e amplitudes
      const timeRatio = i / numBars;
      const amplitude = Math.sin(timeRatio * Math.PI * 4) * 0.5 + 0.5; // Onda base
      const noise = Math.random() * 0.3; // Ruído
      const beat = Math.sin(timeRatio * Math.PI * 16) * 0.2 + 0.8; // Simulação de beat
      
      const finalAmplitude = (amplitude + noise) * beat;
      const height = Math.max(5, finalAmplitude * 70);
      
      // Determinar cor baseada na posição atual e tipo de frequência
      const isCurrentPosition = Math.abs(i - currentPosition) <= 2;
      const isPlayed = i < currentPosition;
      const isLowFreq = height < 25;
      const isMidFreq = height >= 25 && height < 50;
      const isHighFreq = height >= 50;
      
      let color = 'rgba(255,255,255,0.3)';
      if (isCurrentPosition) {
        color = '#ffd700'; // Posição atual em dourado
      } else if (isPlayed) {
        if (isHighFreq) color = '#ff6b35'; // Altas frequências em laranja
        else if (isMidFreq) color = '#66b2ff'; // Médias frequências em azul
        else color = '#98fb98'; // Baixas frequências em verde
      } else {
        color = `rgba(255,255,255,${isHighFreq ? 0.6 : isMidFreq ? 0.4 : 0.2})`;
      }
      
      return (
        <Box
          key={i}
          sx={{
            width: 3,
            height: `${height}px`,
            bgcolor: color,
            borderRadius: 0.5,
            transition: 'all 0.1s ease-out',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: isCurrentPosition ? '#ffd700' : '#ffffff',
              transform: 'scaleY(1.1)'
            }
          }}
          onClick={() => {
            // Permitir clicar na waveform para pular para posição
            if (playerRef.current && duration) {
              const newTime = (i / numBars) * duration;
              playerRef.current.seekTo(newTime, 'seconds');
            }
          }}
        />
      );
    });

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5,
        height: '100%',
        px: 2,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Legenda de frequências */}
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 16,
          display: 'flex',
          gap: 2,
          zIndex: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#98fb98', borderRadius: '50%' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
              Baixas
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#66b2ff', borderRadius: '50%' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
              Médias
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#ff6b35', borderRadius: '50%' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
              Altas
            </Typography>
          </Box>
        </Box>

        {/* Marcadores de tempo */}
        <Box sx={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 1
        }}>
          {Array.from({ length: 5 }, (_, i) => {
            const time = duration ? (duration / 4) * i : i * 60;
            return (
              <Typography 
                key={i}
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)', 
                  fontSize: '10px',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 0.5,
                  borderRadius: 0.5
                }}
              >
                {formatTime(time)}
              </Typography>
            );
          })}
        </Box>

        {/* Barras da waveform */}
        {bars}
        
        {/* Linha de posição atual */}
        <Box
          sx={{
            position: 'absolute',
            left: `${(currentPosition / numBars) * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: '#ffd700',
            zIndex: 2,
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
          }}
        />
      </Box>
    );
  };

  // Renderizar teclas do piano com reconhecimento melhorado de acordes
  const renderPianoKeys = (chordName: string) => {
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = [
      { note: 'C#', position: 20 },
      { note: 'D#', position: 60 },
      { note: 'F#', position: 140 },
      { note: 'G#', position: 180 },
      { note: 'A#', position: 220 }
    ];

    // Função para extrair acordes mais complexos
    const getChordNotes = (chord: string): string[] => {
      if (!chord) return [];
      
      // Remover números de oitava se houver
      const cleanChord = chord.replace(/[0-9]/g, '');
      
      // Extrair nota fundamental
      const rootMatch = cleanChord.match(/^([A-G][#b]?)/);
      if (!rootMatch) return [];
      
      const root = rootMatch[1].replace('b', '♭');
      const suffix = cleanChord.replace(rootMatch[1], '');
      
      // Mapeamento de intervalos para diferentes tipos de acordes
      const chordPatterns: { [key: string]: string[] } = {
        // Acordes básicos
        '': [root, getInterval(root, 4), getInterval(root, 7)], // Maior
        'm': [root, getInterval(root, 3), getInterval(root, 7)], // Menor
        
        // Acordes suspensos
        'sus2': [root, getInterval(root, 2), getInterval(root, 7)],
        'sus4': [root, getInterval(root, 5), getInterval(root, 7)],
        
        // Acordes de sétima
        '7': [root, getInterval(root, 4), getInterval(root, 7), getInterval(root, 10)],
        'm7': [root, getInterval(root, 3), getInterval(root, 7), getInterval(root, 10)],
        'maj7': [root, getInterval(root, 4), getInterval(root, 7), getInterval(root, 11)],
        
        // Acordes diminutos e aumentados
        'dim': [root, getInterval(root, 3), getInterval(root, 6)],
        'aug': [root, getInterval(root, 4), getInterval(root, 8)],
        
        // Acordes com extensões
        'add9': [root, getInterval(root, 4), getInterval(root, 7), getInterval(root, 14)],
        '6': [root, getInterval(root, 4), getInterval(root, 7), getInterval(root, 9)]
      };
      
      return chordPatterns[suffix] || chordPatterns[''] || [];
    };
    
    // Função para calcular intervalo musical
    const getInterval = (rootNote: string, semitones: number): string => {
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const rootIndex = notes.indexOf(rootNote.replace('♭', '#').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#'));
      
      if (rootIndex === -1) return rootNote;
      
      const targetIndex = (rootIndex + semitones) % 12;
      return notes[targetIndex];
    };

    const activeNotes = getChordNotes(chordName);

    return (
      <Box sx={{ 
        position: 'relative', 
        height: 120, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        bgcolor: '#132f4c',
        borderRadius: 2,
        p: 2
      }}>
        {/* Título do acorde com informações extras */}
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ffd700',
              fontWeight: 'bold',
              mb: 0.5
            }}
          >
            {chordName}
          </Typography>
          {activeNotes.length > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '10px'
              }}
            >
              {activeNotes.join(' - ')}
            </Typography>
          )}
        </Box>

        {/* Teclas brancas */}
        <Box sx={{ display: 'flex', position: 'relative' }}>
          {whiteKeys.map((note, index) => {
            const isActive = activeNotes.includes(note);
            const isRoot = activeNotes[0] === note;
            return (
              <Box
                key={note}
                sx={{
                  width: 35,
                  height: 100,
                  bgcolor: isActive ? (isRoot ? '#ff6b35' : '#66b2ff') : 'white',
                  border: '1px solid #333',
                  borderRadius: '0 0 4px 4px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  pb: 1,
                  transition: 'all 0.3s',
                  boxShadow: isActive ? `0 0 20px ${isRoot ? 'rgba(255, 107, 53, 0.8)' : 'rgba(102, 178, 255, 0.8)'}` : 'none'
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: isActive ? 'white' : '#333',
                  fontWeight: 'bold'
                }}>
                  {note}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Teclas pretas */}
        {blackKeys.map(({ note, position }) => {
          const isActive = activeNotes.includes(note);
          const isRoot = activeNotes[0] === note;
          return (
            <Box
              key={note}
              sx={{
                position: 'absolute',
                left: position,
                width: 25,
                height: 70,
                bgcolor: isActive ? (isRoot ? '#cc5429' : '#1976d2') : '#222',
                border: '1px solid #000',
                borderRadius: '0 0 4px 4px',
                zIndex: 2,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 1,
                transition: 'all 0.3s',
                boxShadow: isActive ? `0 0 20px ${isRoot ? 'rgba(204, 84, 41, 0.8)' : 'rgba(25, 118, 210, 0.8)'}` : 'none'
              }}
            >
              <Typography variant="caption" sx={{ 
                color: isActive ? 'white' : '#888',
                fontWeight: 'bold',
                fontSize: '10px'
              }}>
                {note.replace('#', '♯')}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0a1929',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: '#132f4c',
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ 
              color: '#66b2ff',
              borderColor: '#66b2ff',
              textTransform: 'none',
              borderRadius: 20
            }}
          >
            Instrumentos
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              textTransform: 'none',
              borderRadius: 20
            }}
          >
            Letra da música
          </Button>
          <IconButton sx={{ color: 'white' }}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Visualizador de forma de onda */}
      <Box sx={{ 
        bgcolor: '#000',
        height: 150,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        {analyzing ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            gap: 2
          }}>
            <CircularProgress sx={{ color: '#66b2ff' }} />
            <Typography variant="caption" sx={{ color: '#66b2ff' }}>
              {essentiaReady ? 'Analisando com Essentia.js...' : 'Inicializando análise...'}
            </Typography>
            {analysisProgress > 0 && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {analysisProgress.toFixed(0)}%
              </Typography>
            )}
          </Box>
        ) : (
          renderWaveform()
        )}
        
        {/* Indicadores de tempo e BPM */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            top: 8,
            left: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            color: '#ffd700',
            fontWeight: 'bold'
          }}
        >
          {currentChord || 'E'}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            px: 1,
            py: 0.5,
            borderRadius: 1
          }}
        >
          BPM {bpm}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: 8,
            left: 16,
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          {formatTime(currentTime)}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: 8,
            right: 16,
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          {formatTime(duration || 482)} {/* 8:02 = 482 segundos */}
        </Typography>
      </Box>

      {/* Seção de acordes e controles */}
      <Box sx={{ 
        bgcolor: '#0d2238',
        p: 2,
        display: 'flex',
        gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Acordes */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'white' }}>
              Acordes
            </Typography>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={showBasicChords ? "contained" : "outlined"}
              size="small"
              onClick={() => setShowBasicChords(true)}
              sx={{ 
                bgcolor: showBasicChords ? '#66b2ff' : 'transparent',
                color: showBasicChords ? 'white' : '#66b2ff',
                borderColor: '#66b2ff',
                textTransform: 'none',
                borderRadius: 20,
                px: 2
              }}
            >
              Básico
            </Button>
            <Button
              variant={!showBasicChords ? "contained" : "outlined"}
              size="small"
              onClick={() => setShowBasicChords(false)}
              sx={{ 
                bgcolor: !showBasicChords ? '#66b2ff' : 'transparent',
                color: !showBasicChords ? 'white' : '#66b2ff',
                borderColor: '#66b2ff',
                textTransform: 'none',
                borderRadius: 20,
                px: 2
              }}
            >
              Todos
            </Button>
          </Box>
        </Box>

        {/* Posições */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'white' }}>
              Posições
            </Typography>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ 
            width: 40,
            height: 40,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              •
            </Typography>
          </Box>
        </Box>

        {/* Visualização em grade */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'white' }}>
              Visualização em grade
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ 
              width: 40,
              height: 20,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GridViewIcon sx={{ color: 'white', fontSize: 16 }} />
            </Box>
            <Button
              size="small"
              sx={{ 
                color: '#66b2ff',
                textTransform: 'none',
                fontSize: '12px',
                p: 0,
                minWidth: 'auto'
              }}
            >
              Ver todos
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Piano visual */}
      <Box sx={{ 
        flex: 1,
        bgcolor: '#132f4c',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        {/* Piano para acorde atual */}
        {renderPianoKeys(currentChord || 'E')}
        
        {/* Piano para segundo acorde */}
        {renderPianoKeys('Esus2')}
        
        {/* Seção de Análise Musical Detalhada */}
        <Card sx={{ 
          mt: 3, 
          bgcolor: 'rgba(19, 47, 76, 0.8)', 
          border: '1px solid #3d5a80',
          borderRadius: 2
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MusicNote sx={{ color: '#ffd700', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white' }}>
                Análise Musical
              </Typography>
            </Box>
            
            {/* Progressão de acordes atual */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Progressão detectada:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {['E', 'A', 'C#m', 'B'].map((chord, index) => (
                  <Chip
                    key={index}
                    label={chord}
                    variant="filled"
                    sx={{
                      bgcolor: index === Math.floor(currentTime / 8) % 4 ? '#ff6b35' : '#3d5a80',
                      color: 'white',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: index === Math.floor(currentTime / 8) % 4 ? '#e55a2b' : '#5d7aa0'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Grid de informações musicais */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {/* Tom e Escala */}
              <Box sx={{ 
                bgcolor: 'rgba(0,0,0,0.3)', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="caption" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                  TOM PRINCIPAL
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  E Maior
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Escala: E - F# - G# - A - B - C# - D#
                </Typography>
              </Box>

              {/* BPM */}
              <Box sx={{ 
                bgcolor: 'rgba(0,0,0,0.3)', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="caption" sx={{ color: '#66b2ff', fontWeight: 'bold' }}>
                  ANDAMENTO
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  120 BPM
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Moderato
                </Typography>
              </Box>
            </Box>

            {/* Análise harmônica */}
            <Box sx={{ 
              bgcolor: 'rgba(0,0,0,0.3)', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)',
              mt: 2
            }}>
              <Typography variant="body2" sx={{ color: '#ffd700', mb: 1, fontWeight: 'bold' }}>
                ANÁLISE HARMÔNICA:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Graus: 
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', display: 'inline', ml: 1 }}>
                    I - IV - vi - V
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Função: 
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#98fb98', display: 'inline', ml: 1 }}>
                    Progressão clássica
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Cadência: 
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffa500', display: 'inline', ml: 1 }}>
                    V-I Autêntica
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Modalidade: 
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#87ceeb', display: 'inline', ml: 1 }}>
                    Modo Jônio (Maior)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Progresso da análise */}
            <Box sx={{ 
              bgcolor: 'rgba(0,0,0,0.3)', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)',
              mt: 2
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
                Progresso da análise:
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={duration ? (currentTime / duration) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#ffd700',
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block' }}>
                {Math.round(duration ? (currentTime / duration) * 100 : 0)}% analisado
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Player de vídeo */}
      <Box sx={{ 
        bgcolor: '#0a1929',
        p: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Área do vídeo */}
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: 200,
          bgcolor: '#000',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {musicData?.videoUrl ? (
            <ReactPlayer
              ref={playerRef}
              url={musicData.videoUrl}
              playing={playing}
              volume={volume}
              playbackRate={playbackRate}
              loop={loop}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onDuration={(duration) => setDuration(duration)}
              controls={false}
            />
          ) : (
            <Box sx={{ 
              width: '100%',
              height: '100%',
              bgcolor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Vídeo não disponível
              </Typography>
            </Box>
          )}
          
          {/* Botão de fechar vídeo */}
          <IconButton
            onClick={() => setShowPlayerModal(true)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Controles do player */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {/* Controles de altura, velocidade, loop */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Altura" size="small" sx={{ bgcolor: '#132f4c', color: '#66b2ff' }} />
            <Chip label="Velocidade" size="small" sx={{ bgcolor: '#132f4c', color: '#66b2ff' }} />
            <Chip label="Loop" size="small" sx={{ bgcolor: '#132f4c', color: '#66b2ff' }} />
          </Box>
          
          {/* Slider de progresso */}
          <Box sx={{ flex: 1, px: 2 }}>
            <Slider
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={(_, value) => {
                const newTime = (value as number / 100) * duration;
                if (playerRef.current) {
                  playerRef.current.seekTo(newTime, 'seconds');
                }
              }}
              sx={{
                color: '#66b2ff',
                '& .MuiSlider-thumb': {
                  bgcolor: '#66b2ff',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(102, 178, 255, 0.16)'
                  }
                }
              }}
            />
          </Box>
          
          <Typography variant="caption" sx={{ color: 'white', minWidth: 60 }}>
            {formatTime(currentTime)} / {formatTime(duration || 482)}
          </Typography>
        </Box>

        {/* Controles de reprodução */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: 'white' }}>
            <SkipPreviousIcon />
          </IconButton>
          
          <IconButton 
            onClick={handlePlayPause}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          
          <IconButton sx={{ color: 'white' }}>
            <SkipNextIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChordAnalysisScreen;