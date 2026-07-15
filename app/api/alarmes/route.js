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

    const { searchParams } = new URL(request.url)
    const devicesParam = searchParams.get('devices')   // "1,2,3"
    const deviceIds = devicesParam ? devicesParam.split(',').map(Number) : []   // [1,2,3]

    if (deviceIds.length === 0) {
        return Response.json([])
    }

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