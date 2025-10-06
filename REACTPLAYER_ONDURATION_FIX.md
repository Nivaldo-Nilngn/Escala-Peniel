# Correção: ReactPlayer onDuration Warning

## ❌ Problema Original

```
Unknown event handler property `onDuration`. It will be ignored.
```

**Causa:** A propriedade `onDuration` não é reconhecida como um evento válido do ReactPlayer na versão 3.x.

## ✅ Solução Implementada

### Antes (INCORRETO):

```typescript
<ReactPlayer
  onProgress={(state) => setCurrentTime(state.playedSeconds)}
  onDuration={(duration: number) => setDuration(duration)}  // ❌ Não existe
/>
```

### Depois (CORRETO):

```typescript
<ReactPlayer
  onProgress={(state) => {
    setCurrentTime(state.playedSeconds);
    // Atualiza duração via ref
    if (playerRef.current) {
      const dur = playerRef.current.getDuration();
      if (dur && dur !== duration) {
        setDuration(dur);
      }
    }
  }}
  onReady={() => {
    // Obtém duração quando o player está pronto
    if (playerRef.current) {
      const dur = playerRef.current.getDuration();
      if (dur) {
        setDuration(dur);
      }
    }
  }}
/>
```

## 📝 Como Funciona Agora

1. **`onReady`**: Dispara quando o player termina de carregar
   - Chama `playerRef.current.getDuration()`
   - Define a duração inicial

2. **`onProgress`**: Dispara durante a reprodução (~1 vez por segundo)
   - Atualiza o tempo atual (`playedSeconds`)
   - Também verifica a duração via `getDuration()` (para casos onde não estava disponível no `onReady`)

## 🎯 Vantagens da Nova Abordagem

- ✅ Usa métodos oficiais do ReactPlayer
- ✅ Mais confiável (funciona com YouTube, SoundCloud, etc.)
- ✅ Sem avisos no console
- ✅ Compatível com ReactPlayer 3.x

## 📚 Métodos do ReactPlayer Disponíveis

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `getDuration()` | `number` | Duração total do vídeo (segundos) |
| `getCurrentTime()` | `number` | Tempo atual (segundos) |
| `getSecondsLoaded()` | `number` | Quantidade carregada |
| `getInternalPlayer()` | `object` | Player interno (YouTube API, etc.) |

## 🧪 Para Testar

```powershell
npm start
```

1. Abra DevTools (F12) → Console
2. Clique no botão YouTube
3. Selecione um vídeo
4. ✅ **O aviso "Unknown event handler" não deve mais aparecer**
5. A duração do vídeo deve aparecer corretamente

## 🔗 Referências

- [ReactPlayer API](https://github.com/cookpete/react-player#api)
- [ReactPlayer Props](https://github.com/cookpete/react-player#props)

---

**Arquivo modificado:** `src/components/ChordDetector.tsx`  
**Linhas alteradas:** ~1030-1050
