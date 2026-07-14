import { createClient } from "@supabase/supabase-js";
import { validarToken } from "../_lib/auth";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function POST(request) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { username, fcm_token } = await request.json()

    if (!username || !fcm_token) {
        return Response.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // acha o usuario_id pelo username
    const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("username", username)
        .single()

    if (!usuario) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // grava o token (upsert pra não duplicar)
    const { error } = await supabase
        .from("usuario_fcm_token")
        .upsert(
            { usuario_id: usuario.id, token: fcm_token },
            { onConflict: "usuario_id,token" }
        )

    if (error) {
        return Response.json({ error: "Erro ao registrar token" }, { status: 500 })
    }

    return Response.json({ sucesso: true })
}