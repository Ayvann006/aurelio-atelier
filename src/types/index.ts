export type TipoEvento = 'novia' | 'quinceanera' | 'gala' | 'miss' | 'otro'
export type TipoCita = 'primera-entrevista' | 'prueba' | 'ajuste' | 'entrega'
export type EstadoCita = 'confirmada' | 'completada' | 'cancelada' | 'no-asistio'
export type EstadoPedido = 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
export type CategoriaProducto = 'batas' | 'tiaras' | 'tocados' | 'accesorios'

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: CategoriaProducto
  imagenes: string[]
  stock: number
  variantes: VarianteProducto[]
  activo: boolean
  destacado: boolean
  slug: string
  created_at: string
  updated_at: string
}

export interface VarianteProducto {
  nombre: string
  opciones: string[]
}

export interface Pedido {
  id: string
  numero: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  items: ItemPedido[]
  subtotal: number
  descuento: number
  cupon_codigo: string
  total: number
  estado: EstadoPedido
  mp_preference_id: string
  mp_payment_id: string
  mp_status: string
  notas: string
  created_at: string
  updated_at: string
}

export interface ItemPedido {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  variante?: string
  imagen?: string
}

export interface Cita {
  id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  tipo_evento: TipoEvento
  tipo_cita: TipoCita
  fecha: string
  hora: string
  notas: string
  estado: EstadoCita
  sena_pagada: boolean
  monto_sena: number
  mp_preference_id: string
  created_at: string
  updated_at: string
}

export interface ItemCarrito {
  producto: Producto
  cantidad: number
  variante?: string
}

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  provincia?: string
  ciudad?: string
  direccion?: string
  codigo_postal?: string
  tipo_evento_habitual?: string
  tipo_vestido?: 'novia' | 'quinceanera' | 'gala' | 'reina' | 'alta-costura' | 'otro'
  fecha_entrega?: string
  color_vestido?: string
  estado_proyecto?: string
  fotos_referencia?: string[]
  bocetos?: string[]
  total_citas?: number
  notas?: string
  created_at: string
  updated_at: string
}

export interface Medida {
  id: string
  cliente_id: string
  busto?: number
  bajo_busto?: number
  cintura?: number
  cadera?: number
  largo_delantero?: number
  largo_espalda?: number
  largo_total?: number
  hombros?: number
  sisa?: number
  brazo?: number
  biceps?: number
  muneca?: number
  tiro?: number
  largo_falda?: number
  altura?: number
  talle?: number
  taco_zapato?: number
  observaciones?: string
  registrado_por?: string
  created_at: string
  updated_at: string
}

export interface Presupuesto {
  id: string
  cliente_id: string
  numero: string
  descripcion_diseno?: string
  imagen_referencia?: string
  precio_total: number
  anticipos: AnticipoItem[]
  cuotas: CuotaItem[]
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  notas?: string
  created_at: string
  updated_at: string
}

export interface AnticipoItem {
  fecha: string
  monto: number
  descripcion?: string
  pagado: boolean
}

export interface CuotaItem {
  numero: number
  fecha_vencimiento: string
  monto: number
  pagado: boolean
}

export interface NotaClientа {
  id: string
  cliente_id: string
  contenido: string
  autor: string
  importante: boolean
  created_at: string
  updated_at: string
}

export interface ArchivoClientа {
  id: string
  cliente_id: string
  nombre: string
  url: string
  tipo: 'foto' | 'boceto' | 'prueba' | 'referencia' | 'otro'
  created_at: string
}

export interface HistorialEvento {
  id: string
  cliente_id: string
  evento: string
  descripcion?: string
  estado_anterior?: string
  estado_nuevo?: string
  created_at: string
}
