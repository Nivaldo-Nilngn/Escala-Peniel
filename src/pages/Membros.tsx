import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  Divider,
  Fab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { UserService } from '../services/userService';
import { DepartmentService } from '../services/departmentService';
import { User, UserRole } from '../types/user';
import { Department } from '../types/department';
import { useAuth } from '../hooks/useAuth';

export const Membros: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado do formulário
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'membro' as UserRole,
    departmentIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar usuários e departamentos
      const [usersData, departmentsData] = await Promise.all([
        UserService.getUsers({ page: 1, limit: 100 }),
        DepartmentService.getAllDepartments(),
      ]);
      
      setUsers(usersData.items);
      setDepartments(departmentsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
        role: user.role,
        departmentIds: user.departmentIds,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'membro',
        departmentIds: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'membro',
      departmentIds: [],
    });
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      departmentIds: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setSuccess(null);
      
      if (!formData.name || !formData.email) {
        setError('Nome e email são obrigatórios');
        return;
      }

      if (editingUser) {
        // Atualizar usuário existente (não permite alterar senha aqui)
        await UserService.updateUser(editingUser.id, {
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          departmentIds: formData.departmentIds,
        });
        setSuccess('Membro atualizado com sucesso!');
      } else {
        // Validar senha para novo usuário
        if (!formData.password) {
          setError('A senha é obrigatória para novos membros');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          return;
        }
        
        // Criar novo usuário no Authentication e Firestore
        await UserService.createUser({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          departmentIds: formData.departmentIds,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, formData.password);
        
        setSuccess('Membro cadastrado com sucesso! Um email de verificação foi enviado.');
      }

      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar membro');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este membro?')) {
      return;
    }

    try {
      setError(null);
      await UserService.updateUser(userId, { isActive: false });
      setSuccess('Membro removido com sucesso!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover membro');
    }
  };

  const getRoleName = (role: UserRole): string => {
    const roleNames = {
      pastor: 'Pastor',
      lider: 'Líder',
      membro: 'Membro',
    };
    return roleNames[role];
  };

  const getDepartmentNames = (departmentIds: string[]): string => {
    return departmentIds
      .map(id => departments.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'Nenhum';
  };

  const canEdit = user?.role === 'pastor' || user?.role === 'lider';

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2,
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Membros
        </Typography>
        {canEdit && !isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Membro
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Vista Desktop/Tablet - Tabela */}
      {!isMobile ? (
        <Card>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <TableContainer component={Paper}>
              <Table size={isTablet ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    {!isTablet && <TableCell>Email</TableCell>}
                    {!isTablet && <TableCell>Telefone</TableCell>}
                    <TableCell>Função</TableCell>
                    <TableCell>Departamentos</TableCell>
                    {canEdit && <TableCell align="right">Ações</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isTablet ? 4 : 6} align="center">
                        Nenhum membro cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        {!isTablet && <TableCell>{user.email}</TableCell>}
                        {!isTablet && <TableCell>{user.phone || '-'}</TableCell>}
                        <TableCell>
                          <Chip 
                            label={getRoleName(user.role)} 
                            size="small"
                            color={user.role === 'pastor' ? 'primary' : user.role === 'lider' ? 'secondary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{getDepartmentNames(user.departmentIds)}</TableCell>
                        {canEdit && (
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        /* Vista Mobile - Cards */
        <Stack spacing={2}>
          {users.length === 0 ? (
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                textAlign: 'center',
                py: 8
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2, fontSize: '3rem' }}>👥</Box>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Nenhum membro cadastrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toque no botão + para adicionar o primeiro membro
                </Typography>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card 
                key={user.id}
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Nome e Função */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user.name}
                    </Typography>
                    <Chip 
                      label={getRoleName(user.role)} 
                      size="small"
                      color={user.role === 'pastor' ? 'primary' : user.role === 'lider' ? 'secondary' : 'default'}
                    />
                  </Box>
                  
                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20 }}>
                      📧
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  
                  {/* Telefone */}
                  {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20 }}>
                        📱
                      </Typography>
                      <Typography variant="body2">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Departamentos */}
                  {user.departmentIds.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Departamentos
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.departmentIds.map(deptId => {
                          const dept = departments.find(d => d.id === deptId);
                          return dept ? (
                            <Chip
                              key={deptId}
                              label={dept.name}
                              size="small"
                              variant="outlined"
                            />
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Botões */}
                  {canEdit && (
                    <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(user)}
                        variant="outlined"
                        fullWidth
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(user.id)}
                        variant="outlined"
                        color="error"
                        fullWidth
                      >
                        Excluir
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* Botão Flutuante Mobile */}
      {canEdit && isMobile && (
        <Fab
          color="primary"
          aria-label="adicionar membro"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialog de cadastro/edição */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingUser ? 'Editar Membro' : 'Novo Membro'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 2 }}>
              <TextField
                label="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                autoFocus={!isMobile}
              />
              
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                disabled={!!editingUser}
                helperText={editingUser ? "O email não pode ser alterado" : ""}
              />
              
              <TextField
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                placeholder="(00) 00000-0000"
              />
              
              {/* Campos de senha apenas para novo cadastro */}
              {!editingUser && (
                <>
                  <TextField
                    label="Senha"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    fullWidth
                    helperText="Mínimo de 6 caracteres"
                  />
                  
                  <TextField
                    label="Confirmar Senha"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    fullWidth
                    error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                    helperText={
                      formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                        ? "As senhas não coincidem"
                        : ""
                    }
                  />
                </>
              )}
              
              <FormControl fullWidth>
                <InputLabel>Função</InputLabel>
                <Select
                  value={formData.role}
                  label="Função"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <MenuItem value="membro">Membro</MenuItem>
                  <MenuItem value="lider">Líder</MenuItem>
                  {user?.role === 'pastor' && (
                    <MenuItem value="pastor">Pastor</MenuItem>
                  )}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Departamentos</InputLabel>
                <Select
                  multiple
                  value={formData.departmentIds}
                  onChange={handleDepartmentChange}
                  input={<OutlinedInput label="Departamentos" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={departments.find(d => d.id === value)?.name || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      Nenhum departamento disponível
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
            >
              {editingUser ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
