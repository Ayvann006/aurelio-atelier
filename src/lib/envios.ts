export interface TarifaEnvio {
  provincia: string
  zona: string
  dias: string
  precio: number
}

export const TARIFAS_ENVIO: TarifaEnvio[] = [
  { provincia: 'CABA', zona: 'Z1', dias: '1-2 días hábiles', precio: 2500 },
  { provincia: 'Buenos Aires (GBA)', zona: 'Z1', dias: '1-2 días hábiles', precio: 3000 },
  { provincia: 'Buenos Aires (interior)', zona: 'Z2', dias: '2-3 días hábiles', precio: 4500 },
  { provincia: 'Córdoba', zona: 'Z2', dias: '2-3 días hábiles', precio: 5000 },
  { provincia: 'Santa Fe', zona: 'Z2', dias: '2-3 días hábiles', precio: 4800 },
  { provincia: 'Mendoza', zona: 'Z3', dias: '3-4 días hábiles', precio: 6500 },
  { provincia: 'Entre Ríos', zona: 'Z2', dias: '2-3 días hábiles', precio: 5200 },
  { provincia: 'Tucumán', zona: 'Z3', dias: '3-4 días hábiles', precio: 6800 },
  { provincia: 'Salta', zona: 'Z3', dias: '3-5 días hábiles', precio: 7500 },
  { provincia: 'Corrientes', zona: 'Z3', dias: '3-4 días hábiles', precio: 6500 },
  { provincia: 'Misiones', zona: 'Z3', dias: '3-5 días hábiles', precio: 7000 },
  { provincia: 'Chaco', zona: 'Z3', dias: '3-5 días hábiles', precio: 7200 },
  { provincia: 'Formosa', zona: 'Z3', dias: '4-5 días hábiles', precio: 7500 },
  { provincia: 'Jujuy', zona: 'Z3', dias: '3-5 días hábiles', precio: 7800 },
  { provincia: 'Santiago del Estero', zona: 'Z3', dias: '3-4 días hábiles', precio: 6900 },
  { provincia: 'La Rioja', zona: 'Z3', dias: '3-5 días hábiles', precio: 7200 },
  { provincia: 'Catamarca', zona: 'Z3', dias: '3-5 días hábiles', precio: 7200 },
  { provincia: 'San Juan', zona: 'Z3', dias: '3-5 días hábiles', precio: 7000 },
  { provincia: 'San Luis', zona: 'Z3', dias: '3-4 días hábiles', precio: 6500 },
  { provincia: 'La Pampa', zona: 'Z3', dias: '3-4 días hábiles', precio: 6800 },
  { provincia: 'Neuquén', zona: 'Z4', dias: '4-6 días hábiles', precio: 8500 },
  { provincia: 'Río Negro', zona: 'Z4', dias: '4-6 días hábiles', precio: 8500 },
  { provincia: 'Chubut', zona: 'Z4', dias: '5-7 días hábiles', precio: 9500 },
  { provincia: 'Santa Cruz', zona: 'Z4', dias: '6-8 días hábiles', precio: 11000 },
  { provincia: 'Tierra del Fuego', zona: 'Z4', dias: '7-10 días hábiles', precio: 14000 },
]

export function getTarifaEnvio(provincia: string): TarifaEnvio | null {
  return TARIFAS_ENVIO.find(t => t.provincia === provincia) || null
}

export function getProvincias(): string[] {
  return TARIFAS_ENVIO.map(t => t.provincia)
}
