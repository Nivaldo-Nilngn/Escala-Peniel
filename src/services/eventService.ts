// services/eventService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Event, EventType } from '../types/event';

const COLLECTION_NAME = 'events';

export class EventService {
  /**
   * Criar novo evento
   */
  static async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        date: Timestamp.fromDate(eventData.date),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      throw new Error(`Falha ao criar evento: ${error.message}`);
    }
  }

  /**
   * Buscar evento por ID
   */
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        return null;
      }

      const data = eventSnap.data();
      return {
        id: eventSnap.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Event;
    } catch (error: any) {
      console.error('Erro ao buscar evento:', error);
      throw new Error(`Falha ao buscar evento: ${error.message}`);
    }
  }

  /**
   * Buscar eventos por mês/ano
   */
  static async getEventsByMonth(month: number, year: number): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef,
        where('month', '==', month),
        where('year', '==', year),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event);
      });

      // Ordenar por data no client-side
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      return events;
    } catch (error: any) {
      console.error('Erro ao buscar eventos do mês:', error);
      throw new Error(`Falha ao buscar eventos: ${error.message}`);
    }
  }

  /**
   * Buscar todos os eventos ativos
   */
  static async getAllEvents(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef,
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event);
      });

      // Ordenar por data
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      return events;
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error);
      throw new Error(`Falha ao buscar eventos: ${error.message}`);
    }
  }

  /**
   * Atualizar evento
   */
  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, eventId);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Converter Date para Timestamp se necessário
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.createdAt;

      await updateDoc(eventRef, updateData);
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      throw new Error(`Falha ao atualizar evento: ${error.message}`);
    }
  }

  /**
   * Deletar evento (soft delete)
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, eventId);
      await updateDoc(eventRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Erro ao deletar evento:', error);
      throw new Error(`Falha ao deletar evento: ${error.message}`);
    }
  }

  /**
   * Deletar evento permanentemente
   */
  static async permanentDeleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, eventId);
      await deleteDoc(eventRef);
    } catch (error: any) {
      console.error('Erro ao deletar evento permanentemente:', error);
      throw new Error(`Falha ao deletar evento: ${error.message}`);
    }
  }

  /**
   * Buscar eventos por tipo
   */
  static async getEventsByType(type: EventType): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef,
        where('type', '==', type),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Event);
      });

      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      return events;
    } catch (error: any) {
      console.error('Erro ao buscar eventos por tipo:', error);
      throw new Error(`Falha ao buscar eventos: ${error.message}`);
    }
  }

  /**
   * Duplicar evento para outra data
   */
  static async duplicateEvent(eventId: string, newDate: Date): Promise<string> {
    try {
      const originalEvent = await this.getEventById(eventId);
      if (!originalEvent) {
        throw new Error('Evento original não encontrado');
      }

      const newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        ...originalEvent,
        date: newDate,
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear(),
      };

      // Remover campos que não devem ser copiados
      delete (newEvent as any).id;
      delete (newEvent as any).createdAt;
      delete (newEvent as any).updatedAt;

      return await this.createEvent(newEvent);
    } catch (error: any) {
      console.error('Erro ao duplicar evento:', error);
      throw new Error(`Falha ao duplicar evento: ${error.message}`);
    }
  }
}
