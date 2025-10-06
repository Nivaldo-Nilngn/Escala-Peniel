import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Box, Chip } from '@mui/material';
import { Dashboard, CalendarMonth, Schedule, Group, Chat, Notifications, MusicNote, Security, Videocam, ChildCare, CleaningServices, MonetizationOn, ChurchRounded, Logout } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 280;

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Agenda do Mês', icon: <CalendarMonth />, path: '/agenda', roles: ['pastor', 'lider'] },
  ];

  const departmentItems = [
    { text: 'Louvor', icon: <MusicNote />, path: '/louvor', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Diaconato', icon: <Security />, path: '/diaconato', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Mídia', icon: <Videocam />, path: '/midia', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Crianças', icon: <ChildCare />, path: '/criancas', roles: ['pastor', 'lider', 'membro'] },
  ];

  const adminItems = [
    { text: 'Limpeza', icon: <CleaningServices />, path: '/limpeza', roles: ['pastor'] },
    { text: 'Dízimos e Ofertas', icon: <MonetizationOn />, path: '/dizimos', roles: ['pastor'] },
    { text: 'Ministração', icon: <ChurchRounded />, path: '/ministracao', roles: ['pastor'] },
  ];

  const generalItems = [
    { text: 'Escalas', icon: <Schedule />, path: '/escalas', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Membros', icon: <Group />, path: '/membros', roles: ['pastor', 'lider'] },
    { text: 'Chat', icon: <Chat />, path: '/chat', roles: ['pastor', 'lider', 'membro'] },
    { text: 'Notificações', icon: <Notifications />, path: '/notificacoes', roles: ['pastor', 'lider', 'membro'] },
  ];

  const renderMenuItems = (items: typeof menuItems, title?: string) => (
    <>
      {title && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        </Box>
      )}
      {items.filter(item => hasRole(item.roles as any)).map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton onClick={() => { navigate(item.path); onClose(); }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </>
  );

  return (
    <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, mt: 8 } }}>
      <Box sx={{ overflow: 'auto' }}>
        {user && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" noWrap>{user.name}</Typography>
            <Chip label={user.role === 'pastor' ? 'Pastor' : user.role === 'lider' ? 'Líder' : 'Membro'} size="small" color={user.role === 'pastor' ? 'primary' : user.role === 'lider' ? 'secondary' : 'default'} sx={{ mt: 1 }} />
          </Box>
        )}
        <List>
          {renderMenuItems(menuItems)}
          <Divider sx={{ my: 1 }} />
          {renderMenuItems(departmentItems, 'DEPARTAMENTOS')}
          {hasRole(['pastor']) && (<><Divider sx={{ my: 1 }} />{renderMenuItems(adminItems, 'ADMINISTRAÇÃO')}</>)}
          <Divider sx={{ my: 1 }} />
          {renderMenuItems(generalItems, 'GERAL')}
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};
