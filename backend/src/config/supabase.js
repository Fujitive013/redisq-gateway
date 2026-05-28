const { createClient } = require("@supabase/supabase-js");

const createSupabaseClient = () =>
    createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = createSupabaseClient;
