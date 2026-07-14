import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function POST(request) {
    console.log("LOGIN: URL =", process.env.SUPABASE_URL, "| KEY termina em =", process.env.SUPABASE_KEY?.slice(-6))
    const { username, senha } = await request.json()
    console.log("LOGIN: recebeu username =", username)

    const { data: usuario, error: erroBusca } = await supabase
        .from("usuarios")
        .select("email")
        .eq("username", username)
        .single()

    console.log("LOGIN: busca usuario =", usuario, "erro =", erroBusca)

    if (!usuario) {
        console.log("LOGIN: nao achou email pelo username")
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    const { data: authData, error: erroAuth } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: senha
    })

    console.log("LOGIN: signIn erro =", erroAuth)

    if (erroAuth) {
        return Response.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    return Response.json({ token: authData.session.access_token })
}