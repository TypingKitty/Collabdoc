// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlbiwmwzahngtgpmalun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYml3bXd6YWhuZ3RncG1hbHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NDA3NDAsImV4cCI6MjAzODUxNjc0MH0.WklmAzJ9bQUUzHtkpGVn-pTGduVlh06YmkQq-jEqt8w';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
