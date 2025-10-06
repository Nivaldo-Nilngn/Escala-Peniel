# 🎵 Integração com API Pública do Deezer

## Visão Geral

O detector de acordes agora usa a **API Pública do Deezer** para obter previews de áudio de 30 segundos quando não há URL de áudio disponível.

## Documentação da API

- **Base URL**: `https://api.deezer.com`
- **Autenticação**: Não requerida para endpoints públicos
- **Limite de Taxa**: 50 requisições / 5 segundos
- **Formatos**: JSON, XML, JSONP

## Endpoints Utilizados

### 1. Search Track
```
GET /search?q={query}&limit={limit}
```

**Exemplo**:
```
https://api.deezer.com/search?q=Hillsong%20United%20Oceans&limit=1
```

**Resposta**:
```json
{
  "data": [
    {
      "id": 123456,
      "title": "Oceans (Where Feet May Fail)",
      "duration": 530,
      "preview": "https://cdns-preview-x.dzcdn.net/stream/...",
      "artist": {
        "id": 789,
        "name": "Hillsong UNITED",
        "picture": "https://..."
      },
      "album": {
        "id": 456,
        "title": "Zion",
        "cover": "https://..."
      }
    }
  ],
  "total": 42
}
```

### 2. Get Track
```
GET /track/{id}
```

Retorna informações completas de uma faixa específica.

## Implementação

### Arquivo: `src/services/deezerPublicApi.ts`

```typescript
export class DeezerPublicApi {
  static BASE_URL = 'https://api.deezer.com'
  
  // Busca tracks
  static async searchTrack(query: string, limit: number = 5)
  
  // Busca track específico por ID
  static async getTrack(trackId: number)
  
  // Busca apenas preview URL
  static async getPreviewUrl(artist: string, title: string)
  
  // Busca informações completas
  static async getTrackInfo(artist: string, title: string)
  
  // Valida preview URL
  static async validatePreviewUrl(previewUrl: string)
}
```

## Integração no ChordDetector

### Fluxo:

1. **Componente carrega** → verifica se há `musicData.audioUrl`
2. **Se não houver audioUrl** → chama `DeezerPublicApi.getPreviewUrl()`
3. **API retorna preview URL** → define como `url` do player
4. **ReactPlayer carrega preview** → análise em tempo real começa

### Código:

```typescript
useEffect(() => {
  const fetchDeezerPreview = async () => {
    if (!musicData?.musicTitle || !musicData?.artist) return;
    
    // Se não tem audioUrl, busca na API
    setLoadingDeezer(true);
    
    const previewUrl = await DeezerPublicApi.getPreviewUrl(
      musicData.artist,
      musicData.musicTitle
    );
    
    if (previewUrl) {
      setUrl(previewUrl);
    }
    
    setLoadingDeezer(false);
  };
  
  fetchDeezerPreview();
}, [musicData]);
```

## Vantagens

✅ **Sem CORS**: API pública não tem restrições CORS
✅ **Sem Autenticação**: Não precisa OAuth ou API key
✅ **Rápido**: Resposta direta em JSON
✅ **Confiável**: URLs de preview funcionam consistentemente
✅ **Qualidade**: MP3 30s em qualidade razoável

## Limitações

⚠️ **30 segundos**: Previews têm duração limitada
⚠️ **Taxa**: Máximo 50 requests por 5 segundos
⚠️ **Disponibilidade**: Nem todas músicas têm preview
⚠️ **CORS Fallback**: Usa proxy se API falhar

## Logs de Debug

```javascript
// Quando busca preview
🔍 Buscando no Deezer: Hillsong United Oceans
✅ Resultados do Deezer: 5
🎵 Preview encontrado: https://cdns-preview-x.dzcdn.net/...

// Em caso de erro
❌ Erro ao buscar no Deezer: Network error
🔄 Tentando com proxy CORS...
```

## Testando

1. Abra o Detector de Acordes com uma música
2. Verifique o console para ver:
   - `🔍 Buscando preview na API pública do Deezer...`
   - `✅ Preview do Deezer encontrado: [URL]`
3. Confirme que o player carrega o áudio
4. Verifique se RMS > 0 nos logs do Meyda

## Fallback

Se a API do Deezer falhar:
1. Tenta com proxy CORS (`allorigins.win`)
2. Se falhar, usa `videoUrl` (YouTube)
3. Se falhar, usa simulação manual

## Próximos Passos

- [ ] Cache de previews para evitar requisições repetidas
- [ ] Retry automático com backoff exponencial
- [ ] Pré-carregamento de previews na página de detalhes
- [ ] Validação de preview antes de usar
- [ ] Tratamento de rate limiting (429)
