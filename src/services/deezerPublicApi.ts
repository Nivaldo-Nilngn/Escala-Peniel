// services/deezerPublicApi.ts

/**
 * Serviço para API Pública do Deezer
 * Documentação: https://developers.deezer.com/api
 * 
 * Sem necessidade de autenticação para leitura
 * Limite: 50 requests / 5 segundos
 */

const DEEZER_API_BASE = 'https://api.deezer.com';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string; // URL do preview de 30 segundos
  artist: {
    id: number;
    name: string;
    picture: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
  };
}

export interface DeezerSearchResult {
  data: DeezerTrack[];
  total: number;
}

export class DeezerPublicApi {
  /**
   * Busca músicas na API pública do Deezer
   */
  static async searchTrack(query: string, limit: number = 5): Promise<DeezerSearchResult> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${DEEZER_API_BASE}/search?q=${encodedQuery}&limit=${limit}`;
      
      console.log('🔍 Buscando no Deezer:', query);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Resultados do Deezer:', data.data?.length || 0);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar no Deezer:', error);
      
      // Tenta com proxy CORS
      try {
        const encodedQuery = encodeURIComponent(query);
        const url = `${DEEZER_API_BASE}/search?q=${encodedQuery}&limit=${limit}`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
        
        console.log('🔄 Tentando com proxy CORS...');
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        return data;
      } catch (proxyError) {
        console.error('❌ Erro com proxy:', proxyError);
        return { data: [], total: 0 };
      }
    }
  }

  /**
   * Busca track específico por ID
   */
  static async getTrack(trackId: number): Promise<DeezerTrack | null> {
    try {
      const url = `${DEEZER_API_BASE}/track/${trackId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar track:', error);
      return null;
    }
  }

  /**
   * Busca preview de áudio para análise
   * Retorna URL do preview de 30 segundos em MP3
   */
  static async getPreviewUrl(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${artist} ${title}`;
      const result = await this.searchTrack(query, 1);
      
      if (result.data.length === 0) {
        console.warn('⚠️ Nenhum resultado encontrado no Deezer');
        return null;
      }
      
      const track = result.data[0];
      console.log('🎵 Preview encontrado:', track.preview);
      
      return track.preview;
    } catch (error) {
      console.error('❌ Erro ao buscar preview:', error);
      return null;
    }
  }

  /**
   * Busca informações completas da música incluindo preview
   */
  static async getTrackInfo(artist: string, title: string): Promise<DeezerTrack | null> {
    try {
      const query = `${artist} ${title}`;
      const result = await this.searchTrack(query, 1);
      
      if (result.data.length === 0) {
        return null;
      }
      
      return result.data[0];
    } catch (error) {
      console.error('❌ Erro ao buscar info da track:', error);
      return null;
    }
  }

  /**
   * Valida se uma URL de preview do Deezer está acessível
   */
  static async validatePreviewUrl(previewUrl: string): Promise<boolean> {
    try {
      const response = await fetch(previewUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('❌ Preview URL inválida:', error);
      return false;
    }
  }
}
