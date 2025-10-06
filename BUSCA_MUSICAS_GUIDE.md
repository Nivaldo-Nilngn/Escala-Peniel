# Guia de Busca de Músicas - Sistema de Escalas Peniel

## 📚 Visão Geral

O sistema agora conta com integração de APIs de música para facilitar o cadastro de músicas no repertório do Ministério de Louvor. Não é mais necessário copiar e colar links manualmente!

## 🎵 Funcionalidades

### Integrações Disponíveis

1. **Deezer API** ✅ (Principal)
   - Busca de músicas por título, artista ou álbum
   - Busca de artistas e suas músicas
   - Informações completas: duração, álbum, capa
   - Preview de áudio disponível
   - **Não requer API Key** - funciona imediatamente!

2. **Cifra Club** ✅ (Geração automática de URLs)
   - URLs de cifras geradas automaticamente
   - Baseado no nome do artista e da música

3. **YouTube** ⏳ (Preparado para uso)
   - Estrutura pronta, requer API Key
   - Instruções incluídas no código

4. **Spotify** ⏳ (Futuro)
   - Estrutura preparada para expansão

## 🚀 Como Usar

### 1. Acessar o Módulo de Louvor

1. Navegue até **Louvor** no menu principal
2. Clique na aba **"Repertório"**

### 2. Adicionar Nova Música

1. Clique no botão **"+"** (FAB) no canto inferior direito
2. Um diálogo de busca será aberto

### 3. Buscar Música

#### Opção A: Buscar por Música
1. Mantenha a aba **"Buscar Música"** selecionada
2. Digite no campo de busca:
   - Nome da música: `"Bondade de Deus"`
   - Artista: `"Aline Barros"`
   - Combinação: `"Essência da Adoração Gabi Sampaio"`
3. Aguarde os resultados (busca automática após 0.8s)
4. Clique na música desejada para adicionar

#### Opção B: Buscar por Artista
1. Clique na aba **"Buscar por Artista"**
2. Digite o nome do artista ou banda:
   - `"Fernanda Brum"`
   - `"Ministério Zoe"`
   - `"Aline Barros"`
3. Clique no artista desejado
4. Visualize as músicas mais populares do artista
5. Clique na música desejada para adicionar

### 4. Informações Incluídas Automaticamente

Ao adicionar uma música via API, o sistema preenche:

- ✅ **Título da música**
- ✅ **Nome do artista**
- ✅ **Álbum** (quando disponível)
- ✅ **Duração** (formatado em MM:SS)
- ✅ **Imagem de capa**
- ✅ **Link para Cifra Club** (gerado automaticamente)
- ✅ **Link para Deezer** (quando aplicável)
- ✅ **Link para YouTube** (busca gerada automaticamente)
- ✅ **Preview de áudio** (quando disponível)

### 5. Completar Informações

Após adicionar, você pode editar a música para incluir:
- **Tom da música** (Ex: C, D, Em, etc.)
- **BPM** (batidas por minuto)
- **Categoria** (Louvor, Adoração, Congregacional, etc.)
- **Tags** (Ex: animada, calma, reverência)
- **Observações**

## 🎯 Exemplos de Busca

### Buscas Recomendadas

```
✅ "Bondade de Deus"
✅ "Essência da Adoração"
✅ "Aline Barros Ressuscita-me"
✅ "Fernanda Brum"
✅ "Ministério Zoe"
```

### Dicas para Melhores Resultados

1. **Seja específico**: Inclua artista + música para resultados precisos
2. **Use termos em português**: A API Deezer suporta bem buscas em PT-BR
3. **Artistas populares**: Maior chance de encontrar informações completas
4. **Busca por artista**: Use quando quiser explorar o repertório de um artista

## 📱 Interface

### Tela de Busca

```
┌─────────────────────────────────────┐
│  Adicionar Música              [X]  │
├─────────────────────────────────────┤
│  [Buscar Música] [Buscar Artista]  │
│                                     │
│  🎵 Busque pelo título...           │
│  Integrações: Deezer, Cifra Club    │
│                                     │
│  🔍 [Campo de busca]          [⟳]  │
│                                     │
│  Resultados:                        │
│  ┌───────────────────────────────┐ │
│  │ 🎵 Bondade de Deus            │ │
│  │    Isadora Pompeo              │ │
│  │    Tom da Queda | ⏱ 4:23      │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

## 🔧 Estrutura Técnica

### Arquivos Criados

```
src/
├── services/
│   └── musicApiService.ts          # Integração com APIs
├── components/
│   └── MusicSearchDialog.tsx       # Dialog de busca
└── types/
    └── music.ts                    # Tipos TypeScript
```

### APIs e Endpoints

#### Deezer API
- Base: `https://api.deezer.com`
- Busca de música: `/search?q={query}`
- Busca de artista: `/search/artist?q={query}`
- Top tracks: `/artist/{id}/top`

#### Cifra Club
- Base: `https://www.cifraclub.com.br`
- Padrão: `/{artista}/{musica}/`

## 🎨 Características da Interface

### Busca Inteligente
- ⚡ **Debounce automático**: Busca inicia 0.8s após parar de digitar
- 🔄 **Loading indicator**: Feedback visual durante busca
- ❌ **Mensagens de erro**: Feedback claro quando não há resultados

### Cards de Resultado
- 🖼️ **Imagem de capa**: Visual atrativo
- 🏷️ **Badges**: Fonte (Deezer), duração, álbum
- 👆 **Clique para adicionar**: Interface intuitiva
- 📱 **Responsivo**: Funciona em mobile e desktop

### Ícones e Visual
- 🎵 **MusicNote**: Ícone de música
- 👤 **PersonSearch**: Busca de artista
- ⏱️ **AccessTime**: Duração
- 💿 **Album**: Nome do álbum

## 🔐 Segurança e Performance

### Cache e Otimização
- ✅ Debounce para reduzir chamadas à API
- ✅ Tratamento de erros robusto
- ✅ Fallbacks para dados ausentes

### CORS e API
- ✅ Deezer API: Suporta CORS nativamente
- ⚠️ YouTube API: Requer configuração de API Key
- ✅ Cifra Club: URLs geradas localmente (sem chamadas)

## 📝 Próximos Passos

### Para Desenvolvedores

1. **Adicionar YouTube API**
   ```typescript
   // Obtenha sua chave em: https://console.developers.google.com/
   // Adicione em .env:
   REACT_APP_YOUTUBE_API_KEY=sua_chave_aqui
   ```

2. **Persistência no Firebase**
   ```typescript
   // Implemente musicService.ts similar aos outros services
   await MusicService.addMusic(departmentId, musicData);
   ```

3. **Edição de Músicas**
   - Criar página `MusicaDetalhes.tsx` completa
   - Permitir edição de tom, BPM, categoria
   - Adicionar letra completa

4. **Recursos Adicionais**
   - Player de preview integrado
   - Playlist builder
   - Exportar setlist
   - Compartilhar repertório

## 🐛 Troubleshooting

### Erro: "Nenhuma música encontrada"
- ✅ Verifique a ortografia
- ✅ Tente termos mais genéricos
- ✅ Use busca por artista

### Erro: "Erro ao buscar"
- ✅ Verifique conexão com internet
- ✅ API Deezer pode estar indisponível (raro)
- ✅ Tente novamente em alguns segundos

### Links não funcionam
- ✅ Cifra Club: URL gerada pode não existir (música não cadastrada)
- ✅ YouTube: Link leva à busca, não ao vídeo específico
- ✅ Verifique manualmente e atualize se necessário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte os comentários no código
3. Entre em contato com o desenvolvedor

---

**Versão:** 1.0
**Última atualização:** Outubro 2025
**Desenvolvido para:** Igreja Peniel - Ministério de Louvor
