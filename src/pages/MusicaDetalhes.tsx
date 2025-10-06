// pages/MusicaDetalhes.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  MusicNote,
  Schedule,
  OpenInNew,
  Warning,
  Description,
  AudioFile,
  VideoLibrary,
  Person,
  Edit,
  Psychology,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MusicService } from '../services/musicService';
import { Music } from '../types/music';

export const MusicaDetalhes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [musica, setMusica] = useState<Music | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTom, setEditTom] = useState('');
  const [editBpm, setEditBpm] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadMusic();
  }, [id]);

  const loadMusic = async () => {
    if (!id) {
      setError('ID da música não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const musicData = await MusicService.getMusicById(id);
      
      if (!musicData) {
        setError('Música não encontrada');
      } else {
        setMusica(musicData);
        setEditTom(musicData.tom || '');
        setEditBpm(musicData.bpm?.toString() || '');
      }
    } catch (err: any) {
      setError('Erro ao carregar música: ' + err.message);
      console.error('Erro ao carregar música:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditTom(musica?.tom || '');
    setEditBpm(musica?.bpm?.toString() || '');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!musica || !id) return;

    try {
      setSaveLoading(true);
      await MusicService.updateMusic(id, {
        tom: editTom,
        bpm: editBpm ? parseInt(editBpm) : 0,
      });

      setMusica({
        ...musica,
        tom: editTom,
        bpm: editBpm ? parseInt(editBpm) : 0,
      });

      setEditDialogOpen(false);
    } catch (err: any) {
      console.error('Erro ao atualizar música:', err);
      alert('Erro ao atualizar música: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !musica) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Música não encontrada'}
        </Alert>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack /> Voltar
        </IconButton>
      </Box>
    );
  }

  const handleOpenLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Música
        </Typography>
        <IconButton onClick={handleOpenEditDialog}>
          <Edit />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ p: 2 }}>
        {/* Card Principal com Capa e Info */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar 
                variant="rounded" 
                src={musica.coverImage}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: 40
                }}
              >
                <MusicNote />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {musica.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {musica.album ? `Álbum: ${musica.album}` : 'Sem informação de álbum'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}
                  >
                    <Person sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => {
                      // Volta para repertório com filtro do artista
                      navigate('/louvor', { state: { filterArtist: musica.artista } });
                    }}
                  >
                    {musica.artista}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Botão Ver Mais Músicas do Artista */}
        {musica.departmentId && (
          <Card sx={{ mb: 2, bgcolor: 'primary.light', cursor: 'pointer' }} 
            onClick={async () => {
              try {
                const artistMusics = await MusicService.getMusicsByArtist(
                  musica.departmentId!,
                  musica.artista
                );
                if (artistMusics.length > 1) {
                  navigate('/louvor', { state: { filterArtist: musica.artista, tabIndex: 2 } });
                }
              } catch (err) {
                console.error('Erro ao buscar músicas do artista:', err);
              }
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Ver mais músicas de {musica.artista}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Versão */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Versão <Chip label="Original" size="small" sx={{ ml: 1, height: 20 }} />
          </Typography>
        </Box>

        {/* Informações Técnicas */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 2, 
          mb: 3 
        }}>
          {/* Tom */}
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Tom
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {musica.tom || '-'}
            </Typography>
          </Paper>

          {/* Duração */}
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Duração
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {musica.duracao || '-'}
            </Typography>
          </Paper>

          {/* BPM */}
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
              BPM
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {musica.bpm || '-'}
            </Typography>
          </Paper>
        </Box>

        {/* Classificações */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Classificações
          </Typography>
          <Chip label={musica.categoria} color="primary" />
          {musica.tags && musica.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {musica.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </Box>

        {/* Referências */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Referências
          </Typography>

          <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            {/* Letra */}
            {musica.referencias.letra && (
              <>
                <ListItemButton 
                  onClick={() => handleOpenLink(musica.referencias.letra)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Letra"
                    secondary={musica.referencias.letra}
                    secondaryTypographyProps={{
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                  <OpenInNew fontSize="small" color="action" />
                </ListItemButton>
                <Divider />
              </>
            )}

            {/* Cifra */}
            {musica.referencias.cifra && (
              <>
                <ListItemButton 
                  onClick={() => handleOpenLink(musica.referencias.cifra)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Description color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cifra"
                    secondary={musica.referencias.cifra}
                    secondaryTypographyProps={{
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                  <OpenInNew fontSize="small" color="action" />
                </ListItemButton>
                <Divider />
              </>
            )}

            {/* Cifras com IA - Chordify - SEMPRE APARECE */}
            <ListItemButton 
              onClick={() => {
                // Redireciona para o detector de acordes interno com dados da música
                navigate('/detector-acordes', { 
                  state: { 
                    musicTitle: musica.titulo,
                    artist: musica.artista,
                    videoUrl: musica.referencias.video,
                    audioUrl: musica.referencias.audio
                  } 
                });
              }}
              sx={{ 
                py: 1.5, 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <ListItemIcon>
                <Psychology color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="🤖 Cifras com IA (Detector Interno)"
                secondary="Detecção automática de acordes em tempo real"
                primaryTypographyProps={{
                  fontWeight: 600
                }}
              />
              <OpenInNew fontSize="small" color="action" />
            </ListItemButton>
            <Divider />

            {/* Áudio */}
            {musica.referencias.audio && (
              <>
                <ListItemButton 
                  onClick={() => handleOpenLink(musica.referencias.audio)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <AudioFile color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Áudio"
                    secondary={musica.referencias.audio}
                    secondaryTypographyProps={{
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                  <OpenInNew fontSize="small" color="action" />
                </ListItemButton>
                <Divider />
              </>
            )}

            {/* Vídeo */}
            {musica.referencias.video && (
              <ListItemButton 
                onClick={() => handleOpenLink(musica.referencias.video)}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon>
                  <VideoLibrary color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Vídeo"
                  secondary={musica.referencias.video}
                  secondaryTypographyProps={{
                    sx: { 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
                <OpenInNew fontSize="small" color="action" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Box>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Tom e BPM</DialogTitle>
        <DialogContent>
          <TextField
            label="Tom"
            value={editTom}
            onChange={(e) => setEditTom(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Ex: C, Am, G, etc."
            helperText="Informe o tom da música"
          />
          <TextField
            label="BPM (Batidas por Minuto)"
            value={editBpm}
            onChange={(e) => setEditBpm(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            placeholder="Ex: 120"
            helperText="Informe o BPM da música"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={saveLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saveLoading}>
            {saveLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
