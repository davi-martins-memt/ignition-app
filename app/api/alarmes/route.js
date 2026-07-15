import { createClient } from "@supabase/supabase-js";
import { validarToken } from "../_lib/auth";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    // email -> usuario_id
    const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single()

    if (!usuario) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // device_ids que o usuário monitora
    const { data: relacoes } = await supabase
        .from('usuario_devices')
        .select('device_id')
        .eq('usuario_id', usuario.id)

    const deviceIds = relacoes.map(r => r.device_id)

    if (deviceIds.length === 0) {
        return Response.json([])
    }

    // alarmes desses devices
    const { data, error } = await supabase
        .from('alarmes')
        .select('id, grandeza, priority, timestamp, devices(nome)')
        .in('device_id', deviceIds)
        .order('timestamp', { ascending: false })

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
}