// gerarJSONLogos.mjs
import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'fs';

// Conferir se as variáveis estão carregadas
console.log('Private Key:', process.env.GOOGLE_PRIVATE_KEY ? 'CARREGADA' : 'NÃO CARREGADA');
console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL || 'undefined');
console.log('Drive ID:', process.env.GOOGLE_SHARED_DRIVE_ID || 'undefined');

