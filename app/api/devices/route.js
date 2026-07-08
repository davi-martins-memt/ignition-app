import { createClient } from "@supabase/supabase-js";

// Cria cliente autorizado pra ler
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export async function GET() {
    const { data, error } = await supabase
        .from('devices')
        .select('*')

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
}