# 🔧 Troubleshooting - Busca de Músicas

## Problema: "Nenhum artista/música encontrado"

### ✅ Solução Rápida

Abra o **Console do Navegador** (F12) e veja os logs detalhados:

1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Tente fazer uma busca novamente
4. Verifique as mensagens com emojis:
   - 🔍 = Busca iniciada
   - 📡 = URL da requisição
   - 📥 = Status da resposta
   - ✅ = Sucesso
   - ❌ = Erro

### 🔍 Diagnósticos Possíveis

#### 1. Erro de CORS
```
❌ Erro: CORS policy
```

**Solução:**
O sistema tentará automaticamente usar um proxy CORS. Se não funcionar, você pode ativar manualmente:

```javascript
// Abra o Console do navegador (F12) e cole:
window.MusicApiService = require('./services/musicApiService').MusicApiService;
MusicApiService.setUseCorsProxy(true);
```

#### 2. Erro de Rede
```
❌ Failed to fetch
❌ NetworkError
```

**Causas:**
- Sem conexão com internet
- Firewall bloqueando
- Proxy corporativo

**Soluções:**
- Verifique sua conexão
- Tente em outra rede
- Desative VPN/Proxy temporariamente

#### 3. API Deezer Offline
```
📥 Response status: 500
📥 Response status: 503
```

**Solução:**
A API do Deezer pode estar temporariamente indisponível. Aguarde alguns minutos e tente novamente.

#### 4. Nenhum Resultado Encontrado
```
⚠️ Nenhum resultado encontrado
```

**Causas:**
- Nome muito específico
- Artista não cadastrado no Deezer
- Erro de digitação

**Soluções:**
- Use termos mais genéricos
- Tente variações do nome
- Busque por artista primeiro, depois escolha a música

### 🧪 Teste Manual da API

Teste se a API Deezer está respondendo:

1. **Abra uma nova aba** no navegador
2. **Cole esta URL:**
```
https://api.deezer.com/search?q=aline%20barros&limit=5
```
3. Você deve ver um JSON com resultados

Se aparecer um JSON, a API está funcionando!

### 🔄 Alternativas de Busca

#### Busca por Música Específica
```
✅ "bondade de deus"
✅ "essencia da adoracao"
✅ "ressuscita-me aline barros"
```

#### Busca por Artista
```
✅ "aline barros"
✅ "fernanda brum"
✅ "ministério zoe"
```

### 📱 Problemas Específicos por Artista

#### Artistas Gospel Brasileiros
Alguns artistas gospel podem ter menos presença no Deezer internacional. Tente:

1. **Buscar por música:** Geralmente funciona melhor
2. **Variações do nome:**
   - "Aline Barros" vs "Aline Barros Valadão"
   - "Fernandinho" vs "Fernandinho Worship"

#### Artistas Independentes
Se o artista for muito novo ou independente, pode não estar no Deezer.

**Alternativa:** Use "Cadastrar manualmente" (funcionalidade futura)

### 🛠️ Configurações Avançadas

#### Forçar uso do CORS Proxy

Edite o arquivo `src/services/musicApiService.ts`:

Linha ~25:
```typescript
private useCorsProxy = false; // Mude para true
```

#### Aumentar Timeout

Se a conexão for lenta, adicione timeout:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

const response = await fetch(url, {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
  signal: controller.signal
});

clearTimeout(timeoutId);
```

### 📊 Status da API

| Serviço | Status | URL Teste |
|---------|--------|-----------|
| Deezer API | ✅ Ativo | https://api.deezer.com/search?q=test |
| Cifra Club | ✅ URLs Geradas | N/A (não usa API) |
| YouTube | ⏳ Requer Key | https://developers.google.com/youtube/v3 |

### 🆘 Último Recurso

Se nada funcionar:

1. **Limpe o cache do navegador:**
   - Chrome: Ctrl+Shift+Delete → "Cached images and files"
   - Edge: Ctrl+Shift+Delete → "Cached data and files"

2. **Modo Anônimo/Privado:**
   - Teste no modo anônimo para descartar extensões

3. **Outro Navegador:**
   - Chrome, Edge, Firefox

4. **Reporte o Bug:**
   - Anote a mensagem de erro exata
   - Tire screenshot do Console (F12)
   - Informe o artista/música que tentou buscar

### 📞 Contato para Suporte

Se o problema persistir, envie:
- Screenshot do erro no Console (F12)
- Nome do artista/música pesquisado
- Navegador e versão
- Sistema operacional

---

**Dica:** Na dúvida, sempre abra o Console (F12) e veja os logs detalhados!
