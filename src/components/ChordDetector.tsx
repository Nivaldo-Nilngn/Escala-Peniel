import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  PlayArrow as PlayArrowIcon,
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
  LibraryMusic as LibraryMusicIcon,
} from '@mui/icons-material';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Chord, Note } from '@tonaljs/tonal';
import Meyda from 'meyda';
import { DeezerPublicApi } from '../services/deezerPublicApi';
import { HistoryService } from '../services/historyService';
import { HistoryItem } from '../types/history';
import { useAuth } from '../contexts/AuthContext';

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const musicData = location.state as { 
    musicTitle?: string; 
    artist?: string; 
    videoUrl?: string;
    audioUrl?: string;
  } | null;

  // Função para navegar para a tela de análise quando clicar no histórico
  const handleHistoryItemClick = (item: HistoryItem) => {
    navigateToAnalysis({
      musicTitle: item.title,
      artist: item.artist || 'Artista Desconhecido',
      videoUrl: item.videoUrl || item.url || '',
      duration: item.duration
    });
  };

  // Função para navegar para a tela de análise
  const navigateToAnalysis = (musicData: {
    musicTitle: string;
    artist: string;
    videoUrl: string;
    duration: string;
  }) => {
    navigate('/chord-analysis', { 
      state: musicData,
      replace: false 
    });
  };

  // Garantir que o body não tenha margin/padding
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  // Estados existentes...
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [loadingDeezer, setLoadingDeezer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<any[]>([]);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para mostrar o histórico ou as opções de mídia
  const [showHistory, setShowHistory] = useState(true);
  
  // Estados para o histórico real
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);

  // Carregar histórico do usuário
  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser?.id) {
        setLoadingHistory(true);
        try {
          const history = await HistoryService.getUserHistory(currentUser.id, 10);
          setHistoryItems(history);
        } catch (error) {
        } finally {
          setLoadingHistory(false);
        }
      } else {
      }
    };

    loadHistory();
  }, [currentUser]);

  // Função para adicionar música ao histórico
  const addToHistory = async (musicData: {
    title: string;
    artist?: string;
    duration: string;
    url?: string;
    videoUrl?: string;
    audioUrl?: string;
    type: 'music' | 'video' | 'audio';
  }) => {
    if (!currentUser?.id) {
      return;
    }

    try {
      
      await HistoryService.addToHistory({
        ...musicData,
        userId: currentUser.id
      });
      
      // Recarregar histórico
      const updatedHistory = await HistoryService.getUserHistory(currentUser.id, 10);
      setHistoryItems(updatedHistory);
      
      // Mostrar mensagem de sucesso
      setSuccessMessage(`"${musicData.title}" foi adicionado ao histórico!`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
    }
  };

  // Função para remover item do histórico
  const removeFromHistory = async (historyId: string) => {
    try {
      await HistoryService.removeFromHistory(historyId);
      setHistoryItems(prev => prev.filter(item => item.id !== historyId));
    } catch (error) {
      console.error('Erro ao remover do histórico:', error);
    }
  };

  // Função para renderizar ícone baseado no tipo
  const renderHistoryIcon = (item: HistoryItem) => {
    switch (item.type) {
      case 'video':
        return (
          <Box
            sx={{
              width: 40,
              height: 28,
              bgcolor: '#8b4513',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            VID
          </Box>
        );
      case 'audio':
        return <AudiotrackIcon sx={{ color: '#4a90e2', fontSize: 24 }} />;
      default:
        return <MusicNote sx={{ color: '#4a90e2', fontSize: 24 }} />;
    }
  };

  // Função para buscar no YouTube
  const searchYouTubeVideos = async (query: string) => {
    if (!query.trim()) {
      alert('⚠️ Digite algo para buscar');
      return;
    }
    
    setSearching(true);
    setYoutubeSearchResults([]);
    
    try {
      // Usando a API do YouTube via proxy ou serviço alternativo
      const encodedQuery = encodeURIComponent(query);
      
      // Tentativa com Invidious (API gratuita do YouTube)
      const invidiousInstances = [
        'https://inv.nadeko.net',
        'https://invidious.jing.rocks', 
        'https://invidious.privacyredirect.com',
        'https://y.com.sb'
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
          
          if (!response.ok) continue;
          
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
      console.error('Erro na busca:', error);
      alert('❌ Não foi possível buscar vídeos no momento. Tente novamente em alguns segundos.');
      setYoutubeSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Formata segundos para MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para iniciar gravação do microfone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Adicionar ao histórico
        await addToHistory({
          title: `Gravação ${new Date().toLocaleTimeString()}`,
          duration: formatDuration(recordingTime),
          url: audioUrl,
          type: 'audio'
        });
        
        setShowMicModal(false);
        setRecordingTime(0);
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      // Timer para contagem
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Parar timer quando parar gravação
      recorder.onstop = () => {
        clearInterval(timer);
        recorder.onstop = null;
      };
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('❌ Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Função para processar URL inserida
  const handleUrlSubmit = async (url: string) => {
    if (!url.trim()) {
      alert('⚠️ Digite uma URL válida');
      return;
    }
    
    let title = 'Link personalizado';
    let type: 'music' | 'video' | 'audio' = 'video';
    
    // Detectar tipo baseado na URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      title = 'Vídeo do YouTube';
      type = 'video';
    } else if (url.includes('spotify.com')) {
      title = 'Música do Spotify';
      type = 'music';
    } else if (url.includes('soundcloud.com')) {
      title = 'Áudio do SoundCloud';
      type = 'audio';
    } else if (/\.(mp3|wav|m4a|aac)$/i.test(url)) {
      title = 'Arquivo de áudio';
      type = 'audio';
    } else if (/\.(mp4|webm|ogg)$/i.test(url)) {
      title = 'Arquivo de vídeo';
      type = 'video';
    }
    
    await addToHistory({
      title,
      duration: '0:00',
      url,
      type
    });
    
    setShowUrlModal(false);
  };

  // Função para selecionar música do YouTube e navegar para análise
  const selectYouTubeMusic = async (videoData: any) => {
    try {
      // Fechar modal primeiro
      setShowYouTubeModal(false);
      
      // Adicionar ao histórico
      await addToHistory({
        title: videoData.title || 'Vídeo do YouTube',
        artist: videoData.channelTitle || 'YouTube',
        duration: videoData.duration || '0:00',
        videoUrl: videoData.url,
        type: 'video'
      });
      
      // Navegar para a tela de análise com os dados da música
      navigateToAnalysis({
        musicTitle: videoData.title || 'Vídeo do YouTube',
        artist: videoData.channelTitle || 'YouTube', 
        videoUrl: videoData.url,
        duration: videoData.duration || '0:00'
      });
      
    } catch (error) {
      console.error('Erro ao selecionar música:', error);
    }
  };

  // Função para selecionar música do Deezer e adicionar ao histórico
  const selectDeezerMusic = async (trackData: any) => {
    try {
      // Aqui você faria a integração real com o player
      setUrl(trackData.preview || '');
      
      // Adicionar ao histórico
      await addToHistory({
        title: trackData.title || 'Música do Deezer',
        artist: trackData.artist?.name || 'Deezer',
        duration: trackData.duration ? Math.floor(trackData.duration / 60) + ':' + (trackData.duration % 60).toString().padStart(2, '0') : '0:00',
        url: trackData.preview,
        type: 'music'
      });
      
    } catch (error) {
      console.error('Erro ao selecionar música:', error);
    }
  };

  const bottomNavItems = [
    {
      icon: <Box sx={{ width: 24, height: 24, bgcolor: '#4a90e2', borderRadius: '4px' }} />,
      label: 'Página inicial',
      active: false
    },
    {
      icon: <MicIcon sx={{ fontSize: 24, color: '#ccc' }} />,
      label: 'Microfone',
      active: false
    },
    {
      icon: (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: 24, height: 24 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Box key={i} sx={{ width: 6, height: 6, bgcolor: '#ccc', borderRadius: '1px' }} />
          ))}
        </Box>
      ),
      label: 'Lista de acordes',
      active: false
    },
    {
      icon: <LibraryMusicIcon sx={{ fontSize: 24, color: 'white' }} />,
      label: 'Minhas Playlists',
      active: true
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#34495e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      m: 0,
      p: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Header com seta e título */}
      <Box sx={{ 
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.5)'
              }
            }}
            onClick={() => window.history.back()}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500, color: 'white' }}>
            Histórico de navegação
          </Typography>
        </Box>
        <Button 
          sx={{ color: '#4a90e2', textTransform: 'none', fontSize: '14px' }}
          onClick={() => setShowAllHistoryModal(true)}
        >
          Ver todos
        </Button>
      </Box>

      {/* Conteúdo principal */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        px: 3, 
        pt: 16, 
        pb: 2,
        height: 'calc(100vh - 140px)', // Altura fixa considerando header
        overflow: 'hidden'
      }}>
        {/* Histórico de navegação - área com scroll limitada */}
        <Box sx={{ 
          flex: 1,
          mb: 3,
          overflow: 'auto',
          minHeight: 0 // Permite que o flex-shrink funcione
        }}>
          <Stack spacing={1}>
            {loadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#4a90e2' }} />
              </Box>
            ) : historyItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.5)' }}>
                <MusicNote sx={{ fontSize: 60, mb: 2 }} />
                <Typography>
                  Nenhuma música no histórico ainda.
                </Typography>
                <Typography variant="caption">
                  Busque e selecione músicas para aparecerem aqui.
                </Typography>
              </Box>
            ) : (
              historyItems.slice(0, window.innerHeight < 700 ? 3 : 4).map((item, index) => (
                <Paper 
                  key={item.id || index} 
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }
                  }}
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    {renderHistoryIcon(item)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ 
                        overflow: 'hidden',
                        position: 'relative',
                        maxWidth: '200px', // Limita a largura
                        '&:hover .scrolling-text': {
                          animation: item.title.length > 25 ? 'scrollText 4s linear infinite' : 'none'
                        },
                        '@keyframes scrollText': {
                          '0%': { transform: 'translateX(0%)' },
                          '25%': { transform: 'translateX(0%)' },
                          '75%': { transform: 'translateX(-100%)' },
                          '100%': { transform: 'translateX(-100%)' }
                        }
                      }}>
                        <Typography 
                          className="scrolling-text"
                          sx={{ 
                            color: 'white', 
                            fontSize: '14px', 
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.3s ease',
                            paddingRight: '20px' // Espaço para repetição
                          }}
                        >
                          {item.title}{item.title.length > 25 ? ` • ${item.title}` : ''}
                        </Typography>
                      </Box>
                      {item.artist && (
                        <Box sx={{ 
                          overflow: 'hidden',
                          position: 'relative',
                          maxWidth: '200px',
                          '&:hover .scrolling-text-artist': {
                            animation: item.artist.length > 30 ? 'scrollText 4s linear infinite' : 'none'
                          }
                        }}>
                          <Typography 
                            className="scrolling-text-artist"
                            sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                              transition: 'transform 0.3s ease',
                              paddingRight: '20px'
                            }}
                          >
                            {item.artist}{item.artist.length > 30 ? ` • ${item.artist}` : ''}
                          </Typography>
                        </Box>
                      )}
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                        {item.duration}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                      {item.date}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'rgba(255,255,255,0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que o clique propague para o Paper
                        removeFromHistory(item.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        </Box>

        {/* Escolher Mídia - sempre no final da página */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500, mb: 2 }}>
            Escolher Mídia
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 2 
          }}>
            <Paper sx={{
              bgcolor: 'rgba(102, 178, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 178, 255, 0.2)',
              borderRadius: 3,
              p: { xs: 2, sm: 3 }, // Padding menor em telas pequenas
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.3s',
              minHeight: { xs: '80px', sm: '120px' }, // Altura menor em telas pequenas
              '&:hover': {
                bgcolor: 'rgba(102, 178, 255, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setShowMicModal(true)}
            >
              <MicIcon sx={{ fontSize: { xs: 35, sm: 50 }, color: '#66b2ff' }} />
              <Typography sx={{ 
                color: 'white', 
                fontSize: { xs: '12px', sm: '14px' }, 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Microfone
              </Typography>
            </Paper>

            <Paper sx={{
              bgcolor: 'rgba(102, 178, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 178, 255, 0.2)',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.3s',
              minHeight: { xs: '80px', sm: '120px' },
              '&:hover': {
                bgcolor: 'rgba(102, 178, 255, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setShowUrlModal(true)}
            >
              <PublicIcon sx={{ fontSize: { xs: 35, sm: 50 }, color: '#66b2ff' }} />
              <Typography sx={{ 
                color: 'white', 
                fontSize: { xs: '12px', sm: '14px' }, 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Link do URL
              </Typography>
            </Paper>

            <Paper sx={{
              bgcolor: 'rgba(102, 178, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 178, 255, 0.2)',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.3s',
              minHeight: { xs: '80px', sm: '120px' },
              '&:hover': {
                bgcolor: 'rgba(102, 178, 255, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'audio/*,video/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  await addToHistory({
                    title: file.name,
                    duration: '0:00',
                    url,
                    type: file.type.startsWith('video/') ? 'video' : 'audio'
                  });
                }
              };
              input.click();
            }}
            >
              <FolderIcon sx={{ fontSize: { xs: 35, sm: 50 }, color: '#66b2ff' }} />
              <Typography sx={{ 
                color: 'white', 
                fontSize: { xs: '12px', sm: '14px' }, 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Buscar arquivos
              </Typography>
            </Paper>

            <Paper sx={{
              bgcolor: 'rgba(255, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.3s',
              minHeight: { xs: '80px', sm: '120px' },
              '&:hover': {
                bgcolor: 'rgba(255, 0, 0, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setShowYouTubeModal(true)}
            >
              <YouTubeIcon sx={{ fontSize: { xs: 35, sm: 50 }, color: '#FF0000' }} />
              <Typography sx={{ 
                color: 'white', 
                fontSize: { xs: '12px', sm: '14px' }, 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                YouTube
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <Box sx={{
          position: 'fixed',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          bgcolor: '#4caf50',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.3s ease-out',
          '@keyframes slideDown': {
            '0%': { transform: 'translateX(-50%) translateY(-100%)', opacity: 0 },
            '100%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 }
          }
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ✅ {successMessage}
          </Typography>
        </Box>
      )}

      {/* Modal Ver Todos os Históricos */}
      <Dialog 
        open={showAllHistoryModal} 
        onClose={() => setShowAllHistoryModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#34495e',
            color: 'white',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2c3e50', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNote sx={{ color: '#4a90e2', fontSize: 30 }} />
            <Typography variant="h6">Histórico Completo</Typography>
          </Box>
          <IconButton 
            onClick={() => setShowAllHistoryModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#4a90e2' }} />
            </Box>
          ) : historyItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.5)' }}>
              <MusicNote sx={{ fontSize: 60, mb: 2 }} />
              <Typography>
                Nenhuma música no histórico ainda.
              </Typography>
              <Typography variant="caption">
                Busque e selecione músicas para aparecerem aqui.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {historyItems.map((item, index) => (
                <Paper 
                  key={item.id || index} 
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }
                  }}
                  onClick={() => {
                    setShowAllHistoryModal(false); // Fechar modal primeiro
                    handleHistoryItemClick(item);
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    {renderHistoryIcon(item)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ 
                        overflow: 'hidden',
                        position: 'relative',
                        maxWidth: '300px', // Largura maior no modal
                        '&:hover .scrolling-text': {
                          animation: item.title.length > 35 ? 'scrollText 4s linear infinite' : 'none'
                        },
                        '@keyframes scrollText': {
                          '0%': { transform: 'translateX(0%)' },
                          '25%': { transform: 'translateX(0%)' },
                          '75%': { transform: 'translateX(-100%)' },
                          '100%': { transform: 'translateX(-100%)' }
                        }
                      }}>
                        <Typography 
                          className="scrolling-text"
                          sx={{ 
                            color: 'white', 
                            fontSize: '14px', 
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.3s ease',
                            paddingRight: '20px'
                          }}
                        >
                          {item.title}{item.title.length > 35 ? ` • ${item.title}` : ''}
                        </Typography>
                      </Box>
                      {item.artist && (
                        <Box sx={{ 
                          overflow: 'hidden',
                          position: 'relative',
                          maxWidth: '300px',
                          '&:hover .scrolling-text-artist': {
                            animation: item.artist.length > 40 ? 'scrollText 4s linear infinite' : 'none'
                          }
                        }}>
                          <Typography 
                            className="scrolling-text-artist"
                            sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                              transition: 'transform 0.3s ease',
                              paddingRight: '20px'
                            }}
                          >
                            {item.artist}{item.artist.length > 40 ? ` • ${item.artist}` : ''}
                          </Typography>
                        </Box>
                      )}
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                        {item.duration}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                      {item.date}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'rgba(255,255,255,0.5)' }}
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que o clique propague para o Paper
                        removeFromHistory(item.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: '#2c3e50', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          p: 2 
        }}>
          <Button 
            onClick={() => setShowAllHistoryModal(false)} 
            sx={{ color: 'white' }}
          >
            Fechar
          </Button>
          {historyItems.length > 0 && (
            <Button 
              onClick={async () => {
                if (currentUser?.id) {
                  await HistoryService.clearUserHistory(currentUser.id);
                  setHistoryItems([]);
                  setShowAllHistoryModal(false);
                }
              }}
              sx={{ color: '#f44336' }}
            >
              Limpar Histórico
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal do Microfone */}
      <Dialog 
        open={showMicModal} 
        onClose={() => {
          if (isRecording) {
            stopRecording();
          }
          setShowMicModal(false);
          setRecordingTime(0);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#34495e',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2c3e50', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MicIcon sx={{ color: '#66b2ff', fontSize: 30 }} />
          <Typography variant="h6">Gravação de Áudio</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: isRecording ? '#f44336' : '#66b2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              animation: isRecording ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }}>
              <MicIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              {isRecording ? 'Gravando...' : 'Pronto para gravar'}
            </Typography>
            
            {isRecording && (
              <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </Typography>
            )}
            
            {!isRecording && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Clique em "Iniciar Gravação" para começar
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: '#2c3e50', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          p: 2,
          justifyContent: 'center',
          gap: 2
        }}>
          <Button 
            onClick={() => {
              if (isRecording) {
                stopRecording();
              }
              setShowMicModal(false);
              setRecordingTime(0);
            }}
            sx={{ color: 'white' }}
          >
            {isRecording ? 'Cancelar' : 'Fechar'}
          </Button>
          
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              variant="contained"
              sx={{ 
                bgcolor: '#66b2ff',
                '&:hover': { bgcolor: '#5599dd' }
              }}
            >
              Iniciar Gravação
            </Button>
          ) : (
            <Button 
              onClick={stopRecording}
              variant="contained"
              sx={{ 
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' }
              }}
            >
              Parar e Salvar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de URL */}
      <Dialog 
        open={showUrlModal} 
        onClose={() => setShowUrlModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#34495e',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2c3e50', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PublicIcon sx={{ color: '#66b2ff', fontSize: 30 }} />
          <Typography variant="h6">Adicionar Link</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
            Cole aqui a URL de qualquer plataforma de música ou vídeo:
          </Typography>
          
          <TextField
            fullWidth
            placeholder="https://www.youtube.com/watch?v=..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit(customUrl);
                setCustomUrl('');
              }
            }}
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              mb: 3,
              '& .MuiInputBase-input': {
                color: 'white'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#66b2ff'
                }
              }
            }}
            InputProps={{
              startAdornment: <PublicIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
            }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>
              Plataformas suportadas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="YouTube" size="small" sx={{ bgcolor: '#FF0000', color: 'white' }} />
              <Chip label="Spotify" size="small" sx={{ bgcolor: '#1DB954', color: 'white' }} />
              <Chip label="SoundCloud" size="small" sx={{ bgcolor: '#FF5500', color: 'white' }} />
              <Chip label="Links diretos" size="small" sx={{ bgcolor: '#66b2ff', color: 'white' }} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: '#2c3e50', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          p: 2 
        }}>
          <Button 
            onClick={() => {
              setShowUrlModal(false);
              setCustomUrl('');
            }}
            sx={{ color: 'white' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              handleUrlSubmit(customUrl);
              setCustomUrl('');
            }}
            variant="contained"
            disabled={!customUrl.trim()}
            sx={{ 
              bgcolor: '#66b2ff',
              '&:hover': { bgcolor: '#5599dd' }
            }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Busca do YouTube - mantendo o existente */}
      <Dialog 
        open={showYouTubeModal} 
        onClose={() => setShowYouTubeModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2c3e50',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#34495e', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <YouTubeIcon sx={{ color: '#FF0000', fontSize: 30 }} />
            <Typography variant="h6">Buscar no YouTube</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
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
              <CircularProgress sx={{ color: '#FF0000' }} />
            </Box>
          )}

          {!searching && youtubeSearchResults.length > 0 && (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {youtubeSearchResults.map((video) => (
                <ListItem key={video.id} disablePadding>
                  <ListItemButton
                    onClick={async () => {
                      
                      await selectYouTubeMusic({
                        title: video.title,
                        channelTitle: video.channel,
                        duration: video.duration,
                        url: video.url
                      });
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

          {!searching && youtubeSearchResults.length === 0 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.5)' }}>
              <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography>
                Nenhum resultado encontrado para "{searchQuery}"
              </Typography>
              <Typography variant="caption">
                Tente termos diferentes
              </Typography>
            </Box>
          )}

          {!searching && youtubeSearchResults.length === 0 && !searchQuery && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.5)' }}>
              <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography>
                Digite algo e clique em "Buscar" para encontrar vídeos
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                As músicas selecionadas serão automaticamente adicionadas ao histórico
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: '#34495e', borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Button onClick={() => setShowYouTubeModal(false)} sx={{ color: 'white' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChordDetector;