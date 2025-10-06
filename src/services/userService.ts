// services/userService.ts
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
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { User, UserRole, PaginatedResponse, PaginationParams } from '../types';

export class UserService {
  private static readonly COLLECTION_NAME = 'users';

  // Buscar usuário por ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Criar novo usuário no Authentication e Firestore
  static async createUser(userData: Omit<User, 'id'>, password: string = 'Senha@123'): Promise<string> {
    try {
      // 1. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password
      );
      
      const uid = userCredential.user.uid;
      
      // 2. Criar documento no Firestore usando o UID
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      await setDoc(userRef, {
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role,
        departmentIds: userData.departmentIds || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('Usuário criado com sucesso:', uid);
      return uid;
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      // Traduzir erros comuns do Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email já está em uso');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      throw error;
    }
  }

  // Atualizar usuário
  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Buscar usuários por departamento
  static async getUsersByDepartment(departmentId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('departmentIds', 'array-contains', departmentId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];
      
      // Ordenar no lado do cliente
      return users.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar usuários por departamento:', error);
      throw error;
    }
  }

  // Buscar usuários por papel
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('role', '==', role),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];
      
      // Ordenar no lado do cliente
      return users.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar usuários por papel:', error);
      throw error;
    }
  }

  // Listar usuários com paginação
  static async getUsers(params: PaginationParams, lastDoc?: DocumentSnapshot): Promise<PaginatedResponse<User>> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        limit(params.limit)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];

      // Ordenar no lado do cliente
      const sortedUsers = users.sort((a, b) => {
        const orderBy = params.orderBy || 'name';
        const direction = params.orderDirection || 'asc';
        const aVal = a[orderBy as keyof User];
        const bVal = b[orderBy as keyof User];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });

      return {
        items: sortedUsers,
        total: sortedUsers.length,
        page: params.page,
        totalPages: Math.ceil(sortedUsers.length / params.limit),
        hasNext: sortedUsers.length === params.limit,
        hasPrev: params.page > 1,
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  // Adicionar usuário a um departamento
  static async addUserToDepartment(userId: string, departmentId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentDepartments = userData.departmentIds || [];
        
        if (!currentDepartments.includes(departmentId)) {
          await updateDoc(userRef, {
            departmentIds: [...currentDepartments, departmentId],
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário ao departamento:', error);
      throw error;
    }
  }

  // Remover usuário de um departamento
  static async removeUserFromDepartment(userId: string, departmentId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentDepartments = userData.departmentIds || [];
        
        await updateDoc(userRef, {
          departmentIds: currentDepartments.filter((id: string) => id !== departmentId),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao remover usuário do departamento:', error);
      throw error;
    }
  }
}