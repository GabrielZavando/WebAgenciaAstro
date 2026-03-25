import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

console.log('Firebase API Key length:', process.env.PUBLIC_FIREBASE_API_KEY?.length);
console.log('Firebase Project ID:', process.env.PUBLIC_FIREBASE_PROJECT_ID);
console.log('API Key starts with:', process.env.PUBLIC_FIREBASE_API_KEY?.substring(0, 5));
