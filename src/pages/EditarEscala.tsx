// pages/EditarEscala.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  Stack,
  alpha,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { 
  CalendarMonth, 
  AccessTime, 
  LocationOn,
  CheckCircle,
  Add,
  ArrowBack,
  Lock,
} from '@mui/icons-material';
import { EventService } from '../services/eventService';
import { DepartmentService } from '../services/departmentService';
import { UserService } from '../services/userService';
import { ScheduleService } from '../services/scheduleService';
import { Event, DepartmentFunction, User, DepartmentSchedule, Assignment, ColorPalette } from '../types';
import { EVENT_TYPES } from '../types/event';
import { useAuth } from '../hooks/useAuth';

interface AssignmentInput {
  functionId: string;
  functionName: string;
  userId: string;
  userName: string;
}

export const EditarEscala: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMountedRef = React.useRef(true);

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dados
  const [schedule, setSchedule] = useState<DepartmentSchedule | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [functions, setFunctions] = useState<DepartmentFunction[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [department, setDepartment] = useState<any>(null);

  // Form data
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInput[]>([]);
  const [arrivalTime, setArrivalTime] = useState('17:40');
  const [eventStartTime, setEventStartTime] = useState('18:30');
  const [colorPaletteType, setColorPaletteType] = useState<'white' | 'black' | 'custom'>('white');
  const [colorPalette, setColorPalette] = useState<ColorPalette>({
    primary: '#FFFFFF',
    secondary: '#000000',
    accent: '',
    description: '',
  });
  const [notes, setNotes] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [scheduleId]);

  // Inicializar assignments quando functions e schedule carregarem
  useEffect(() => {
    if (loading) return;
    
    if (functions.length > 0 && schedule && assignments.length === 0) {
      const scheduleAssignments = schedule.assignments || [];
      const newAssignments = functions.map(func => {
        const existing = scheduleAssignments.find(a => a.functionId === func.id);
        return {
          functionId: func.id,
          functionName: func.name,
          userId: existing?.userId || '',
          userName: existing?.userName || '',
        };
      });
      setAssignments(newAssignments);
    }
  }, [functions, schedule, assignments.length, loading]);

  const loadData = async () => {
    if (!scheduleId) {
      setError('ID da escala não informado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar escala
      const scheduleData = await ScheduleService.getDepartmentScheduleById(scheduleId);
      
      if (!scheduleData) {
        throw new Error('Escala não encontrada');
      }

      setSchedule(scheduleData);

      // Buscar departamento
      const deptData = await DepartmentService.getDepartmentById(scheduleData.departmentId);
      
      if (!deptData) {
        throw new Error('Departamento não encontrado');
      }

      setDepartment(deptData);

      // Buscar funções
      const functionsData = await DepartmentService.getDepartmentFunctions(deptData.id);
      setFunctions(functionsData);

      // Buscar membros
      const membersData = await UserService.getUsersByDepartment(deptData.id);
      const activeMembers = membersData.filter(m => m.isActive);
      setMembers(activeMembers);

      // Buscar eventos do mês da escala
      const scheduleDate = scheduleData.eventDate instanceof Date 
        ? scheduleData.eventDate 
        : (scheduleData.eventDate as any).toDate?.() || new Date();
      
      const scheduleMonth = scheduleDate.getMonth() + 1;
      const scheduleYear = scheduleDate.getFullYear();
      
      const eventsData = await EventService.getEventsByMonth(scheduleMonth, scheduleYear);
      setEvents(eventsData); // Adicionar eventos ao estado
      
      // Buscar evento da escala
      let scheduleEvent = eventsData.find(e => e.id === scheduleData.eventId);
      
      // Se o evento não estiver na lista, criar um evento temporário
      if (!scheduleEvent) {
        const month = scheduleDate.getMonth() + 1;
        const year = scheduleDate.getFullYear();
        scheduleEvent = {
          id: scheduleData.eventId,
          title: scheduleData.eventTitle || 'Evento',
          date: scheduleDate,
          month,
          year,
          time: scheduleData.eventStartTime,
          type: 'culto_celebracao',
          description: '',
          isActive: true,
          createdBy: scheduleData.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Adicionar evento temporário ao array de eventos
        setEvents([...eventsData, scheduleEvent]);
      }
      
      // Preencher formulário
      setSelectedEventId(scheduleData.eventId);
      setSelectedEvent(scheduleEvent || null);
      
      setArrivalTime(scheduleData.arrivalTime);
      setEventStartTime(scheduleData.eventStartTime);
      
      // Determinar tipo de paleta
      const palette = scheduleData.colorPalette || {
        primary: '#FFFFFF',
        secondary: '#000000',
        accent: '',
        description: '',
      };
      
      setColorPalette(palette);
      
      if (palette.primary === '#FFFFFF' && palette.secondary === '#000000' && palette.description === 'Roupa Branca') {
        setColorPaletteType('white');
      } else if (palette.primary === '#000000' && palette.secondary === '#FFFFFF' && palette.description === 'Roupa Preta') {
        setColorPaletteType('black');
      } else {
        setColorPaletteType('custom');
      }
      
      setNotes(scheduleData.notes || '');

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (functionId: string, userId: string) => {
    // Verificar se o membro já está escalado em outra função
    const isAlreadyAssigned = assignments.some(
      a => a.userId === userId && a.functionId !== functionId && userId !== ''
    );

    if (isAlreadyAssigned) {
      const member = members.find(m => m.id === userId);
      setError(`${member?.name} já está escalado em outra função. Um membro não pode ter múltiplas funções na mesma escala.`);
      return;
    }

    const member = members.find(m => m.id === userId);
    
    setAssignments(prev =>
      prev.map(a =>
        a.functionId === functionId
          ? { ...a, userId, userName: member?.name || '' }
          : a
      )
    );
    
    // Limpar erro se estava setado
    setError('');
  };

  const validateForm = (): string | null => {
    if (!selectedEventId) {
      return 'Selecione um evento';
    }

    if (!arrivalTime || !eventStartTime) {
      return 'Informe os horários de chegada e início do evento';
    }

    // Verificar se todas as funções têm membros atribuídos
    const unassigned = assignments.filter(a => !a.userId);
    if (unassigned.length > 0) {
      return `Atribua membros para: ${unassigned.map(a => a.functionName).join(', ')}`;
    }

    // Verificar membros duplicados
    const userIds = assignments.map(a => a.userId);
    const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      const duplicateNames = assignments
        .filter(a => duplicates.includes(a.userId))
        .map(a => a.userName);
      return `Membros não podem estar em mais de uma função: ${Array.from(new Set(duplicateNames)).join(', ')}`;
    }

    // Descrição da paleta não é mais obrigatória
    // if (!colorPalette.description) {
    //   return 'Descreva a paleta de cores (ex: Terno preto)';
    // }

    return null;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validar formulário
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setSaving(false);
        return;
      }

      if (!user || !schedule || !selectedEvent) {
        throw new Error('Dados incompletos');
      }

      // Criar objeto com as alterações
      const updates: Partial<DepartmentSchedule> = {
        eventId: selectedEventId,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        assignments: assignments.map(a => ({
          userId: a.userId,
          userName: a.userName,
          functionId: a.functionId,
          functionName: a.functionName,
        })) as Assignment[],
        arrivalTime,
        eventStartTime,
        colorPalette,
        notes,
      };

      // Atualizar no Firestore
      await ScheduleService.updateDepartmentSchedule(schedule.id, updates);
      
      setSuccess('Escala atualizada com sucesso!');
      
      setTimeout(() => {
        window.location.href = '/diaconato';
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Carregando escala...
        </Typography>
      </Box>
    );
  }

  if (error && !schedule) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Erro ao carregar escala
          </Typography>
          <Typography variant="body2" paragraph>
            {error}
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/diaconato')}
            >
              Voltar para Diaconato
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          Editar Escala - {department?.name || 'Diaconato'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Informação do Evento Original */}
        {schedule && (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Evento original:</strong> {schedule.eventTitle}
            </Typography>
            <Typography variant="caption">
              Você pode manter ou alterar para outro evento disponível
            </Typography>
          </Alert>
        )}

        {/* Seleção de Evento */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth color="primary" />
              Evento
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Evento vinculado a esta escala (não pode ser alterado)
            </Typography>

            {selectedEventId ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Card do evento (bloqueado) */}
                {(() => {
                  const selectedEvent = events.find(e => e.id === selectedEventId);
                  if (!selectedEvent) return null;
                  
                  const eventTypeInfo = EVENT_TYPES[selectedEvent.type];
                  const dayOfWeek = selectedEvent.date.toLocaleDateString('pt-BR', { weekday: 'long' });
                  const day = selectedEvent.date.getDate();
                  const month = selectedEvent.date.toLocaleDateString('pt-BR', { month: 'long' });
                  const year = selectedEvent.date.getFullYear();
                  
                  return (
                    <Box
                      sx={{
                        position: 'relative',
                        background: `linear-gradient(135deg, ${alpha(eventTypeInfo.color, 0.08)} 0%, ${alpha(eventTypeInfo.color, 0.02)} 100%)`,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: 2,
                        borderColor: alpha(eventTypeInfo.color, 0.3),
                        boxShadow: `0 8px 32px ${alpha(eventTypeInfo.color, 0.2)}`,
                        opacity: 0.92,
                        cursor: 'not-allowed',
                        userSelect: 'none',
                      }}
                    >
                      {/* Barra colorida superior */}
                      <Box
                        sx={{
                          height: 6,
                          background: `linear-gradient(90deg, ${eventTypeInfo.color} 0%, ${alpha(eventTypeInfo.color, 0.7)} 100%)`,
                        }}
                      />

                      <Box sx={{ p: 4 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            gap: 3, 
                            alignItems: 'stretch',
                            minHeight: 240,
                            maxHeight: 240,
                          }}
                        >
                          {/* Card de data grande com design moderno */}
                          <Box
                            sx={{
                              width: 140,
                              minWidth: 140,
                              height: 'fit-content',
                              borderRadius: 3,
                              overflow: 'hidden',
                              boxShadow: `0 10px 30px ${alpha(eventTypeInfo.color, 0.3)}`,
                              flexShrink: 0,
                              position: 'relative',
                              transform: 'rotate(-2deg)',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'rotate(0deg) scale(1.05)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                background: `linear-gradient(135deg, ${eventTypeInfo.color} 0%, ${alpha(eventTypeInfo.color, 0.8)} 100%)`,
                                color: 'white',
                                textAlign: 'center',
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                textTransform: 'uppercase',
                              }}
                            >
                              {month.substring(0, 3)}
                            </Box>
                            <Box
                              sx={{
                                backgroundColor: 'white',
                                color: 'text.primary',
                                textAlign: 'center',
                                py: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Typography 
                                variant="h1" 
                                sx={{ 
                                  fontWeight: 800, 
                                  lineHeight: 1,
                                  color: eventTypeInfo.color,
                                  fontSize: '4rem',
                                }}
                              >
                                {day}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                  letterSpacing: 1,
                                }}
                              >
                                {dayOfWeek.substring(0, 3)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Informações detalhadas com design moderno */}
                          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            {/* Cabeçalho com título e badge */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    mb: 0.5,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {selectedEvent.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  <CalendarMonth sx={{ fontSize: 18 }} />
                                  {dayOfWeek}, {day} de {month} de {year}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 48,
                                  height: 48,
                                  minWidth: 48,
                                  borderRadius: '50%',
                                  backgroundColor: alpha(eventTypeInfo.color, 0.15),
                                  border: 3,
                                  borderColor: eventTypeInfo.color,
                                }}
                              >
                                <CheckCircle sx={{ color: eventTypeInfo.color, fontSize: 28 }} />
                              </Box>
                            </Box>

                            {/* Chips e informações */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              <Chip
                                label={eventTypeInfo.label}
                                size="small"
                                sx={{
                                  backgroundColor: eventTypeInfo.color,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  height: 28,
                                  boxShadow: `0 4px 12px ${alpha(eventTypeInfo.color, 0.3)}`,
                                }}
                              />
                              <Chip
                                icon={<AccessTime sx={{ color: eventTypeInfo.color + ' !important', fontSize: 16 }} />}
                                label={selectedEvent.time}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: eventTypeInfo.color,
                                  color: eventTypeInfo.color,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 28,
                                  borderWidth: 2,
                                }}
                              />
                            </Box>

                            {/* Descrição com design card - com limite de linhas */}
                            {selectedEvent.description && (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  backgroundColor: alpha('#000', 0.02),
                                  border: 1,
                                  borderColor: alpha(eventTypeInfo.color, 0.2),
                                  borderRadius: 2,
                                  mb: 1.5,
                                  flex: 1,
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    lineHeight: 1.5,
                                    fontSize: '0.8rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {selectedEvent.description}
                                </Typography>
                              </Paper>
                            )}

                            {/* Alert mostrando que o evento está bloqueado */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                backgroundColor: alpha('#ff9800', 0.1),
                                border: 2,
                                borderColor: alpha('#ff9800', 0.3),
                                borderRadius: 2,
                              }}
                            >
                              <Lock sx={{ color: '#f57c00', fontSize: 24, flexShrink: 0 }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100', fontSize: '0.8rem' }}>
                                  Evento Fixo
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  O evento não pode ser alterado ao editar uma escala existente.
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            ) : (
              <Alert severity="error">
                <Typography variant="body2">
                  Erro: Evento não encontrado para esta escala.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Horários e Paleta de Cores */}
        {selectedEvent && (
          <>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              <Card sx={{ flex: 1, minWidth: 300, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <AccessTime color="primary" />
                    1. Horários
                  </Typography>
                
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Horário de Chegada"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Quando os membros devem chegar"
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Início do Evento"
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Horário de início do culto/evento"
                      variant="outlined"
                    />
                  </Stack>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    {selectedEvent.date.getDay() === 0
                      ? 'Domingo: Chegada às 17:40, Culto às 18:30'
                      : 'Dia de semana: Chegada às 18:50, Culto às 19:30'}
                  </Alert>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, minWidth: 300, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    2. Paleta de Cores (Vestimenta)
                  </Typography>
              
              <Stack spacing={3}>
                {/* Opções Pré-definidas */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Escolha uma opção:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Card
                      onClick={() => {
                        setColorPaletteType('white');
                        setColorPalette({
                          primary: '#FFFFFF',
                          secondary: '#000000',
                          accent: '',
                          description: 'Roupa Branca',
                        });
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 120,
                        cursor: 'pointer',
                        border: 2,
                        borderColor: colorPaletteType === 'white' ? 'primary.main' : 'divider',
                        transition: 'all 0.3s',
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #000',
                            borderRadius: 2,
                            margin: '0 auto 8px',
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          Roupa Branca
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card
                      onClick={() => {
                        setColorPaletteType('black');
                        setColorPalette({
                          primary: '#000000',
                          secondary: '#FFFFFF',
                          accent: '',
                          description: 'Roupa Preta',
                        });
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 120,
                        cursor: 'pointer',
                        border: 2,
                        borderColor: colorPaletteType === 'black' ? 'primary.main' : 'divider',
                        transition: 'all 0.3s',
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: '#000000',
                            border: '2px solid #999',
                            borderRadius: 2,
                            margin: '0 auto 8px',
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          Roupa Preta
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card
                      onClick={() => {
                        setColorPaletteType('custom');
                        setColorPalette({
                          primary: '#FFFFFF',
                          secondary: '#000000',
                          accent: '',
                          description: '',
                        });
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 120,
                        cursor: 'pointer',
                        border: 2,
                        borderColor: colorPaletteType === 'custom' ? 'primary.main' : 'divider',
                        transition: 'all 0.3s',
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
                            borderRadius: 2,
                            margin: '0 auto 8px',
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          Personalizar
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Cores Personalizadas */}
                {colorPaletteType === 'custom' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Cores personalizadas:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Cor Principal"
                        type="color"
                        value={colorPalette.primary}
                        onChange={(e) => setColorPalette({ ...colorPalette, primary: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Cor Secundária"
                        type="color"
                        value={colorPalette.secondary}
                        onChange={(e) => setColorPalette({ ...colorPalette, secondary: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Descrição (opcional)"
                      value={colorPalette.description}
                      onChange={(e) => setColorPalette({ ...colorPalette, description: e.target.value })}
                      placeholder="Ex: Camisa azul e calça preta"
                      helperText="Descreva detalhes adicionais se necessário"
                    />
                  </Box>
                )}

                {/* Mostrar descrição editável para opções pré-definidas */}
                {colorPaletteType !== 'custom' && (
                  <TextField
                    fullWidth
                    label="Observações (opcional)"
                    value={colorPalette.description}
                    onChange={(e) => setColorPalette({ ...colorPalette, description: e.target.value })}
                    placeholder="Ex: Adicionar gravata vermelha"
                    helperText="Adicione detalhes ou uma terceira cor se necessário"
                  />
                )}

                {/* Preview */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Preview:
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: colorPalette.primary,
                        border: '2px solid #999',
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: colorPalette.secondary,
                        border: '2px solid #999',
                        borderRadius: 1,
                      }}
                    />
                    {colorPalette.accent && (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: colorPalette.accent,
                          border: '2px solid #999',
                          borderRadius: 1,
                        }}
                      />
                    )}
                    {colorPalette.description && (
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {colorPalette.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Botão para adicionar terceira cor */}
                {!colorPalette.accent && (
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setColorPalette({ ...colorPalette, accent: '#FF0000' })}
                      sx={{ textTransform: 'none' }}
                    >
                      Adicionar Terceira Cor (opcional)
                    </Button>
                  </Box>
                )}

                {/* Campo para editar/remover terceira cor */}
                {colorPalette.accent && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Terceira Cor (opcional)"
                      type="color"
                      value={colorPalette.accent}
                      onChange={(e) => setColorPalette({ ...colorPalette, accent: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => setColorPalette({ ...colorPalette, accent: '' })}
                    >
                      Remover
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
            </Box>

            {/* Atribuições */}
            <Card sx={{ boxShadow: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              3. Atribuir Membros às Funções
            </Typography>

            {/* Debug: Mostrar quantidade de membros */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Membros disponíveis:</strong> {members.length}
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Função</strong></TableCell>
                    <TableCell><strong>Membro Escalado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.functionId}>
                      <TableCell>{assignment.functionName}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={assignment.userId}
                            onChange={(e) => {
                              handleAssignmentChange(assignment.functionId, e.target.value);
                            }}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Selecione um membro</em>
                            </MenuItem>
                            {members.map((member) => (
                              <MenuItem key={member.id} value={member.id}>
                                {member.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {members.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Nenhum membro ativo encontrado no departamento
              </Alert>
            )}
              </CardContent>
            </Card>

            {/* Observações */}
            <Card sx={{ boxShadow: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  4. Observações (Opcional)
                </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre esta escala..."
              variant="outlined"
            />
              </CardContent>
            </Card>

            {/* Resumo Visual */}
            {assignments.some(a => a.userId) && (
              <Card sx={{ backgroundColor: alpha('#2196f3', 0.05), boxShadow: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                📋 Resumo da Escala
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Evento
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>{selectedEvent.title}</strong>
                  </Typography>
                  <Typography variant="body2">
                    📅 {selectedEvent.date.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                  <Typography variant="body2">
                    🕐 Chegada: {arrivalTime} | Início: {eventStartTime}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vestimenta
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: colorPalette.primary,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: colorPalette.secondary,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                      }}
                    />
                    {colorPalette.accent && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: colorPalette.accent,
                          border: '1px solid #ccc',
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2">
                    {colorPalette.description || 'Não especificado'}
                  </Typography>
                </Box>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Membros Escalados
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {assignments
                    .filter(a => a.userId)
                    .map((assignment) => (
                      <Paper 
                        key={assignment.functionId} 
                        variant="outlined" 
                        sx={{ p: 1.5, minWidth: 200, flex: '1 1 calc(33% - 16px)' }}
                      >
                        <Typography variant="body2" color="primary">
                          {assignment.functionName}
                        </Typography>
                        <Typography variant="body2">
                          {assignment.userName}
                        </Typography>
                      </Paper>
                    ))}
                </Box>
              </Box>
            </CardContent>
              </Card>
            )}

            {/* Botões de Ação */}
            <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/diaconato')}
                disabled={saving}
                sx={{ minWidth: 150 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={saving || !selectedEventId}
                sx={{ minWidth: 150 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};
