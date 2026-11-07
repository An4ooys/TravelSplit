import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const port = Number(loadEnv(mode, '.', 'VITE_').VITE_PORT || '5173');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('VITE_PORT должен быть числом от 1 до 65535');
  }

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port,
      strictPort: true,
    },
  };
});
