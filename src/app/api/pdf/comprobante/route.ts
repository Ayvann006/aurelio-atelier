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
    monto = 0,
    moneda = 'ARS',
    concepto = 'Pago de anticipo',
    metodo_pago = 'Transferencia',
    fecha_pago = new Date().toISOString().split('T')[0],
    numero = `R-${Date.now().toString().slice(-6)}`,
    presupuesto_total = 0,
    saldo_restante = 0,
    tipo_vestido = '',
  } = data

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
  .recibo-info { text-align: right; }
  .recibo-info p { font-size: 11px; color: rgba(245,240,232,0.5); margin-bottom: 4px; }
  .recibo-num { font-size: 14px; color: #C9A96E; letter-spacing: 2px; }
  .section-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #C9A96E; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .field-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,240,232,0.35); margin-bottom: 4px; }
  .field-value { font-size: 13px; color: #F5F0E8; }
  .monto-box { background: rgba(201,169,110,0.05); border: 0.5px solid rgba(201,169,110,0.2); padding: 30px; text-align: center; margin-bottom: 40px; }
  .monto-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(201,169,110,0.6); margin-bottom: 8px; }
  .monto-valor { font-size: 36px; font-weight: 300; color: #C9A96E; }
  .monto-concepto { font-size: 12px; color: rgba(245,240,232,0.4); margin-top: 8px; font-style: italic; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 0.5px solid rgba(245,240,232,0.05); }
  .detail-row .label { color: rgba(245,240,232,0.5); }
  .detail-row .value { color: #F5F0E8; }
  .detail-row.gold .value { color: #C9A96E; }
  .sello { display: inline-block; border: 2px solid rgba(74,222,128,0.4); color: rgba(74,222,128,0.7); padding: 8px 24px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; transform: rotate(-5deg); margin-top: 30px; }
  .footer { position: absolute; bottom: 40px; left: 50px; right: 50px; border-top: 0.5px solid rgba(201,169,110,0.15); padding-top: 16px; display: flex; justify-content: space-between; }
  .footer p { font-size: 9px; color: rgba(245,240,232,0.25); letter-spacing: 1px; }
  .gold-line { width: 40px; height: 0.5px; background: #C9A96E; margin: 16px 0; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">Aurelio Martinez</div>
      <div class="logo-sub">Atelier de Alta Costura</div>
    </div>
    <div class="recibo-info">
      <div class="recibo-num">${numero}</div>
      <p>Comprobante de pago</p>
      <p>Fecha: ${fecha_pago}</p>
    </div>
  </div>

  <div class="section-title">Recibimos de</div>
  <div class="grid">
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
  </div>

  <div class="monto-box">
    <div class="monto-label">Monto recibido</div>
    <div class="monto-valor">${formatPrecio(monto, moneda)}</div>
    <div class="monto-concepto">${concepto}</div>
  </div>

  <div class="section-title">Detalle</div>
  <div style="margin-bottom:40px">
    <div class="detail-row">
      <span class="label">Concepto</span>
      <span class="value">${concepto}</span>
    </div>
    <div class="detail-row">
      <span class="label">Metodo de pago</span>
      <span class="value">${metodo_pago}</span>
    </div>
    <div class="detail-row">
      <span class="label">Fecha de pago</span>
      <span class="value">${fecha_pago}</span>
    </div>
    ${presupuesto_total > 0 ? `
    <div class="detail-row" style="margin-top:16px;border-top:0.5px solid rgba(201,169,110,0.15);padding-top:16px">
      <span class="label">Presupuesto total</span>
      <span class="value">${formatPrecio(presupuesto_total, moneda)}</span>
    </div>
    <div class="detail-row">
      <span class="label">Total abonado a la fecha</span>
      <span class="value">${formatPrecio(monto, moneda)}</span>
    </div>
    <div class="detail-row gold">
      <span class="label">Saldo pendiente</span>
      <span class="value">${formatPrecio(saldo_restante, moneda)}</span>
    </div>` : ''}
  </div>

  <div style="text-align:center">
    <div class="sello">Pagado</div>
  </div>

  <div class="gold-line" style="margin-top:40px"></div>
  <p style="font-size:11px;color:rgba(245,240,232,0.35);line-height:1.7;margin-top:16px">
    Este comprobante acredita la recepcion del pago indicado. No constituye factura fiscal.
    Para obtener su factura, comuniquese con el atelier.
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
    return NextResponse.json({ html })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
