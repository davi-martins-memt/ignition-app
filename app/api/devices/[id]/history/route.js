import { createClient } from "@supabase/supabase-js";
import { validarToken } from "@/app/api/_lib/auth";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

function validarData(inicio, fim) {
    const agora = new Date()
    const fimData = new Date(fim)
    if (fimData > agora) {
        return "A data final não pode ser no futuro"
    }

    const inicioData = new Date(inicio)
    if (fimData - inicioData < 1200000) {
        return "O período mínimo selecionado deve ser de 20 minutos"
    }

    if (fimData - inicioData > 604800000) {
        return "O período máximo selecionado deve ser de 7 dias"
    }

    return ""
}

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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (startDate == null || endDate == null) {
        return Response.json({ error: "Erro: Data vazia - preencha o período." }, { status: 400 })
    }

    const startDate_date = new Date(startDate)
    const endDate_date = new Date(endDate)

    if (isNaN(startDate_date.getTime()) || isNaN(endDate_date.getTime())) {
        return Response.json({ error: "Erro: Data inválida - corrija o período." }, { status: 400 })
    }

    const validacao = validarData(startDate_date, endDate_date)
    if (validacao != "") {
        return Response.json({ error: validacao }, { status: 400 })
    }

    const { data, error } = await supabase.from('device_history')
        .select('*')
        .eq('device_id', id)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
}