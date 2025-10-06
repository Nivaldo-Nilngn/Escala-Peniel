// pages/Mídia.tsx
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

export const Mídia: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
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

      // Buscar ou criar departamento de Mídia
      let Mídia: Department | null = null;
      
      try {
        const departments = await DepartmentService.getAllDepartments();
        Mídia = departments.find(d => d.type === 'midia') || null;
      } catch (err) {
        // Erro ao buscar departamentos
      }

      // Se não encontrou e o usuário é pastor, criar o departamento
      if (!Mídia) {
        if (hasRole(['pastor'])) {
          try {
            const departmentId = await DepartmentService.createDepartment({
              name: 'Mídia',
              type: 'midia',
              description: 'Departamento de Mídia - Responsável por recepção, porta, altar e ordem',
              leaderId: user?.id || '',
              members: [],
              color: '#ff5722',
              isActive: true,
            });
            
            const createdDepartment = await DepartmentService.getDepartmentById(departmentId);
            if (createdDepartment) {
              Mídia = createdDepartment;
            }
          } catch (createErr: any) {
            setError(`Erro ao criar departamento: ${createErr.message}`);
          }
        } else {
          setError('Departamento não encontrado. Apenas pastores podem criar departamentos.');
        }
      }

      setDepartment(Mídia || null);

      if (Mídia) {
        // Carregar membros do departamento
        const deptMembers = await UserService.getUsersByDepartment(Mídia.id);
        setMembers(deptMembers);

        // Carregar funções
        const funcList = await DepartmentService.getDepartmentFunctions(Mídia.id);
        setFunctions(funcList);

        // Carregar escalas
        const scheduleList = await ScheduleService.getDepartmentSchedules(Mídia.id);
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
      setSuccess(`${selectedUser.name} adicionado ao Mídia!`);
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
        name: 'Mídia',
        type: 'midia',
        description: 'Ministério de Mídia - Responsável pela filmagem, projeção e cobertura de mídias sociais',
        leaderId: user?.id || '',
        members: [],
        color: '#ff5722',
        isActive: true,
      });

      // Criar funções padrão para o Ministério de Mídia
      const defaultFunctions = [
        { 
          name: 'Câmera', 
          description: 'Responsável pela filmagem durante os cultos e eventos, garantindo enquadramento adequado, movimentação suave e foco nos momentos principais da celebração.',
          isRequired: false 
        },
        { 
          name: 'Computador / Projeção', 
          description: 'Operar o computador durante os cultos, controlando letras de louvores, versículos, anúncios e demais mídias projetadas no telão.',
          isRequired: false 
        },
        { 
          name: 'Celular / Story', 
          description: 'Capturar fotos e vídeos curtos para publicação em stories ou redes sociais da igreja, destacando os principais momentos do culto e eventos.',
          isRequired: false 
        },
      ];

      for (const func of defaultFunctions) {
        await DepartmentService.createDepartmentFunction({
          departmentId,
          ...func,
        });
      }
      
      setSuccess('Departamento e funções criados com sucesso!');
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
          Departamento de Mídia não encontrado.
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
                Criar Departamento de Mídia
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mídia</Typography>
        <Chip label={`${members.length} membros`} color="primary" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab icon={<People />} label="Membros" />
        <Tab icon={<ScheduleIcon />} label="Funções" />
        <Tab icon={<CalendarMonth />} label="Escalas" />
      </Tabs>

      {/* Aba de Membros */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Membros do Mídia</Typography>
          {canEdit && (
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
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Funções do Ministério de Mídia</Typography>
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {functions.length === 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={async () => {
                    if (!department) return;
                    try {
                      setLoading(true);
                      const defaultFunctions = [
                        { 
                          name: 'Câmera', 
                          description: 'Responsável pela filmagem durante os cultos e eventos, garantindo enquadramento adequado, movimentação suave e foco nos momentos principais da celebração.',
                          isRequired: false 
                        },
                        { 
                          name: 'Computador / Projeção', 
                          description: 'Operar o computador durante os cultos, controlando letras de louvores, versículos, anúncios e demais mídias projetadas no telão.',
                          isRequired: false 
                        },
                        { 
                          name: 'Celular / Story', 
                          description: 'Capturar fotos e vídeos curtos para publicação em stories ou redes sociais da igreja, destacando os principais momentos do culto e eventos.',
                          isRequired: false 
                        },
                      ];

                      for (const func of defaultFunctions) {
                        await DepartmentService.createDepartmentFunction({
                          departmentId: department.id,
                          ...func,
                        });
                      }

                      setSuccess('3 funções padrão criadas com sucesso!');
                      await loadDepartmentData();
                    } catch (err: any) {
                      setError('Erro ao criar funções padrão: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  ✨ Criar Funções Padrão
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddFunctionDialog(true)}
              >
                Adicionar Função
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            <strong>Funções do Ministério de Mídia:</strong> Câmera, Computador / Projeção, Celular / Story
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
              Nenhuma função cadastrada. {canEdit && 'Clique em "✨ Criar Funções Padrão" ou adicione manualmente.'}
            </Alert>
          )}
        </List>
      </TabPanel>

      {/* Aba de Escalas */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">Escalas do Mês</Typography>
            <Typography variant="caption" color="text.secondary">
              {members.length} membros • {functions.length} funções cadastradas
            </Typography>
          </Box>
          {canEdit && department && (
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
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
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
                    border: '1px solid',
                    borderColor: isPast ? 'grey.300' : 'primary.main',
                    opacity: isPast ? 0.7 : 1,
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    {/* Cabeçalho Compacto - Sempre visível */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {schedule.eventTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {scheduleDate.toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </Typography>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {schedule.eventStartTime}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {schedule.assignments?.length || 0} membros escalados
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={schedule.isPublished ? 'Publicada' : 'Rascunho'}
                        color={schedule.isPublished ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>

                    {/* Detalhes - Aparecem quando expandido */}
                    {isExpanded && (
                      <>
                        <Divider sx={{ my: 2 }} />

                        {/* Horários Completos */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Horários:
                          </Typography>
                          <Typography variant="body2">
                            🕐 Chegada: <strong>{schedule.arrivalTime}</strong> | Início: <strong>{schedule.eventStartTime}</strong>
                          </Typography>
                        </Box>

                        {/* Paleta de Cores */}
                        {schedule.colorPalette && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Paleta de Cores:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: 1, 
                                  bgcolor: schedule.colorPalette.primary,
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }} 
                              />
                              <Box 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: 1, 
                                  bgcolor: schedule.colorPalette.secondary,
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }} 
                              />
                              <Box 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: 1, 
                                  bgcolor: schedule.colorPalette.accent,
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }} 
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {schedule.colorPalette.description}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Membros Escalados */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Membros Escalados:
                          </Typography>
                          <List dense disablePadding>
                            {schedule.assignments?.map((assignment, index) => (
                              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip 
                                        label={assignment.functionName} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
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

                        {/* Notas */}
                        {schedule.notes && (
                          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Observações:
                            </Typography>
                            <Typography variant="body2">
                              {schedule.notes}
                            </Typography>
                          </Box>
                        )}

                        {/* Ações */}
                        {canEdit && !isPast && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button 
                              size="small" 
                              startIcon={<Edit />}
                              onClick={() => {
                                // Navegar para página de edição (será implementada)
                                navigate(`/editar-escala/${schedule.id}`);
                              }}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => {
                                setScheduleToDelete(schedule);
                                setDeleteConfirmDialog(true);
                              }}
                            >
                              Excluir
                            </Button>
                          </Box>
                        )}
                      </>
                    )}

                    {/* Botão de Expandir/Colapsar no canto inferior */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pt: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => toggleScheduleExpansion(schedule.id)}
                        sx={{
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </TabPanel>

      {/* Dialog: Adicionar Membro */}
      <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Membro ao Mídia</DialogTitle>
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
            placeholder="Ex: Câmera, Computador / Projeção, Celular / Story"
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={newFunction.description}
            onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
            placeholder="Ex: Responsável pela filmagem durante os cultos e eventos"
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
    </Box>
  );
};
