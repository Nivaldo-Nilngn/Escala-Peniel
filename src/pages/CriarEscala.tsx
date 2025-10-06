// pages/CriarEscala.tsx
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

export const CriarEscala: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMountedRef = React.useRef(true);

  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dados
  const [events, setEvents] = useState<Event[]>([]);
  const [functions, setFunctions] = useState<DepartmentFunction[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [department, setDepartment] = useState<any>(null);

  // Form data
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInput[]>([]);
  const [arrivalTime, setArrivalTime] = useState('17:40'); // Valor padrão
  const [eventStartTime, setEventStartTime] = useState('18:30'); // Valor padrão
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
  }, [departmentId]);

  // Atualizar horários quando evento for selecionado
  useEffect(() => {
    if (selectedEvent && !loading) {
      const defaultTimes = getDefaultTimes(selectedEvent);
      setEventStartTime(defaultTimes.eventStartTime);
      setArrivalTime(defaultTimes.arrivalTime);
    }
  }, [selectedEvent, loading]);

  // Inicializar assignments quando functions carregarem
  useEffect(() => {
    if (loading) return; // Não executar durante o carregamento
    
    if (functions.length > 0 && assignments.length === 0) {
      // 🎯 Ordenar funções: "Vocalista Principal" sempre no topo
      const sortedFunctions = [...functions].sort((a, b) => {
        const aIsVocalistaPrincipal = a.name.toLowerCase().includes('vocalista principal');
        const bIsVocalistaPrincipal = b.name.toLowerCase().includes('vocalista principal');
        
        if (aIsVocalistaPrincipal) return -1; // a vem primeiro
        if (bIsVocalistaPrincipal) return 1;  // b vem primeiro
        return 0; // manter ordem original
      });

      const newAssignments = sortedFunctions.map(func => ({
        functionId: func.id,
        functionName: func.name,
        userId: '',
        userName: '',
      }));
      setAssignments(newAssignments);
    }
  }, [functions, assignments.length, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!departmentId) {
        throw new Error('ID do departamento não informado');
      }

      // Buscar departamento
      let deptData = null;
      
      try {
        deptData = await DepartmentService.getDepartmentById(departmentId);
      } catch (err) {
        const allDepts = await DepartmentService.getAllDepartments();
        deptData = allDepts.find(d => d.type === 'diaconato') || null;
      }

      if (!deptData) {
        throw new Error('Departamento não encontrado. Volte para /diaconato e tente novamente.');
      }

      // Buscar funções
      const functionsData = await DepartmentService.getDepartmentFunctions(deptData.id);

      if (functionsData.length === 0) {
        throw new Error('Nenhuma função cadastrada. Cadastre funções na página do Diaconato.');
      }

      // Buscar membros
      const membersData = await UserService.getUsersByDepartment(deptData.id);

      const activeMembers = membersData.filter(m => m.isActive);

      if (activeMembers.length === 0) {
        throw new Error('Nenhum membro ativo encontrado. Adicione membros ao Diaconato.');
      }

      // Buscar eventos
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const eventsData = await EventService.getEventsByMonth(currentMonth, currentYear);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureEvents = eventsData.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      // Filtrar eventos que já têm escalas criadas
      const existingSchedules = await ScheduleService.getDepartmentSchedules(deptData.id);
      
      const scheduledEventIds = existingSchedules.map(s => s.eventId);
      
      const availableEvents = futureEvents.filter(e => !scheduledEventIds.includes(e.id));

      // Atualizar estados
      setDepartment(deptData);
      setFunctions(functionsData);
      setMembers(activeMembers);
      setEvents(availableEvents);
      
      // Aguardar um pouco antes de desligar o loading para garantir que o DOM foi atualizado
      setTimeout(() => {
        setLoading(false);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
      setLoading(false);
    }
  };

  const getDefaultTimes = (event: Event) => {
    const dayOfWeek = event.date.getDay(); // 0 = Domingo
    const eventType = event.type;

    // Eventos especiais permitem customização
    if (eventType === 'conferencia') {
      return {
        eventStartTime: event.time || '19:00',
        arrivalTime: calculateArrivalTime(event.time || '19:00', 50),
      };
    }

    // Domingo
    if (dayOfWeek === 0) {
      return {
        eventStartTime: '18:30',
        arrivalTime: '17:40',
      };
    }

    // Dia de semana
    return {
      eventStartTime: '19:30',
      arrivalTime: '18:50',
    };
  };

  const calculateArrivalTime = (eventTime: string, minutesBefore: number): string => {
    const [hours, minutes] = eventTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes - minutesBefore;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
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

    // ✅ NOVA VALIDAÇÃO: Apenas "Vocalista Principal" é obrigatório
    const vocalistaPrincipal = assignments.find(a => 
      a.functionName.toLowerCase().includes('vocalista principal')
    );
    
    if (vocalistaPrincipal && !vocalistaPrincipal.userId) {
      return '⚠️ É obrigatório atribuir um membro para "Vocalista Principal"';
    }

    // Verificar membros duplicados (apenas entre os que foram atribuídos)
    const assignedUserIds = assignments
      .filter(a => a.userId) // Apenas assignments com usuário
      .map(a => a.userId);
    
    const duplicates = assignedUserIds.filter((id, index) => assignedUserIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      const duplicateNames = assignments
        .filter(a => duplicates.includes(a.userId))
        .map(a => a.userName);
      return `Membros não podem estar em mais de uma função: ${Array.from(new Set(duplicateNames)).join(', ')}`;
    }

    return null;
  };

  const handleSave = async () => {
    try {
      console.log('🚀 CriarEscala: Iniciando salvamento da escala...');
      
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validar formulário
      const validationError = validateForm();
      if (validationError) {
        console.log('❌ Erro de validação:', validationError);
        setError(validationError);
        setSaving(false);
        return;
      }

      if (!user || !departmentId || !selectedEvent) {
        throw new Error('Dados incompletos');
      }

      console.log('👤 Usuário logado:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      
      console.log('🏢 Departamento:', {
        id: departmentId,
        name: department?.name,
        type: department?.type,
      });
      
      console.log('📅 Evento selecionado:', {
        id: selectedEventId,
        title: selectedEvent.title,
        date: selectedEvent.date,
      });

      // Filtrar apenas os assignments preenchidos (com userId)
      const filledAssignments = assignments.filter(a => a.userId);
      
      console.log(`👥 Assignments preenchidos: ${filledAssignments.length} de ${assignments.length}`);

      // Criar objeto de escala
      const scheduleData: Omit<DepartmentSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
        departmentId,
        departmentName: department?.name,
        eventId: selectedEventId,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        assignments: filledAssignments.map(a => ({
          userId: a.userId,
          userName: a.userName,
          functionId: a.functionId,
          functionName: a.functionName,
        })) as Assignment[],
        arrivalTime,
        eventStartTime,
        colorPalette,
        notes,
        isPublished: false,
        createdBy: user.id,
      };

      console.log('📦 Dados da escala preparados, chamando ScheduleService...');

      // Salvar no Firestore
      const scheduleId = await ScheduleService.createDepartmentSchedule(scheduleData);
      
      console.log('✅ Escala salva com sucesso! ID:', scheduleId);
      
      // Ir DIRETO para tela de navegação (evita múltiplas re-renderizações)
      setNavigating(true);
      setSaving(false);
      
      // Aguardar para garantir que o DOM está atualizado antes de navegar
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirecionar dinamicamente baseado no tipo do departamento
      const departmentType = department?.type || 'diaconato';
      const redirectPath = `/${departmentType}`;
      console.log('🔄 Redirecionando para:', redirectPath);
      window.location.href = redirectPath;
      
    } catch (err: any) {
      console.error('❌ ERRO no handleSave:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(err.message || 'Erro ao salvar escala');
      setSaving(false);
    }
  };

  // Tela de navegação
  if (navigating) {
    const departmentName = department?.name || 'Diaconato';
    
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h5" color="success.main" fontWeight="bold">
          Escala criada com sucesso!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecionando para {departmentName}...
        </Typography>
        <CircularProgress size={40} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Carregando dados...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Buscando departamento, membros, funções e eventos
        </Typography>
      </Box>
    );
  }

  if (error && !department) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Erro ao carregar página
          </Typography>
          <Typography variant="body2" paragraph>
            {error}
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/diaconato')}
            >
              Ir para Diaconato
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Criar Escala - {department?.name || 'Diaconato'}
      </Typography>

      {!saving && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!saving && success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Seleção de Evento */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth color="primary" />
              1. Selecione o Evento
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Escolha o evento para o qual deseja criar a escala do Diaconato
            </Typography>

            {events.length === 0 ? (
              <Alert severity="info" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Nenhum evento disponível para criar escala
                </Typography>
                <Typography variant="body2">
                  Todos os eventos deste mês já possuem escalas criadas ou não há eventos futuros cadastrados.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  💡 Para criar novas escalas, cadastre mais eventos na página de <strong>Agenda</strong>.
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Galeria de ícones de calendário */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    pb: 2,
                    borderBottom: 2,
                    borderColor: 'divider',
                  }}
                >
                  {events.map((event) => {
                    const isSelected = selectedEventId === event.id;
                    const eventTypeInfo = EVENT_TYPES[event.type];
                    const dayOfWeek = event.date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
                    const day = event.date.getDate();
                    const month = event.date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
                    
                    return (
                      <Box
                        key={event.id}
                        onClick={() => handleEventSelect(event.id)}
                        sx={{
                          width: 70,
                          height: 85,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: isSelected ? 4 : 2,
                          cursor: 'pointer',
                          border: isSelected ? 3 : 0,
                          borderColor: 'primary.main',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        {/* Cabeçalho do calendário */}
                        <Box
                          sx={{
                            backgroundColor: eventTypeInfo.color,
                            color: 'white',
                            textAlign: 'center',
                            py: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {month}
                        </Box>
                        {/* Dia do mês */}
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            color: 'text.primary',
                            textAlign: 'center',
                            height: 'calc(100% - 22px)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                            {day}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            {dayOfWeek}
                          </Typography>
                        </Box>
                        {/* Indicador de seleção */}
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              backgroundColor: 'primary.main',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CheckCircle sx={{ color: 'white', fontSize: 16 }} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Card do evento selecionado em destaque */}
                {selectedEventId && (() => {
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

                            {/* Alert de sucesso moderno */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                backgroundColor: alpha('#4caf50', 0.1),
                                border: 2,
                                borderColor: alpha('#4caf50', 0.3),
                                borderRadius: 2,
                              }}
                            >
                              <CheckCircle sx={{ color: '#4caf50', fontSize: 24, flexShrink: 0 }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.8rem' }}>
                                  Evento Confirmado!
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Configure os horários e atribua as funções aos membros abaixo.
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
            )}
          </CardContent>
        </Card>

        {/* Horários e Paleta de Cores */}
        {selectedEvent && (
          <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Card sx={{ flex: 1, minWidth: 300 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" />
                    2. Horários
                  </Typography>
                
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Horário de Chegada"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Quando os membros devem chegar"
                    />
                    <TextField
                      fullWidth
                      label="Início do Evento"
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Horário de início do culto/evento"
                    />
                  </Stack>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    {selectedEvent.date.getDay() === 0
                      ? 'Domingo: Chegada às 17:40, Culto às 18:30'
                      : 'Dia de semana: Chegada às 18:50, Culto às 19:30'}
                  </Alert>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, minWidth: 300 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    3. Paleta de Cores (Vestimenta)
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
              4. Atribuir Membros às Funções
            </Typography>

            {/* Info sobre obrigatoriedade */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Membros disponíveis:</strong> {members.length}
              <br />
              <strong>Atenção:</strong> Apenas <strong>"Vocalista Principal"</strong> é obrigatório. As demais funções são opcionais.
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
                  {assignments.map((assignment) => {
                    const isRequired = assignment.functionName.toLowerCase().includes('vocalista principal');
                    
                    return (
                      <TableRow key={assignment.functionId}>
                        <TableCell>
                          {assignment.functionName}
                          {isRequired && (
                            <Box component="span" sx={{ color: 'error.main', ml: 0.5, fontWeight: 'bold' }}>
                              *
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small" error={isRequired && !assignment.userId}>
                            <Select
                              value={assignment.userId}
                              onChange={(e) => {
                                handleAssignmentChange(assignment.functionId, e.target.value);
                              }}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>{isRequired ? 'Selecione um membro (obrigatório)' : 'Selecione um membro (opcional)'}</em>
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
                    );
                  })}
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  5. Observações (Opcional)
                </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre esta escala..."
            />
              </CardContent>
            </Card>

            {/* Resumo Visual */}
            {assignments.some(a => a.userId) && (
              <Card sx={{ backgroundColor: '#f5f5f5' }}>
                <CardContent>
              <Typography variant="h6" gutterBottom>
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
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/diaconato')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !selectedEventId}
              >
                {saving ? <CircularProgress size={24} /> : 'Salvar Escala'}
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};
