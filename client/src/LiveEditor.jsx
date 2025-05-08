import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Typography,
  Box,
  Chip,
  Container,
  Paper,
  Divider,
  IconButton
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
      <Paper elevation={6} sx={{ p: 4, mt: 5, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Live Note Editor
        </Typography>

        <Box
          sx={{
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            minHeight: '300px',
            backgroundColor: '#f5f5f5',
            mb: 2,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
          }}
        >
          {note.map((line, idx) => (
            <Typography
              key={idx}
              sx={{
                color: line.client_id === clientId.current ? 'blue' : 'green',
                fontWeight: 'lighter',
                marginBottom: 1,
                fontSize: '1rem',
              }}
            >
              [{line.client_id === clientId.current ? 'You' : line.client_id.slice(0, 6)}] {line.content}
            </Typography>
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
            sx={{ mr: 1 }}
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
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
