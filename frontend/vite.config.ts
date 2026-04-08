import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Needed when running in Docker on Windows (NTFS doesn't emit inotify events)
      usePolling: true,
    },
  },
})
