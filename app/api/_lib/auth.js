import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

// Retorna o user se o token for válido, ou null caso contrário
export async function validarToken(request) {
    // 1. Extrai o header Authorization
    const authHeader = request.headers.get('Authorization')

    // Header ausente ou sem formato "Bearer <token>" -> inválido
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }

    // Tira o "Bearer " e sobra só o token
    const token = authHeader.substring(7)

    if (!token) {
        return null
    }

    // 2. Pergunta pro Supabase se o token é válido
    const { data, error } = await supabase.auth.getUser(token)

    // 3. Erro ou sem user -> inválido (fail-closed)
    if (error || !data.user) {
        return null
    }

    return data.user
}