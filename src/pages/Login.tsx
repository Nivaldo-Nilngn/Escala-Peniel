// pages/Login.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      // Traduzir erros do Firebase
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desativado.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: "relative",
        overflow: "hidden",
        //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        
      }}
    >
       {/* Vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      >
        <source src="fundo.mp4" type="video/mp4" />
      </video>

       {/* Overlay escuro translúcido */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.24)", // ajuste a opacidade conforme desejar
          zIndex: -2,
        }}
      />

      <Container maxWidth="sm">
        
        <Card elevation={8} sx={{ p: 4, bgcolor: "rgba(255, 255, 255, 0.068)",
          borderRadius: 4,
           }}
          >

          <CardContent sx={{ p: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
                Escala Peniel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'white' }}>
                Sistema de Gestão de Escalas da Igreja
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
                disabled={loading}
                sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '25px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // leve transparência
      color: 'white', // texto digitado branco
      '& input': {
        color: 'white', // texto principal
      },
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: '#1976d2', // azul no hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        boxShadow: '0 0 5px rgba(25, 118, 210, 0.6)',
      },
    },
    
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1976d2',
    
        
      },
    }}
              />

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '25px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // leve transparência
      color: 'white', // texto digitado branco
      '& input': {
        color: 'white', // texto principal
      },
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: '#1976d2', // azul no hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        boxShadow: '0 0 5px rgba(25, 118, 210, 0.6)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.7)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1976d2',
    
        
      },
    }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ mt: 3, mb: 2, borderRadius: '25px' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ color: 'white' }}>
                Esqueceu sua senha?{' '}
                <Button size="small" disabled={loading}>
                  Recuperar
                </Button>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1,color: 'white' }}>
                Não tem uma conta?{' '}
                <Button 
                  size="small" 
                  disabled={loading}
                  onClick={() => navigate('/register')}
                >
                  Criar conta
                </Button>
              </Typography>
            </Box>

            
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
