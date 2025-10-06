# Correção: Hydration Error - <div> dentro de <p>

## ❌ Problema Original

```
In HTML, <div> cannot be a descendant of <p>.
This will cause a hydration error.

<p> cannot contain a nested <div>.
```

**Causa:** No modal de busca do YouTube, o componente `ListItemText` com a prop `secondary` criava um `<Typography variant="body2">` que renderiza como `<p>`, e dentro dele colocamos um `<Box>` que renderiza como `<div>`.

## 🔍 Stack Trace

```
<p className="MuiTypography-root MuiTypography-body2 MuiListItemText-secondary">
  <div className="MuiBox-root css-1v02wvo">  ← ❌ ERRO!
    {video.channel} • {video.duration}
  </div>
</p>
```

## ✅ Solução Implementada

### Antes (INCORRETO):

```tsx
<ListItemText
  primary={video.title}
  secondary={
    <Box sx={{ color: 'rgba(255,255,255,0.6)' }}>  {/* ❌ Box = <div> */}
      {video.channel} • {video.duration}
    </Box>
  }
  sx={{ ml: 2 }}
  primaryTypographyProps={{
    sx: { color: 'white', fontWeight: 500 }
  }}
/>
```

**Resultado HTML:**
```html
<div class="MuiListItemText-root">
  <span class="MuiTypography-root">Video Title</span>
  <p class="MuiTypography-root MuiTypography-body2">  ← <p>
    <div class="MuiBox-root">                        ← <div> ❌ ERRO!
      Channel • Duration
    </div>
  </p>
</div>
```

### Depois (CORRETO):

```tsx
<ListItemText
  primary={video.title}
  secondary={`${video.channel} • ${video.duration}`}  {/* ✅ String direta */}
  sx={{ ml: 2 }}
  primaryTypographyProps={{
    sx: { color: 'white', fontWeight: 500 }
  }}
  secondaryTypographyProps={{
    sx: { color: 'rgba(255,255,255,0.6)' }  /* ✅ Estilo via props */}
  }}
/>
```

**Resultado HTML:**
```html
<div class="MuiListItemText-root">
  <span class="MuiTypography-root">Video Title</span>
  <p class="MuiTypography-root MuiTypography-body2">  ← <p>
    Channel • Duration                                ← Texto direto ✅
  </p>
</div>
```

## 📝 Por que isso acontece?

### Regras HTML:

1. **`<p>`** é um elemento de **fluxo de frase** (phrasing content)
2. **`<div>`** é um elemento de **fluxo de conteúdo** (flow content)
3. **`<p>` só pode conter phrasing content** (texto, `<span>`, `<strong>`, etc.)
4. **`<p>` NÃO pode conter `<div>`** (nem outros flow content)

### Componentes MUI:

- `<Typography variant="body2">` → renderiza como `<p>`
- `<Box>` → renderiza como `<div>` (por padrão)
- `ListItemText` com `secondary` → cria `<Typography variant="body2">`

### A Armadilha:

```tsx
<ListItemText 
  secondary={<Box>...</Box>}  // ❌ Box dentro de Typography
/>

// Gera:
<p>
  <div>...</div>  // ❌ INVÁLIDO!
</p>
```

## 🎯 Soluções Alternativas

### Opção 1: String direta (ESCOLHIDA)
```tsx
<ListItemText 
  secondary={`${channel} • ${duration}`}
  secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
/>
```

### Opção 2: Box com component="span"
```tsx
<ListItemText 
  secondary={
    <Box component="span" sx={{ color: 'rgba(255,255,255,0.6)' }}>
      {channel} • {duration}
    </Box>
  }
/>
```

### Opção 3: Fragment com Typography inline
```tsx
<ListItemText 
  secondary={
    <>
      <Typography component="span" color="rgba(255,255,255,0.6)">
        {channel} • {duration}
      </Typography>
    </>
  }
/>
```

### Opção 4: secondaryTypographyProps
```tsx
<ListItemText 
  secondary={`${channel} • ${duration}`}
  secondaryTypographyProps={{
    component: 'div',  // Muda de <p> para <div>
    sx: { color: 'rgba(255,255,255,0.6)' }
  }}
/>
```

## 📚 Elementos HTML Permitidos

| Pai | Filhos Permitidos | Filhos NÃO Permitidos |
|-----|-------------------|----------------------|
| `<p>` | `<span>`, `<a>`, `<strong>`, `<em>`, texto | `<div>`, `<p>`, `<section>`, `<article>` |
| `<div>` | Qualquer elemento | Nenhuma restrição |
| `<span>` | Outros `<span>`, texto | `<div>`, `<p>` |

## 🧪 Para Testar

```powershell
npm start
```

1. Abra DevTools (F12) → Console
2. Clique no botão YouTube
3. Digite uma busca
4. ✅ **O erro "cannot be a descendant" não deve aparecer**
5. ✅ Lista de vídeos deve renderizar normalmente
6. ✅ Texto "Channel • Duration" deve aparecer com cor cinza

## 🔗 Referências

- [MDN: Content categories](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories)
- [MDN: Phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content)
- [React Hydration Errors](https://react.dev/reference/react-dom/client/hydrateRoot#hydration-errors)

---

**Arquivo modificado:** `src/components/ChordDetector.tsx`  
**Linhas alteradas:** ~1370-1385 (ListItemText no modal YouTube)
