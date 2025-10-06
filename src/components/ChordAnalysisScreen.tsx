import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Chip,
  CircularProgress
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
  Close as CloseIcon
} from '@mui/icons-material';
import ReactPlayer from 'react-player';

interface MusicData {
  nome: string;
  artista: string;
  videoUrl?: string;
}

const ChordAnalysisScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  
  // Estados do player
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  // Estados da análise
  const [analyzing, setAnalyzing] = useState(false);
  const [essentiaReady, setEssentiaReady] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentChord, setCurrentChord] = useState('E');
  const [showBasicChords, setShowBasicChords] = useState(true);
  
  const musicData: MusicData = location.state?.musicData || {
    nome: 'Música de Exemplo',
    artista: 'Artista Exemplo',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  };

  useEffect(() => {
    console.log('🔧 Iniciando análise de acordes...');
    
    // Simular inicialização da análise
    setTimeout(() => {
      console.log('⚡ Usando simulação avançada de acordes...');
      setEssentiaReady(true);
      console.log('✅ Sistema de análise inicializado!');
    }, 1000);
  }, []);

  // Handlers do player
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Formatar tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            borderRadius: 1,
            color: '#66b2ff'
          }}
        >
          120 BPM
        </Typography>
      </Box>

      {/* Área principal - flexível */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Painel de controles horizontais */}
        <Box sx={{ 
          bgcolor: '#132f4c',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Acordes */}
          <Box>
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
                  px: 2,
                  fontSize: '12px'
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
                  px: 2,
                  fontSize: '12px'
                }}
              >
                Todos
              </Button>
            </Box>
          </Box>

          {/* Posições */}
          <Box>
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
              borderRadius: '50%',
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
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'white' }}>
                Visualização em grade
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              <Box sx={{ 
                width: 40,
                height: 30,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GridViewIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Button
                size="small"
                sx={{ 
                  color: '#66b2ff',
                  textTransform: 'none',
                  fontSize: '10px',
                  p: 0,
                  minWidth: 'auto'
                }}
              >
                Ver todos
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Área dos pianos */}
        <Box sx={{ 
          flex: 1,
          bgcolor: '#132f4c',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflow: 'auto'
        }}>
          {/* Piano para acorde atual */}
          {renderPianoKeys(currentChord || 'E')}
          
          {/* Piano para segundo acorde */}
          {renderPianoKeys('Esus2')}
        </Box>
      </Box>

      {/* Player compacto na parte inferior */}
      <Box sx={{ 
        bgcolor: '#000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        minHeight: 80
      }}>
        {/* Miniatura do vídeo */}
        <Box sx={{ 
          width: 120,
          height: 60,
          bgcolor: '#333',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0
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
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Sem vídeo
              </Typography>
            </Box>
          )}
        </Box>

        {/* Controles de reprodução */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" sx={{ color: 'white' }}>
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
          
          <IconButton size="small" sx={{ color: 'white' }}>
            <SkipNextIcon />
          </IconButton>
        </Box>

        {/* Informações da música */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {musicData?.nome || 'Música selecionada'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {musicData?.artista || 'Artista'}
          </Typography>
        </Box>

        {/* Slider de progresso */}
        <Box sx={{ width: 200, mx: 2 }}>
          <Slider
            size="small"
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
                width: 12,
                height: 12,
                '&:hover': {
                  boxShadow: '0 0 0 8px rgba(102, 178, 255, 0.16)'
                }
              },
              '& .MuiSlider-track': {
                height: 4
              },
              '& .MuiSlider-rail': {
                height: 4,
                opacity: 0.3
              }
            }}
          />
        </Box>

        {/* Tempo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'white', minWidth: 80, textAlign: 'center' }}>
            {formatTime(currentTime)} / {formatTime(duration || 482)}
          </Typography>
          
          {/* Controles extras */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip 
              label="Altura" 
              size="small" 
              clickable
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: '#66b2ff',
                height: 24,
                fontSize: '10px',
                '&:hover': {
                  bgcolor: 'rgba(102, 178, 255, 0.2)'
                }
              }} 
            />
            <Chip 
              label="Velocidade" 
              size="small" 
              clickable
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: '#66b2ff',
                height: 24,
                fontSize: '10px',
                '&:hover': {
                  bgcolor: 'rgba(102, 178, 255, 0.2)'
                }
              }} 
            />
            <Chip 
              label="Loop" 
              size="small" 
              clickable
              sx={{ 
                bgcolor: loop ? 'rgba(102, 178, 255, 0.3)' : 'rgba(255,255,255,0.1)', 
                color: '#66b2ff',
                height: 24,
                fontSize: '10px',
                '&:hover': {
                  bgcolor: 'rgba(102, 178, 255, 0.2)'
                }
              }}
              onClick={() => setLoop(!loop)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChordAnalysisScreen;