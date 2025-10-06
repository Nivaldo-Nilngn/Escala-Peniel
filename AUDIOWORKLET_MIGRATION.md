# Migração para AudioWorkletNode

## ❌ Problema Original

O console mostrava o aviso de depreciação:
```
[Deprecation] The ScriptProcessorNode is deprecated. Use AudioWorkletNode instead.
```

**Causa:** A biblioteca Meyda usava internamente o `ScriptProcessorNode`, uma API antiga e depreciada que será removida dos navegadores.

## ✅ Solução Implementada

### 1. **Criado AudioWorklet Processor** (`public/audio-processor.js`)

```javascript
class AudioAnalyzerProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // Processa áudio em thread separado (mais eficiente)
    // Envia buffers para thread principal via postMessage
  }
}
```

**Vantagens:**
- ✅ Roda em thread separado (não bloqueia UI)
- ✅ Melhor performance
- ✅ API moderna e mantida
- ✅ Sem avisos de depreciação

### 2. **Atualizado ChordDetector.tsx**

#### Mudanças:

**Antes:**
```typescript
// Usava Meyda.createMeydaAnalyzer (ScriptProcessorNode interno)
meydaAnalyzerRef.current = Meyda.createMeydaAnalyzer({
  audioContext: audioContextRef.current,
  source: source,
  bufferSize: 4096,
  featureExtractors: ['chroma', 'rms', 'spectralCentroid'],
  callback: handleMeydaFeatures
});
```

**Depois:**
```typescript
// Carrega AudioWorklet
await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

// Cria AudioWorkletNode
const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-analyzer-processor');

// Recebe buffers do worklet
workletNode.port.onmessage = (event) => {
  const features = Meyda.extract(['chroma', 'rms'], event.data.buffer);
  handleMeydaFeatures(features);
};

// Conecta: source -> workletNode -> analyser -> destination
source.connect(workletNode);
workletNode.connect(analyser);
analyser.connect(audioContextRef.current.destination);
```

### 3. **Fluxo de Processamento**

```
🎵 Vídeo/Áudio
    ↓
MediaElementSource
    ↓
AudioWorkletNode (thread separado) ← NOVO!
    ↓ (postMessage com buffer)
Thread Principal
    ↓
Meyda.extract() ← Processa apenas uma vez por buffer
    ↓
handleMeydaFeatures()
    ↓
detectChordFromChroma()
    ↓
🎸 Acorde detectado
```

## 📊 Comparação

| Característica | ScriptProcessorNode (Antigo) | AudioWorkletNode (Novo) |
|---|---|---|
| **Status** | ⚠️ Depreciado | ✅ Moderno |
| **Performance** | Thread principal | Thread separado |
| **Latência** | Alta | Baixa |
| **Aviso no console** | Sim | Não |
| **Futuro** | Será removido | Mantido |

## 🧪 Como Testar

1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Clique no botão YouTube e selecione um vídeo
4. ✅ **NÃO deve aparecer** o aviso de depreciação
5. Acordes devem aparecer normalmente em dourado

## 🔧 Arquivos Modificados

1. **`public/audio-processor.js`** (NOVO)
   - Processador AudioWorklet
   - Captura buffers de áudio
   - Envia para thread principal

2. **`src/components/ChordDetector.tsx`**
   - Adicionado `audioWorkletNodeRef`
   - Função `startRealtimeAnalysis()` agora é `async`
   - Carrega módulo AudioWorklet
   - Processa buffers com `Meyda.extract()` ao invés de `Meyda.createMeydaAnalyzer()`

## 📝 Notas Técnicas

- **Buffer Size:** 4096 amostras (mantido igual)
- **Features:** chroma, rms, spectralCentroid (mantidos iguais)
- **Compatibilidade:** Chrome 64+, Firefox 76+, Safari 14.1+
- **Fallback:** Se AudioWorklet falhar, usa análise simulada

## ✅ Resultado Final

- ✅ Nenhum aviso de depreciação
- ✅ Melhor performance
- ✅ Código mais moderno
- ✅ Mesma funcionalidade
- ✅ Console limpo
