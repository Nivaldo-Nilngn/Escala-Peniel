// components/MusicSearchDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Search,
  Close,
  MusicNote,
  Album,
  AccessTime,
  PersonSearch,
} from '@mui/icons-material';
import { MusicApiService, MusicSearchResult } from '../services/musicApiService';

interface MusicSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMusic: (music: MusicSearchResult) => void;
}

export const MusicSearchDialog: React.FC<MusicSearchDialogProps> = ({
  open,
  onClose,
  onSelectMusic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'track' | 'artist'>('track');
  const [searchResults, setSearchResults] = useState<MusicSearchResult[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  // Debounce para busca automática
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setArtistResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 800); // Aguarda 800ms após o usuário parar de digitar

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      setError('Digite pelo menos 3 caracteres para buscar');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🔍 Iniciando busca:', searchQuery, 'Tipo:', searchType);

      if (searchType === 'track') {
        const results = await MusicApiService.searchAll(searchQuery);
        console.log('📊 Resultados da busca:', results);
        setSearchResults(results);
        
        if (results.length === 0) {
          setError('Nenhuma música encontrada. Tente outros termos de busca.');
        }
      } else {
        const artists = await MusicApiService.searchArtistDeezer(searchQuery);
        console.log('👥 Artistas encontrados:', artists);
        setArtistResults(artists);
        
        if (artists.length === 0) {
          setError('Nenhum artista encontrado. Tente outros termos de busca.');
        }
      }
    } catch (err: any) {
      console.error('❌ Erro na busca:', err);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao buscar. ';
      
      if (err.message?.includes('CORS')) {
        errorMessage += 'Problema de CORS. Verifique a configuração do servidor.';
      } else if (err.message?.includes('Failed to fetch')) {
        errorMessage += 'Não foi possível conectar à API. Verifique sua conexão com a internet.';
      } else if (err.message?.includes('NetworkError')) {
        errorMessage += 'Erro de rede. Tente novamente.';
      } else {
        errorMessage += err.message || 'Tente novamente em alguns instantes.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArtist = async (artist: any) => {
    setSelectedArtist(artist);
    setLoading(true);
    
    try {
      const tracks = await MusicApiService.getArtistTopTracks(artist.id);
      setSearchResults(tracks);
    } catch (err) {
      setError('Erro ao carregar músicas do artista');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMusic = (music: MusicSearchResult) => {
    onSelectMusic(music);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setArtistResults([]);
    setSelectedArtist(null);
    setError('');
    onClose();
  };

  const handleBackToArtists = () => {
    setSelectedArtist(null);
    setSearchResults([]);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedArtist ? `Músicas de ${selectedArtist.name}` : 'Adicionar Música'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Tabs de busca */}
        {!selectedArtist && (
          <>
            <Tabs 
              value={searchType} 
              onChange={(_, value) => {
                setSearchType(value);
                setSearchResults([]);
                setArtistResults([]);
                setError('');
              }}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<MusicNote />} 
                iconPosition="start" 
                label="Buscar Música" 
                value="track" 
              />
              <Tab 
                icon={<PersonSearch />} 
                iconPosition="start" 
                label="Buscar por Artista" 
                value="artist" 
              />
            </Tabs>

            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎵 Busque pelo título da música, nome do artista ou banda
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Integrações: Deezer, Cifra Club
                </Typography>
              </Alert>
            </Box>
          </>
        )}

        {/* Campo de busca */}
        {!selectedArtist && (
          <TextField
            fullWidth
            placeholder={
              searchType === 'track' 
                ? 'Ex: Bondade de Deus, Essência da Adoração...' 
                : 'Ex: Aline Barros, Fernanda Brum...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
            autoFocus
          />
        )}

        {/* Botão voltar quando artista selecionado */}
        {selectedArtist && (
          <Button 
            startIcon={<Close />} 
            onClick={handleBackToArtists}
            sx={{ mb: 2 }}
          >
            Voltar aos artistas
          </Button>
        )}

        {/* Mensagem de erro */}
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Resultados de Artistas */}
        {!loading && searchType === 'artist' && artistResults.length > 0 && !selectedArtist && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {artistResults.map((artist) => (
              <ListItem
                key={artist.id}
                onClick={() => handleSelectArtist(artist)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={artist.picture_medium} alt={artist.name}>
                    <PersonSearch />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={artist.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" component="span">
                        {artist.nb_album} álbuns · {artist.nb_fan?.toLocaleString()} fãs
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Resultados de Músicas */}
        {!loading && searchResults.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {searchResults.map((music) => (
              <ListItem
                key={music.id}
                onClick={() => handleSelectMusic(music)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={music.coverImage} 
                    variant="rounded"
                    alt={music.title}
                  >
                    <MusicNote />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {music.title}
                      </Typography>
                      <Chip 
                        label={music.source.toUpperCase()} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {music.artist}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {music.album && (
                          <Chip
                            icon={<Album sx={{ fontSize: 12 }} />}
                            label={music.album}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {music.duration && (
                          <Chip
                            icon={<AccessTime sx={{ fontSize: 12 }} />}
                            label={MusicApiService.formatDuration(music.duration)}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Estado vazio */}
        {!loading && searchQuery.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {searchType === 'track' 
                ? 'Digite o nome de uma música para buscar'
                : 'Digite o nome de um artista ou banda'
              }
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
