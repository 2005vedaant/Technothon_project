require("dotenv").config();

console.log('[Supabase] URL configured:', !!process.env.SUPABASE_URL);
console.log('[Supabase] service-role key present:', !!process.env.SUPABASE_SECRET_KEY);

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

module.exports = supabase;