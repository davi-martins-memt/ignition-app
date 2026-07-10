import { createClient } from "@supabase/supabase-js";
import { validarToken } from "../_lib/auth";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)


export async function GET(request) {
    const user = await validarToken(request)
    if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('devices')
        .select('*')

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

            return {
                ...device,
                online: online
            }
        })
    )

    return Response.json(devicesComStatus)
}