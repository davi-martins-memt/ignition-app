import { createClient } from "@supabase/supabase-js";

// Cria cliente autorizado pra ler
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function GET(request, { params }) {
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