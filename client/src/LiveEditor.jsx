import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Typography,
  Box,
  Chip,
  Container,
  Paper,
  Divider,
  IconButton,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function LiveEditor() {
  const [note, setNote] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const clientId = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:8000/ws');

    socket.current.onopen = () => console.log('WebSocket Connected');
    socket.current.onclose = () => console.log('WebSocket Closed');

    socket.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'init') {
        clientId.current = data.client_id;
      } else if (data.type === 'update') {
        setNote(data.note);
      } else if (data.type === 'users') {
        setUsers(data.users);
      }
    };

    return () => socket.current.close();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      socket.current.send(JSON.stringify({ type: 'update', note: input.trim() }));
      setInput('');
    }
  };

  const handleSendClick = () => {
    if (input.trim()) {
      socket.current.send(JSON.stringify({ type: 'update', note: input.trim() }));
      setInput('');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={8}
        sx={{
          p: 4,
          mt: 5,
          borderRadius: 4,
          boxShadow: 12,
          backgroundColor: '#fff',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          fontWeight="bold"
          color="primary"
          sx={{
            letterSpacing: '1.2px',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: '#1976d2',
            },
          }}
        >
          Live Note Editor
        </Typography>

        <Box
          sx={{
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            minHeight: '300px',
            backgroundColor: '#f9f9f9',
            mb: 2,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
        >
          {note.map((line, idx) => (
            <Fade in={true} key={idx} timeout={500}>
              <Typography
                sx={{
                  color: line.client_id === clientId.current ? 'blue' : 'green',
                  fontWeight: 'lighter',
                  marginBottom: 1,
                  fontSize: '1rem',
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                [{line.client_id === clientId.current ? 'You' : line.client_id.slice(0, 6)}] {line.content}
              </Typography>
            </Fade>
          ))}
        </Box>

        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Write something and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            variant="outlined"
            sx={{
              mr: 1,
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
            size="small"
          />
          <IconButton
            onClick={handleSendClick}
            color="primary"
            disabled={!input.trim()}
            sx={{
              backgroundColor: input.trim() ? 'primary.main' : 'grey.300',
              '&:hover': {
                backgroundColor: input.trim() ? 'primary.dark' : 'grey.400',
              },
              borderRadius: '50%',
              p: 1.5,
              transition: 'background-color 0.2s ease',
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Online Users:
        </Typography>
        <Box display="flex" flexWrap="wrap" mt={1}>
          {users.map((u) => (
            <Chip
              key={u}
              label={u === clientId.current ? 'You' : u.slice(0, 6)}
              color={u === clientId.current ? 'primary' : 'default'}
              sx={{
                m: 0.5,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
