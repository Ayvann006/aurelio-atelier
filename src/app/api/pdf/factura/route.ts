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
    pagos = [],
    total_pagado = 0,
    saldo_restante = 0,
    tipo_vestido = '',
    color_vestido = '',
    fecha_entrega = '',
    numero = `AM-${Date.now().toString().slice(-6)}`,
    fecha = new Date().toISOString().split('T')[0],
  } = data

  const pagosHTML = pagos.map((p: any, i: number) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:0.5px solid rgba(245,240,232,0.06);font-size:12px;color:rgba(245,240,232,0.5)">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:0.5px solid rgba(245,240,232,0.06);font-size:12px;color:#F5F0E8">${p.concepto || 'Pago'}</td>
      <td style="padding:10px 12px;border-bottom:0.5px solid rgba(245,240,232,0.06);font-size:12px;color:rgba(245,240,232,0.5)">${p.metodo || 'Transferencia'}</td>
      <td style="padding:10px 12px;border-bottom:0.5px solid rgba(245,240,232,0.06);font-size:12px;color:rgba(245,240,232,0.5)">${p.fecha || ''}</td>
      <td style="padding:10px 12px;border-bottom:0.5px solid rgba(245,240,232,0.06);font-size:12px;color:rgba(74,222,128,0.7);text-align:right">${formatPrecio(p.monto || 0, moneda)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #090909; color: #F5F0E8; width: 794px; min-height: 1123px; position: relative; }
  .page { padding: 50px 45px; min-height: 1123px; position: relative; }
  
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 0.5px solid rgba(201,169,110,0.3); padding-bottom: 25px; margin-bottom: 30px; }
  .logo { font-size: 26px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; color: #F5F0E8; }
  .logo-sub { color: rgba(201,169,110,0.7); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
  
  .doc-info { text-align: right; }
  .doc-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C9A96E; margin-bottom: 6px; }
  .doc-num { font-size: 13px; color: rgba(245,240,232,0.6); letter-spacing: 1px; }
  .doc-date { font-size: 11px; color: rgba(245,240,232,0.35); margin-top: 3px; }
  
  .section-title { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #C9A96E; margin-bottom: 14px; }
  
  .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .field-label { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 3px; }
  .field-value { font-size: 12px; color: #F5F0E8; }
  
  .design-box { background: rgba(245,240,232,0.02); border: 0.5px solid rgba(245,240,232,0.06); padding: 16px; margin-bottom: 28px; }
  .design-label { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 6px; }
  .design-text { font-size: 12px; color: rgba(245,240,232,0.5); line-height: 1.6; font-style: italic; }
  
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { padding: 10px 12px; text-align: left; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,169,110,0.5); border-bottom: 0.5px solid rgba(201,169,110,0.2); font-weight: normal; }
  th:last-child { text-align: right; }
  
  .totals { border-top: 0.5px solid rgba(201,169,110,0.2); padding-top: 20px; margin-top: 8px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
  .total-row.sub { color: rgba(245,240,232,0.4); }
  .total-row.paid { color: rgba(74,222,128,0.7); }
  .total-row.main { border-top: 0.5px solid rgba(201,169,110,0.2); padding-top: 14px; margin-top: 8px; font-size: 15px; }
  .total-row.main .amount { font-size: 22px; font-weight: 300; }
  .total-row.main.zero .amount { color: rgba(74,222,128,0.8); }
  .total-row.main.pending .amount { color: #C9A96E; }
  
  .status-badge { display: inline-block; padding: 4px 14px; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; margin-top: 12px; }
  .status-paid { border: 0.5px solid rgba(74,222,128,0.3); color: rgba(74,222,128,0.7); }
  .status-partial { border: 0.5px solid rgba(201,169,110,0.3); color: #C9A96E; }
  .status-pending { border: 0.5px solid rgba(248,113,113,0.3); color: rgba(248,113,113,0.7); }
  
  .gold-line { width: 35px; height: 0.5px; background: #C9A96E; margin: 20px 0; }
  .legal { font-size: 10px; color: rgba(245,240,232,0.25); line-height: 1.6; }
  
  .footer { position: absolute; bottom: 35px; left: 45px; right: 45px; border-top: 0.5px solid rgba(201,169,110,0.12); padding-top: 12px; display: flex; justify-content: space-between; }
  .footer p { font-size: 8px; color: rgba(245,240,232,0.2); letter-spacing: 1px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">Aurelio Martinez</div>
      <div class="logo-sub">Atelier de Alta Costura</div>
    </div>
    <div class="doc-info">
      <div class="doc-title">Estado de cuenta</div>
      <div class="doc-num">${numero}</div>
      <div class="doc-date">Fecha: ${fecha}</div>
    </div>
  </div>

  <div class="section-title">Cliente</div>
  <div class="client-grid">
    <div>
      <div class="field-label">Nombre</div>
      <div class="field-value">${cliente_nombre}</div>
    </div>
    <div>
      <div class="field-label">Contacto</div>
      <div class="field-value">${cliente_telefono}${cliente_email ? ' · ' + cliente_email : ''}</div>
    </div>
    ${tipo_vestido ? `<div><div class="field-label">Tipo de vestido</div><div class="field-value" style="text-transform:capitalize">${tipo_vestido}</div></div>` : ''}
    ${fecha_entrega ? `<div><div class="field-label">Fecha de entrega</div><div class="field-value">${fecha_entrega}</div></div>` : ''}
  </div>

  ${descripcion ? `
  <div class="design-box">
    <div class="design-label">Descripcion del diseno</div>
    <div class="design-text">${descripcion}</div>
  </div>
  ` : ''}

  <div class="section-title">Detalle de pagos</div>
  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Concepto</th>
        <th>Metodo</th>
        <th>Fecha</th>
        <th style="text-align:right">Monto</th>
      </tr>
    </thead>
    <tbody>
      ${pagosHTML || '<tr><td colspan="5" style="padding:20px;text-align:center;color:rgba(245,240,232,0.2);font-size:11px">Sin pagos registrados</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row sub">
      <span>Presupuesto total</span>
      <span>${formatPrecio(total, moneda)}</span>
    </div>
    <div class="total-row paid">
      <span>Total abonado</span>
      <span>${formatPrecio(total_pagado, moneda)}</span>
    </div>
    <div class="total-row main ${saldo_restante <= 0 ? 'zero' : 'pending'}">
      <span>Saldo ${saldo_restante <= 0 ? 'cancelado' : 'pendiente'}</span>
      <span class="amount">${formatPrecio(Math.max(0, saldo_restante), moneda)}</span>
    </div>
  </div>

  <div style="text-align:right">
    <span class="status-badge ${saldo_restante <= 0 ? 'status-paid' : total_pagado > 0 ? 'status-partial' : 'status-pending'}">
      ${saldo_restante <= 0 ? 'CANCELADO' : total_pagado > 0 ? 'PAGO PARCIAL' : 'PENDIENTE'}
    </span>
  </div>

  <div class="gold-line"></div>
  <p class="legal">
    Este documento es un estado de cuenta interno del atelier y no constituye factura fiscal.
    Para obtener su factura oficial, comuniquese con el atelier.
    Los montos expresados son en ${moneda === 'USD' ? 'dolares estadounidenses' : 'pesos argentinos'}.
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
