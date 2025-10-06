# 🐛 Debug: Detector de Acordes

## Logs Esperados (ordem):

### 1. Inicialização
```
✅ Meyda + Web Audio API prontos
```

### 2. Ao clicar Play
```
🎵 Elemento de áudio encontrado: VIDEO (ou AUDIO)
✅ Análise em tempo real iniciada
🧪 Testando Meyda... Analisador rodando? [object]
```

### 3. Durante reprodução (a cada frame)
```
🎵 Features recebidas: { rms: 0.05, chromaPeaks: 0.8 }
🎸 Acorde calculado: C notas: ['C', 'E', 'G']
✅ Acorde detectado: C em 3.2 s
➕ Adicionando acorde: C
```

---

## Problemas Comuns:

### ❌ "Elemento de áudio não encontrado"
**Causa**: ReactPlayer não renderizou ainda  
**Solução**: Delay de 100ms implementado

### ❌ "Erro ao criar MediaElementSource"
**Causa**: Tentando reconectar ao mesmo elemento  
**Solução**: Flag `audioSourceConnectedRef` implementada

### ❌ Sem áudio
**Causa**: Source não conectado ao destination  
**Solução**: `source.connect(audioContextRef.current.destination)`

### ❌ "Features inválidas"
**Causa**: Meyda não consegue extrair chroma  
**Solução**: Verificar se bufferSize é adequado (4096)

### ❌ "RMS muito baixo"
**Causa**: Áudio muito silencioso ou threshold alto  
**Solução**: Ajustar threshold de 0.1 para 0.05

---

## Console Commands para Debug:

### Ver estado do Meyda:
```javascript
// No console do navegador:
window.meyda = meydaAnalyzerRef.current
console.log(window.meyda)
```

### Testar manualmente:
```javascript
// Pegar elemento de áudio
const audio = document.querySelector('audio, video')
console.log('Audio element:', audio)
console.log('Is playing?', !audio.paused)
console.log('Current time:', audio.currentTime)
```

### Verificar AudioContext:
```javascript
const ctx = audioContextRef.current
console.log('State:', ctx.state) // deve ser 'running'
console.log('Sample rate:', ctx.sampleRate)
```

---

## Checklist de Verificação:

- [ ] Log "✅ Meyda + Web Audio API prontos" aparece?
- [ ] Log "🎵 Elemento de áudio encontrado" aparece?
- [ ] Log "✅ Análise em tempo real iniciada" aparece?
- [ ] Log "🎵 Features recebidas" aparece repetidamente?
- [ ] Áudio está tocando?
- [ ] Badge "X acordes detectados" aparece?
- [ ] Acordes aparecem na timeline?

---

## Se nada funcionar:

### Ativar análise manual:
Comentar linha que chama `startRealtimeAnalysis()` e descomentar:
```typescript
startManualAnalysis(); // Força uso do fallback
```

Isso vai gerar acordes simulados a cada 3 segundos para testar a UI.
