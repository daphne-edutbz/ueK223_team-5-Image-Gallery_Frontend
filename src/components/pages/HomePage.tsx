import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
// @ts-ignore
import logo from '../../logo1.png';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                        'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                },
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        animation: `${fadeIn} 1s ease-out`,
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* Haupttitel */}
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                            color: '#fff',
                            mb: 1,
                            textShadow: '2px 4px 8px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        OurSpace
                    </Typography>

                    {/* Untertitel */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.85)',
                            mb: 5,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            fontWeight: 400,
                        }}
                    >
                        Willkommen zurück
                    </Typography>

                    {/* Logo */}
                    <Box
                        component="img"
                        src={logo}
                        alt="ourSpace logo"
                        sx={{
                            maxWidth: { xs: '250px', sm: '350px' },
                            width: '100%',
                            mb: 5,
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                            animation: `${float} 3s ease-in-out infinite`,
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    />

                    {/* Login Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 3,
                            backgroundColor: '#fff',
                            color: '#1e3c72',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                        }}
                    >
                        Jetzt anmelden
                    </Button>

                    {/* Registrieren Link */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            mt: 3,
                            fontSize: '0.9rem',
                        }}
                    >
                        Noch kein Konto?{' '}
                        <Box
                            component="span"
                            onClick={() => navigate('/register')}
                            sx={{
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: 'rgba(255,255,255,0.9)',
                                },
                            }}
                        >
                            Registrieren
                        </Box>
                    </Typography>
                </Box>
            </Container>

            {/* Dekorative Elemente */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    filter: 'blur(60px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    filter: 'blur(60px)',
                }}
            />
        </Box>
    );
}