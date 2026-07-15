import { createClient } from "@supabase/supabase-js";
import { validarToken } from "../../_lib/auth";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request, { params }) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    // email -> usuario_id
    const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single()

    if (!usuario) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // confere se ESSE device pertence ao usuário
    const { data: relacao } = await supabase
        .from('usuario_devices')
        .select('device_id')
        .eq('usuario_id', usuario.id)
        .eq('device_id', id)
        .single()

    if (!relacao) {
        return Response.json({ error: "Acesso negado a este device" }, { status: 403 })
    }

    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)

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