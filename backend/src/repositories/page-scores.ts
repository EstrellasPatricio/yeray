import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase.js';

export interface PageScoreInput {
    hostname: string;
    score: number;
}

export interface PageScoreRecord extends PageScoreInput {
    id: number;
    createdAt: string;
}

export interface PageScoreRepository {
    save(input: PageScoreInput): Promise<PageScoreRecord>;
}

/** Guarda la puntuación en `page_scores`, creando antes el dominio en `domains` si no existe. */
export function createSupabasePageScoreRepository(
    getClient: () => SupabaseClient = getSupabaseClient,
): PageScoreRepository {
    return {
        async save({ hostname, score }) {
            const supabase = getClient();

            const domain = await supabase
                .from('domains')
                .upsert({ host: hostname }, { onConflict: 'host' })
                .select('id')
                .single();
            if (domain.error) throw new Error(`No se pudo registrar el dominio: ${domain.error.message}`);

            const stored = await supabase
                .from('page_scores')
                .insert({ domain_id: domain.data.id, score })
                .select('id, created_at')
                .single();
            if (stored.error) throw new Error(`No se pudo guardar la puntuación: ${stored.error.message}`);

            return { id: stored.data.id, hostname, score, createdAt: stored.data.created_at };
        },
    };
}
