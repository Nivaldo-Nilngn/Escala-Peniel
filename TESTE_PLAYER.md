# TESTE RÁPIDO - Player Simples

Para testar se o ReactPlayer funciona, adicione este código temporário logo após o Header:

```tsx
{/* TESTE: Player simples sempre visível */}
<Box sx={{ bgcolor: '#000', p: 2 }}>
  <Typography color="white">URL atual: {url || 'NENHUMA'}</Typography>
  <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#333', mt: 2 }}>
    <ReactPlayer
      url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      controls={true}
      width="100%"
      height="100%"
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  </Box>
</Box>
```

Se isso funcionar, o problema é com o estado `url`.
Se não funcionar, o problema é com ReactPlayer ou imports.
