import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { HistoryItem, CreateHistoryItem } from '../types/history';

const COLLECTION_NAME = 'musicHistory';

export class HistoryService {
  // Adicionar item ao histórico
  static async addToHistory(item: CreateHistoryItem): Promise<string> {
    try {
      const historyData = {
        ...item,
        createdAt: Timestamp.now(),
        // Adicionar timestamp como número para facilitar ordenação
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), historyData);
      console.log('Item adicionado ao histórico com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      throw error;
    }
  }

  // Buscar histórico do usuário
  static async getUserHistory(userId: string, limitItems: number = 10): Promise<HistoryItem[]> {
    try {
      console.log('Buscando histórico para usuário:', userId);
      
      // Consulta simples sem ordenação para evitar erro de índice
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const history: HistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Documento encontrado:', doc.id, data);
        history.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as HistoryItem);
      });

      console.log(`Encontrados ${history.length} itens no histórico`);

      // Ordenar por timestamp (número) que é mais simples
      const sortedHistory = history
        .sort((a, b) => {
          const timestampA = (a as any).timestamp || a.createdAt.getTime();
          const timestampB = (b as any).timestamp || b.createdAt.getTime();
          return timestampB - timestampA;
        })
        .slice(0, limitItems);

      console.log(`Retornando ${sortedHistory.length} itens após ordenação e limite`);
      return sortedHistory;
        
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      
      // Se for erro de índice, mostrar URL para criar
      if (error instanceof Error && error.message.includes('index')) {
        console.error('💡 Para resolver este erro, acesse o Console do Firebase e crie o índice:');
        console.error('🔗 https://console.firebase.google.com/project/escala-peniel/firestore/indexes');
        console.error('📋 Campos necessários: userId (Ascending) + createdAt (Descending)');
      }
      
      return [];
    }
  }

  // Remover item do histórico
  static async removeFromHistory(historyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, historyId));
    } catch (error) {
      console.error('Erro ao remover do histórico:', error);
      throw error;
    }
  }

  // Limpar todo o histórico do usuário
  static async clearUserHistory(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      throw error;
    }
  }

  // Buscar se uma música já existe no histórico
  static async musicExistsInHistory(userId: string, title: string, artist?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('title', '==', title),
        ...(artist ? [where('artist', '==', artist)] : [])
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar música no histórico:', error);
      return false;
    }
  }
}