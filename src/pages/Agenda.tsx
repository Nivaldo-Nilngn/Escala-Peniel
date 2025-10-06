// pages/Agenda.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
  Paper,
  Divider,
  GlobalStyles,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CalendarMonth,
  NavigateBefore,
  NavigateNext,
  ContentCopy,
  CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { EventService } from '../services/eventService';
import { Event, EventType, EVENT_TYPES } from '../types/event';
import { seedOctoberEvents } from '../utils/seedOctoberEvents';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Agenda: React.FC = () => {
  const { user, hasRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado da data atual
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Eventos
  const [events, setEvents] = useState<Event[]>([]);

  // Diálogos
  const [addEventDialog, setAddEventDialog] = useState(false);
  const [editEventDialog, setEditEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Formulário
  const [formData, setFormData] = useState({
    title: '',
    type: 'culto_celebracao' as EventType,
    date: '',
    time: '19:00',
    description: '',
  });

  // Modo de visualização
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Semana atual para mobile (offset em relação à primeira semana do mês)
  const [weekOffset, setWeekOffset] = useState(0);

  // Estado para importação de eventos
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const eventsData = await EventService.getEventsByMonth(currentMonth, currentYear);
      setEvents(eventsData);
    } catch (err: any) {
      setError('Erro ao carregar eventos da agenda.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportOctoberEvents = async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    if (!window.confirm('Isso irá adicionar 10 eventos de Outubro/2025. Deseja continuar?')) {
      return;
    }

    try {
      setImporting(true);
      setError('');
      
      const results = await seedOctoberEvents(user.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        setSuccess(`✅ Todos os ${successCount} eventos foram criados com sucesso!`);
      } else {
        setSuccess(`⚠️ ${successCount} eventos criados, ${failCount} falharam.`);
      }
      
      // Navegar para outubro se não estiver nele
      if (currentMonth !== 10 || currentYear !== 2025) {
        setCurrentMonth(10);
        setCurrentYear(2025);
      } else {
        await loadEvents();
      }
    } catch (err: any) {
      setError(`Erro ao importar eventos: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handlePreviousMonth = () => {
    setWeekOffset(0); // Resetar para primeira semana
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    setWeekOffset(0); // Resetar para primeira semana
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const handleAddEvent = async () => {
    if (!formData.title || !formData.date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const eventDate = new Date(formData.date + 'T' + formData.time);
      
      await EventService.createEvent({
        title: formData.title,
        type: formData.type,
        date: eventDate,
        time: formData.time,
        description: formData.description,
        month: eventDate.getMonth() + 1,
        year: eventDate.getFullYear(),
        color: EVENT_TYPES[formData.type].color,
        isActive: true,
        createdBy: user?.id || '',
      });

      setSuccess('Evento criado com sucesso!');
      setAddEventDialog(false);
      resetForm();
      await loadEvents();
    } catch (err: any) {
      setError('Erro ao criar evento.');
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !formData.title || !formData.date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const eventDate = new Date(formData.date + 'T' + formData.time);
      
      await EventService.updateEvent(selectedEvent.id, {
        title: formData.title,
        type: formData.type,
        date: eventDate,
        time: formData.time,
        description: formData.description,
        month: eventDate.getMonth() + 1,
        year: eventDate.getFullYear(),
        color: EVENT_TYPES[formData.type].color,
      });

      setSuccess('Evento atualizado com sucesso!');
      setEditEventDialog(false);
      setSelectedEvent(null);
      resetForm();
      await loadEvents();
    } catch (err: any) {
      setError('Erro ao atualizar evento.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      await EventService.deleteEvent(eventId);
      setSuccess('Evento excluído com sucesso!');
      await loadEvents();
    } catch (err: any) {
      setError('Erro ao excluir evento.');
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      description: event.description || '',
    });
    setAddEventDialog(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      description: event.description || '',
    });
    setEditEventDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'culto_celebracao',
      date: '',
      time: '19:00',
      description: '',
    });
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDay = event.date.getDate();
      return eventDay === day;
    });
  };

  // Funções para calendário semanal (mobile)
  const getCurrentWeekDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Pegar domingo da primeira semana do mês
    const firstSunday = new Date(firstDayOfMonth);
    firstSunday.setDate(1 - firstDayOfWeek);
    
    // Adicionar offset de semanas
    const targetSunday = new Date(firstSunday);
    targetSunday.setDate(firstSunday.getDate() + (weekOffset * 7));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(targetSunday);
      date.setDate(targetSunday.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const getWeekEvents = () => {
    const weekDays = getCurrentWeekDays();
    return events.filter(event => {
      const eventDate = event.date;
      return weekDays.some(day => 
        day.getDate() === eventDate.getDate() &&
        day.getMonth() === eventDate.getMonth() &&
        day.getFullYear() === eventDate.getFullYear()
      );
    });
  };

  const renderMobileWeekView = () => {
    const weekDays = getCurrentWeekDays();
    const weekEvents = getWeekEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* BLOCO 1: Card do Mini Calendário Semanal */}
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              📅
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              Calendário Semanal
            </Typography>
          </Box>
          
          {/* Navegação de semanas */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handlePreviousWeek} size="small" sx={{ flexShrink: 0 }}>
              <NavigateBefore />
            </IconButton>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: 1,
              }}
            >
              Semana de {weekDays[0].getDate()} a {weekDays[6].getDate()} de {MONTHS[currentMonth - 1]}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small" sx={{ flexShrink: 0 }}>
              <NavigateNext />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: { xs: 0.25, sm: 0.5 },
            width: '100%',
          }}>
            {weekDays.map((day, index) => {
              const dayEvents = events.filter(event => 
                event.date.getDate() === day.getDate() &&
                event.date.getMonth() === day.getMonth() &&
                event.date.getFullYear() === day.getFullYear()
              );
              
              const isToday = day.getTime() === today.getTime();
              const dayNumber = day.getDate();
              const isCurrentMonth = day.getMonth() === currentMonth - 1;

              return (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 0.3, sm: 0.5 },
                  }}
                >
                  {/* Nome do dia */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.55rem', sm: '0.65rem' },
                      fontWeight: 600,
                      color: isToday ? 'primary.main' : 'text.secondary',
                      textTransform: 'uppercase',
                    }}
                  >
                    {DAYS_OF_WEEK[index].slice(0, 3)}
                  </Typography>

                  {/* Número do dia com bolinhas de evento */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: 32, sm: 40, md: 44 },
                      height: { xs: 32, sm: 40, md: 44 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: isToday ? 'primary.main' : 'transparent',
                      border: isToday ? 'none' : dayEvents.length > 0 ? '2px solid' : '1px solid',
                      borderColor: dayEvents.length > 0 ? dayEvents[0].color : '#e0e0e0',
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday ? 700 : 600,
                        color: isToday ? 'white' : 'text.primary',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {dayNumber}
                    </Typography>
                  </Box>

                  {/* Bolinhas de eventos */}
                  {dayEvents.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.25, mt: 0.25, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: { xs: 4, sm: 6 },
                            height: { xs: 4, sm: 6 },
                            borderRadius: '50%',
                            backgroundColor: event.color,
                            boxShadow: `0 0 4px ${event.color}`,
                          }}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' }, color: 'text.secondary', ml: 0.25 }}>
                          +{dayEvents.length - 2}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* BLOCO 2: Card dos Eventos desta Semana */}
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              📋
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              Eventos desta Semana
            </Typography>
          </Box>
          
          {weekEvents.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum evento programado para esta semana
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weekEvents
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event) => {
                  const eventDate = event.date;
                  const dayOfWeek = DAYS_OF_WEEK[eventDate.getDay()];
                  const day = eventDate.getDate();
                  const month = MONTHS[eventDate.getMonth()];

                  return (
                    <Box
                      key={event.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: `4px solid ${event.color}`,
                        bgcolor: 'background.paper',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {/* Cabeçalho com data */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              display: 'block', 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            }}
                          >
                            {dayOfWeek}, {day} de {month}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                mt: 0.5,
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                              }}
                            >
                              {event.title}
                            </Typography>
                          </Box>

                          {/* Bolinha de cor com legenda */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: event.color,
                                boxShadow: `0 0 8px ${event.color}`,
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Chips com tipo e horário */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={EVENT_TYPES[event.type].label}
                            size="small"
                            sx={{
                              backgroundColor: event.color,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              height: { xs: 20, sm: 24 },
                            }}
                          />
                          <Chip
                            label={event.time}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: event.color,
                              color: event.color,
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              height: { xs: 20, sm: 24 },
                            }}
                          />
                        </Box>

                        {/* Descrição */}
                        {event.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 1.5, 
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            {event.description}
                          </Typography>
                        )}

                        {/* Botões de ação (apenas para admin) */}
                        {hasRole(['pastor', 'lider']) && (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDuplicateEvent(event)} 
                              sx={{ color: 'text.secondary' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => openEditDialog(event)} 
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteEvent(event.id)} 
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                    </Box>
                  );
                })}
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Box
          key={`empty-${i}`}
          sx={{
            minHeight: 100,
            border: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
          }}
        />
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() + 1 && 
                      currentYear === new Date().getFullYear();

      days.push(
        <Box
          key={day}
          sx={{
            minHeight: 100,
            border: '1px solid #e0e0e0',
            p: 1,
            backgroundColor: isToday ? '#e3f2fd' : 'white',
            cursor: dayEvents.length > 0 ? 'pointer' : 'default',
          }}
        >
          <Typography
            variant="body2"
            fontWeight={isToday ? 'bold' : 'normal'}
            color={isToday ? 'primary' : 'text.primary'}
          >
            {day}
          </Typography>
          {dayEvents.map((event) => (
            <Chip
              key={event.id}
              label={event.title}
              size="small"
              sx={{
                mt: 0.5,
                width: '100%',
                backgroundColor: event.color,
                color: 'white',
                fontSize: '0.7rem',
                height: '20px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 0.5,
                },
              }}
              onClick={() => openEditDialog(event)}
            />
          ))}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
        }}
      >
        {/* Cabeçalho dos dias da semana */}
        {DAYS_OF_WEEK.map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#1976d2',
              color: 'white',
            }}
          >
            {day}
          </Box>
        ))}
        {/* Dias do mês */}
        {days}
      </Box>
    );
  };

  const renderListView = () => {
    if (events.length === 0) {
      return (
        <Alert severity="info">
          Nenhum evento cadastrado para {MONTHS[currentMonth - 1]} de {currentYear}.
        </Alert>
      );
    }

    return (
      <List>
        {events.map((event) => {
          const dayOfWeek = DAYS_OF_WEEK[event.date.getDay()];
          const dateStr = `${event.date.getDate().toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}`;
          
          return (
            <ListItem
              key={event.id}
              sx={{
                mb: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                borderLeft: `4px solid ${event.color}`,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{event.title}</Typography>
                    <Chip
                      label={EVENT_TYPES[event.type].label}
                      size="small"
                      sx={{ backgroundColor: event.color, color: 'white' }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.primary">
                      {dateStr} ({dayOfWeek}) às {event.time}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                  </>
                }
              />
              {hasRole(['pastor', 'lider']) && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDuplicateEvent(event)} sx={{ mr: 1 }}>
                    <ContentCopy />
                  </IconButton>
                  <IconButton edge="end" onClick={() => openEditDialog(event)} sx={{ mr: 1 }}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteEvent(event.id)} color="error">
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>
    );
  };

  const canEdit = hasRole(['pastor', 'lider']);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <GlobalStyles styles={{
        'body, html, #root': {
          overflowX: 'hidden',
          margin: 0,
          padding: 0,
          width: '100%',
          maxWidth: '100vw',
        }
      }} />
      
      <Box sx={{ width: '100%', maxWidth: '100vw', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: { xs: '100%', md: '1400px' }, 
          px: { xs: 0.5, sm: 1, md: 2 },
          py: { xs: 1, sm: 2, md: 3 },
        }}>
          {/* Header - Apenas Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h4">
                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                Agenda do Mês
              </Typography>
              {canEdit && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {currentMonth === 10 && currentYear === 2025 && events.length === 0 && (
                    <Button
                      variant="outlined"
                      startIcon={importing ? <CircularProgress size={20} /> : <CloudUpload />}
                      onClick={handleImportOctoberEvents}
                      disabled={importing}
                      color="secondary"
                    >
                      {importing ? 'Importando...' : 'Importar Outubro'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      resetForm();
                      setAddEventDialog(true);
                    }}
                  >
                    Novo Evento
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Header Compacto */}
          {isMobile && (
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              <CalendarMonth />
              Agenda do Mês
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Card do Calendário Grande - Separado */}
          <Paper elevation={2} sx={{ mb: 2, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handlePreviousMonth} size="small">
                <NavigateBefore />
              </IconButton>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.5rem' },
                }}
              >
                {MONTHS[currentMonth - 1]} {currentYear}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small">
                <NavigateNext />
              </IconButton>
            </Box>

            {/* Desktop: Toggle entre Calendário e Lista */}
            {!isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="calendar">
                    Calendário
                  </ToggleButton>
                  <ToggleButton value="list">
                    Lista
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {/* Desktop: Toggle Calendar/List */}
            {!isMobile && (viewMode === 'calendar' ? renderCalendarView() : renderListView())}
          </Paper>

          {/* Mobile: Calendário Semanal e Eventos (fora do card mensal) */}
          {isMobile && renderMobileWeekView()}

          {/* Botão Flutuante Mobile */}
          {canEdit && isMobile && (
            <Fab
              color="primary"
              aria-label="novo evento"
              onClick={() => {
                resetForm();
                setAddEventDialog(true);
              }}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000,
              }}
            >
              <Add />
            </Fab>
          )}

          {/* Dialog para adicionar evento */}
          <Dialog open={addEventDialog} onClose={() => setAddEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Evento</DialogTitle>
        <DialogContent>
          <TextField
            label="Título do Evento"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Evento</InputLabel>
            <Select
              value={formData.type}
              label="Tipo de Evento"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
            >
              {Object.entries(EVENT_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: value.color, borderRadius: '50%' }} />
                    {value.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Data"
              type="date"
              sx={{ flex: 2 }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Horário"
              type="time"
              sx={{ flex: 1 }}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Descrição (opcional)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEventDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddEvent} variant="contained">Criar Evento</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar evento */}
      <Dialog open={editEventDialog} onClose={() => setEditEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Evento</DialogTitle>
        <DialogContent>
          <TextField
            label="Título do Evento"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Evento</InputLabel>
            <Select
              value={formData.type}
              label="Tipo de Evento"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
            >
              {Object.entries(EVENT_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: value.color, borderRadius: '50%' }} />
                    {value.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Data"
              type="date"
              sx={{ flex: 2 }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Horário"
              type="time"
              sx={{ flex: 1 }}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Descrição (opcional)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEventDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditEvent} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Box>
    </>
  );
};
