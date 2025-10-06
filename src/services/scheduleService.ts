// services/scheduleService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { DepartmentSchedule, MonthlyAgenda } from '../types';

export class ScheduleService {
  private static readonly SCHEDULES_COLLECTION = 'departmentSchedules';
  private static readonly AGENDAS_COLLECTION = 'monthlyAgendas';

  // Buscar agenda do mês
  static async getMonthlyAgenda(month: number, year: number): Promise<MonthlyAgenda | null> {
    try {
      const q = query(
        collection(db, this.AGENDAS_COLLECTION),
        where('month', '==', month),
        where('year', '==', year)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          events: data.events?.map((event: any) => ({
            ...event,
            date: event.date?.toDate() || new Date(),
          })) || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MonthlyAgenda;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar agenda mensal:', error);
      throw error;
    }
  }

  // Criar agenda mensal
  static async createMonthlyAgenda(agenda: Omit<MonthlyAgenda, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.AGENDAS_COLLECTION), {
        ...agenda,
        events: agenda.events.map(event => ({
          ...event,
          date: Timestamp.fromDate(event.date),
        })),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar agenda mensal:', error);
      throw error;
    }
  }

  // Buscar escalas de um departamento
  static async getDepartmentSchedules(departmentId: string): Promise<DepartmentSchedule[]> {
    try {
      const q = query(
        collection(db, this.SCHEDULES_COLLECTION),
        where('departmentId', '==', departmentId)
      );
      
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as DepartmentSchedule[];
      
      // Ordenar no lado do cliente
      return schedules.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erro ao buscar escalas do departamento:', error);
      throw error;
    }
  }

  // Alias para getDepartmentSchedules (compatibilidade)
  static async getSchedulesByDepartment(departmentId: string): Promise<DepartmentSchedule[]> {
    return this.getDepartmentSchedules(departmentId);
  }

  // Buscar escalas por evento
  static async getSchedulesByEvent(eventId: string): Promise<DepartmentSchedule[]> {
    try {
      const q = query(
        collection(db, this.SCHEDULES_COLLECTION),
        where('eventId', '==', eventId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as DepartmentSchedule[];
    } catch (error) {
      console.error('Erro ao buscar escalas por evento:', error);
      throw error;
    }
  }

  // Buscar escala por ID
  static async getDepartmentScheduleById(scheduleId: string): Promise<DepartmentSchedule | null> {
    try {
      const docRef = doc(db, this.SCHEDULES_COLLECTION, scheduleId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        eventDate: data.eventDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as DepartmentSchedule;
    } catch (error) {
      console.error('Erro ao buscar escala por ID:', error);
      throw error;
    }
  }

  // Criar escala de departamento
  static async createDepartmentSchedule(schedule: Omit<DepartmentSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('📝 ScheduleService: Iniciando criação de escala...');
      console.log('📋 Departamento:', schedule.departmentId, schedule.departmentName);
      console.log('📅 Evento:', schedule.eventTitle, schedule.eventDate);
      console.log('👥 Assignments:', schedule.assignments.length);
      
      // Converter eventDate para Timestamp se for Date
      const dataToSave: any = {
        ...schedule,
        eventDate: schedule.eventDate ? Timestamp.fromDate(schedule.eventDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('💾 Dados preparados para salvar no Firestore:', {
        departmentId: dataToSave.departmentId,
        departmentName: dataToSave.departmentName,
        eventTitle: dataToSave.eventTitle,
        createdBy: dataToSave.createdBy,
        assignmentsCount: dataToSave.assignments.length,
      });

      console.log('🔥 Chamando addDoc na collection:', this.SCHEDULES_COLLECTION);
      const docRef = await addDoc(collection(db, this.SCHEDULES_COLLECTION), dataToSave);
      
      console.log('✅ Escala criada com sucesso! ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ ERRO ao criar escala:', {
        message: error.message,
        code: error.code,
        details: error,
      });
      throw error;
    }
  }

  // Atualizar escala de departamento
  static async updateDepartmentSchedule(scheduleId: string, updates: Partial<DepartmentSchedule>): Promise<void> {
    try {
      const scheduleRef = doc(db, this.SCHEDULES_COLLECTION, scheduleId);
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar escala:', error);
      throw error;
    }
  }

  // Publicar escala
  static async publishSchedule(scheduleId: string): Promise<void> {
    try {
      await this.updateDepartmentSchedule(scheduleId, { isPublished: true });
    } catch (error) {
      console.error('Erro ao publicar escala:', error);
      throw error;
    }
  }

  // Verificar conflitos de membros (se estão em mais de uma escala no mesmo evento)
  static async checkMemberConflicts(assignments: any[], eventId: string): Promise<string[]> {
    try {
      const conflictingMembers: string[] = [];
      const memberIds = assignments.map(a => a.userId);
      
      // Buscar escalas do mesmo evento
      const eventSchedules = await this.getSchedulesByEvent(eventId);
      
      // Verificar se algum membro já está escalado
      for (const schedule of eventSchedules) {
        for (const assignment of schedule.assignments) {
          if (memberIds.includes(assignment.userId)) {
            conflictingMembers.push(assignment.userId);
          }
        }
      }
      
      return Array.from(new Set(conflictingMembers)); // Remove duplicatas
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return [];
    }
  }

  // Deletar escala
  static async deleteDepartmentSchedule(scheduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.SCHEDULES_COLLECTION, scheduleId));
    } catch (error) {
      console.error('Erro ao deletar escala:', error);
      throw error;
    }
  }
}
