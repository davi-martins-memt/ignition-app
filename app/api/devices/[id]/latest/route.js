import { createClient } from "@supabase/supabase-js";
import { validarToken } from "@/app/api/_lib/auth";

// Cria cliente autorizado pra ler
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function GET(request, { params }) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    const { id } = await params
    const { data, error } = await supabase
        .from('realtime_readings')
        .select('*')
        .eq('device_id', id)

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
}