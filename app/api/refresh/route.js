import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function POST(request) {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
        return Response.json({ error: "Refresh token ausente" }, { status: 400 })
    }

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
    })

    if (error || !data.session) {
        return Response.json({ error: "Sessão inválida ou expirada" }, { status: 401 })
    }

    return Response.json({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
    })
}