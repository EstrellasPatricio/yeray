import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Comprueba que el cliente puede consultar la base de datos en Supabase. */
export async function verificarConexionBD(): Promise<boolean> {
    const { error } = await supabase.from('domains').select('id').limit(1);

    if (error) {
        throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }

    return true;
}
