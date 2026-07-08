import { createClient } from "@supabase/supabase-js";

// Cria cliente autorizado pra ler
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

function validarData(inicio, fim) {
        // Validar se fim eh maior doq momento atual
        const agora = new Date()
        const fimData = new Date(fim)
        if (fimData > agora) {
            return "A data final não pode ser no futuro"
        }

        // Validar se a diferença é maior que 1h (minimo)
        const inicioData = new Date(inicio)
        if (fimData - inicioData < 1200000) {
            return "O período mínimo selecionado deve ser de 20 minutos"
        }

        // Validar se a diferença é menor que 7D (máximo)
        if (fimData - inicioData > 604800000) {
            return "O período máximo selecionado deve ser de 7 dias"
        }

        return ""
}

export async function GET(request, { params }) {
    const { id } = await params
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
    if (validacao != ""){
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