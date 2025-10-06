import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

export const createFakeSchedule = async () => {
  try {
    console.log('🔄 Criando escala fake...');

    // Dados da escala fake
    const fakeSchedule = {
      departmentId: '365jfYtgyfj6hlbmENhT', // ID do Diaconato
      departmentName: 'Diaconato',
      eventId: 'evento-fake-001',
      eventTitle: 'Culto de Celebração',
      eventDate: Timestamp.fromDate(new Date('2025-10-05T19:30:00')), // Domingo, 5 de outubro
      assignments: [
        {
          userId: 'user-fake-001',
          userName: 'João Silva',
          functionId: 'func-porta-001',
          functionName: 'Porta Principal',
        },
        {
          userId: 'user-fake-002',
          userName: 'Maria Santos',
          functionId: 'func-corredor-001',
          functionName: 'Corredor Central',
        },
        {
          userId: 'user-fake-003',
          userName: 'Pedro Oliveira',
          functionId: 'func-altar-001',
          functionName: 'Altar',
        },
      ],
      arrivalTime: '17:40',
      eventStartTime: '18:30',
      colorPalette: {
        primary: '#1976d2',
        secondary: '#dc004e',
        accent: '#ff9800',
        description: 'Azul, Rosa e Laranja',
      },
      notes: 'Esta é uma escala de exemplo criada automaticamente.',
      isPublished: false,
      createdBy: 'admin-fake',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('📝 Dados da escala:', fakeSchedule);

    // Adicionar no Firestore
    const docRef = await addDoc(collection(db, 'departmentSchedules'), fakeSchedule);

    console.log('✅ Escala fake criada com sucesso!');
    console.log('🆔 ID do documento:', docRef.id);
    console.log('🔗 Acesse o Firebase Console para ver a coleção "departmentSchedules"');

    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar escala fake:', error);
    throw error;
  }
};
