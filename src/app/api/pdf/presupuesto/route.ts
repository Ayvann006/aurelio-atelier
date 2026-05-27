import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

function formatPrecio(monto: number, moneda: string = 'ARS'): string {
  if (moneda === 'USD') return `USD ${monto.toLocaleString('es-AR')}`
  return `$ ${monto.toLocaleString('es-AR')}`
}

function generarHTML(data: any): string {
  const {
    cliente_nombre = 'Clienta',
    cliente_email = '',
    cliente_telefono = '',
    descripcion = '',
    total = 0,
    moneda = 'ARS',
    anticipo = 0,
    cuotas = 1,
    fecha_pago = '',
    estado = 'pendiente',
    tipo_vestido = '',
    color_vestido = '',
    fecha_entrega = '',
    fecha_presupuesto = new Date().toISOString().split('T')[0],
    numero = `P-${Date.now().toString().slice(-6)}`,
  } = data

  const saldo = total - anticipo
  const valorCuota = cuotas > 1 ? Math.round(saldo / cuotas) : saldo

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #090909; color: #F5F0E8; width: 794px; min-height: 1123px; position: relative; }
  .page { padding: 60px 50px; min-height: 1123px; position: relative; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 0.5px solid rgba(201,169,110,0.3); padding-bottom: 30px; margin-bottom: 40px; }
  .logo { font-size: 28px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; color: #F5F0E8; }
  .logo-sub { color: rgba(201,169,110,0.7); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 6px; }
  .presup-info { text-align: right; }
  .presup-info p { font-size: 11px; color: rgba(245,240,232,0.5); margin-bottom: 4px; }
  .presup-num { font-size: 14px; color: #C9A96E; letter-spacing: 2px; }
  .estado-badge { display: inline-block; padding: 4px 14px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
  .estado-pendiente { border: 0.5px solid rgba(201,169,110,0.4); color: #C9A96E; }
  .estado-aprobado { border: 0.5px solid rgba(74,222,128,0.4); color: rgba(74,222,128,0.8); }
  .estado-rechazado { border: 0.5px solid rgba(248,113,113,0.4); color: rgba(248,113,113,0.8); }
  .section-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #C9A96E; margin-bottom: 16px; }
  .cliente-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .field-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,240,232,0.35); margin-bottom: 4px; }
  .field-value { font-size: 13px; color: #F5F0E8; }
  .descripcion { background: rgba(245,240,232,0.03); border: 0.5px solid rgba(245,240,232,0.08); padding: 20px; margin-bottom: 40px; font-size: 13px; color: rgba(245,240,232,0.6); line-height: 1.7; font-style: italic; }
  .totals { border-top: 0.5px solid rgba(201,169,110,0.2); padding-top: 24px; margin-bottom: 40px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
  .total-row.sub { color: rgba(245,240,232,0.5); }
  .total-row.main { border-top: 0.5px solid rgba(201,169,110,0.2); padding-top: 16px; margin-top: 8px; font-size: 16px; }
  .total-row.main .amount { font-size: 24px; font-weight: 300; color: #C9A96E; }
  .total-row.highlight { color: #C9A96E; }
  .cuotas-box { background: rgba(201,169,110,0.05); border: 0.5px solid rgba(201,169,110,0.15); padding: 20px; margin-bottom: 40px; }
  .cuotas-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C9A96E; margin-bottom: 12px; }
  .cuota-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: rgba(245,240,232,0.6); border-bottom: 0.5px solid rgba(245,240,232,0.05); }
  .cuota-row:last-child { border-bottom: none; }
  .footer { position: absolute; bottom: 40px; left: 50px; right: 50px; border-top: 0.5px solid rgba(201,169,110,0.15); padding-top: 16px; display: flex; justify-content: space-between; }
  .footer p { font-size: 9px; color: rgba(245,240,232,0.25); letter-spacing: 1px; }
  .gold-line { width: 40px; height: 0.5px; background: #C9A96E; margin: 16px 0; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">Aurelio Martínez</div>
      <div class="logo-sub">Atelier de Alta Costura</div>
    </div>
    <div class="presup-info">
      <div class="presup-num">${numero}</div>
      <p>Fecha: ${fecha_presupuesto}</p>
      ${fecha_pago ? `<p>Vencimiento: ${fecha_pago}</p>` : ''}
      <div class="estado-badge estado-${estado}">${estado.toUpperCase()}</div>
    </div>
  </div>

  <div class="section-title">Presupuesto para</div>
  <div class="cliente-grid">
    <div>
      <div class="field-label">Clienta</div>
      <div class="field-value">${cliente_nombre}</div>
    </div>
    <div>
      <div class="field-label">Contacto</div>
      <div class="field-value">${cliente_telefono}${cliente_email ? ` · ${cliente_email}` : ''}</div>
    </div>
    ${tipo_vestido ? `<div>
      <div class="field-label">Tipo de vestido</div>
      <div class="field-value" style="text-transform:capitalize">${tipo_vestido}</div>
    </div>` : ''}
    ${color_vestido ? `<div>
      <div class="field-label">Color</div>
      <div class="field-value">${color_vestido}</div>
    </div>` : ''}
    ${fecha_entrega ? `<div>
      <div class="field-label">Fecha de entrega</div>
      <div class="field-value">${fecha_entrega}</div>
    </div>` : ''}
  </div>

  ${descripcion ? `
  <div class="section-title">Descripcion del diseno</div>
  <div class="descripcion">${descripcion}</div>
  ` : ''}

  <div class="section-title">Detalle economico</div>
  <div class="totals">
    <div class="total-row main">
      <span>Total</span>
      <span class="amount">${formatPrecio(total, moneda)}</span>
    </div>
    ${anticipo > 0 ? `
    <div class="total-row highlight" style="margin-top:12px">
      <span>Anticipo / Sena</span>
      <span>${formatPrecio(anticipo, moneda)}</span>
    </div>
    <div class="total-row sub">
      <span>Saldo pendiente</span>
      <span>${formatPrecio(saldo, moneda)}</span>
    </div>` : ''}
  </div>

  ${cuotas > 1 ? `
  <div class="cuotas-box">
    <div class="cuotas-title">Plan de pagos — ${cuotas} cuotas</div>
    ${Array.from({length: cuotas}, (_, i) => `
    <div class="cuota-row">
      <span>Cuota ${i + 1}</span>
      <span>${formatPrecio(valorCuota, moneda)}</span>
    </div>`).join('')}
  </div>` : ''}

  <div class="gold-line"></div>
  <p style="font-size:11px;color:rgba(245,240,232,0.35);line-height:1.7;margin-top:16px">
    Este presupuesto tiene una validez de 15 dias corridos a partir de la fecha de emision.
    Los precios pueden variar segun modificaciones solicitadas al diseno original.
    La sena confirma el inicio de la confeccion y no es reembolsable.
  </p>

  <div class="footer">
    <p>El Salvador 5930 · Palermo Hollywood · CABA · Argentina</p>
    <p>+54 9 11 3620-5098 · @aureliomartinezmoda</p>
  </div>
</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = await req.json()
    const html = generarHTML(data)

    // Return HTML for client-side PDF generation
    return NextResponse.json({ html })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
