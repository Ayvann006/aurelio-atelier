# Aurelio Martínez — Atelier de Alta Costura
## Stack: Next.js 14 · Supabase · MercadoPago · Vercel

---

## INSTALACIÓN LOCAL

```bash
# 1. Clonar / descomprimir
cd aurelio-atelier

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# → Editar .env.local con tus credenciales reales

# 4. Correr en desarrollo
npm run dev
# → http://localhost:3000
```

---

## CONFIGURACIÓN DE SUPABASE

1. Ir a https://supabase.com → New Project
2. En SQL Editor, ejecutar todo el contenido de `supabase/schema.sql`
3. Copiar las credenciales a `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings → API → anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` → Settings → API → service_role key

---

## CONFIGURACIÓN DE MERCADO PAGO

1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una aplicación
3. Copiar a `.env.local`:
   - `MP_ACCESS_TOKEN` → Credenciales → Access Token de producción
   - `NEXT_PUBLIC_MP_PUBLIC_KEY` → Credenciales → Public Key

**Para webhooks en producción:**
- URL: `https://tudominio.com/api/webhook/mp`
- Evento: `payment`

---

## DEPLOY EN VERCEL

```bash
# Opción A — CLI
npm i -g vercel
vercel --prod

# Opción B — GitHub
# 1. Subir a GitHub
# 2. Importar en vercel.com
# 3. Agregar todas las variables de .env.local en Vercel → Settings → Environment Variables
```

---

## PANEL DE ADMINISTRACIÓN

URL: `https://tudominio.com/admin`
Contraseña: la que configures en `ADMIN_PASSWORD` del .env.local

**Funcionalidades:**
- Dashboard con métricas en tiempo real
- Gestión completa de citas (ver, completar, cancelar)
- Gestión de pedidos con cambio de estado
- CRUD de productos (crear, editar stock, activar/desactivar)
- Bloquear fechas y horarios

---

## IMÁGENES

Agregar en `/public/images/`:
- `hero.jpg` → Foto hero de la landing
- `aurelio.jpg` → Foto de Aurelio
- `cat-novias.jpg`, `cat-quinces.jpg`, `cat-gala.jpg`, `cat-miss.jpg` → Categorías
- `cta-bg.jpg` → Fondo del CTA final

O usar Supabase Storage y actualizar las URLs en los productos desde el admin.

---

## VARIABLES DE ENTORNO REQUERIDAS

| Variable | Descripción |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL de tu proyecto Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Clave pública Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Clave privada Supabase |
| MP_ACCESS_TOKEN | Token de MercadoPago |
| NEXT_PUBLIC_MP_PUBLIC_KEY | Clave pública MercadoPago |
| NEXT_PUBLIC_APP_URL | URL de producción |
| ADMIN_PASSWORD | Contraseña del panel admin |
| NEXT_PUBLIC_WA_NUMBER | Número de WhatsApp (sin +) |

---

## ESTRUCTURA DE RUTAS

| Ruta | Descripción |
|---|---|
| `/` | Landing page completa |
| `/citas` | Sistema de reservas con calendario |
| `/citas/confirmada` | Confirmación post-cita |
| `/tienda` | Catálogo de productos |
| `/tienda/carrito` | Carrito + checkout |
| `/tienda/gracias` | Confirmación post-compra |
| `/admin` | Panel de administración |
| `/api/disponibilidad` | Horarios disponibles por fecha |
| `/api/citas` | CRUD de citas |
| `/api/checkout` | Crear pedido + preferencia MP |
| `/api/webhook/mp` | Webhook de pagos MP |

