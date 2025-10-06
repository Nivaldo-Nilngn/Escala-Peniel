// services/departmentService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Department, DepartmentFunction } from '../types';

export class DepartmentService {
  private static readonly COLLECTION_NAME = 'departments';
  private static readonly FUNCTIONS_COLLECTION = 'departmentFunctions';

  // Buscar departamento por ID
  static async getDepartmentById(departmentId: string): Promise<Department | null> {
    try {
      const departmentDoc = await getDoc(doc(db, this.COLLECTION_NAME, departmentId));
      
      if (departmentDoc.exists()) {
        const data = departmentDoc.data();
        return {
          id: departmentDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Department;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar departamento:', error);
      throw error;
    }
  }

  // Listar todos os departamentos ativos
  static async getAllDepartments(): Promise<Department[]> {
    try {
      // Versão simplificada sem orderBy para evitar erro de índice
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const departments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Department[];
      
      // Ordenar no lado do cliente
      return departments.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao listar departamentos:', error);
      throw error;
    }
  }

  // Criar novo departamento
  static async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...department,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      throw error;
    }
  }

  // Atualizar departamento
  static async updateDepartment(departmentId: string, updates: Partial<Department>): Promise<void> {
    try {
      const departmentRef = doc(db, this.COLLECTION_NAME, departmentId);
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      throw error;
    }
  }

  // Adicionar membro ao departamento
  static async addMemberToDepartment(departmentId: string, userId: string): Promise<void> {
    try {
      // 1. Adicionar userId ao array members do departamento
      const departmentRef = doc(db, this.COLLECTION_NAME, departmentId);
      const departmentDoc = await getDoc(departmentRef);
      
      if (departmentDoc.exists()) {
        const currentMembers = departmentDoc.data().members || [];
        
        if (!currentMembers.includes(userId)) {
          await updateDoc(departmentRef, {
            members: [...currentMembers, userId],
            updatedAt: Timestamp.now(),
          });
        }
      }
      
      // 2. Adicionar departmentId ao array departmentIds do usuário
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentDepartments = userDoc.data().departmentIds || [];
        
        if (!currentDepartments.includes(departmentId)) {
          await updateDoc(userRef, {
            departmentIds: [...currentDepartments, departmentId],
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar membro ao departamento:', error);
      throw error;
    }
  }

  // Remover membro do departamento
  static async removeMemberFromDepartment(departmentId: string, userId: string): Promise<void> {
    try {
      // 1. Remover userId do array members do departamento
      const departmentRef = doc(db, this.COLLECTION_NAME, departmentId);
      const departmentDoc = await getDoc(departmentRef);
      
      if (departmentDoc.exists()) {
        const currentMembers = departmentDoc.data().members || [];
        
        await updateDoc(departmentRef, {
          members: currentMembers.filter((id: string) => id !== userId),
          updatedAt: Timestamp.now(),
        });
      }
      
      // 2. Remover departmentId do array departmentIds do usuário
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentDepartments = userDoc.data().departmentIds || [];
        
        await updateDoc(userRef, {
          departmentIds: currentDepartments.filter((id: string) => id !== departmentId),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao remover membro do departamento:', error);
      throw error;
    }
  }

  // Buscar funções de um departamento
  static async getDepartmentFunctions(departmentId: string): Promise<DepartmentFunction[]> {
    try {
      const q = query(
        collection(db, this.FUNCTIONS_COLLECTION),
        where('departmentId', '==', departmentId)
      );
      
      const querySnapshot = await getDocs(q);
      const functions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DepartmentFunction[];
      
      // Ordenar no lado do cliente
      return functions.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar funções do departamento:', error);
      throw error;
    }
  }

  // Criar função de departamento
  static async createDepartmentFunction(func: Omit<DepartmentFunction, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.FUNCTIONS_COLLECTION), func);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar função do departamento:', error);
      throw error;
    }
  }

  // Atualizar função de departamento
  static async updateDepartmentFunction(functionId: string, updates: Partial<DepartmentFunction>): Promise<void> {
    try {
      const functionRef = doc(db, this.FUNCTIONS_COLLECTION, functionId);
      await updateDoc(functionRef, updates);
    } catch (error) {
      console.error('Erro ao atualizar função do departamento:', error);
      throw error;
    }
  }

  // Deletar função de departamento
  static async deleteDepartmentFunction(functionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.FUNCTIONS_COLLECTION, functionId));
    } catch (error) {
      console.error('Erro ao deletar função do departamento:', error);
      throw error;
    }
  }
}
