// services/musicApiService.ts
// Serviço para integração com APIs de música

export interface MusicSearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  coverImage?: string;
  preview?: string;
  source: 'deezer' | 'youtube' | 'spotify';
  // Dados musicais adicionais
  bpm?: number;
  key?: string; // Tom musical
  energy?: number;
  danceability?: number;
}

export interface MusicDetails extends MusicSearchResult {
  lyrics?: string;
  cifraClubUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  deezerUrl?: string;
}

class MusicApiServiceClass {
  private readonly DEEZER_API = 'https://api.deezer.com';
  private readonly CIFRA_CLUB_BASE = 'https://www.cifraclub.com.br';
  
  // CORS Proxies alternativos (testados em ordem)
  private readonly CORS_PROXIES = [
    '', // Tenta direto primeiro
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];
  private currentProxyIndex = 0;
  
  /**
   * Constrói URL com proxy apropriado
   */
  private buildUrl(baseUrl: string): string {
    const proxy = this.CORS_PROXIES[this.currentProxyIndex];
    if (proxy === '') {
      return baseUrl;
    }
    return proxy + encodeURIComponent(baseUrl);
  }
  
  /**
   * Tenta o próximo proxy disponível
   */
  private tryNextProxy(): boolean {
    if (this.currentProxyIndex < this.CORS_PROXIES.length - 1) {
      this.currentProxyIndex++;
      console.log(`🔄 Tentando proxy ${this.currentProxyIndex}: ${this.CORS_PROXIES[this.currentProxyIndex]}`);
      return true;
    }
    return false;
  }
  
  /**
   * Busca músicas no Deezer
   */
  async searchDeezer(query: string): Promise<MusicSearchResult[]> {
    try {
      console.log('🔍 Buscando no Deezer:', query);
      
      const baseUrl = `${this.DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=20`;
      const url = this.buildUrl(baseUrl);
      console.log('📡 URL:', url);
      console.log('🔌 Proxy atual:', this.CORS_PROXIES[this.currentProxyIndex] || 'Direto');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Resposta não OK:', response.status, response.statusText);
        
        // Tenta próximo proxy
        if (this.tryNextProxy()) {
          return this.searchDeezer(query);
        }
        
        throw new Error(`Erro ao buscar no Deezer: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      if (!data.data || data.data.length === 0) {
        console.warn('⚠️ Nenhum resultado encontrado');
        return [];
      }
      
      const results = data.data.map((track: any) => ({
        id: `deezer_${track.id}`,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        duration: track.duration,
        coverImage: track.album.cover_medium,
        preview: track.preview,
        source: 'deezer' as const,
      }));
      
      console.log('✅ Resultados processados:', results.length);
      return results;
    } catch (error: any) {
      console.error('❌ Erro ao buscar no Deezer:', error);
      
      // Se for erro de rede e ainda temos proxies para tentar
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🔌 Erro de rede/CORS detectado');
        
        if (this.tryNextProxy()) {
          console.log('🔄 Tentando novamente com outro proxy...');
          return this.searchDeezer(query);
        }
      }
      
      throw error;
    }
  }

  /**
   * Busca artista no Deezer
   */
  async searchArtistDeezer(artistName: string): Promise<any[]> {
    try {
      console.log('🎤 Buscando artista no Deezer:', artistName);
      
      const baseUrl = `${this.DEEZER_API}/search/artist?q=${encodeURIComponent(artistName)}&limit=10`;
      const url = this.buildUrl(baseUrl);
      console.log('📡 URL:', url);
      console.log('🔌 Proxy atual:', this.CORS_PROXIES[this.currentProxyIndex] || 'Direto');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Resposta não OK:', response.status, response.statusText);
        
        // Tenta próximo proxy
        if (this.tryNextProxy()) {
          return this.searchArtistDeezer(artistName);
        }
        
        throw new Error(`Erro ao buscar artista no Deezer: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      if (!data.data || data.data.length === 0) {
        console.warn('⚠️ Nenhum artista encontrado');
        return [];
      }
      
      console.log('✅ Artistas encontrados:', data.data.length);
      return data.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar artista:', error);
      
      // Se for erro de rede e ainda temos proxies para tentar
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🔌 Erro de rede/CORS detectado');
        
        if (this.tryNextProxy()) {
          console.log('🔄 Tentando novamente com outro proxy...');
          return this.searchArtistDeezer(artistName);
        }
      }
      
      throw error;
    }
  }

  /**
   * Obtém top tracks de um artista no Deezer
   */
  async getArtistTopTracks(artistId: string): Promise<MusicSearchResult[]> {
    try {
      const url = this.buildUrl(`${this.DEEZER_API}/artist/${artistId}/top?limit=50`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar músicas do artista');
      }

      const data = await response.json();
      
      return data.data.map((track: any) => ({
        id: `deezer_${track.id}`,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        duration: track.duration,
        coverImage: track.album.cover_medium,
        preview: track.preview,
        source: 'deezer' as const,
      }));
    } catch (error) {
      console.error('Erro ao buscar top tracks:', error);
      return [];
    }
  }

  /**
   * Gera URL do Cifra Club baseado no nome da música e artista
   */
  generateCifraClubUrl(artist: string, title: string): string {
    const formatForUrl = (str: string) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
    };

    const formattedArtist = formatForUrl(artist);
    const formattedTitle = formatForUrl(title);
    
    return `${this.CIFRA_CLUB_BASE}/${formattedArtist}/${formattedTitle}/`;
  }

  /**
   * Busca música no YouTube (simulado - requer YouTube API key)
   * Para implementar completamente, você precisa de uma API key do YouTube
   */
  async searchYouTube(query: string): Promise<MusicSearchResult[]> {
    // Esta é uma implementação simulada
    // Para usar a API real do YouTube, você precisa:
    // 1. Obter uma API key em: https://console.developers.google.com/
    // 2. Habilitar YouTube Data API v3
    // 3. Adicionar a key nas variáveis de ambiente
    
    console.log('YouTube search não implementado ainda. Query:', query);
    return [];
    
    /* Implementação real (descomente e adicione sua API key):
    const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar no YouTube');
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: `youtube_${item.id.videoId}`,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        coverImage: item.snippet.thumbnails.medium.url,
        source: 'youtube' as const,
      }));
    } catch (error) {
      console.error('Erro ao buscar no YouTube:', error);
      return [];
    }
    */
  }

  /**
   * Busca unificada em múltiplas fontes
   */
  async searchAll(query: string): Promise<MusicSearchResult[]> {
    const [deezerResults] = await Promise.all([
      this.searchDeezer(query),
      // Adicione outras APIs aqui quando implementadas
      // this.searchYouTube(query),
    ]);

    // Combina e remove duplicatas
    const allResults = [...deezerResults];
    
    // Remove duplicatas baseado em título e artista similares
    const uniqueResults = allResults.filter((result, index, self) =>
      index === self.findIndex((r) => (
        r.title.toLowerCase() === result.title.toLowerCase() &&
        r.artist.toLowerCase() === result.artist.toLowerCase()
      ))
    );

    return uniqueResults;
  }

  /**
   * Converte resultado de busca em detalhes completos
   */
  enrichMusicDetails(result: MusicSearchResult): MusicDetails {
    const cifraClubUrl = this.generateCifraClubUrl(result.artist, result.title);
    
    let youtubeUrl = '';
    let deezerUrl = '';
    
    if (result.source === 'deezer' && result.id.startsWith('deezer_')) {
      const deezerId = result.id.replace('deezer_', '');
      deezerUrl = `https://www.deezer.com/track/${deezerId}`;
      // Gera busca no YouTube
      youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(result.artist + ' ' + result.title)}`;
    }

    return {
      ...result,
      cifraClubUrl,
      youtubeUrl,
      deezerUrl,
    };
  }

  /**
   * Formata duração em segundos para formato MM:SS
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Ativa/desativa uso de CORS proxy
   */
  setUseCorsProxy(proxyIndex: number = 1) {
    if (proxyIndex >= 0 && proxyIndex < this.CORS_PROXIES.length) {
      this.currentProxyIndex = proxyIndex;
      console.log('🔧 Proxy ativo:', this.CORS_PROXIES[proxyIndex] || 'Direto');
    }
  }
  
  /**
   * Reseta para tentar direto sem proxy
   */
  resetProxy() {
    this.currentProxyIndex = 0;
    console.log('🔄 Proxy resetado para conexão direta');
  }

  /**
   * Busca dados musicais complementares (BPM, Tom) usando AcoustID + MusicBrainz
   * API gratuita e open-source para análise de áudio
   */
  async getAudioFeatures(artist: string, title: string): Promise<{ bpm?: number; key?: string }> {
    try {
      console.log('🎵 Buscando características de áudio para:', artist, '-', title);
      
      // Tenta buscar no MusicBrainz (API gratuita)
      const searchQuery = `${encodeURIComponent(artist)} ${encodeURIComponent(title)}`;
      const musicBrainzUrl = `https://musicbrainz.org/ws/2/recording/?query=${searchQuery}&fmt=json&limit=1`;
      
      const response = await fetch(this.buildUrl(musicBrainzUrl), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EscalaPeniel/1.0.0 ( contact@example.com )'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.recordings && data.recordings.length > 0) {
          const recording = data.recordings[0];
          
          // MusicBrainz não fornece BPM diretamente, mas vamos retornar os dados disponíveis
          console.log('✅ Dados do MusicBrainz encontrados:', recording);
          
          // Aqui podemos adicionar lógica futura para extrair BPM se disponível
          return {
            bpm: undefined,
            key: undefined
          };
        }
      }

      console.log('⚠️ Características de áudio não disponíveis via API gratuita');
      return { bpm: undefined, key: undefined };
      
    } catch (error) {
      console.error('❌ Erro ao buscar características de áudio:', error);
      return { bpm: undefined, key: undefined };
    }
  }

  /**
   * Enriquece resultados de busca com dados de áudio (BPM, Tom)
   */
  async enrichWithAudioFeatures(result: MusicSearchResult): Promise<MusicSearchResult> {
    try {
      const audioFeatures = await this.getAudioFeatures(result.artist, result.title);
      
      return {
        ...result,
        bpm: audioFeatures.bpm,
        key: audioFeatures.key
      };
    } catch (error) {
      console.error('❌ Erro ao enriquecer com características de áudio:', error);
      return result;
    }
  }
}

export const MusicApiService = new MusicApiServiceClass();
