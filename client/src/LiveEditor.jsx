import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Typography,
  Box,
  Chip,
  Container,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedNote = motion(Box);
const AnimatedChip = motion(Chip);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(5),
  background: 'linear-gradient(to right, #fdfbfb, #ebedee)',
  boxShadow: '0px 10px 25px rgba(0,0,0,0.1)',
  borderRadius: 16
}));

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
    socket.current.onerror = () => {
        console.log('WebSocket Error');
        // Optionally add retry logic here
      };

    socket.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'init') {
        clientId.current = data.client_id;
      } else if (data.type === 'update') {
        setNote(data.note);
        console.log("note: ",data.note)
      } else if (data.type === 'users') {
        setUsers(data.users);
      }
    };

    return () => socket.current.close();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        const timestamp = new Date().toISOString();
        socket.current.send(JSON.stringify({
          type: 'update',
          note: input.trim(),
          timestamp
        }));
        setInput('');
      } else {
        console.warn('WebSocket is not ready.');
      }
    }
  };
  

  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Typography variant="h4" gutterBottom color="primary">
          Live Note Editor
        </Typography>

        <Box
          sx={{
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            minHeight: '300px',
            background: '#f5f5f5',
            mb: 2,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            maxHeight: '400px',
            transition: 'all 0.3s ease'
          }}
        >
          <AnimatePresence>
            {note.map((line, idx) => (
              <AnimatedNote
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                  mb: 1,
                  color: line.client_id === clientId.current ? 'blue' : 'green'
                }}
              >
                <Typography variant="body2">
                  [{line.client_id === clientId.current ? 'You' : line.client_id.slice(0, 6)} | {line.timestamp.slice(11,19)}]
                  &nbsp;{line.content}
                </Typography>
              </AnimatedNote>
            ))}
          </AnimatePresence>
        </Box>

        <TextField
          fullWidth
          label="Write something and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="outlined"
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">🟢 Online Users:</Typography>
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
          <AnimatePresence>
            {users.map((u) => (
              <motion.div
                key={u}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Chip
                  label={u === clientId.current ? 'You' : u.slice(0, 6)}
                  color={u === clientId.current ? 'primary' : 'default'}
                  sx={{
                    m: 0.5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    fontWeight: 500
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      </StyledPaper>
    </Container>
  );
}
