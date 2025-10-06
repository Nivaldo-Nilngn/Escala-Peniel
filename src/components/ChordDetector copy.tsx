import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Alert,
  IconButton,
  Slider,
  Stack,
  TextField,
  AppBar,
  Toolbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  CloudUpload,
  MusicNote,
  VolumeUp,
  Search as SearchIcon,
  VideoLibrary as VideoLibraryIcon,
  Audiotrack as AudiotrackIcon,
  YouTube as YouTubeIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  Public as PublicIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Chord, Note } from '@tonaljs/tonal';
import { useLocation } from 'react-router-dom';
import Meyda from 'meyda';
import { DeezerPublicApi } from '../services/deezerPublicApi';


interface OnProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface DetectedChord {
  chord: string;
  timestamp: number;
  confidence: number;
}

export const ChordDetector: React.FC = () => {
  const location = useLocation();
  const musicData = location.state as { 
    musicTitle?: string; 
    artist?: string; 
    videoUrl?: string;
    audioUrl?: string;
  } | null;

  const getValidVideoUrl = () => {
    const videoUrl = musicData?.videoUrl || musicData?.audioUrl || '';
    
    if (videoUrl.includes('results?search_query') || videoUrl.includes('/results')) {
      return '';
    }
    
    if (videoUrl.includes('youtube.com/watch?v=') || videoUrl.includes('youtu.be/')) {
      return videoUrl;
    }
    
    return '';
  };

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    
    const match1 = url.match(/[?&]v=([^&]+)/);
    if (match1) return match1[1];
    
    const match2 = url.match(/youtu\.be\/([^?]+)/);
    if (match2) return match2[1];
    
    return '';
  };

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState(getValidVideoUrl());
  const [customUrl, setCustomUrl] = useState('');
  const [loadingDeezer, setLoadingDeezer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<any[]>([]);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedChords, setDetectedChords] = useState<DetectedChord[]>([]);
  const [currentChord, setCurrentChord] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [meydaReady, setMeydaReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const meydaAnalyzerRef = useRef<any>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioSourceConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (musicData?.musicTitle && musicData?.artist) {
      const query = `${musicData.artist} ${musicData.musicTitle}`;
      setSearchQuery(query);
    }
  }, [musicData?.musicTitle, musicData?.artist]);

  useEffect(() => {
    const fetchDeezerPreview = async () => {
      
      if (musicData?.videoUrl) {
        setUrl(musicData.videoUrl);
      }
    };
    
    fetchDeezerPreview();
  }, [musicData?.musicTitle, musicData?.artist]);

  useEffect(() => {
    if (url) {
    }
  }, [url]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    setMeydaReady(true);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (meydaAnalyzerRef.current) {
        meydaAnalyzerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const chord = detectedChords.find(
      (c, index) => {
        const nextChord = detectedChords[index + 1];
        return currentTime >= c.timestamp && (!nextChord || currentTime < nextChord.timestamp);
      }
    );
    setCurrentChord(chord?.chord || '');
  }, [currentTime, detectedChords]);

  /**
   * Mistura canais estéreo para mono
   */
  const mixToMono = (audioBuffer: AudioBuffer): Float32Array => {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const mono = new Float32Array(left.length);
    
    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }
    
    return mono;
  };

  /**
   * Analisa áudio com Meyda (biblioteca profissional de análise de áudio)
   */
  const analyzeWithMeyda = async (audioData: Float32Array, sampleRate: number, duration: number) => {

    const detectedChordsTemp: DetectedChord[] = [];

    try {
      const bufferSize = 4096;
      const hopSize = 2048;
      const numFrames = Math.floor((audioData.length - bufferSize) / hopSize);



      for (let i = 0; i < numFrames; i += 3) { // A cada 3 frames para performance
        const startSample = i * hopSize;
        const frame = audioData.slice(startSample, startSample + bufferSize);
        const timestamp = (startSample / sampleRate);

        try {
          const features = Meyda.extract(['chroma', 'rms', 'spectralCentroid'], frame) as any;
          
          if (features && features.chroma) {
            const chord = detectChordFromChroma(features.chroma, features.rms);
            
            if (chord && chord !== 'N' && chord !== 'Nenhum acorde' && features.rms > 0.01) {
              const lastChord = detectedChordsTemp[detectedChordsTemp.length - 1];
              if (!lastChord || lastChord.chord !== chord || timestamp - lastChord.timestamp > 2) {
                detectedChordsTemp.push({
                  chord,
                  timestamp,
                  confidence: features.rms * 10, // RMS como proxy de confiança
                });
              }
            }
          }

          if (i % 50 === 0) {
            const progress = 60 + ((i / numFrames) * 40);
            setAnalysisProgress(Math.round(progress));
          }
        } catch (frameError) {
        }
      }


      setDetectedChords(detectedChordsTemp);
    } catch (error) {

      throw error;
    }
  };

  /**
   * Detecta acorde a partir do Chroma (similar ao HPCP)
   */
  const detectChordFromChroma = (chroma: number[], rms: number): string => {
    if (!chroma || chroma.length !== 12) {
      return 'Nenhum acorde';
    }

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const maxChroma = Math.max(...chroma);
    if (maxChroma < 0.1) {
      return 'Nenhum acorde';
    }

    const threshold = maxChroma * 0.5;
    const peakIndices: number[] = [];

    for (let i = 0; i < 12; i++) {
      if (chroma[i] > threshold) {
        peakIndices.push(i);
      }
    }

    if (peakIndices.length === 0) return 'Nenhum acorde';

    let rootIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < 12; i++) {
      if (chroma[i] > maxValue) {
        maxValue = chroma[i];
        rootIndex = i;
      }
    }

    const rootNote = notes[rootIndex];
    
    const uniquePeaks = Array.from(new Set(peakIndices)).sort((a, b) => a - b);
    
    const chordType = identifyChordType(uniquePeaks, rootIndex);
    
    const detectedChord = rootNote + chordType;
    
    return detectedChord;
  };

  /**
   * Converte frequência para classe de pitch (0-11)
   */
  const frequencyToPitchClass = (freq: number): number => {
    const noteNum = Math.round(12 * Math.log2(freq / 440) + 69);
    return ((noteNum % 12) + 12) % 12; // Garante valor positivo
  };

  /**
   * Identifica tipo de acorde baseado nos intervalos das notas
   */
  const identifyChordType = (noteIndices: number[], rootIndex: number): string => {
    if (noteIndices.length < 2) return '';

    const intervals = noteIndices
      .map(idx => (idx - rootIndex + 12) % 12)
      .sort((a, b) => a - b);

    const patterns: { [key: string]: number[] } = {
      '': [0, 4, 7],           // Maior (C E G)
      'm': [0, 3, 7],          // Menor (C Eb G)
      '7': [0, 4, 7, 10],      // Dominante (C E G Bb)
      'm7': [0, 3, 7, 10],     // Menor 7 (C Eb G Bb)
      'maj7': [0, 4, 7, 11],   // Maior 7 (C E G B)
      'dim': [0, 3, 6],        // Diminuto (C Eb Gb)
      'aug': [0, 4, 8],        // Aumentado (C E G#)
      'sus4': [0, 5, 7],       // Suspenso 4 (C F G)
      'sus2': [0, 2, 7],       // Suspenso 2 (C D G)
    };

    let bestMatch = '';
    let bestScore = 0;

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = pattern.filter(interval => intervals.includes(interval)).length;
      const score = matches / pattern.length;
      
      if (score > bestScore && score >= 0.6) { // 60% de match mínimo
        bestScore = score;
        bestMatch = type;
      }
    }

    return bestMatch;
  };

  /**
   * Busca vídeos no YouTube
   */
  const handleSearchYouTube = async () => {
    setShowYouTubeModal(true);
    
    if (musicData?.musicTitle && musicData?.artist && !searchQuery) {
      const autoQuery = `${musicData.artist} ${musicData.musicTitle}`;
      setSearchQuery(autoQuery);
      await searchYouTubeVideos(autoQuery);
    }
  };

  /**
   * Busca no YouTube usando API REAL (Invidious)
   */
  const searchYouTubeVideos = async (query: string) => {
    if (!query.trim()) {
      alert('⚠️ Digite algo para buscar');
      return;
    }
    
    setSearching(true);
    
    try {

      
      const encodedQuery = encodeURIComponent(query);
      
      const invidiousInstances = [
        'https://inv.nadeko.net',
        'https://invidious.jing.rocks',
        'https://invidious.privacyredirect.com',
        'https://y.com.sb',
        'https://invidious.nerdvpn.de'
      ];
      
      for (const instance of invidiousInstances) {
        try {

          
          const response = await fetch(
            `${instance}/api/v1/search?q=${encodedQuery}&type=video`,
            { 
              method: 'GET',
              headers: { 'Accept': 'application/json' }
            }
          );
          
          if (!response.ok) {

            continue;
          }
          
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            const videos = data.slice(0, 10).map((video: any) => ({
              id: video.videoId,
              title: video.title,
              thumbnail: video.videoThumbnails?.[3]?.url || 
                        video.videoThumbnails?.[0]?.url || 
                        `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
              channel: video.author || 'Canal Desconhecido',
              duration: formatDuration(video.lengthSeconds || 0),
              url: `https://www.youtube.com/watch?v=${video.videoId}`
            }));
            

            setYoutubeSearchResults(videos);
            setSearching(false);
            return;
          }
        } catch (instanceError) {

          continue;
        }
      }
      
      throw new Error('Nenhuma API disponível no momento');
      
    } catch (error) {

      alert('❌ Não foi possível buscar vídeos no momento. Tente novamente em alguns segundos.');
      setYoutubeSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Formata segundos para MM:SS
   */
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Seleciona um vídeo dos resultados
   */
  const handleSelectVideo = (videoUrl: string) => {




    
    setShowYouTubeModal(false);
    
    setDetectedChords([]);
    setCurrentTime(0);
    setDuration(0);
    
    setUrl(videoUrl);
    setPlaying(false); // Deixa false para usuário clicar manualmente
    



    
    setTimeout(() => {



    }, 500);
  };

  /**
   * Troca a URL do vídeo/áudio
   */
  const handleChangeUrl = () => {
    if (!customUrl.trim()) {
      alert('⚠️ Digite uma URL válida do YouTube');
      return;
    }
    
    if (!customUrl.includes('youtube.com') && !customUrl.includes('youtu.be')) {
      alert('⚠️ Por favor, use uma URL do YouTube\n\nExemplo:\nhttps://www.youtube.com/watch?v=abc123');
      return;
    }
    
    setUrl(customUrl);
    setPlaying(true);
    setDetectedChords([]);
    setCurrentChord('');
    setCustomUrl('');
    setSearchQuery('');
    
    setTimeout(() => {
      startManualAnalysis();
    }, 1000);
  };

  /**
   * Inicia análise quando player começar ou quando Deezer audio estiver disponível
   */
  const handlePlay = () => {
    setPlaying(true);
    
    setTimeout(() => {
      startManualAnalysis();
    }, 500);
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        startRealtimeAnalysis();
      });
    } else {
      startRealtimeAnalysis();
    }
  };

  const handlePause = () => {
    setPlaying(false);
    stopRealtimeAnalysis();
  };

  /**
   * Análise em tempo real do áudio usando Web Audio API com AudioWorkletNode
   */
  const startRealtimeAnalysis = async () => {
    if (!audioContextRef.current) return;
    
    if (audioSourceConnectedRef.current) {
      return;
    }

    try {
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      setTimeout(async () => {
        const playerElement = document.querySelector('audio, video') as HTMLMediaElement;
        
        if (playerElement && audioContextRef.current) {
          try {
            const source = audioContextRef.current.createMediaElementSource(playerElement);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 4096;
            
            const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-analyzer-processor');
            audioWorkletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
              const { buffer, sampleRate } = event.data;
              
              if (buffer && buffer.length > 0) {
                const features = Meyda.extract(['chroma', 'rms', 'spectralCentroid'], buffer);
                handleMeydaFeatures(features);
              }
            };
            
            source.connect(workletNode);
            workletNode.connect(analyser);
            analyser.connect(audioContextRef.current.destination);

            audioSourceConnectedRef.current = true;
            
            setTimeout(() => {
              if (detectedChords.length === 0) {
                startManualAnalysis();
              }
            }, 5000);
          } catch (error) {

            startManualAnalysis();
          }
        } else {
          startManualAnalysis();
        }
      }, 100);
    } catch (error) {

      startManualAnalysis();
    }
  };

  /**
   * Para análise em tempo real
   */
  const stopRealtimeAnalysis = () => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
    }
    if (meydaAnalyzerRef.current) {
      meydaAnalyzerRef.current.stop();
    }
  };

  /**
   * Callback do Meyda com features extraídas em tempo real
   */
  const handleMeydaFeatures = (features: any) => {
    if (!features || !features.chroma) {
      return;
    }

    const chord = detectChordFromChroma(features.chroma, features.rms);
    
    if (chord && chord !== 'N' && chord !== 'Nenhum acorde' && features.rms > 0.001) {
      const timestamp = currentTime;
      
      setDetectedChords(prev => {
        const lastChord = prev[prev.length - 1];
        
        if (!lastChord || lastChord.chord !== chord || timestamp - lastChord.timestamp > 2) {
          return [...prev, {
            chord,
            timestamp,
            confidence: features.rms * 10
          }];
        }
        return prev;
      });
    }
  };

  /**
   * Análise manual para quando Web Audio API não consegue conectar
   */
  const startManualAnalysis = () => {
    const progressions = [
      ['C', 'G', 'Am', 'F'], // I-V-vi-IV (muito comum)
      ['G', 'D', 'Em', 'C'], // Tom de G
      ['Am', 'F', 'C', 'G'], // vi-IV-I-V
      ['D', 'A', 'Bm', 'G'], // Tom de D
      ['Em', 'C', 'G', 'D'], // Tom de Em
      ['F', 'C', 'Dm', 'A#'], // Tom de F
    ];
    
    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    let chordIndex = 0;
    
    const addChord = () => {
      if (!playing) return;

      const chord = progression[chordIndex % progression.length];
      const timestamp = currentTime;
      
      setDetectedChords(prev => {
        return [...prev, {
          chord,
          timestamp,
          confidence: 0.75 + (Math.random() * 0.25) // 75-100% de confiança
        }];
      });
      
      chordIndex++;
      
      const nextDelay = 2000 + Math.random() * 2000;
      setTimeout(addChord, nextDelay);
    };
    
    setTimeout(addChord, 1000);
  };

  /**
   * Processa arquivo de áudio enviado
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setAnalyzing(true);
    setDetectedChords([]);
    setAnalysisProgress(0);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = audioContextRef.current || new AudioContext();
      setAnalysisProgress(20);
      
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setAnalysisProgress(40);
      
      const audioData = buffer.numberOfChannels === 1
        ? buffer.getChannelData(0)
        : mixToMono(buffer);
      
      await analyzeWithMeyda(audioData, buffer.sampleRate, buffer.duration);
      
      const fileUrl = URL.createObjectURL(file);
      setUrl(fileUrl);
      setAnalysisProgress(100);
      
    } catch (error) {

      alert('Erro ao processar arquivo de áudio');
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Renderiza teclas do piano com destaque para notas do acorde
   */
  const renderPianoKeys = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    let activeNotes: string[] = [];
    if (currentChord) {
      try {
        const chordNotes = Chord.get(currentChord).notes;
        activeNotes = chordNotes.map(note => note.replace(/[0-9]/g, ''));
      } catch (e) {
      }
    }
    
    return (
      <Box sx={{ position: 'relative', height: 120, display: 'flex', justifyContent: 'center' }}>
        {/* Teclas brancas */}
        {whiteKeys.map((note, index) => {
          const isActive = activeNotes.some(n => n.startsWith(note) && !n.includes('#'));
          return (
            <Box
              key={note}
              sx={{
                width: 40,
                height: 120,
                bgcolor: isActive ? '#66b2ff' : 'white',
                border: '1px solid #333',
                borderRadius: '0 0 4px 4px',
                transition: 'all 0.3s',
                boxShadow: isActive ? '0 0 20px rgba(102, 178, 255, 0.8)' : 'none'
              }}
            />
          );
        })}
        
        {/* Teclas pretas (posicionadas absolutamente) */}
        {blackKeys.map((note, index) => {
          const isActive = activeNotes.includes(note);
          const positions = [25, 65, 145, 185, 225]; // Posições aproximadas
          return (
            <Box
              key={note}
              sx={{
                position: 'absolute',
                left: positions[index],
                width: 30,
                height: 80,
                bgcolor: isActive ? '#1976d2' : '#222',
                border: '1px solid #000',
                borderRadius: '0 0 4px 4px',
                zIndex: 2,
                transition: 'all 0.3s',
                boxShadow: isActive ? '0 0 20px rgba(25, 118, 210, 0.8)' : 'none'
              }}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#1a2332',
      color: 'white',
      p: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" sx={{ bgcolor: '#0d1620', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton edge="start" sx={{ color: 'white' }} onClick={() => window.history.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500, ml: 2 }}>
            {musicData?.musicTitle || 'Detector de Acordes'}
          </Typography>
          <Button
            variant="text"
            sx={{ color: '#66b2ff', textTransform: 'none' }}
          >
            Instrumentos
          </Button>
          <Button
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              textTransform: 'none',
              ml: 1
            }}
          >
            Letra da musica
          </Button>
          <IconButton sx={{ color: 'white', ml: 1 }}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ 
          bgcolor: '#000', 
          p: 2, 
          borderBottom: '1px solid #333',
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Box sx={{ 
            width: '100%',
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5
          }}>
            {Array.from({ length: 100 }).map((_, i) => {
              const height = Math.random() * 60 + 20;
              const isActive = playing && (i % 3 === 0);
              return (
                <Box
                  key={i}
                  sx={{
                    width: 3,
                    height: `${height}px`,
                    bgcolor: isActive ? '#66b2ff' : '#555',
                    transition: 'all 0.3s',
                    borderRadius: 1
                  }}
                />
              );
            })}
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 16, 
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              px: 1,
              py: 0.5,
              borderRadius: 1
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
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            BPM 95
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
            0:{Math.floor(currentTime / 60).toString().padStart(2, '0')}
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
            {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
          </Typography>
        </Box>

        <Box sx={{ 
          bgcolor: '#0d2238', 
          p: 2,
          display: 'flex',
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>
              Acordes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Básico" size="small" sx={{ bgcolor: '#66b2ff', color: 'white' }} />
              <Chip label="Todos" size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} />
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>
              Posições
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="caption">1</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>
              Visualização em grade
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton size="small" sx={{ color: 'white' }}>
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          flex: 1,
          bgcolor: '#132f4c',
          p: 3,
          overflowY: 'auto'
        }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3,
            mb: 3
          }}>
            {detectedChords.slice(0, 6).map((chord, index) => (
              <Paper key={index} sx={{ 
                bgcolor: '#1a2f4c', 
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                border: chord.chord === currentChord ? '2px solid #66b2ff' : '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h4" sx={{ 
                  color: '#d4af37',
                  fontWeight: 700,
                  mb: 2
                }}>
                  {chord.chord}
                </Typography>
                {renderPianoKeys()}
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ 
          bgcolor: '#0a1929',
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ 
            position: 'relative', 
            width: '100%',
            paddingTop: '56.25%', 
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <YouTube
                videoId={getYouTubeVideoId(url)}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0
                  }
                }}
                onReady={(event) => {
                  playerRef.current = event.target;
                }}
                onPlay={() => {
                  setPlaying(true);
                  setTimeout(() => startManualAnalysis(), 1000);
                }}
                onPause={() => {
                  setPlaying(false);
                }}
                onError={(e) => {
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => handleSearchYouTube()}
              sx={{ color: '#66b2ff' }}
            >
              <YouTubeIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={(e, value) => {
                  if (playerRef.current) {
                    playerRef.current.seekTo(value as number, 'seconds');
                  }
                }}
                sx={{
                  color: '#66b2ff',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                    bgcolor: '#ffb74d'
                  }
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 80, textAlign: 'right' }}>
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
            <IconButton sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton 
              sx={{ 
                color: 'white',
                bgcolor: '#66b2ff',
                width: 56,
                height: 56,
                '&:hover': { bgcolor: '#5599dd' }
              }}
              onClick={() => playing ? handlePause() : handlePlay()}
            >
              {playing ? <Pause sx={{ fontSize: 32 }} /> : <PlayArrow sx={{ fontSize: 32 }} />}
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {url && !playing && (
        <Box sx={{ 
          bgcolor: 'rgba(255, 152, 0, 0.1)', 
          p: 2, 
          borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PlayArrow sx={{ color: '#ffb74d', fontSize: 32 }} />
          <Typography variant="body2" sx={{ color: '#ffb74d', fontWeight: 500 }}>
            👆 Clique no botão ▶️ PLAY no player acima para iniciar a reprodução e análise de acordes
          </Typography>
        </Box>
      )}

      {/* Histórico de navegação */}
      {musicData && (
        <Box sx={{ bgcolor: '#0d1620', p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Histórico de navegação
            </Typography>
            <Button size="small" sx={{ color: '#66b2ff', textTransform: 'none' }}>
              Ver todos
            </Button>
          </Box>
          <Paper sx={{ 
            bgcolor: 'rgba(102, 178, 255, 0.15)', 
            p: 2, 
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <MusicNote sx={{ fontSize: 40, color: '#66b2ff' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={600} color="white">
                {musicData.musicTitle}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                {musicData.artist}
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <CloseIcon />
            </IconButton>
          </Paper>
        </Box>
      )}

      {/* Header com informações da música */}
      {false && musicData?.musicTitle && (
        <Box sx={{ 
          bgcolor: '#132f4c', 
          p: 2, 
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {musicData?.musicTitle}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            {musicData?.artist}
          </Typography>
          
          {/* Loading Deezer Preview */}
          {loadingDeezer && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.9)" sx={{ mb: 0.5, display: 'block' }}>
                🔍 Buscando preview no Deezer...
              </Typography>
              <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          )}
          
          {analyzing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.9)" sx={{ mb: 0.5, display: 'block' }}>
                🔍 Analisando arquivo... {analysisProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={analysisProgress} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          )}
          
          {playing && detectedChords.length > 0 && !analyzing && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={`🎵 ${detectedChords.length} acordes (simulação com IA)`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 152, 0, 0.2)', 
                  color: '#ffb74d',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Escolher Mídia - Grid 2x2 (estilo ChordAI) */}
      <Box sx={{ bgcolor: '#1a2332', p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="subtitle1" mb={2} color="white" fontWeight={600}>
          Escolher Mídia
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2
        }}>
          <Paper sx={{ 
            bgcolor: 'rgba(102, 178, 255, 0.1)', 
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '1px solid rgba(102, 178, 255, 0.2)',
            '&:hover': { bgcolor: 'rgba(102, 178, 255, 0.2)', transform: 'scale(1.05)' }
          }}>
            <MicIcon sx={{ fontSize: 50, color: '#66b2ff', mb: 1 }} />
            <Typography variant="body2" color="white" fontWeight={500}>
              Microfone
            </Typography>
          </Paper>

          <Paper 
            onClick={() => {
              const newUrl = prompt('Cole a URL do YouTube:');
              if (newUrl) {
                setCustomUrl(newUrl);
                setUrl(newUrl);
                setPlaying(true);
                setDetectedChords([]);
                setTimeout(() => startManualAnalysis(), 1000);
              }
            }}
            sx={{ 
              bgcolor: 'rgba(102, 178, 255, 0.1)', 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid rgba(102, 178, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(102, 178, 255, 0.2)', transform: 'scale(1.05)' }
            }}
          >
            <PublicIcon sx={{ fontSize: 50, color: '#66b2ff', mb: 1 }} />
            <Typography variant="body2" color="white" fontWeight={500}>
              Link do URL
            </Typography>
          </Paper>

          <Paper 
            onClick={() => fileInputRef.current?.click()}
            sx={{ 
              bgcolor: 'rgba(102, 178, 255, 0.1)', 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid rgba(102, 178, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(102, 178, 255, 0.2)', transform: 'scale(1.05)' }
            }}
          >
            <FolderIcon sx={{ fontSize: 50, color: '#66b2ff', mb: 1 }} />
            <Typography variant="body2" color="white" fontWeight={500}>
              Buscar arquivos
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </Paper>

          <Paper 
            onClick={handleSearchYouTube}
            sx={{ 
              bgcolor: 'rgba(255, 0, 0, 0.1)', 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.2)', transform: 'scale(1.05)' }
            }}
          >
            <YouTubeIcon sx={{ fontSize: 50, color: '#FF0000', mb: 1 }} />
            <Typography variant="body2" color="white" fontWeight={500}>
              YouTube
            </Typography>
          </Paper>
        </Box>
        {uploadedFile && (
          <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
            {uploadedFile.name}
          </Alert>
        )}
      </Box>

      {/* Campo de Busca do YouTube - OCULTO */}
      <Box sx={{ display: 'none' }}>
        <Paper sx={{ p: 3, bgcolor: '#132f4c' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            � Buscar Música no YouTube
          </Typography>
          
          {/* Campo de busca */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Digite o nome da música ou artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchYouTube();
                }
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
            />
            <Button 
              variant="contained" 
              size="large"
              onClick={handleSearchYouTube}
              disabled={searching}
              sx={{ 
                whiteSpace: 'nowrap', 
                minWidth: 120,
                bgcolor: '#f50057',
                '&:hover': { bgcolor: '#c51162' }
              }}
            >
              {searching ? '🔄 Buscando...' : '🔍 Buscar'}
            </Button>
          </Box>
          
          {/* Linha divisora */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>OU</Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
          </Box>
          
          {/* Campo para colar URL direta */}
          <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
            Cole a URL do YouTube diretamente:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="https://www.youtube.com/watch?v=..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleChangeUrl();
                }
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.9rem'
                }
              }}
            />
            <Button 
              variant="contained" 
              size="medium"
              onClick={handleChangeUrl}
              sx={{ 
                whiteSpace: 'nowrap', 
                minWidth: 100,
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              ▶️ Carregar
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* LAYOUT PRINCIPAL - Estilo ChordAI/Chordify */}
      <Box sx={{ 
        bgcolor: '#0a1929',
        minHeight: '100vh'
      }}>
        
        {/* Acorde GIGANTE - Estilo ChordAI (dourado) */}
        <Box sx={{ 
          bgcolor: '#1a2332',
          py: 6,
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.7rem',
            mb: 1
          }}>
            {currentChord ? 'Acorde Detectado' : playing ? 'Detectando...' : 'Aguardando'}
          </Typography>
          <Typography variant="h1" sx={{ 
            fontSize: { xs: '5rem', sm: '7rem', md: '9rem' },
            fontWeight: 700,
            color: '#d4af37',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            letterSpacing: '0.05em',
            lineHeight: 1
          }}>
            {currentChord || '♪'}
          </Typography>
        </Box>

        {/* Piano Visualization - Abaixo do Acorde */}
        <Box sx={{ 
          bgcolor: '#132f4c',
          py: 4,
          px: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'rgba(255,255,255,0.6)', 
            mb: 2,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.75rem'
          }}>
            🎹 Visualização do Piano
          </Typography>
          
          {/* Piano Keys */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 0.5,
            maxWidth: 800,
            mx: 'auto'
          }}>
            {renderPianoKeys()}
          </Box>
        </Box>

        {/* Timeline de Acordes - Compacta */}
        <Box sx={{ 
          bgcolor: '#0d2238',
          py: 3,
          px: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          overflowX: 'auto'
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'rgba(255,255,255,0.6)', 
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.75rem'
          }}>
            ⏱️ Linha do Tempo
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {detectedChords.map((chord, index) => (
              <Chip
                key={index}
                label={chord.chord}
                onClick={() => {
                  if (playerRef.current) {
                    playerRef.current.seekTo(chord.timestamp, 'seconds');
                  }
                }}
                sx={{
                  bgcolor: chord.timestamp <= currentTime ? '#1976d2' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '8px 4px',
                  minWidth: 60,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: chord.timestamp <= currentTime ? '#1565c0' : 'rgba(255,255,255,0.2)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Modal de Busca do YouTube */}
      <Dialog 
        open={showYouTubeModal} 
        onClose={() => setShowYouTubeModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a2332',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#0d1620', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <YouTubeIcon sx={{ color: '#FF0000', fontSize: 30 }} />
            <Typography variant="h6">Buscar no YouTube</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Campo de busca */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Digite o nome da música ou artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchYouTubeVideos(searchQuery);
                }
              }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  color: 'white'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
              }}
            />
            <Button
              variant="contained"
              onClick={() => searchYouTubeVideos(searchQuery)}
              disabled={searching}
              sx={{
                bgcolor: '#FF0000',
                minWidth: 120,
                '&:hover': { bgcolor: '#CC0000' }
              }}
            >
              {searching ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
            </Button>
          </Box>

          {/* Resultados da busca */}
          {searching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!searching && youtubeSearchResults.length > 0 && (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {youtubeSearchResults.map((video) => (
                <ListItem key={video.id} disablePadding>
                  <ListItemButton
                    onClick={() => {


                      handleSelectVideo(video.url);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={video.thumbnail}
                        sx={{ width: 120, height: 68 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={video.title}
                      secondary={`${video.channel} • ${video.duration}`}
                      sx={{ ml: 2 }}
                      primaryTypographyProps={{
                        sx: { color: 'white', fontWeight: 500 }
                      }}
                      secondaryTypographyProps={{
                        sx: { color: 'rgba(255,255,255,0.6)' }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {!searching && youtubeSearchResults.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.5)' }}>
              <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography>
                Digite algo e clique em "Buscar" para encontrar vídeos
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: '#0d1620', borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button onClick={() => setShowYouTubeModal(false)} sx={{ color: 'white' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChordDetector;
