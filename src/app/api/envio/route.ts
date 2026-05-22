import { NextRequest, NextResponse } from 'next/server'
import { TARIFAS_ENVIO } from '@/lib/envios'

export async function POST(req: NextRequest) {
  try {
    const { provincia, peso_kg = 0.5, largo = 30, ancho = 20, alto = 15 } = await req.json()

    if (!provincia) return NextResponse.json({ error: 'Provincia requerida' }, { status: 400 })

    const tarifa = TARIFAS_ENVIO.find(t => t.provincia === provincia)
    if (!tarifa) return NextResponse.json({ error: 'Provincia no encontrada' }, { status: 404 })

    // Simulación de cotización Andreani/Correo Argentino
    // Cuando tengas credenciales reales de Andreani, reemplazá esto:
    // const res = await fetch('https://apis.andreani.com/v2/tarifas', { ... })
    
    const pesoFacturado = Math.max(peso_kg, (largo * ancho * alto) / 5000)
    const precioBase = tarifa.precio
    const recargo = pesoFacturado > 1 ? (pesoFacturado - 1) * 500 : 0
    const total = Math.round(precioBase + recargo)

    return NextResponse.json({
      exitoso: true,
      transportista: 'Andreani / Correo Argentino',
      provincia,
      zona: tarifa.zona,
      dias_habiles: tarifa.dias,
      precio: total,
      precio_base: precioBase,
      recargo_peso: Math.round(recargo),
      peso_facturado: pesoFacturado.toFixed(2),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
