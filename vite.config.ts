import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all network interfaces
    host: true,
    // Specify the port Vite should use, if necessary
    port: 5173, // Optional: Use the port your app should run on
  },
});