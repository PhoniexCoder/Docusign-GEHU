import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the root directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
