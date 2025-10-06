# 🎵 Integração Essentia.js + Deezer API

## ✅ IMPLEMENTAÇÃO COMPLETA

### O que foi feito:

1. **Instalação do Essentia.js**
   - ✅ Pacote instalado via npm
   - ✅ Tipos personalizados criados em `src/types/essentia.d.ts`

2. **Integração com Deezer API**
   - ✅ Áudio carregado diretamente do Deezer (preview de 30 segundos)
   - ✅ Função `loadAndAnalyzeDeezerAudio()` implementada
   - ✅ Conversão automática de estéreo para mono

3. **Análise com Essentia.js**
   - ✅ HPCP (Harmonic Pitch Class Profile) para detecção de acordes
   - ✅ PitchYinFFT para detecção de nota fundamental
   - ✅ KeyExtractor para detecção de tonalidade
   - ✅ Windowing + Spectrum para análise espectral

4. **Detecção de Acordes Avançada**
   - ✅ Detecção baseada em HPCP (12 notas cromáticas)
   - ✅ Identificação de tipos de acorde:
     - Maior, Menor
     - 7, m7, maj7
     - dim, aug
     - sus4, sus2
   - ✅ Confiança baseada em pitch confidence (>70%)
   - ✅ Filtragem de acordes duplicados (>2 segundos)

5. **UI/UX**
   - ✅ Indicador de progresso visual
   - ✅ Mensagem "🔍 Analisando com Essentia.js + Deezer API..."
   - ✅ Porcentagem de progresso em tempo real
   - ✅ Mantém interface moderna e responsiva

---

## 🔬 Como funciona:

### Fluxo de Análise:

```
1. Usuário clica em "▶️ Play"
   ↓
2. loadAndAnalyzeDeezerAudio(audioUrl)
   ↓
3. Fetch do áudio do Deezer
   ↓
4. Decodificação com AudioContext
   ↓
5. Conversão para Mono (se necessário)
   ↓
6. analyzeWithEssentia(audioData, sampleRate, duration)
   ↓
7. Para cada frame (4096 samples, hop 2048):
   - Windowing (Hann)
   - Spectrum (FFT)
   - HPCP (12 notas cromáticas)
   - PitchYinFFT (nota fundamental)
   - detectChordFromHPCP()
   ↓
8. Acordes detectados mostrados na UI
```

### Algoritmos Essentia.js utilizados:

- **Windowing**: Aplica janela de Hann para reduzir artefatos do FFT
- **Spectrum**: Calcula espectro de frequências
- **HPCP**: Extrai perfil harmônico (12 classes de pitch)
- **PitchYinFFT**: Detecta frequência fundamental com alta precisão
- **KeyExtractor**: Detecta tonalidade da música

### Detecção de Acordes:

O HPCP retorna um array de 12 valores representando a energia de cada nota cromática:
```
[C, C#, D, D#, E, F, F#, G, G#, A, A#, B]
```

Algoritmo:
1. Encontra picos acima de 50% do máximo
2. Pega nota fundamental do PitchYinFFT
3. Calcula intervalos relativos
4. Compara com padrões de acordes
5. Retorna melhor match (>60% de similaridade)

---

## 🎹 Padrões de Acordes:

| Tipo | Intervalos | Exemplo (C) |
|------|-----------|-------------|
| Maior | 0, 4, 7 | C, E, G |
| Menor | 0, 3, 7 | C, Eb, G |
| 7 | 0, 4, 7, 10 | C, E, G, Bb |
| m7 | 0, 3, 7, 10 | C, Eb, G, Bb |
| maj7 | 0, 4, 7, 11 | C, E, G, B |
| dim | 0, 3, 6 | C, Eb, Gb |
| aug | 0, 4, 8 | C, E, G# |
| sus4 | 0, 5, 7 | C, F, G |
| sus2 | 0, 2, 7 | C, D, G |

---

## 📊 Parâmetros de Análise:

```typescript
const frameSize = 4096;     // Tamanho da janela (boa resolução)
const hopSize = 2048;       // Sobreposição de 50%
const threshold = 0.5;      // 50% do pico máximo para HPCP
const confidence = 0.7;     // 70% confiança mínima no pitch
const minDuration = 2;      // Mínimo 2s entre acordes iguais
```

---

## 🚀 Como usar:

1. **Acessar página de músicas**
2. **Clicar em música** → Ver detalhes
3. **Clicar em "🤖 Cifras com IA (Detector Interno)"**
4. **Clicar em ▶️ Play**
5. **Aguardar análise** (progresso visível)
6. **Acordes aparecem automaticamente** na timeline e display gigante

---

## 🎯 Vantagens da nova abordagem:

### ❌ Método Antigo (FFT simplificado):
- Usava análise de frequência básica
- Muitos falsos positivos
- Baixa precisão em músicas complexas
- Não considerava harmônicos

### ✅ Método Novo (Essentia.js + HPCP):
- Análise espectral profissional
- HPCP considera harmônicos e timbre
- Pitch detection com YinFFT (state-of-the-art)
- Detecção de tonalidade
- Confiança baseada em múltiplos fatores
- Mesma tecnologia de apps profissionais

---

## 🔧 Arquivos modificados:

1. **src/components/ChordDetector.tsx**
   - Removida lógica FFT simplificada
   - Adicionado `loadAndAnalyzeDeezerAudio()`
   - Adicionado `analyzeWithEssentia()`
   - Adicionado `detectChordFromHPCP()`
   - Adicionado `identifyChordType()`
   - Indicador de progresso visual

2. **src/types/essentia.d.ts** (NOVO)
   - Definições TypeScript completas para Essentia.js
   - Interfaces para todos os algoritmos
   - Return types documentados

---

## 📚 Referências:

- **Essentia.js**: https://mtg.github.io/essentia.js/
- **HPCP Paper**: https://mtg.upf.edu/node/1849
- **Pitch YinFFT**: https://essentia.upf.edu/reference/std_PitchYinFFT.html
- **Deezer API**: https://developers.deezer.com/api

---

## 🐛 Troubleshooting:

### Análise não inicia:
- Verificar se Essentia.js carregou: `essentiaReady === true`
- Verificar console do navegador para erros
- Verificar se `musicData.audioUrl` existe

### Acordes incorretos:
- Ajustar `threshold` (linha 211)
- Ajustar `confidence` (linha 229)
- Verificar qualidade do áudio do Deezer

### Performance lenta:
- Ajustar `hop size` (atualmente a cada 5 frames)
- Reduzir `frameSize` para análise mais rápida

---

## 🎉 Resultado Final:

**Detector de Acordes Profissional** integrado ao sistema, usando:
- ✅ Deezer API para áudio de alta qualidade
- ✅ Essentia.js para análise de ponta
- ✅ Interface moderna e responsiva
- ✅ Detecção em tempo real
- ✅ 9 tipos de acordes suportados
- ✅ Detecção de tonalidade
- ✅ Indicador de confiança

**Está pronto para uso em produção!** 🚀
