import { db } from './index.js'
import { casas, estado, reservas } from './schema.js'
import { sql } from 'drizzle-orm'

async function seed() {
  console.log('Seeding database...')

  try {
    // Limpiar tablas (orden inverso por dependencias)
    console.log('Cleaning tables...')
    await db.delete(reservas)
    await db.delete(casas)
    await db.delete(estado)

    // Resetear auto-increment (opcional, pero util para ids predecibles)
    // Nota: TRUNCATE suele ser mejor pero delete es mas compatible si no hay restricciones severas.
    // Para asegurar IDs, los insertaremos explicitamente.

    // Insertar estados
    console.log('Inserting estados...')
    await db.insert(estado).values([
      { id: 1, nombre: 'por cobrar' },
      { id: 2, nombre: 'pagado' },
    ])

    // Insertar casas
    console.log('Inserting casas...')
    await db.insert(casas).values([
      { id: 1, nombre: 'HAB 1' },
      { id: 2, nombre: 'HAB 2' },
      { id: 3, nombre: 'HAB 3' },
    ])

    // Insertar reservas
    console.log('Inserting reservas...')
    await db.insert(reservas).values([
      {
        nombre: 'Reserva 1',
        casaId: 1,
        cantPersonas: 2,
        estadoId: 1,
        total: 100,
        fechaInicio: new Date('2025-12-01'),
        fechaFin: new Date('2025-12-05'),
      },
      {
        nombre: 'Reserva 2',
        casaId: 2,
        cantPersonas: 3,
        estadoId: 2,
        total: 200,
        fechaInicio: new Date('2025-12-06'),
        fechaFin: new Date('2025-12-10'),
      },
      {
        nombre: 'Reserva 3',
        casaId: 3,
        cantPersonas: 4,
        estadoId: 1,
        total: 300,
        fechaInicio: new Date('2025-12-11'),
        fechaFin: new Date('2025-12-15'),
      },
    ])

    console.log('Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
