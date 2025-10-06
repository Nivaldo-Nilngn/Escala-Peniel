// pages/Escalas.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  alpha,
  Stack,
  Avatar,
  GlobalStyles,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  Group,
  MusicNote,
  Videocam,
  ChildCare,
  AccountBalance,
  CheckCircle,
} from '@mui/icons-material';
import { ScheduleService } from '../services/scheduleService';
import { DepartmentService } from '../services/departmentService';
import { DepartmentSchedule, Department } from '../types';

const departmentConfig = {
  diaconato: { color: '#1976d2', icon: AccountBalance, label: 'Diaconato' },
  louvor: { color: '#9c27b0', icon: MusicNote, label: 'Louvor' },
  midia: { color: '#ff5722', icon: Videocam, label: 'Mídia' },
  criancas: { color: '#4caf50', icon: ChildCare, label: 'Crianças' },
};

export const Escalas: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schedulesByDepartment, setSchedulesByDepartment] = useState<Record<string, DepartmentSchedule[]>>({});
  const [allSchedules, setAllSchedules] = useState<DepartmentSchedule[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const depts = await DepartmentService.getAllDepartments();
      setDepartments(depts);

      const schedulesMap: Record<string, DepartmentSchedule[]> = {};
      const allSchedulesArray: DepartmentSchedule[] = [];

      for (const dept of depts) {
        const schedules = await ScheduleService.getSchedulesByDepartment(dept.id);
        schedulesMap[dept.id] = schedules;
        allSchedulesArray.push(...schedules);
      }

      setSchedulesByDepartment(schedulesMap);
      setAllSchedules(allSchedulesArray);
    } catch (err: any) {
      console.error('Erro ao carregar escalas:', err);
      setError('Erro ao carregar as escalas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleCard = (schedule: DepartmentSchedule, departmentType: string) => {
    const config = departmentConfig[departmentType as keyof typeof departmentConfig];
    const Icon = config?.icon || AccountBalance;
    const color = config?.color || '#1976d2';

    if (!schedule.eventDate) return null;

    // Converter eventDate para Date object (pode ser Timestamp do Firestore ou string)
    let eventDate: Date;
    if (schedule.eventDate instanceof Date) {
      eventDate = schedule.eventDate;
    } else if (typeof schedule.eventDate === 'string') {
      eventDate = new Date(schedule.eventDate);
    } else if (schedule.eventDate && typeof schedule.eventDate === 'object' && 'toDate' in schedule.eventDate) {
      // Firestore Timestamp
      eventDate = (schedule.eventDate as any).toDate();
    } else {
      return null;
    }

    const scheduleDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    const isPast = scheduleDate < today;

    const dayOfWeek = eventDate.toLocaleDateString('pt-BR', { weekday: 'short' });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' });
    const year = eventDate.getFullYear();

    return (
      <Card
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          boxShadow: 1,
          '&:hover': { boxShadow: 2 },
          opacity: isPast ? 0.7 : 1,
        }}
      >
        {/* Header colorido compacto */}
        <Box sx={{ 
          bgcolor: isPast ? 'grey.400' : color,
          color: 'white',
          p: { xs: 1, md: 1.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Icon sx={{ fontSize: { xs: 18, md: 20 }, flexShrink: 0 }} />
            <Typography 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '0.85rem', md: '1rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {schedule.eventTitle}
            </Typography>
          </Box>
          {schedule.isPublished ? (
            <CheckCircle sx={{ fontSize: { xs: 16, md: 18 }, flexShrink: 0 }} />
          ) : (
            <Chip 
              label="Rascunho" 
              size="small" 
              sx={{ 
                height: { xs: 20, md: 24 },
                fontSize: { xs: '0.65rem', md: '0.7rem' },
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                flexShrink: 0,
              }} 
            />
          )}
        </Box>

        <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
          {/* Info compacta */}
          <Stack spacing={1}>
            {/* Data e Horário em linha */}
            <Box>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' }, color: 'text.secondary', display: 'block' }}>
                📅 {dayOfWeek}, {day} {month} {year}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' }, color: 'text.secondary' }}>
                ⏰ {schedule.arrivalTime} • {schedule.eventStartTime}
              </Typography>
            </Box>

            {/* Equipe */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Group sx={{ fontSize: { xs: 14, md: 16 }, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, fontWeight: 600 }}>
                {schedule.assignments?.length || 0} {schedule.assignments?.length === 1 ? 'pessoa' : 'pessoas'}
              </Typography>
            </Box>

            {/* Vestimenta inline */}
            {schedule.colorPalette && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' }, color: 'text.secondary' }}>
                  👔
                </Typography>
                <Box
                  sx={{
                    width: { xs: 20, md: 24 },
                    height: { xs: 20, md: 24 },
                    bgcolor: schedule.colorPalette.primary,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    flexShrink: 0,
                  }}
                />
                <Box
                  sx={{
                    width: { xs: 20, md: 24 },
                    height: { xs: 20, md: 24 },
                    bgcolor: schedule.colorPalette.secondary,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    flexShrink: 0,
                  }}
                />
                {schedule.colorPalette.accent && (
                  <Box
                    sx={{
                      width: { xs: 20, md: 24 },
                      height: { xs: 20, md: 24 },
                      bgcolor: schedule.colorPalette.accent,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
                {schedule.colorPalette.description && (
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, color: 'text.secondary' }}>
                    {schedule.colorPalette.description}
                  </Typography>
                )}
              </Box>
            )}

            {/* Membros resumido */}
            {schedule.assignments && schedule.assignments.length > 0 && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' }, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Escalados:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {schedule.assignments.slice(0, 3).map((assignment, idx) => (
                    <Chip
                      key={idx}
                      label={assignment.userName}
                      size="small"
                      sx={{
                        height: { xs: 22, md: 24 },
                        fontSize: { xs: '0.65rem', md: '0.7rem' },
                        bgcolor: alpha(color, 0.1),
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  ))}
                  {schedule.assignments.length > 3 && (
                    <Chip
                      label={`+${schedule.assignments.length - 3}`}
                      size="small"
                      sx={{
                        height: { xs: 22, md: 24 },
                        fontSize: { xs: '0.65rem', md: '0.7rem' },
                        bgcolor: alpha(color, 0.2),
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Observações */}
            {schedule.notes && (
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                    color: 'text.secondary',
                    display: 'block',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  💬 {schedule.notes}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const sortedDepartments = departments.sort((a, b) => {
    const order = ['diaconato', 'louvor', 'midia', 'criancas'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  return (
    <>
      <GlobalStyles
        styles={{
          'body, html, #root': {
            overflowX: 'hidden !important',
            maxWidth: '100vw',
            position: 'relative',
            margin: 0,
            padding: 0,
          },
          '*': {
            boxSizing: 'border-box',
          },
        }}
      />
      <Box sx={{ 
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: '1400px' },
          px: { xs: 0.5, sm: 1, md: 2 },
          py: { xs: 1, md: 2 },
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight={700} 
              sx={{ 
                fontSize: { xs: '1.25rem', md: '2rem' },
                wordBreak: 'break-word',
              }}
            >
              📅 Todas as Escalas
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.8rem', md: '1rem' },
                wordBreak: 'break-word',
              }}
            >
              Visualize todas as escalas de todos os departamentos
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontSize: '0.75rem' }}>
              Total: <strong>{allSchedules.length}</strong> {allSchedules.length === 1 ? 'escala' : 'escalas'}
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, md: 1 }, 
            flexWrap: 'wrap', 
            mb: { xs: 1.5, md: 2 },
            width: '100%',
            justifyContent: 'center',
          }}>
            {sortedDepartments.map(dept => {
              const config = departmentConfig[dept.type as keyof typeof departmentConfig];
              const Icon = config?.icon || AccountBalance;
              const scheduleCount = schedulesByDepartment[dept.id]?.length || 0;

              return (
                <Card
                  key={dept.id}
                  onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
                  sx={{
                    flex: { xs: '0 0 calc(50% - 4px)', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' },
                    minWidth: 0,
                    maxWidth: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                    border: 2,
                    borderColor: selectedDepartment === dept.id ? (config?.color || '#1976d2') : 'divider',
                    bgcolor: selectedDepartment === dept.id ? alpha(config?.color || '#1976d2', 0.15) : alpha(config?.color || '#1976d2', 0.05),
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
              <CardContent sx={{ 
                p: { xs: 0.75, md: 1.25 }, 
                '&:last-child': { pb: { xs: 0.75, md: 1.25 } },
                overflow: 'hidden',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 0.75 }, mb: { xs: 0.5, md: 1 } }}>
                  <Avatar
                    sx={{
                      bgcolor: config?.color || '#1976d2',
                      width: { xs: 24, md: 28 },
                      height: { xs: 24, md: 28 },
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 14, md: 16 } }} />
                  </Avatar>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={700} 
                    sx={{ 
                      fontSize: { xs: '0.65rem', md: '0.75rem' }, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {dept.name}
                  </Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  color={config?.color || '#1976d2'} 
                  sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 0 }}
                >
                  {scheduleCount}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
                >
                  {scheduleCount === 1 ? 'escala' : 'escalas'}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
          </Box>

          {/* Grid de Escalas Filtradas */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, sm: 1, md: 1.5 }, 
            flexWrap: 'wrap',
            width: '100%',
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}>
            {(() => {
              const schedulesToShow = selectedDepartment 
                ? schedulesByDepartment[selectedDepartment] || []
                : allSchedules;

              if (schedulesToShow.length === 0) {
                return (
                  <Alert severity="info" sx={{ width: '100%' }}>
                    {selectedDepartment 
                      ? 'Nenhuma escala cadastrada para este departamento.'
                      : 'Nenhuma escala cadastrada ainda.'}
                  </Alert>
                );
              }

              return schedulesToShow
                .sort((a, b) => {
                  const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
                  const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
                  return dateB - dateA;
                })
                .map(schedule => {
                  const dept = departments.find(d => d.id === schedule.departmentId);
                  return (
                    <Box 
                      key={schedule.id} 
                      sx={{ 
                        flex: { xs: '0 0 100%', md: '0 0 calc(50% - 8px)', lg: '0 0 calc(33.333% - 12px)' },
                        minWidth: 0,
                        maxWidth: { xs: '100%', md: 'calc(50% - 8px)', lg: 'calc(33.333% - 12px)' },
                      }}
                    >
                      {renderScheduleCard(schedule, dept?.type || 'diaconato')}
                    </Box>
                  );
                });
            })()}
          </Box>
        </Box>
      </Box>
    </>
  );
};
