export function generarLinkGoogleCalendar(cita: {
  fecha: string
  hora: string
  tipo_cita: string
  tipo_evento: string
  cliente_nombre: string
}) {
  const fecha = cita.fecha.replace(/-/g, '')
  const hora = cita.hora.replace(':', '') + '00'
  const horaFin = String(parseInt(hora.substring(0, 2)) + 1).padStart(2, '0') + hora.substring(2)
  
  const inicio = `${fecha}T${hora}`
  const fin = `${fecha}T${horaFin}`
  
  const titulo = `Cita Aurelio Martínez — ${cita.tipo_cita.replace('-', ' ')}`
  const descripcion = `Tipo de evento: ${cita.tipo_evento}\nAtelier: El Salvador 5930, Palermo Hollywood, CABA\nTel: +54 9 11 3620-5098`
  const lugar = 'El Salvador 5930, Palermo Hollywood, CABA'

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${inicio}/${fin}`,
    details: descripcion,
    location: lugar,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generarLinkAppleCalendar(cita: {
  fecha: string
  hora: string
  tipo_cita: string
  tipo_evento: string
}) {
  const fecha = cita.fecha.replace(/-/g, '')
  const hora = cita.hora.replace(':', '') + '00'
  const horaFin = String(parseInt(hora.substring(0, 2)) + 1).padStart(2, '0') + hora.substring(2)
  
  // ICS format para Apple Calendar
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fecha}T${hora}`,
    `DTEND:${fecha}T${horaFin}`,
    `SUMMARY:Cita Aurelio Martínez — ${cita.tipo_cita.replace('-', ' ')}`,
    `DESCRIPTION:Tipo de evento: ${cita.tipo_evento}`,
    `LOCATION:El Salvador 5930\\, Palermo Hollywood\\, CABA`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  const blob = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
  return blob
}

export function generarMensajeWA(cita: {
  cliente_nombre: string
  fecha: string
  hora: string
  tipo_cita: string
  tipo_evento: string
  id: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const linkCita = `${appUrl}/mi-cita/${cita.id}`
  const gcal = generarLinkGoogleCalendar(cita)

  return `🌹 *Aurelio Martínez Atelier*

Hola *${cita.cliente_nombre}*! Tu cita fue confirmada.

📅 *Fecha:* ${cita.fecha}
🕐 *Hora:* ${cita.hora} hs
✂️ *Tipo:* ${cita.tipo_cita.replace(/-/g, ' ')}
👗 *Evento:* ${cita.tipo_evento}

📍 *Dónde:* El Salvador 5930, Palermo Hollywood, CABA

🗓️ Agendalo en Google Calendar:
${gcal}

Ver detalles de tu cita:
${linkCita}

Ante cualquier consulta escribinos. ¡Nos vemos pronto! 💛`
}

export function generarEmailCita(cita: {
  cliente_nombre: string
  fecha: string
  hora: string
  tipo_cita: string
  tipo_evento: string
  id: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const linkCita = `${appUrl}/mi-cita/${cita.id}`
  const gcal = generarLinkGoogleCalendar(cita)

  return {
    subject: `Cita confirmada — Aurelio Martínez Atelier`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#090909;font-family:'Georgia',serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:40px;border-bottom:0.5px solid rgba(201,169,110,0.3);padding-bottom:30px">
      <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#F5F0E8;letter-spacing:6px;margin:0;text-transform:uppercase">Aurelio Martínez</h1>
      <p style="color:rgba(201,169,110,0.7);font-size:11px;letter-spacing:4px;margin:8px 0 0;text-transform:uppercase">Atelier de Alta Costura</p>
    </div>
    
    <!-- Saludo -->
    <h2 style="font-family:Georgia,serif;font-size:22px;font-style:italic;font-weight:300;color:#F5F0E8;margin:0 0 8px">Tu cita está confirmada</h2>
    <p style="color:rgba(245,240,232,0.5);font-size:14px;margin:0 0 30px">Hola ${cita.cliente_nombre}, te esperamos en el atelier.</p>
    
    <!-- Detalles -->
    <div style="background:#111;border:0.5px solid rgba(201,169,110,0.2);padding:24px;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        ${[
          ['📅 Fecha', cita.fecha],
          ['🕐 Hora', `${cita.hora} hs`],
          ['✂️ Tipo de cita', cita.tipo_cita.replace(/-/g, ' ')],
          ['👗 Evento', cita.tipo_evento],
          ['📍 Dirección', 'El Salvador 5930, Palermo Hollywood, CABA'],
        ].map(([label, val]) => `
        <tr>
          <td style="padding:8px 0;color:rgba(201,169,110,0.7);font-size:12px;letter-spacing:1px;text-transform:uppercase;width:40%;border-bottom:0.5px solid rgba(245,240,232,0.06)">${label}</td>
          <td style="padding:8px 0;color:#F5F0E8;font-size:14px;border-bottom:0.5px solid rgba(245,240,232,0.06)">${val}</td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- Botones calendario -->
    <div style="text-align:center;margin-bottom:24px">
      <p style="color:rgba(245,240,232,0.4);font-size:12px;margin:0 0 12px;letter-spacing:1px;text-transform:uppercase">Agendá tu cita en tu calendario</p>
      <a href="${gcal}" style="display:inline-block;margin:0 6px;background:transparent;border:0.5px solid rgba(201,169,110,0.4);color:#C9A96E;padding:10px 20px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase">Google Calendar</a>
      <a href="${linkCita}" style="display:inline-block;margin:0 6px;background:rgba(201,169,110,0.1);border:0.5px solid rgba(201,169,110,0.4);color:#C9A96E;padding:10px 20px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase">Ver mi cita</a>
    </div>

    <!-- Footer -->
    <div style="border-top:0.5px solid rgba(201,169,110,0.15);padding-top:24px;text-align:center">
      <p style="color:rgba(245,240,232,0.25);font-size:12px;margin:0">Ante cualquier consulta escribinos por WhatsApp al +54 9 11 3620-5098</p>
      <p style="color:rgba(245,240,232,0.15);font-size:11px;margin:8px 0 0">© 2025 Aurelio Martínez Atelier · Palermo Hollywood, CABA</p>
    </div>
  </div>
</body>
</html>`,
  }
}

// Notificación al atelier por Telegram cuando se agenda una cita.
// Requiere TELEGRAM_BOT_TOKEN (token del bot creado con @BotFather) y
// TELEGRAM_CHAT_ID (tu chat_id personal, obtenido una vez via /getUpdates).
// Si no están configurados, no hace nada (no rompe el flujo de citas).
export async function enviarNotificacionPushCita(cita: {
  cliente_nombre: string
  cliente_telefono: string
  fecha: string
  hora: string
  tipo_evento: string
  tipo_cita: string
  notas?: string
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const mensaje = [
    '🌹 Nueva cita agendada',
    '',
    `Cliente: ${cita.cliente_nombre}`,
    `Fecha: ${cita.fecha} a las ${cita.hora} hs`,
    `Evento: ${cita.tipo_evento} · Cita: ${cita.tipo_cita.replace(/-/g, ' ')}`,
    `Tel: ${cita.cliente_telefono}`,
    cita.notas ? `Notas: ${cita.notas}` : null,
  ].filter(Boolean).join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensaje }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('Telegram respondio con error:', res.status, await res.text().catch(() => ''))
    }
  } catch (e) {
    console.error('Error enviando notificacion Telegram (revisa TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID):', e)
  }
}
