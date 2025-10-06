// services/musicService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Music } from '../types/music';

class MusicServiceClass {
  private readonly COLLECTION = 'musics';

  /**
   * Adiciona uma nova música ao repertório de um departamento
   */
  async addMusic(departmentId: string, musicData: Partial<Music>, userId: string): Promise<string> {
    try {
      const musicRef = collection(db, this.COLLECTION);
      
      const newMusic = {
        ...musicData,
        departmentId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(musicRef, newMusic);
      console.log('✅ Música adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar música:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma música existente
   */
  async updateMusic(musicId: string, updates: Partial<Music>): Promise<void> {
    try {
      const musicRef = doc(db, this.COLLECTION, musicId);
      
      await updateDoc(musicRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Música atualizada:', musicId);
    } catch (error) {
      console.error('❌ Erro ao atualizar música:', error);
      throw error;
    }
  }

  /**
   * Remove uma música
   */
  async deleteMusic(musicId: string): Promise<void> {
    try {
      const musicRef = doc(db, this.COLLECTION, musicId);
      await deleteDoc(musicRef);
      console.log('✅ Música removida:', musicId);
    } catch (error) {
      console.error('❌ Erro ao remover música:', error);
      throw error;
    }
  }

  /**
   * Busca uma música por ID
   */
  async getMusicById(musicId: string): Promise<Music | null> {
    try {
      const musicRef = doc(db, this.COLLECTION, musicId);
      const musicDoc = await getDoc(musicRef);
      
      if (!musicDoc.exists()) {
        return null;
      }

      return {
        id: musicDoc.id,
        ...musicDoc.data(),
        createdAt: musicDoc.data().createdAt?.toDate(),
        updatedAt: musicDoc.data().updatedAt?.toDate(),
      } as Music;
    } catch (error) {
      console.error('❌ Erro ao buscar música:', error);
      throw error;
    }
  }

  /**
   * Busca todas as músicas de um departamento
   */
  async getMusicsByDepartment(departmentId: string): Promise<Music[]> {
    try {
      const musicsRef = collection(db, this.COLLECTION);
      
      // Query simplificada - apenas filtra por departamento
      // Ordenação será feita localmente para evitar necessidade de índice
      const q = query(
        musicsRef,
        where('departmentId', '==', departmentId)
      );

      const snapshot = await getDocs(q);
      
      const musics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Music[];

      // Ordena localmente por título
      musics.sort((a, b) => a.titulo.localeCompare(b.titulo));

      console.log(`✅ ${musics.length} músicas carregadas do departamento ${departmentId}`);
      return musics;
    } catch (error) {
      console.error('❌ Erro ao buscar músicas do departamento:', error);
      throw error;
    }
  }

  /**
   * Busca músicas por artista
   */
  async getMusicsByArtist(departmentId: string, artistName: string): Promise<Music[]> {
    try {
      const musicsRef = collection(db, this.COLLECTION);
      
      // Query simplificada
      const q = query(
        musicsRef,
        where('departmentId', '==', departmentId),
        where('artista', '==', artistName)
      );

      const snapshot = await getDocs(q);
      
      const musics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Music[];

      // Ordena localmente
      musics.sort((a, b) => a.titulo.localeCompare(b.titulo));
      
      return musics;
    } catch (error) {
      console.error('❌ Erro ao buscar músicas por artista:', error);
      throw error;
    }
  }

  /**
   * Busca músicas por categoria
   */
  async getMusicsByCategory(departmentId: string, category: string): Promise<Music[]> {
    try {
      const musicsRef = collection(db, this.COLLECTION);
      
      // Query simplificada
      const q = query(
        musicsRef,
        where('departmentId', '==', departmentId),
        where('categoria', '==', category)
      );

      const snapshot = await getDocs(q);
      
      const musics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Music[];

      // Ordena localmente
      musics.sort((a, b) => a.titulo.localeCompare(b.titulo));
      
      return musics;
    } catch (error) {
      console.error('❌ Erro ao buscar músicas por categoria:', error);
      throw error;
    }
  }

  /**
   * Busca músicas por tom
   */
  async getMusicsByKey(departmentId: string, key: string): Promise<Music[]> {
    try {
      const musicsRef = collection(db, this.COLLECTION);
      
      // Query simplificada
      const q = query(
        musicsRef,
        where('departmentId', '==', departmentId),
        where('tom', '==', key)
      );

      const snapshot = await getDocs(q);
      
      const musics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Music[];

      // Ordena localmente
      musics.sort((a, b) => a.titulo.localeCompare(b.titulo));
      
      return musics;
    } catch (error) {
      console.error('❌ Erro ao buscar músicas por tom:', error);
      throw error;
    }
  }

  /**
   * Lista todos os artistas únicos de um departamento
   */
  async getArtistsByDepartment(departmentId: string): Promise<string[]> {
    try {
      const musics = await this.getMusicsByDepartment(departmentId);
      
      // Extrai artistas únicos
      const artistsSet = new Set(musics.map(m => m.artista));
      const artists = Array.from(artistsSet).sort();
      
      console.log(`✅ ${artists.length} artistas encontrados`);
      return artists;
    } catch (error) {
      console.error('❌ Erro ao buscar artistas:', error);
      throw error;
    }
  }

  /**
   * Busca músicas por texto (título ou artista)
   */
  async searchMusics(departmentId: string, searchText: string): Promise<Music[]> {
    try {
      // Busca todas as músicas do departamento
      const allMusics = await this.getMusicsByDepartment(departmentId);
      
      // Filtra localmente por título ou artista
      const searchLower = searchText.toLowerCase();
      const filtered = allMusics.filter(music => 
        music.titulo.toLowerCase().includes(searchLower) ||
        music.artista.toLowerCase().includes(searchLower)
      );
      
      console.log(`✅ ${filtered.length} músicas encontradas para "${searchText}"`);
      return filtered;
    } catch (error) {
      console.error('❌ Erro ao buscar músicas:', error);
      throw error;
    }
  }

  /**
   * Conta músicas por categoria
   */
  async countByCategory(departmentId: string): Promise<Record<string, number>> {
    try {
      const musics = await this.getMusicsByDepartment(departmentId);
      
      const counts: Record<string, number> = {};
      musics.forEach(music => {
        counts[music.categoria] = (counts[music.categoria] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.error('❌ Erro ao contar músicas:', error);
      throw error;
    }
  }
}

export const MusicService = new MusicServiceClass();
