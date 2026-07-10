import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function POST(request){
    const body = await request.json()
    const { username, senha } = body

    // Valida se username e senha estão preenchidos
    if (!username || !senha) {
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    // 1. Mapeia username -> email
    const { data: usuario, error: erroBusca } = await supabase
        .from('usuarios')
        .select('email')
        .eq('username', username)
        .single()
    
    // username não existe -> mesma mensagem genérica (não revela o que falhou)
    if (erroBusca || !usuario) {
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    // 2. Autentica no Supabase Auth com o email + senha
    const { data: authData, error: erroAuth } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: senha
    })
    console.log("ERRO AUTH:", erroAuth)
    if (erroAuth || !authData.session) {
        return Response.json({ error: "Usuário ou senha inválidos." }, { status: 401 })
    }

    // 3. Sucesso -> devolve o token de acesso
    return Response.json({
        token: authData.session.access_token
    })
}