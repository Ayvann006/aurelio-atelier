import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || req.cookies.get('admin_auth')?.value
  return token === process.env.ADMIN_PASSWORD
}

function generarHTML(data: any): string {
  const { cliente_nombre = 'Clienta', medidas = {}, notas_medidas = '' } = data

  function medidaRow(label: string, key: string, color: string) {
    const val = medidas[key]
    if (!val && val !== 0) return ''
    return `<tr>
      <td style="padding:7px 12px;border-bottom:0.5px solid rgba(245,240,232,0.05)">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle"></span>
        <span style="font-size:12px;color:rgba(245,240,232,0.6)">${label}</span>
      </td>
      <td style="padding:7px 12px;border-bottom:0.5px solid rgba(245,240,232,0.05);text-align:right;font-size:13px;color:#F5F0E8;font-weight:500">${val} cm</td>
    </tr>`
  }

  const frente = [
    ['Sobre busto','sobre_busto','#fda4af'],['Busto','busto','#f472b6'],['Bajo busto','bajo_busto','#f87171'],
    ['Escote','escote','#e879f9'],['Cintura','cintura','#fb923c'],['Cadera alta','cadera_alta','#fbbf24'],
    ['Cadera','cadera','#C9A96E'],['Cadera baja','cadera_baja','#ca8a04'],['Largo corpiño lateral','largo_corpino_lateral','#a3e635'],
    ['Largo delantero','largo_delantero','#4ade80'],['Largo total','largo_total','#2dd4bf'],
    ['Hombros','hombros','#60a5fa'],['Sisa','sisa','#a78bfa']
  ].map(([l,k,c]) => medidaRow(l,k,c)).filter(Boolean).join('')

  const espalda = [
    ['Largo espalda','largo_espalda','#f472b6'],['Ancho espalda','ancho_espalda','#fb923c'],['Talle','talle','#C9A96E']
  ].map(([l,k,c]) => medidaRow(l,k,c)).filter(Boolean).join('')

  const brazo = [
    ['Largo brazo','brazo','#f472b6'],['Largo manga','largo_manga','#fb923c'],['Bíceps','biceps','#C9A96E'],
    ['Codo','codo','#fdba74'],['Muñeca','muneca','#4ade80']
  ].map(([l,k,c]) => medidaRow(l,k,c)).filter(Boolean).join('')

  const falda = [
    ['Tiro','tiro','#60a5fa'],['Sobre rodilla','sobre_rodilla','#818cf8'],['Largo falda','largo_falda','#a78bfa'],
    ['Altura total','altura','#2dd4bf'],['Taco del zapato','taco_zapato','#f87171']
  ].map(([l,k,c]) => medidaRow(l,k,c)).filter(Boolean).join('')

  function seccion(titulo: string, rows: string) {
    if (!rows) return ''
    return `
      <div style="margin-bottom:24px">
        <p style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C9A96E;margin-bottom:10px">${titulo}</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>`
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #090909; color: #F5F0E8; width: 794px; min-height: 1123px; }
  .page { padding: 50px 45px; min-height: 1123px; position: relative; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 0.5px solid rgba(201,169,110,0.3); padding-bottom: 25px; margin-bottom: 30px; }
  .logo { font-size: 26px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; }
  .logo-sub { color: rgba(201,169,110,0.7); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
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
    <div style="text-align:right">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A96E;margin-bottom:6px">Ficha de medidas</p>
      <p style="font-size:13px;color:rgba(245,240,232,0.6)">${cliente_nombre}</p>
      <p style="font-size:11px;color:rgba(245,240,232,0.3);margin-top:3px">${new Date().toLocaleDateString('es-AR')}</p>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px">
    <div>
      ${seccion('Vista frontal & Largo', frente)}
    </div>
    <div>
      ${seccion('Espalda', espalda)}
      ${seccion('Brazo', brazo)}
      ${seccion('Falda & Largo', falda)}
    </div>
  </div>

  ${notas_medidas ? `
  <div style="margin-top:24px;padding-top:20px;border-top:0.5px solid rgba(201,169,110,0.15)">
    <p style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#C9A96E;margin-bottom:8px">Observaciones</p>
    <p style="font-size:12px;color:rgba(245,240,232,0.5);line-height:1.6;font-style:italic">${notas_medidas}</p>
  </div>
  ` : ''}

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
