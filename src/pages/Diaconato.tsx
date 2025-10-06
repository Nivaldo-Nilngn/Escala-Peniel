// pages/Diaconato.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Divider,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
  GlobalStyles,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Schedule as ScheduleIcon,
  People,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DepartmentService } from '../services/departmentService';
import { ScheduleService } from '../services/scheduleService';
import { UserService } from '../services/userService';
import { Department, User, DepartmentFunction, DepartmentSchedule, Assignment } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Diaconato: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado do departamento
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [functions, setFunctions] = useState<DepartmentFunction[]>([]);
  const [schedules, setSchedules] = useState<DepartmentSchedule[]>([]);

  // Dialogs
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [addFunctionDialog, setAddFunctionDialog] = useState(false);
  const [createScheduleDialog, setCreateScheduleDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<DepartmentSchedule | null>(null);
  
  // Estado para controlar expansão dos cards de escalas
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  
  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newFunction, setNewFunction] = useState({ name: '', description: '', isRequired: false });
  const [newSchedule, setNewSchedule] = useState({
    eventId: '',
    arrivalTime: '',
    colorPalette: { primary: '', secondary: '', description: '' },
    notes: '',
    assignments: [] as Assignment[],
  });

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

      // Buscar ou criar departamento de Diaconato
      let diaconato: Department | null = null;
      
      try {
        const departments = await DepartmentService.getAllDepartments();
        diaconato = departments.find(d => d.type === 'diaconato') || null;
      } catch (err) {
        // Erro ao buscar departamentos
      }

      // Se não encontrou e o usuário é pastor, criar o departamento
      if (!diaconato) {
        if (hasRole(['pastor'])) {
          try {
            const departmentId = await DepartmentService.createDepartment({
              name: 'Diaconato',
              type: 'diaconato',
              description: 'Departamento de Diaconato - Responsável por recepção, porta, altar e ordem',
              leaderId: user?.id || '',
              members: [],
              color: '#1976d2',
              isActive: true,
            });
            
            const createdDepartment = await DepartmentService.getDepartmentById(departmentId);
            if (createdDepartment) {
              diaconato = createdDepartment;
            }
          } catch (createErr: any) {
            setError(`Erro ao criar departamento: ${createErr.message}`);
          }
        } else {
          setError('Departamento não encontrado. Apenas pastores podem criar departamentos.');
        }
      }

      setDepartment(diaconato || null);

      if (diaconato) {
        // Carregar membros do departamento
        const deptMembers = await UserService.getUsersByDepartment(diaconato.id);
        setMembers(deptMembers);

        // Carregar funções
        const funcList = await DepartmentService.getDepartmentFunctions(diaconato.id);
        setFunctions(funcList);

        // Carregar escalas
        const scheduleList = await ScheduleService.getDepartmentSchedules(diaconato.id);
        setSchedules(scheduleList);
      }

      // Carregar todos os usuários ativos para adicionar membros
      const usersData = await UserService.getUsers({ page: 1, limit: 100 });
      setAllUsers(usersData.items);

    } catch (err: any) {
      setError('Erro ao carregar dados do departamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser || !department) return;

    try {
      setError('');
      await DepartmentService.addMemberToDepartment(department.id, selectedUser.id);
      setSuccess(`${selectedUser.name} adicionado ao Diaconato!`);
      setAddMemberDialog(false);
      setSelectedUser(null);
      await loadDepartmentData();
    } catch (err: any) {
      setError('Erro ao adicionar membro.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!department) return;

    try {
      setError('');
      await DepartmentService.removeMemberFromDepartment(department.id, userId);
      setSuccess('Membro removido com sucesso!');
      await loadDepartmentData();
    } catch (err: any) {
      setError('Erro ao remover membro.');
    }
  };

  const handleAddFunction = async () => {
    if (!department || !newFunction.name) return;

    try {
      setError('');
      await DepartmentService.createDepartmentFunction({
        departmentId: department.id,
        name: newFunction.name,
        description: newFunction.description,
        isRequired: newFunction.isRequired,
      });
      setSuccess('Função criada com sucesso!');
      setAddFunctionDialog(false);
      setNewFunction({ name: '', description: '', isRequired: false });
      await loadDepartmentData();
    } catch (err: any) {
      setError('Erro ao criar função.');
    }
  };

  const handleDeleteFunction = async (functionId: string) => {
    try {
      setError('');
      await DepartmentService.deleteDepartmentFunction(functionId);
      setSuccess('Função removida com sucesso!');
      await loadDepartmentData();
    } catch (err: any) {
      setError('Erro ao remover função.');
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      setError('');
      await ScheduleService.deleteDepartmentSchedule(scheduleToDelete.id);
      setSuccess('Escala excluída com sucesso!');
      setDeleteConfirmDialog(false);
      setScheduleToDelete(null);
      await loadDepartmentData();
    } catch (err: any) {
      setError('Erro ao excluir escala: ' + err.message);
      setDeleteConfirmDialog(false);
      setScheduleToDelete(null);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const departmentId = await DepartmentService.createDepartment({
        name: 'Diaconato',
        type: 'diaconato',
        description: 'Departamento de Diaconato - Responsável por recepção, porta, altar e ordem',
        leaderId: user?.id || '',
        members: [],
        color: '#1976d2',
        isActive: true,
      });
      
      setSuccess('Departamento criado com sucesso!');
      await loadDepartmentData();
    } catch (err: any) {
      setError(`Erro ao criar departamento: ${err.message}`);
      setLoading(false);
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          Departamento de Diaconato não encontrado.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {hasRole(['pastor']) ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criar Departamento de Diaconato
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                O departamento ainda não foi criado. Clique no botão abaixo para criar.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleCreateDepartment}
              >
                Criar Departamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            Entre em contato com o pastor para criar o departamento.
          </Alert>
        )}
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
        px: { xs: 0.5, sm: 1, md: 3 },
        py: { xs: 1, sm: 2, md: 3 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          mb: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom>Diaconato</Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 1
          }}>
            <Chip 
              icon={<People />}
              label={`${members.length} membros`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<ScheduleIcon />}
              label={`${functions.length} funções`} 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              icon={<CalendarMonth />}
              label={`${schedules.length} escalas`} 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs 
        value={tabValue} 
        onChange={(_, newValue) => setTabValue(newValue)}
        centered={!isMobile}
        variant={isMobile ? 'fullWidth' : 'standard'}
      >
        <Tab icon={<CalendarMonth />} label="Escalas" />
        <Tab icon={<People />} label="Membros" />
        <Tab icon={<ScheduleIcon />} label="Funções" />
      </Tabs>

      {/* Aba de Escalas */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">Escalas do Mês</Typography>
            <Typography variant="caption" color="text.secondary">
              {members.length} membros • {functions.length} funções cadastradas
            </Typography>
          </Box>
          {!isMobile && canEdit && department && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  navigate(`/criar-escala/${department.id}`);
                }}
                disabled={members.length === 0 || functions.length === 0}
              >
                Criar Escala
              </Button>
            </Box>
          )}
        </Box>

        {(members.length === 0 || functions.length === 0) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Para criar escalas, você precisa ter membros e funções cadastrados.
          </Alert>
        )}

        {schedules.length === 0 ? (
          <Alert severity="info">
            Nenhuma escala criada ainda.
          </Alert>
        ) : (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}>
            {schedules.map((schedule) => {
              // Converter eventDate para Date (pode ser Date ou Timestamp do Firebase)
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
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    border: '1px solid',
                    borderColor: isPast ? 'grey.300' : 'primary.light',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => toggleScheduleExpansion(schedule.id)}
                >
                  {/* Barra colorida no topo */}
                  {schedule.colorPalette && (
                    <Box
                      sx={{
                        height: 4,
                        background: `linear-gradient(90deg, ${schedule.colorPalette.primary} 0%, ${schedule.colorPalette.secondary} 50%, ${schedule.colorPalette.accent || schedule.colorPalette.primary} 100%)`,
                      }}
                    />
                  )}

                  <CardContent sx={{ pb: isExpanded ? 2 : 1.5, pt: 1.5 }}>
                    {/* VERSÃO COMPACTA - Quando NÃO expandido */}
                    {!isExpanded && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleScheduleExpansion(schedule.id);
                            }}
                            sx={{ ml: 1 }}
                          >
                            <ExpandMore />
                          </IconButton>
                        </Box>
                      </>
                    )}

                    {/* VERSÃO EXPANDIDA - Quando expandido */}
                    {isExpanded && (
                      <>
                        {/* Header com título e status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {schedule.eventTitle}
                            </Typography>
                          </Box>
                          <Chip 
                            label={isPast ? 'Concluída' : schedule.isPublished ? 'Publicada' : 'Rascunho'}
                            color={isPast ? 'default' : schedule.isPublished ? 'success' : 'warning'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>

                        {/* Informações principais */}
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: 1.5,
                          mb: 2,
                          p: 1.5,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                        }}>
                          {/* Data */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonth sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                                Data
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {scheduleDate.toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Horários */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                                Horários
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Chegada: {schedule.arrivalTime} • Início: {schedule.eventStartTime}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Número de escalados */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                                Escalados
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {schedule.assignments?.length || 0} membros
                              </Typography>
                            </Box>
                          </Box>

                          {/* Paleta de cores */}
                          {schedule.colorPalette && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '50%', 
                                    bgcolor: schedule.colorPalette.primary,
                                    border: '2px solid white',
                                    boxShadow: 1,
                                  }} 
                                />
                                <Box 
                                  sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '50%', 
                                    bgcolor: schedule.colorPalette.secondary,
                                    border: '2px solid white',
                                    boxShadow: 1,
                                    ml: -0.5,
                                  }} 
                                />
                                {schedule.colorPalette.accent && (
                                  <Box 
                                    sx={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      bgcolor: schedule.colorPalette.accent,
                                      border: '2px solid white',
                                      boxShadow: 1,
                                      ml: -0.5,
                                    }} 
                                  />
                                )}
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                                  Paleta
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                  {schedule.colorPalette.description || 'Personalizada'}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Lista completa de escalados */}
                        {schedule.assignments && schedule.assignments.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                              Escalados ({schedule.assignments.length}):
                            </Typography>
                            <List dense disablePadding>
                              {schedule.assignments.map((assignment, idx) => (
                                <ListItem 
                                  key={idx} 
                                  sx={{ 
                                    px: 0, 
                                    py: 0.5,
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                      borderRadius: 1,
                                    }
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                          label={assignment.functionName} 
                                          size="small" 
                                          color="primary" 
                                          variant="filled"
                                          sx={{ minWidth: 120, fontWeight: 500 }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
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

                        {/* Notas/Observações */}
                        {schedule.notes && (
                          <Box sx={{ 
                            mb: 2, 
                            p: 1.5, 
                            bgcolor: 'info.lighter', 
                            borderLeft: 3,
                            borderColor: 'info.main',
                            borderRadius: 1 
                          }}>
                            <Typography variant="caption" color="info.dark" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                              📝 Observações:
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                              {schedule.notes}
                            </Typography>
                          </Box>
                        )}

                        {/* Ações */}
                        {canEdit && !isPast && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              startIcon={<Edit />}
                              onClick={() => {
                                navigate(`/editar-escala/${schedule.id}`);
                              }}
                              fullWidth
                            >
                              Editar
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => {
                                setScheduleToDelete(schedule);
                                setDeleteConfirmDialog(true);
                              }}
                              fullWidth
                            >
                              Excluir
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </TabPanel>

      {/* Aba de Membros */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Membros do Diaconato</Typography>
          {!isMobile && canEdit && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddMemberDialog(true)}
            >
              Adicionar Membro
            </Button>
          )}
        </Box>

        <List>
          {members.map((member) => (
            <Card key={member.id} sx={{ mb: 1 }}>
              <ListItem>
                <ListItemText
                  primary={member.name}
                  secondary={member.email}
                />
                {canEdit && (
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveMember(member.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </Card>
          ))}

          {members.length === 0 && (
            <Alert severity="info">
              Nenhum membro cadastrado ainda. {canEdit && 'Clique em "Adicionar Membro" para começar.'}
            </Alert>
          )}
        </List>
      </TabPanel>

      {/* Aba de Funções */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Funções do Diaconato</Typography>
          {!isMobile && canEdit && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddFunctionDialog(true)}
            >
              Adicionar Função
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            <strong>Funções típicas:</strong> Porta (entrada principal), Corredor (organização interna), 
            Altar (próximo ao púlpito), Recepção, Estacionamento
          </Alert>
        </Box>

        <List>
          {functions.map((func) => (
            <Card key={func.id} sx={{ mb: 1 }}>
              <ListItem>
                <ListItemText
                  primary={func.name}
                  secondary={
                    <>
                      {func.description}
                      {func.isRequired && <Chip label="Obrigatório" size="small" color="error" sx={{ ml: 1 }} />}
                    </>
                  }
                />
                {canEdit && (
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteFunction(func.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </Card>
          ))}

          {functions.length === 0 && (
            <Alert severity="info">
              Nenhuma função cadastrada. {canEdit && 'Adicione funções como "Porta", "Corredor", "Altar", etc.'}
            </Alert>
          )}
        </List>
      </TabPanel>

      {/* Dialog: Adicionar Membro */}
      <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Membro ao Diaconato</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={allUsers.filter(u => !members.find(m => m.id === u.id))}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Selecione um membro" margin="normal" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!selectedUser}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Adicionar Função */}
      <Dialog open={addFunctionDialog} onClose={() => setAddFunctionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Função</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Função"
            fullWidth
            margin="normal"
            value={newFunction.name}
            onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
            placeholder="Ex: Porta Principal, Corredor, Altar"
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={newFunction.description}
            onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFunctionDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddFunction} variant="contained" disabled={!newFunction.name}>
            Criar Função
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar Exclusão de Escala */}
      <Dialog 
        open={deleteConfirmDialog} 
        onClose={() => {
          setDeleteConfirmDialog(false);
          setScheduleToDelete(null);
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Delete />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>
          
          {scheduleToDelete && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Deseja realmente excluir a escala abaixo?
              </Typography>
              
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {scheduleToDelete.eventTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {scheduleToDelete.eventDate instanceof Date 
                    ? scheduleToDelete.eventDate.toLocaleDateString('pt-BR')
                    : new Date().toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🕐 {scheduleToDelete.eventStartTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  👥 {scheduleToDelete.assignments?.length || 0} membros escalados
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteConfirmDialog(false);
              setScheduleToDelete(null);
            }}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteSchedule}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Sim, Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* SpeedDial para mobile */}
      {canEdit && isMobile && (
        <SpeedDial
          ariaLabel="Ações do Diaconato"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<People />}
            tooltipTitle="Adicionar Membro"
            onClick={() => setAddMemberDialog(true)}
          />
          <SpeedDialAction
            icon={<ScheduleIcon />}
            tooltipTitle="Adicionar Função"
            onClick={() => setAddFunctionDialog(true)}
          />
          {department && (
            <SpeedDialAction
              icon={<CalendarMonth />}
              tooltipTitle="Criar Escala"
              onClick={() => {
                if (members.length > 0 && functions.length > 0) {
                  navigate(`/criar-escala/${department.id}`);
                }
              }}
            />
          )}
        </SpeedDial>
      )}
      </Box>
    </>
  );
};
