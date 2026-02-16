import React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const router = useNavigate();

 // ✅ Auto redirect if token exists
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) router("/home");
  }, []);
    const handleAuth = async () => {
    try {
      if(formState === 0){
        // ✅ Attempt login
        await handleLogin(username, password);
      } else {
        // ✅ Attempt registration
        const result = await handleRegister(name, username, password);
        setUsername('');
        setPassword('');
        setName('');
        setFormState(0);
        setMessage(result);
        setOpen(true);
        setError('');
      }
    } catch(err){
      // ✅ Show error message in UI
      setError(err.message);
    }
  }

  /*const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        let result = await handleRegister(name, username, password);
        setUsername('');
        setPassword('');
        setName('');
        setFormState(0);
        setMessage(result);
        setOpen(true);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };*/

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B132B, #1C2541)',
        }}
      >
        <CssBaseline />

        {/* Form Container */}
        <Grid
          item
          xs={11}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1C2541',
            borderRadius: 3,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ color: '#5BC0BE', mb: 2 }}
            >
              {formState === 0 ? 'Sign In' : 'Sign Up'}
            </Typography>

            {/* Toggle Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                sx={{
                  bgcolor: formState === 0 ? '#5BC0BE' : 'transparent',
                  color: formState === 0 ? '#0B132B' : '#5BC0BE',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#6FFFE9',
                  },
                }}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                sx={{
                  bgcolor: formState === 1 ? '#5BC0BE' : 'transparent',
                  color: formState === 1 ? '#0B132B' : '#5BC0BE',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#6FFFE9',
                  },
                }}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            {/* Form Fields */}
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    bgcolor: '#0B132B',
                    borderRadius: 1,
                    input: { color: 'white' },
                  }}
                  InputLabelProps={{ style: { color: '#5BC0BE' } }}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  bgcolor: '#0B132B',
                  borderRadius: 1,
                  input: { color: 'white' },
                }}
                InputLabelProps={{ style: { color: '#5BC0BE' } }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  bgcolor: '#0B132B',
                  borderRadius: 1,
                  input: { color: 'white' },
                }}
                InputLabelProps={{ style: { color: '#5BC0BE' } }}
              />

              {error && (
                <Typography sx={{ color: 'red', mt: 1 }}>{error}</Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: '#5BC0BE',
                  color: '#0B132B',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#6FFFE9' },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? 'Login' : 'Register'}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Snackbar open={open} autoHideDuration={4000} message={message} />
      </Grid>
    </ThemeProvider>
  );
}  