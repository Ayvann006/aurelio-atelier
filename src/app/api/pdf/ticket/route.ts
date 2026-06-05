import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

function generarHTML(data: any): string {
  const {
    numero = '',
    cliente_nombre = '',
    cliente_telefono = '',
    cliente_email = '',
    direccion_envio = '',
    ciudad_envio = '',
    provincia_envio = '',
    codigo_postal = '',
    items = [],
    notas = '',
    metodo_envio = 'Andreani',
    fecha = new Date().toISOString().split('T')[0],
  } = data

  const productosHTML = items.map((item: any) =>
    `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:13px">${item.cantidad}x</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:13px;font-weight:600">${item.nombre}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:12px;color:#666">${item.variante || ''}</td>
    </tr>`
  ).join('')

  // Simple barcode-like visual using the order number
  const barcodeChars = numero.replace(/[^A-Z0-9]/g, '').split('')
  const barcodeHTML = barcodeChars.map((c: string) => {
    const w = ((c.charCodeAt(0) % 3) + 1) * 2
    return `<span style="display:inline-block;width:${w}px;height:50px;background:#000;margin:0 1px"></span>`
  }).join('') + barcodeChars.map((c: string) => {
    const w = ((c.charCodeAt(0) % 2) + 1) * 2
    return `<span style="display:inline-block;width:${w}px;height:50px;background:#000;margin:0 1px"></span>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A5 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; width: 210mm; height: 148mm; }
  .ticket { padding: 15mm; height: 148mm; position: relative; border: 2px solid #000; }
  
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
  .logo { font-size: 18px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
  .logo-sub { font-size: 9px; letter-spacing: 2px; color: #666; margin-top: 2px; }
  .order-num { font-size: 22px; font-weight: 700; text-align: right; letter-spacing: 2px; }
  .order-date { font-size: 10px; color: #666; text-align: right; margin-top: 2px; }
  
  .dest-section { margin-bottom: 12px; }
  .dest-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px; font-weight: 600; }
  .dest-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .dest-address { font-size: 16px; font-weight: 600; line-height: 1.4; margin-bottom: 4px; background: #f5f5f5; padding: 8px 10px; border: 1px solid #ddd; }
  .dest-city { font-size: 14px; font-weight: 600; }
  .dest-cp { font-size: 14px; font-weight: 700; background: #000; color: #fff; display: inline-block; padding: 2px 8px; margin-left: 8px; }
  .dest-contact { font-size: 11px; color: #444; margin-top: 6px; }
  
  .content { display: flex; gap: 15px; }
  .content-left { flex: 1; }
  .content-right { width: 160px; text-align: center; }
  
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: #999; text-align: left; padding: 4px 10px; border-bottom: 1px solid #ccc; }
  
  .barcode { margin-top: 8px; text-align: center; line-height: 0; }
  .barcode-text { font-size: 12px; font-weight: 700; letter-spacing: 3px; margin-top: 6px; }
  
  .envio-badge { display: inline-block; border: 2px solid #000; padding: 3px 12px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
  
  .notas { font-size: 10px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc; font-style: italic; }
  
  .footer { position: absolute; bottom: 15mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 8px; color: #aaa; border-top: 1px solid #eee; padding-top: 6px; }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <div>
      <div class="logo">Aurelio Martinez</div>
      <div class="logo-sub">Atelier de Alta Costura</div>
    </div>
    <div>
      <div class="order-num">${numero}</div>
      <div class="order-date">${fecha}</div>
    </div>
  </div>

  <div class="content">
    <div class="content-left">
      <div class="dest-section">
        <div class="dest-label">Destinatario</div>
        <div class="dest-name">${cliente_nombre}</div>
        <div class="dest-address">${direccion_envio || 'Sin dirección'}</div>
        <div>
          <span class="dest-city">${ciudad_envio || ''}${provincia_envio ? ', ' + provincia_envio : ''}</span>
          ${codigo_postal ? `<span class="dest-cp">CP ${codigo_postal}</span>` : ''}
        </div>
        <div class="dest-contact">${cliente_telefono}${cliente_email ? ' · ' + cliente_email : ''}</div>
      </div>

      <div class="dest-label">Contenido</div>
      <table>
        <thead><tr><th>Cant.</th><th>Producto</th><th>Variante</th></tr></thead>
        <tbody>${productosHTML}</tbody>
      </table>

      ${notas ? `<div class="notas">Notas: ${notas}</div>` : ''}
    </div>

    <div class="content-right">
      <div class="barcode">${barcodeHTML}</div>
      <div class="barcode-text">${numero}</div>
      <div class="envio-badge">${metodo_envio}</div>
    </div>
  </div>

  <div class="footer">
    <span>El Salvador 5930 · Palermo Hollywood · CABA</span>
    <span>+54 9 11 3620-5098</span>
    <span>@aureliomartinezmoda</span>
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
