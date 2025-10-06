// INSTRUÇÕES: 
// 1. Abra o navegador na sua aplicação (localhost:3000)
// 2. Pressione F12 para abrir DevTools
// 3. Vá na aba "Console"
// 4. Cole TODO este código abaixo
// 5. Pressione ENTER

import('http://localhost:3000/static/js/bundle.js').then(() => {
  // Importar Firebase
  const { collection, addDoc, Timestamp } = window.firebase.firestore;
  const { db } = window;

  // Criar escala fake
  const fakeSchedule = {
    departmentId: '365jfYtgyfj6hlbmENhT',
    departmentName: 'Diaconato',
    eventId: 'evento-fake-001',
    eventTitle: 'Culto de Celebração',
    eventDate: Timestamp.fromDate(new Date('2025-10-05T19:30:00')),
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
    ],
    arrivalTime: '17:40',
    eventStartTime: '18:30',
    colorPalette: {
      primary: '#1976d2',
      secondary: '#dc004e',
      accent: '#ff9800',
      description: 'Azul, Rosa e Laranja',
    },
    notes: 'Escala de exemplo',
    isPublished: false,
    createdBy: 'admin-fake',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  addDoc(collection(db, 'departmentSchedules'), fakeSchedule)
    .then((docRef) => {
      console.log('✅ Escala criada! ID:', docRef.id);
    })
    .catch((err) => {
      console.error('❌ Erro:', err);
    });
});
