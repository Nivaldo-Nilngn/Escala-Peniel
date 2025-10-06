# 🎸 Detector de Acordes Interno - Similar ao Chordify

## 🎯 O Que Foi Criado

Em vez de abrir o site **Chordify** externamente, agora o sistema tem seu **próprio detector de acordes interno**, similar ao Chordify e outros apps de detecção musical.

## ✨ Funcionalidades

### 1. **Integração com Músicas do Repertório**
Quando você clica em **"🤖 Cifras com IA (Detector Interno)"** nos detalhes de uma música:
- ✅ Abre o detector **dentro do sistema**
- ✅ Carrega automaticamente a música selecionada
- ✅ Mostra título e artista na tela
- ✅ Usa o link do YouTube ou áudio do Deezer

### 2. **Detector de Acordes em Tempo Real**
Similar aos apps das imagens que você enviou:

#### 📱 Recursos Principais:
- **Player Integrado**: YouTube ou arquivos locais
- **Timeline de Acordes**: Acordes detectados aparecem na linha do tempo
- **Sincronização**: Acordes mudam conforme a música toca
- **Upload de Arquivo**: Suporta MP3, WAV, OGG
- **Controles Completos**: Play, pause, volume, seek

#### 🎵 Interface Visual:
```
┌─────────────────────────────────────────┐
│  🎶 Detector de Acordes com IA          │
├─────────────────────────────────────────┤
│  ✅ Bondade de Deus                     │
│     Por: Isaías Saad                    │
├─────────────────────────────────────────┤
│  [Player de Vídeo/Áudio]                │
│  ▶️ ⏸️ ⏮️ ⏭️ 🔊────────                   │
├─────────────────────────────────────────┤
│  📁 Upload de Arquivo                   │
├─────────────────────────────────────────┤
│           🎵 ACORDE ATUAL               │
│              Sol / G                    │
├─────────────────────────────────────────┤
│  Timeline:                              │
│  [Sol] [Do] [Re] [Mi] [Sol] ...        │
└─────────────────────────────────────────┘
```

### 3. **Análise de Áudio**

#### Métodos de Análise:

**Opção A: YouTube (Limitado)**
- CORS pode bloquear análise em tempo real
- Usa Web Audio API quando possível

**Opção B: Upload de Arquivo (Recomendado)**
- Análise completa do arquivo
- Detecta acordes a cada 2 segundos
- Cria timeline completa

**Tecnologias Usadas**:
- ✅ **Web Audio API**: Análise FFT
- ✅ **Tonal.js**: Teoria musical (notas → acordes)
- ✅ **React Player**: Reprodução YouTube/local
- ⚠️ **Essentia.js**: Pode ser adicionado para análise avançada

## 🔄 Fluxo de Uso

### Caminho 1: A partir do Repertório
```
1. Louvor > Repertório
2. Clique em uma música
3. Veja os detalhes
4. Role até "Referências"
5. Clique em "🤖 Cifras com IA (Detector Interno)"
6. → Abre detector com a música já carregada
```

### Caminho 2: Acesso Direto
```
1. Menu lateral > "🎵 Detector de Acordes IA"
2. Faça upload de arquivo MP3/WAV
3. Ou cole URL do YouTube
4. → Análise automática
```

## 📊 Comparação: Chordify vs Sistema Interno

| Recurso | Chordify (Externo) | Detector Interno |
|---------|-------------------|------------------|
| Detecção de Acordes | ✅ Avançada | ✅ Simplificada |
| Interface | Site externo | ✅ Dentro do sistema |
| Upload de arquivo | ✅ | ✅ |
| YouTube | ✅ | ✅ (limitado) |
| Timeline visual | ✅ | ✅ |
| Integração com repertório | ❌ | ✅ |
| Grátis | Limitado | ✅ Totalmente |
| Offline | ❌ | ✅ Com arquivos |

## 🎨 Visual Similar aos Apps Mostrados

Baseado nas imagens que você enviou, o detector tem:

### 🎹 Imagem 1 (Chordify-like):
- ✅ Player de vídeo do YouTube
- ✅ Timeline com acordes
- ✅ Diagrama de acordes (pode ser adicionado)
- ✅ Controles de reprodução
- ✅ BPM e escala

### 📱 Imagem 2 (App Mobile):
- ✅ Player centralizado
- ✅ Acordes destacados (E7, F#)
- ✅ Diagramas de piano/teclado (pode ser adicionado)
- ✅ Controles de pitch e speed (pode ser adicionado)

## 🚀 Melhorias Futuras (Opcional)

### Fase 1 (Atual) ✅
- Player integrado
- Detecção básica de acordes
- Timeline sincronizada
- Upload de arquivos

### Fase 2 (Futuro)
- [ ] Diagramas de acordes visuais
- [ ] Diagramas de piano/teclado
- [ ] Controle de pitch (transpose)
- [ ] Controle de velocidade
- [ ] Detecção mais precisa com Essentia.js
- [ ] Exportar cifra gerada
- [ ] Salvar acordes no Firebase

### Fase 3 (Avançado)
- [ ] Machine Learning para melhor detecção
- [ ] Letra sincronizada com acordes
- [ ] Edição manual de acordes
- [ ] Compartilhar cifras geradas

## 💡 Como Funciona a Detecção

### 1. **Captura de Áudio**
```typescript
// Web Audio API analisa o stream
audioContext.createAnalyser()
analyser.getByteFrequencyData(dataArray)
```

### 2. **Extração de Frequências**
```typescript
// FFT (Fast Fourier Transform)
for (let i = 0; i < bufferLength; i++) {
  if (dataArray[i] > threshold) {
    frequency = (i * sampleRate) / bufferLength
    frequencies.push(frequency)
  }
}
```

### 3. **Conversão Frequência → Nota**
```typescript
// Fórmula matemática
const noteNum = 12 * Math.log2(frequency / 440) + 69
const noteName = notes[noteNum % 12] // C, D, E, F, G, A, B
```

### 4. **Detecção de Acordes**
```typescript
// Tonal.js agrupa notas
const possibleChords = ['C', 'Cm', 'C7', 'Cmaj7', ...]
const bestMatch = Chord.detect(notes) // Retorna acorde mais provável
```

### 5. **Exibição na Timeline**
```typescript
const chord = { 
  chord: 'G', 
  timestamp: 15.5, // 15.5 segundos
  confidence: 0.8 
}
```

## 📚 Vantagens do Sistema Interno

1. **Integração Total**: Música do repertório → Detector em 1 clique
2. **Sem Sair do Sistema**: Tudo dentro da sua aplicação
3. **Personalização**: Pode adaptar para suas necessidades
4. **Dados Privados**: Nada enviado para servidores externos
5. **Grátis**: Sem limitações de uso
6. **Aprendizado**: Você controla todo o código

## 🎓 Referências Técnicas

- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Tonal.js**: https://github.com/tonaljs/tonal
- **React Player**: https://github.com/cookpete/react-player
- **Essentia.js**: https://mtg.github.io/essentia.js/

---

## ✅ Resultado Final

Agora quando você clicar em **"🤖 Cifras com IA (Detector Interno)"**:

1. ✅ Abre página **dentro do sistema** (não abre site externo)
2. ✅ Música já está carregada automaticamente
3. ✅ Interface similar ao Chordify/ChordAi
4. ✅ Detecção de acordes em tempo real
5. ✅ Timeline visual com todos os acordes

**É como ter o Chordify integrado no seu próprio sistema! 🎸🎵**
