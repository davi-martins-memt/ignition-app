import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
    const { username, senha } = await request.json()

    console.log("SERVICE KEY existe?", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: usuario, error: erroBusca } = await supabaseAdmin
        .from("usuarios")
        .select("email")
        .eq("username", username)
        .single()

    console.log("LOGIN admin: usuario =", JSON.stringify(usuario), "| erro =", JSON.stringify(erroBusca))

    if (!usuario) {
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    const { data: authData, error: erroAuth } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: senha
    })

    if (erroAuth) {
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    return Response.json({ token: authData.session.access_token })
}