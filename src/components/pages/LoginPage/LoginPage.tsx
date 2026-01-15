import {
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import * as Yup from 'yup';
import ActiveUserContext from '../../../Contexts/ActiveUserContext';

const validationSchema = Yup.object().shape({
  email: Yup.string().required('E-Mail ist erforderlich'),
  password: Yup.string().required('Passwort ist erforderlich'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, logout } = useContext(ActiveUserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
      logout();
  }, []);

  const handleSubmit = (
      values: { email: string; password: string },
      { setSubmitting }: any
  ) => {
    setErrorMessage('');
    login(values.email.toLowerCase(), values.password)
        .then(() => {
          navigate('/gallery');
        })
        .catch((error) => {
          if (
              typeof error.response !== 'undefined' &&
              (error.response.status === 401 || error.response.status === 403)
          ) {
            setErrorMessage('Ungültige E-Mail oder Passwort');
          } else {
            setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
          }
          setSubmitting(false);
        });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
      <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}
      >
        <Paper
            elevation={6}
            sx={{
              padding: 4,
              width: { xs: '90%', sm: 400 },
              borderRadius: 3,
            }}
        >
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Box
                sx={{
                  backgroundColor: 'primary.main',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
            >
              <LockOutlined sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Willkommen zurück
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Melde dich an, um fortzufahren
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              Demo Login:
            </Typography>
            <Typography variant="body2">E-Mail: admin@example.com</Typography>
            <Typography variant="body2">Passwort: 1234</Typography>
          </Alert>

          {/* Error Message */}
          {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
          )}

          <Formik
              initialValues={{
                email: '',
                password: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form>
                  <TextField
                      id="email"
                      name="email"
                      label="E-Mail"
                      placeholder="name@example.com"
                      fullWidth
                      autoFocus
                      margin="normal"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={{ mb: 2 }}
                  />

                  <TextField
                      id="password"
                      name="password"
                      label="Passwort"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                  onClick={handleClickShowPassword}
                                  edge="end"
                                  aria-label="toggle password visibility"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 1 }}
                  />

                  <Box textAlign="right" mb={3}>
                    <Link
                        href="#"
                        variant="body2"
                        underline="hover"
                        sx={{ color: 'primary.main' }}
                    >
                      Passwort vergessen?
                    </Link>
                  </Box>

                  <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={isSubmitting}
                      sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: 16,
                        fontWeight: 'bold',
                        mb: 2,
                      }}
                  >
                    {isSubmitting ? 'Wird angemeldet...' : 'Anmelden'}
                  </Button>
                </Form>
            )}
          </Formik>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ODER
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Noch kein Konto?{' '}
              <Link
                  href="#"
                  underline="hover"
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                Jetzt registrieren
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
  );
};

export default Login;