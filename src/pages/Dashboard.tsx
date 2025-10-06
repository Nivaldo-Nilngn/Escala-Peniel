// pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  People,
  NotificationsActive,
  TrendingUp,
  Event,
  MusicNote,
  Security,
  Videocam,
  ChildCare,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/eventService';
import { UserService } from '../services/userService';
import { DepartmentService } from '../services/departmentService';
import { Event as EventType, EVENT_TYPES } from '../types/event';

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para dados reais
  const [totalMembers, setTotalMembers] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Buscar todos os membros ativos
      const usersData = await UserService.getUsers({ page: 1, limit: 1000 });
      const activeMembers = usersData.items.filter(u => u.isActive);
      setTotalMembers(activeMembers.length);

      // Buscar eventos próximos (próximos 7 dias)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const allEvents = await EventService.getAllEvents();
      const upcoming = allEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= nextWeek;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);
      
      setUpcomingEvents(upcoming);

      // Contar eventos do mês atual
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const monthEvents = await EventService.getEventsByMonth(currentMonth, currentYear);
      setEventCount(monthEvents.length);

      // Buscar estatísticas dos departamentos
      const departments = await DepartmentService.getAllDepartments();
      const stats = await Promise.all(
        departments.map(async (dept) => {
          const members = await UserService.getUsersByDepartment(dept.id);
          const functions = await DepartmentService.getDepartmentFunctions(dept.id);
          return {
            name: dept.name,
            type: dept.type,
            color: dept.color,
            membersCount: members.length,
            functionsCount: functions.length,
          };
        })
      );
      setDepartmentStats(stats);

    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      diaconato: <Security />,
      louvor: <MusicNote />,
      midia: <Videocam />,
      criancas: <ChildCare />,
    };
    return icons[type] || <People />;
  };

  const stats = [
    {
      title: 'Eventos Este Mês',
      value: eventCount.toString(),
      icon: <CalendarMonth />,
      color: '#1976d2',
      onClick: () => navigate('/agenda'),
    },
    {
      title: 'Próximos Eventos',
      value: upcomingEvents.length.toString(),
      icon: <Event />,
      color: '#dc004e',
      onClick: () => navigate('/agenda'),
    },
    {
      title: 'Membros Ativos',
      value: totalMembers.toString(),
      icon: <People />,
      color: '#2e7d32',
      onClick: () => navigate('/membros'),
    },
    {
      title: 'Departamentos',
      value: departmentStats.length.toString(),
      icon: <Schedule />,
      color: '#ed6c02',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100vw', 
      px: { xs: 0.5, sm: 1, md: 2 },
      py: { xs: 1, sm: 2, md: 3 },
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          sx={{ fontWeight: 600 }}
        >
          Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Bem-vindo(a), <strong>{user?.name}</strong>! Aqui está um resumo das suas atividades.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cards de Estatísticas - Grid Responsivo */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)',  // Mobile: 2 colunas
          sm: 'repeat(2, 1fr)',  // Tablet: 2 colunas
          md: 'repeat(4, 1fr)'   // Desktop: 4 colunas
        }, 
        gap: { xs: 1.5, sm: 2, md: 3 }, 
        mb: 3 
      }}>
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            elevation={2}
            sx={{ 
              transition: 'all 0.3s',
              cursor: stat.onClick ? 'pointer' : 'default',
              borderRadius: 2,
              '&:hover': { 
                transform: stat.onClick ? 'translateY(-4px)' : 'none',
                boxShadow: stat.onClick ? '0 8px 24px rgba(0,0,0,0.15)' : undefined,
              },
            }}
            onClick={stat.onClick}
          >
            <CardContent sx={{ 
              p: { xs: 2, sm: 2.5 },
              '&:last-child': { pb: { xs: 2, sm: 2.5 } }
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: stat.color, 
                    width: { xs: 48, sm: 56 }, 
                    height: { xs: 48, sm: 56 },
                    boxShadow: `0 4px 12px ${stat.color}40`,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="div"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Seção de Conteúdo Principal - 2 Colunas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
        gap: { xs: 2, sm: 3 },
        mb: 3,
      }}>
        {/* Próximos Eventos */}
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Event />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Próximos Eventos
              </Typography>
              <Chip 
                label="7 dias" 
                size="small" 
                sx={{ ml: 'auto' }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {upcomingEvents.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum evento próximo nos próximos 7 dias
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {upcomingEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      borderLeft: `4px solid ${event.color}`,
                      bgcolor: 'background.paper',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateX(4px)',
                      },
                    }}
                    onClick={() => navigate('/agenda')}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          📅 {event.date.toLocaleDateString('pt-BR')} • ⏰ {event.time}
                        </Typography>
                      </Box>
                      <Chip
                        label={EVENT_TYPES[event.type].label}
                        size="small"
                        sx={{
                          backgroundColor: event.color,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            <Button 
              fullWidth 
              sx={{ mt: 2 }} 
              variant="outlined"
              onClick={() => navigate('/agenda')}
            >
              Ver Agenda Completa
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas dos Departamentos */}
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <People />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Departamentos
              </Typography>
              <Chip 
                label={departmentStats.length} 
                size="small" 
                sx={{ ml: 'auto' }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {departmentStats.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum departamento cadastrado ainda
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {departmentStats.map((dept, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `2px solid ${dept.color}30`,
                      bgcolor: `${dept.color}05`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                        bgcolor: `${dept.color}10`,
                      },
                    }}
                    onClick={() => navigate(`/${dept.type}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: dept.color, 
                            width: 44, 
                            height: 44,
                            boxShadow: `0 4px 8px ${dept.color}40`,
                          }}
                        >
                          {getDepartmentIcon(dept.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="600" sx={{ mb: 0.25 }}>
                            {dept.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            👥 {dept.membersCount} membros · 📋 {dept.functionsCount} funções
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={dept.membersCount}
                        size="small"
                        sx={{ 
                          backgroundColor: dept.color, 
                          color: 'white',
                          fontWeight: 700,
                          minWidth: 32,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            <Button 
              fullWidth 
              sx={{ mt: 2 }} 
              variant="outlined"
            >
              Ver Todos os Departamentos
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Informações Rápidas (apenas para líderes/pastor) */}
      {hasRole(['pastor', 'lider']) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo Geral
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Total de Membros Cadastrados</Typography>
                <Typography variant="body2" fontWeight="bold">{totalMembers}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Departamentos Ativos</Typography>
                <Typography variant="body2" fontWeight="bold">{departmentStats.length}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Eventos Este Mês</Typography>
                <Typography variant="body2" fontWeight="bold">{eventCount}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Próximos Eventos (7 dias)</Typography>
                <Typography variant="body2" fontWeight="bold">{upcomingEvents.length}</Typography>
              </Box>
            </Box>

            {totalMembers === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Comece cadastrando membros em <strong onClick={() => navigate('/membros')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Membros</strong>
              </Alert>
            )}

            {eventCount === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Adicione eventos na <strong onClick={() => navigate('/agenda')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Agenda do Mês</strong>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};