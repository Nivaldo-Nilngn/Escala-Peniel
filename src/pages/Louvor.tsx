// pages/Louvor.tsx - Versão LouveApp Style
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Fab,
  useTheme,
  useMediaQuery,
  GlobalStyles,
  Paper,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Schedule as ScheduleIcon,
  People,
  CalendarMonth,
  MusicNote,
  ExpandMore,
  ExpandLess,
  Home as HomeIcon,
  LibraryMusic,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DepartmentService } from '../services/departmentService';
import { ScheduleService } from '../services/scheduleService';
import { UserService } from '../services/userService';
import { Department, User, DepartmentFunction, DepartmentSchedule } from '../types';
import { MusicSearchDialog } from '../components/MusicSearchDialog';
import { MusicSearchResult, MusicApiService } from '../services/musicApiService';
import { MusicService } from '../services/musicService';
import { Music } from '../types/music';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const Louvor: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [musicSearchOpen, setMusicSearchOpen] = useState(false);

  // Estado do departamento
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<DepartmentSchedule[]>([]);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());

  // Lista de músicas do Firebase
  const [musicas, setMusicas] = useState<Music[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('');

  // Toggle expansão de card
  const toggleScheduleExpansion = (scheduleId: string) => {
    setExpandedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadDepartmentData();
  }, []);

  const loadDepartmentData = async () => {
    try {
      setLoading(true);
      setError('');

      const departments = await DepartmentService.getAllDepartments();
      const louvorDept = departments.find(d => d.type === 'louvor') || null;

      setDepartment(louvorDept);

      if (louvorDept) {
        const deptMembers = await UserService.getUsersByDepartment(louvorDept.id);
        setMembers(deptMembers);

        const scheduleList = await ScheduleService.getDepartmentSchedules(louvorDept.id);
        setSchedules(scheduleList);

        // Carrega músicas do Firebase
        const musicsList = await MusicService.getMusicsByDepartment(louvorDept.id);
        setMusicas(musicsList);

        // Carrega lista de artistas únicos
        const artistsList = await MusicService.getArtistsByDepartment(louvorDept.id);
        setArtists(artistsList);
      }
    } catch (err: any) {
      setError('Erro ao carregar dados do departamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = async (musicData: MusicSearchResult) => {
    if (!department || !user) {
      setError('Departamento ou usuário não encontrado');
      return;
    }

    try {
      // Enriquece os dados da música com URLs geradas
      const enrichedMusic = MusicApiService.enrichMusicDetails(musicData);
      
      // Gera URLs específicas para cada referência
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(enrichedMusic.artist + ' ' + enrichedMusic.title)}`;
      const letraUrl = `https://www.letras.mus.br/winamp.php?musica=${encodeURIComponent(enrichedMusic.title + ' ' + enrichedMusic.artist)}`;
      
      // Cria nova música no formato do sistema
      const newMusicData: Partial<Music> = {
        titulo: enrichedMusic.title,
        artista: enrichedMusic.artist,
        album: enrichedMusic.album || '',
        tom: '', // Usuário pode preencher depois
        duracao: MusicApiService.formatDuration(enrichedMusic.duration),
        bpm: 0, // Usuário pode preencher depois
        categoria: 'Louvor' as const,
        coverImage: enrichedMusic.coverImage,
        referencias: {
          letra: letraUrl,
          cifra: enrichedMusic.cifraClubUrl || '',
          audio: enrichedMusic.preview || enrichedMusic.deezerUrl || '',
          video: youtubeSearchUrl,
        }
      };

      console.log('💾 Salvando música com referências:', newMusicData.referencias);

      // Salva no Firebase
      const musicId = await MusicService.addMusic(department.id, newMusicData, user.id);
      
      // Recarrega a lista de músicas
      const musicsList = await MusicService.getMusicsByDepartment(department.id);
      setMusicas(musicsList);

      // Atualiza lista de artistas
      const artistsList = await MusicService.getArtistsByDepartment(department.id);
      setArtists(artistsList);
      
      setSuccess(`Música "${newMusicData.titulo}" adicionada com sucesso!`);
      
    } catch (err: any) {
      setError('Erro ao adicionar música: ' + err.message);
      console.error('Erro ao adicionar música:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Departamento de Louvor não encontrado.
        </Alert>
      </Box>
    );
  }

  const canEdit = hasRole(['pastor', 'lider']);

  return (
    <>
      <GlobalStyles styles={{ 'body, html, #root': { overflowX: 'hidden' } }} />
      <Box sx={{ 
        width: '100%',
        maxWidth: '100vw',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2, md: 3 }
      }}>
        {/* Header com nome do ministério */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          mb: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {department.name}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 1
          }}>
            <Chip 
              icon={<CalendarMonth />}
              label={`${schedules.length} escalas`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<LibraryMusic />}
              label={`${musicas.length} músicas`} 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              icon={<People />}
              label={`${members.length} membros`} 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Tabs Navigation */}
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          centered={!isMobile}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{ mb: 3 }}
        >
          <Tab icon={<HomeIcon />} label="Início" iconPosition="start" />
          <Tab icon={<CalendarMonth />} label="Escalas" iconPosition="start" />
          <Tab icon={<LibraryMusic />} label="Repertório" iconPosition="start" />
        </Tabs>

        {/* ABA 1: INÍCIO (Dashboard) */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Card de Avisos/Novidades */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📢 Avisos
                  <Chip label="1/1" size="small" color="primary" />
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Em destaque
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MusicNote sx={{ color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Bem-vindo ao Ministério de Louvor
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label="🔵" size="small" />
                        <Chip label="🎵" size="small" />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <ExpandMore />
                    </IconButton>
                  </Box>
                </Paper>
              </CardContent>
            </Card>

            {/* Minhas Escalas */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Minhas escalas <Chip label={schedules.length} size="small" />
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => setTabValue(1)}
                  >
                    Ver todas
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Próximas
                </Typography>
                
                {schedules.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarMonth sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Lista vazia.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ pt: 2 }}>
                    {schedules.slice(0, 3).map((schedule) => (
                      <ListItem 
                        key={schedule.id}
                        sx={{ 
                          mb: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          px: 2
                        }}
                      >
                        <ListItemText
                          primary={schedule.eventTitle}
                          secondary={schedule.eventDate instanceof Date 
                            ? schedule.eventDate.toLocaleDateString('pt-BR')
                            : 'Data não disponível'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Aniversariantes */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Aniversariantes <Chip label="0" size="small" />
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    Ver todos
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Outubro
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    🎂 Lista vazia.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* ABA 2: ESCALAS */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Sub-tabs para Próximas e Anteriores */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip 
                label="Próximas" 
                color="primary" 
                onClick={() => {}}
                sx={{ flex: 1, height: 40, fontSize: '0.9rem' }}
              />
              <Chip 
                label="Anteriores" 
                variant="outlined"
                onClick={() => {}}
                sx={{ flex: 1, height: 40, fontSize: '0.9rem' }}
              />
            </Box>

            {schedules.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <CalendarMonth sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Lista vazia.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Para cadastrar uma escala, toque no botão: ( + )
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'center',
              }}>
                {schedules.map((schedule) => {
                  let scheduleDate: Date;
                  if (schedule.eventDate instanceof Date) {
                    scheduleDate = schedule.eventDate;
                  } else if (schedule.eventDate && typeof (schedule.eventDate as any).toDate === 'function') {
                    scheduleDate = (schedule.eventDate as any).toDate();
                  } else {
                    scheduleDate = new Date();
                  }
                  
                  const isPast = scheduleDate < new Date();
                  const isExpanded = expandedSchedules.has(schedule.id);

                  return (
                    <Card 
                      key={schedule.id}
                      sx={{ 
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 500, md: 600 },
                        opacity: isPast ? 0.7 : 1,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        }
                      }}
                      onClick={() => toggleScheduleExpansion(schedule.id)}
                    >
                      {schedule.colorPalette && (
                        <Box
                          sx={{
                            height: 4,
                            background: `linear-gradient(90deg, ${schedule.colorPalette.primary} 0%, ${schedule.colorPalette.secondary} 100%)`,
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ pb: isExpanded ? 2 : 1.5, pt: 1.5 }}>
                        {!isExpanded && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                                {schedule.eventTitle}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  icon={<CalendarMonth sx={{ fontSize: 14 }} />}
                                  label={scheduleDate.toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: 'short',
                                    year: 'numeric'
                                  })} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  icon={<People sx={{ fontSize: 14 }} />}
                                  label={`${schedule.assignments?.length || 0} escalados`}
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                              </Box>
                            </Box>
                            <IconButton size="small">
                              <ExpandMore />
                            </IconButton>
                          </Box>
                        )}

                        {isExpanded && (
                          <>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              {schedule.eventTitle}
                            </Typography>
                            
                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Data
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {scheduleDate.toLocaleDateString('pt-BR')}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Horário
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {schedule.eventStartTime}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {schedule.assignments && schedule.assignments.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  Escalados ({schedule.assignments.length}):
                                </Typography>
                                <List dense>
                                  {schedule.assignments.map((assignment, idx) => (
                                    <ListItem key={idx} sx={{ px: 0 }}>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip 
                                              label={assignment.functionName} 
                                              size="small" 
                                              color="primary" 
                                              variant="filled"
                                            />
                                            <Typography variant="body2">
                                              {assignment.userName}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            <Box sx={{ textAlign: 'center', pt: 1 }}>
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                toggleScheduleExpansion(schedule.id);
                              }}>
                                <ExpandLess />
                              </IconButton>
                            </Box>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* ABA 3: REPERTÓRIO */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Sub-tabs para Músicas e Artistas */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip 
                label={`Músicas (${musicas.length})`}
                color="primary" 
                onClick={() => setSelectedArtistFilter('')}
                sx={{ flex: 1, height: 40, fontSize: '0.9rem' }}
              />
              <Chip 
                label={`Artistas (${artists.length})`}
                variant="outlined"
                onClick={() => {
                  // Mostra dialog com lista de artistas
                  if (artists.length > 0) {
                    setSelectedArtistFilter(artists[0]);
                  }
                }}
                sx={{ flex: 1, height: 40, fontSize: '0.9rem' }}
              />
            </Box>

            {/* Filtro de Artistas */}
            {selectedArtistFilter && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Filtrando por artista:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="Todos"
                    onClick={() => setSelectedArtistFilter('')}
                    variant="outlined"
                  />
                  {artists.map(artist => (
                    <Chip
                      key={artist}
                      label={artist}
                      color={selectedArtistFilter === artist ? 'primary' : 'default'}
                      onClick={() => setSelectedArtistFilter(artist)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Filtro rápido de artistas (sempre visível) */}
            {!selectedArtistFilter && artists.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Filtrar por artista:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 100, overflow: 'auto' }}>
                  {artists.map(artist => (
                    <Chip
                      key={artist}
                      label={artist}
                      size="small"
                      onClick={() => setSelectedArtistFilter(artist)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Lista de Músicas */}
            <List sx={{ px: 0 }}>
              {musicas
                .filter(musica => !selectedArtistFilter || musica.artista === selectedArtistFilter)
                .map((musica) => (
                <Card 
                  key={musica.id} 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-2px)'
                    } 
                  }}
                  onClick={() => navigate(`/musica/${musica.id}`)}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box sx={{ display: 'flex', position: 'relative' }}>
                      {/* Conteúdo da Música - LADO ESQUERDO */}
                      <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {musica.titulo}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <Avatar sx={{ width: 20, height: 20, bgcolor: 'secondary.main' }}>
                            <People sx={{ fontSize: 12 }} />
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {musica.artista}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={musica.categoria} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                          {musica.tom && (
                            <Chip 
                              label={`Tom: ${musica.tom}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          )}
                          {musica.duracao && (
                            <Chip 
                              icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                              label={musica.duracao} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Imagem da Música - LADO DIREITO */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {musica.coverImage ? (
                          <Box
                            component="img"
                            src={musica.coverImage}
                            alt={musica.titulo}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MusicNote sx={{ fontSize: 48, color: 'white' }} />
                          </Box>
                        )}
                        
                        {/* Ícones de Recursos - Posicionados sobre a imagem */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 0.5,
                            py: 0.5,
                            px: 0.5,
                          }}
                        >
                          {musica.referencias?.letra && (
                            <Box
                              sx={{
                                bgcolor: 'warning.main',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                              }}
                            >
                              📝
                            </Box>
                          )}
                          {musica.referencias?.cifra && (
                            <Box
                              sx={{
                                bgcolor: 'success.main',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                              }}
                            >
                              🎼
                            </Box>
                          )}
                          {musica.referencias?.audio && (
                            <Box
                              sx={{
                                bgcolor: 'info.main',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                              }}
                            >
                              🎵
                            </Box>
                          )}
                          {musica.referencias?.video && (
                            <Box
                              sx={{
                                bgcolor: 'error.main',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                              }}
                            >
                              🎥
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* FAB Button */}
        {canEdit && isMobile && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
            onClick={() => {
              if (tabValue === 1) {
                navigate('/criar-escala/' + department.id);
              } else if (tabValue === 2) {
                // Adicionar música - abre o dialog de busca
                setMusicSearchOpen(true);
              }
            }}
          >
            <Add />
          </Fab>
        )}

        {/* Dialog de Busca de Música */}
        <MusicSearchDialog
          open={musicSearchOpen}
          onClose={() => setMusicSearchOpen(false)}
          onSelectMusic={handleAddMusic}
        />
      </Box>
    </>
  );
};
