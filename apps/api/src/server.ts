import { createServer } from 'http';
import app from './app';
import { env } from './env';

const server = createServer(app);

server.listen(env.API_PORT, () => {
  console.log(`API listening on http://localhost:${env.API_PORT}`);
});
