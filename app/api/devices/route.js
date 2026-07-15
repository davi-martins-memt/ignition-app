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

    // só os devices do usuário
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .in('id', deviceIds)

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    const devicesComStatus = await Promise.all(
        data.map(async (device) => {
            const { data: ultimaLeitura } = await supabase
                .from('realtime_readings')
                .select('timestamp')
                .eq('device_id', device.id)
                .order('timestamp', { ascending: false })
                .limit(1)

            let online = false
            if (ultimaLeitura && ultimaLeitura.length > 0) {
                const ultimoTimestamp = new Date(ultimaLeitura[0].timestamp)
                const agora = new Date()
                const diferencaSegundos = (agora - ultimoTimestamp) / 1000
                online = diferencaSegundos < 60
            }

            return { ...device, online }
        })
    )

    return Response.json(devicesComStatus)
}