import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Devuelve el cliente de Supabase inicializado bajo demanda. */
export function getSupabaseClient(): SupabaseClient {
    if (client) {
        return client;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY en el archivo .env');
    }

    client = createClient(supabaseUrl, supabaseKey);
    return client;
}

/** Comprueba que el cliente puede consultar la base de datos en Supabase. */
export async function verificarConexionBD(): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('domains').select('id').limit(1);

    if (error) {
        throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    return true;
}
