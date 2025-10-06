// utils/seedOctoberEvents.ts
import { EventService } from '../services/eventService';

/**
 * Script para adicionar eventos de Outubro/2025
 * EXECUTE APENAS UMA VEZ!
 */
export async function seedOctoberEvents(userId: string) {
  const events = [
    {
      title: 'Esquenta Conferência Jovem',
      type: 'esquenta' as const,
      date: new Date('2025-10-02T19:00:00'),
      time: '19:00',
      description: 'Preparação para a Conferência Jovem',
    },
    {
      title: 'Culto de Celebração',
      type: 'culto_celebracao' as const,
      date: new Date('2025-10-05T19:00:00'),
      time: '19:00',
      description: '',
    },
    {
      title: 'Esquenta Conferência Jovem',
      type: 'esquenta' as const,
      date: new Date('2025-10-09T19:00:00'),
      time: '19:00',
      description: 'Preparação para a Conferência Jovem',
    },
    {
      title: 'Santa Ceia',
      type: 'santa_ceia' as const,
      date: new Date('2025-10-12T19:00:00'),
      time: '19:00',
      description: 'Culto com celebração da Santa Ceia',
    },
    {
      title: 'Esquenta Conferência Jovem',
      type: 'esquenta' as const,
      date: new Date('2025-10-16T19:00:00'),
      time: '19:00',
      description: 'Preparação para a Conferência Jovem',
    },
    {
      title: 'Conferência Jovem',
      type: 'conferencia' as const,
      date: new Date('2025-10-18T19:00:00'),
      time: '19:00',
      description: 'Grande Conferência Jovem - Dia 1',
    },
    {
      title: 'Conferência Jovem',
      type: 'conferencia' as const,
      date: new Date('2025-10-19T19:00:00'),
      time: '19:00',
      description: 'Grande Conferência Jovem - Dia 2',
    },
    {
      title: 'Culto de Celebração JP',
      type: 'culto_jp' as const,
      date: new Date('2025-10-23T19:00:00'),
      time: '19:00',
      description: 'Culto de Jovens e Profissionais',
    },
    {
      title: 'Culto de Celebração',
      type: 'culto_celebracao' as const,
      date: new Date('2025-10-26T19:00:00'),
      time: '19:00',
      description: '',
    },
    {
      title: 'Culto de Celebração JP',
      type: 'culto_jp' as const,
      date: new Date('2025-10-30T19:00:00'),
      time: '19:00',
      description: 'Culto de Jovens e Profissionais',
    },
  ];

  const results = [];

  for (const event of events) {
    try {
      const eventId = await EventService.createEvent({
        ...event,
        month: event.date.getMonth() + 1,
        year: event.date.getFullYear(),
        color: getEventColor(event.type),
        isActive: true,
        createdBy: userId,
      });
      
      results.push({
        success: true,
        title: event.title,
        date: event.date.toLocaleDateString('pt-BR'),
        id: eventId,
      });
      
      console.log(`✅ Criado: ${event.title} - ${event.date.toLocaleDateString('pt-BR')}`);
    } catch (error: any) {
      results.push({
        success: false,
        title: event.title,
        date: event.date.toLocaleDateString('pt-BR'),
        error: error.message,
      });
      
      console.error(`❌ Erro ao criar: ${event.title}`, error);
    }
  }

  return results;
}

function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    culto_celebracao: '#1976d2',
    santa_ceia: '#7b1fa2',
    culto_jp: '#0288d1',
    conferencia: '#d32f2f',
    esquenta: '#f57c00',
    ensaio: '#388e3c',
    reuniao: '#455a64',
    outro: '#616161',
  };
  
  return colors[type] || '#616161';
}
