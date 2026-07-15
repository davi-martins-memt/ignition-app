import { createClient } from "@supabase/supabase-js";
import { validarToken } from "../_lib/auth";

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { fcm_token } = await request.json()

    if (!fcm_token) {
        return Response.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // usa o email do token (não confia em username do body)
    const { data: usuario } = await supabaseAdmin
        .from("usuarios")
        .select("id")
        .eq("email", user.email)
        .single()

    if (!usuario) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { error } = await supabaseAdmin
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