'use client'
import { useState } from 'react'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import { useCarrito } from '@/lib/store'
import { formatPrecio } from '@/lib/utils'
import { TARIFAS_ENVIO } from '@/lib/envios'
import { Trash2, Minus, Plus, ShoppingBag, Loader2, Tag, MapPin, Truck, Package, Home, Building } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'

const checkoutSchema = z.object({
  cliente_nombre: z.string().min(2, 'Nombre requerido'),
  cliente_email: z.string().email('Email inválido'),
  cliente_telefono: z.string().min(8, 'Teléfono requerido'),
  tipo_domicilio: z.enum(['casa', 'departamento', 'oficina']),
  calle: z.string().min(3, 'Calle requerida'),
  numero: z.string().min(1, 'Número requerido'),
  piso: z.string().optional(),
  departamento: z.string().optional(),
  entre_calles: z.string().optional(),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  provincia: z.string().min(1, 'Provincia requerida'),
  codigo_postal: z.string().min(4, 'CP requerido'),
  notas_envio: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CarritoPage() {
  const { items, quitar, actualizar, limpiar, total, cantidad } = useCarrito()
  const [cupon, setCupon] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [cargandoCupon, setCargandoCupon] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [cotizando, setCotizando] = useState(false)
  const [cotizacion, setCotizacion] = useState<any>(null)
  const [provinciaCalc, setProvinciaCalc] = useState('')

  const costoEnvio = cotizacion?.precio || 0
  const totalFinal = total() - descuento + costoEnvio

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { tipo_domicilio: 'casa' }
  })

  const tipoDomicilio = watch('tipo_domicilio')

  async function cotizarEnvio(provincia: string) {
    if (!provincia) return
    setCotizando(true)
    try {
      const res = await fetch('/api/envio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provincia, peso_kg: 0.5 }),
      })
      const data = await res.json()
      if (res.ok) setCotizacion(data)
      else toast.error('No se pudo cotizar el envío')
    } finally { setCotizando(false) }
  }

  async function aplicarCupon() {
    if (!cupon.trim()) return
    setCargandoCupon(true)
    await new Promise(r => setTimeout(r, 600))
    setCuponAplicado(cupon.toUpperCase())
    toast.info('El cupón se validará al confirmar')
    setCargandoCupon(false)
  }

  async function onCheckout(data: CheckoutForm) {
    setCargando(true)
    try {
      const direccion_completa = `${data.calle} ${data.numero}${data.piso ? `, Piso ${data.piso}` : ''}${data.departamento ? ` Dpto ${data.departamento}` : ''}${data.entre_calles ? ` (entre ${data.entre_calles})` : ''}`

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: data.cliente_nombre,
          cliente_email: data.cliente_email,
          cliente_telefono: data.cliente_telefono,
          provincia_envio: data.provincia,
          ciudad_envio: data.ciudad,
          direccion_envio: direccion_completa,
          codigo_postal: data.codigo_postal,
          notas: data.notas_envio,
          items: items.map(i => ({
            producto_id: i.producto.id,
            nombre: i.producto.nombre,
            precio: i.producto.precio,
            cantidad: i.cantidad,
            variante: i.variante,
          })),
          subtotal: total(),
          descuento,
          cupon_codigo: cuponAplicado || undefined,
          costo_envio: costoEnvio,
          total: totalFinal,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      limpiar()
      window.location.href = json.mp_url
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago')
    } finally { setCargando(false) }
  }

  if (cantidad() === 0) {
    return (
      <>
        <Nav />
        <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag size={48} className="text-marfil/10 mx-auto mb-6" strokeWidth={0.5} />
            <p className="font-cormorant text-2xl italic text-marfil/40 mb-6">Tu carrito está vacío</p>
            <Link href="/tienda" className="btn-gold">Ver la tienda</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-28 pb-20 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-cormorant text-3xl italic font-light mb-10">Carrito</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-px">
              {items.map(item => (
                <div key={`${item.producto.id}-${item.variante}`} className="card-dark flex gap-4 items-center">
                  <div className="w-16 h-20 bg-negro3 flex-shrink-0 overflow-hidden">
                    {item.producto.imagenes?.[0]
                      ? <img src={item.producto.imagenes[0]} alt={item.producto.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={20} className="text-marfil/15" strokeWidth={0.5} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dorado text-xs uppercase tracking-wider mb-0.5">{item.producto.categoria}</p>
                    <p className="font-cormorant text-lg font-light truncate">{item.producto.nombre}</p>
                    <p className="text-dorado text-sm mt-1">{formatPrecio(item.producto.precio)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => actualizar(item.producto.id, item.cantidad - 1, item.variante)} className="w-7 h-7 border border-marfil/10 flex items-center justify-center text-marfil/40 hover:border-dorado/40 hover:text-dorado transition-all"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm">{item.cantidad}</span>
                    <button onClick={() => actualizar(item.producto.id, item.cantidad + 1, item.variante)} className="w-7 h-7 border border-marfil/10 flex items-center justify-center text-marfil/40 hover:border-dorado/40 hover:text-dorado transition-all"><Plus size={12} /></button>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm mb-2">{formatPrecio(item.producto.precio * item.cantidad)}</p>
                    <button onClick={() => quitar(item.producto.id, item.variante)} className="text-marfil/20 hover:text-red-400/70 transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                  </div>
                </div>
              ))}

              {/* Cotizador de envío */}
              <div className="card-dark">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={14} className="text-dorado" strokeWidth={1.5} />
                  <p className="text-xs text-marfil/40 tracking-widest uppercase">Calcular costo de envío</p>
                </div>
                <div className="flex gap-3">
                  <select value={provinciaCalc} onChange={e => setProvinciaCalc(e.target.value)} className="select-dark flex-1">
                    <option value="">Seleccioná tu provincia</option>
                    {TARIFAS_ENVIO.map(t => <option key={t.provincia} value={t.provincia}>{t.provincia}</option>)}
                  </select>
                  <button onClick={() => cotizarEnvio(provinciaCalc)} disabled={!provinciaCalc || cotizando}
                    className="border border-dorado/50 text-dorado px-4 text-xs hover:bg-dorado/10 transition-all disabled:opacity-40 flex items-center gap-2">
                    {cotizando ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />}
                    Cotizar
                  </button>
                </div>
                {cotizacion && (
                  <div className="mt-3 bg-dorado/5 border border-dorado/15 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-marfil font-medium">{cotizacion.transportista}</p>
                        <p className="text-marfil/40 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {cotizacion.provincia} · {cotizacion.dias_habiles}
                        </p>
                        <p className="text-marfil/30 text-xs mt-0.5">Peso facturado: {cotizacion.peso_facturado} kg</p>
                      </div>
                      <p className="text-dorado font-cormorant text-2xl">{formatPrecio(cotizacion.precio)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div>
              <div className="card-dark sticky top-28">
                <p className="text-xs text-marfil/40 tracking-widest uppercase mb-5">Resumen</p>
                <div className="flex gap-2 mb-5">
                  <input value={cupon} onChange={e => setCupon(e.target.value)} placeholder="Cupón de descuento" className="input-dark flex-1 text-xs py-2" />
                  <button onClick={aplicarCupon} disabled={cargandoCupon} className="border border-dorado/50 text-dorado px-3 text-xs hover:bg-dorado/10 transition-all flex items-center">
                    {cargandoCupon ? <Loader2 size={12} className="animate-spin" /> : <Tag size={12} />}
                  </button>
                </div>
                {cuponAplicado && <p className="text-dorado text-xs mb-4 flex items-center gap-1"><Tag size={10} /> {cuponAplicado}</p>}
                <div className="space-y-2.5 border-t border-marfil/8 pt-4 mb-5">
                  <div className="flex justify-between text-sm"><span className="text-marfil/50">Subtotal</span><span>{formatPrecio(total())}</span></div>
                  {descuento > 0 && <div className="flex justify-between text-sm text-dorado"><span>Descuento</span><span>-{formatPrecio(descuento)}</span></div>}
                  <div className="flex justify-between text-sm">
                    <span className="text-marfil/50 flex items-center gap-1"><Truck size={11} /> Envío</span>
                    <span>{cotizacion ? formatPrecio(costoEnvio) : <span className="text-marfil/30 text-xs">Cotizá arriba</span>}</span>
                  </div>
                  <div className="flex justify-between border-t border-marfil/8 pt-3">
                    <span className="text-sm tracking-wider uppercase">Total</span>
                    <span className="font-cormorant text-xl">{formatPrecio(totalFinal)}</span>
                  </div>
                </div>
                <button onClick={() => setCheckoutOpen(true)} disabled={!cotizacion}
                  className="btn-gold-fill w-full justify-center py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                  Finalizar Compra
                </button>
                {!cotizacion && <p className="text-center text-marfil/25 text-xs mt-2">Cotizá el envío primero</p>}
                <p className="text-center text-marfil/25 text-xs mt-2">Pago seguro con MercadoPago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal checkout */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 bg-negro/92 flex items-center justify-center p-4" style={{backdropFilter:'blur(8px)'}}>
            <div className="bg-negro2 border border-marfil/10 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-8">
              <h2 className="font-cormorant text-2xl italic mb-2">Datos de entrega</h2>
              <p className="text-marfil/30 text-xs mb-6 tracking-wider">Completá todos los campos para procesar tu pedido</p>
              <form onSubmit={handleSubmit(onCheckout)} className="space-y-5">

                {/* Datos personales */}
                <div>
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Datos personales</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Nombre completo *</label>
                      <input {...register('cliente_nombre')} className="input-dark" placeholder="Tu nombre y apellido" />
                      {errors.cliente_nombre && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_nombre.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Email *</label>
                        <input {...register('cliente_email')} type="email" className="input-dark" placeholder="tu@email.com" />
                        {errors.cliente_email && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_email.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Teléfono *</label>
                        <input {...register('cliente_telefono')} className="input-dark" placeholder="+54 9 11..." />
                        {errors.cliente_telefono && <p className="text-red-400/80 text-xs mt-1">{errors.cliente_telefono.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipo de domicilio */}
                <div>
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Tipo de domicilio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'casa', label: 'Casa', icon: Home },
                      { value: 'departamento', label: 'Departamento', icon: Building },
                      { value: 'oficina', label: 'Oficina', icon: Building },
                    ].map(({ value, label, icon: Icon }) => (
                      <label key={value} className={`flex flex-col items-center gap-2 p-3 border cursor-pointer transition-all ${tipoDomicilio === value ? 'border-dorado bg-dorado/10' : 'border-marfil/10 hover:border-dorado/30'}`}>
                        <input type="radio" value={value} {...register('tipo_domicilio')} className="hidden" />
                        <Icon size={16} className={tipoDomicilio === value ? 'text-dorado' : 'text-marfil/30'} strokeWidth={1.5} />
                        <span className={`text-xs ${tipoDomicilio === value ? 'text-dorado' : 'text-marfil/40'}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <p className="text-xs text-dorado tracking-widest uppercase mb-3">Dirección de entrega</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Calle *</label>
                      <input {...register('calle')} className="input-dark" placeholder="Nombre de la calle" />
                      {errors.calle && <p className="text-red-400/80 text-xs mt-1">{errors.calle.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Número *</label>
                      <input {...register('numero')} className="input-dark" placeholder="1234" />
                      {errors.numero && <p className="text-red-400/80 text-xs mt-1">{errors.numero.message}</p>}
                    </div>
                  </div>
                  {tipoDomicilio === 'departamento' && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Piso</label>
                        <input {...register('piso')} className="input-dark" placeholder="Ej: 3" />
                      </div>
                      <div>
                        <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Departamento</label>
                        <input {...register('departamento')} className="input-dark" placeholder="Ej: B" />
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Entre calles (opcional)</label>
                    <input {...register('entre_calles')} className="input-dark" placeholder="Ej: Av. Santa Fe y Thames" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Ciudad *</label>
                      <input {...register('ciudad')} className="input-dark" placeholder="Tu ciudad" />
                      {errors.ciudad && <p className="text-red-400/80 text-xs mt-1">{errors.ciudad.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Código Postal *</label>
                      <input {...register('codigo_postal')} className="input-dark" placeholder="1234" />
                      {errors.codigo_postal && <p className="text-red-400/80 text-xs mt-1">{errors.codigo_postal.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Provincia *</label>
                    <select {...register('provincia')} className="select-dark w-full">
                      <option value="">Seleccioná tu provincia</option>
                      {TARIFAS_ENVIO.map(t => <option key={t.provincia} value={t.provincia}>{t.provincia}</option>)}
                    </select>
                    {errors.provincia && <p className="text-red-400/80 text-xs mt-1">{errors.provincia.message}</p>}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-xs text-marfil/40 uppercase tracking-wider block mb-1.5">Notas para el envío</label>
                  <textarea {...register('notas_envio')} rows={2} className="input-dark resize-none" placeholder="Horario de entrega, referencia del domicilio, etc." />
                </div>

                {/* Resumen final */}
                <div className="bg-negro3 border border-marfil/5 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-marfil/50">Productos</span><span>{formatPrecio(total())}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-marfil/50 flex items-center gap-1"><Truck size={10} /> Envío</span><span>{formatPrecio(costoEnvio)}</span></div>
                  {descuento > 0 && <div className="flex justify-between text-sm text-dorado"><span>Descuento</span><span>-{formatPrecio(descuento)}</span></div>}
                  <div className="flex justify-between border-t border-marfil/10 pt-2 mt-1">
                    <span className="font-medium">Total</span>
                    <span className="font-cormorant text-xl text-dorado">{formatPrecio(totalFinal)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCheckoutOpen(false)} className="btn-ghost flex-1 justify-center py-3 text-xs">Volver</button>
                  <button type="submit" disabled={cargando} className="btn-gold-fill flex-1 justify-center py-3 gap-2 disabled:opacity-50">
                    {cargando ? <Loader2 size={14} className="animate-spin" /> : null}
                    Pagar con MercadoPago
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
