import express from 'express'
import cors from 'cors'
import { db } from './db/index.js'
import { casas, estado, reservas, anotaciones } from './db/schema.js'
import { eq, inArray } from 'drizzle-orm'

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'https://reservas-senderosamados.rsanjur.com',
  'http://localhost:8081',
  'capacitor://localhost',
  'ionic://localhost',
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Si no hay origin (ej. App móvil nativa, Postman, server-to-server)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      } else {
        console.log('Solicitud bloqueada por CORS desde el origen:', origin)
        const msg = `El origen CORS '${origin}' no tiene permiso de acceso.`
        return callback(new Error(msg), false)
      }
    },
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Obtener todas las casas
app.get('/casas', async (req, res) => {
  try {
    const allCasas = await db.select().from(casas)
    res.json(allCasas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener casas' })
  }
})

// Obtener todos los estados
app.get('/estados', async (req, res) => {
  try {
    const allEstados = await db.select().from(estado)
    res.json(allEstados)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener estados' })
  }
})

// Obtener todas las reservas con detalles y anotaciones
app.get('/reservas', async (req, res) => {
  try {
    const reservasResult = await db
      .select({
        id: reservas.id,
        nombre: reservas.nombre,
        casaId: reservas.casaId,
        cantPersonas: reservas.cantPersonas,
        estadoId: reservas.estadoId,
        total: reservas.total,
        abono: reservas.abono,
        comisionBooking: reservas.comisionBooking,
        estadoComision: reservas.estadoComision,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        casaNombre: casas.nombre,
        estadoNombre: estado.nombre,
      })
      .from(reservas)
      .leftJoin(casas, eq(reservas.casaId, casas.id))
      .leftJoin(estado, eq(reservas.estadoId, estado.id))

    const reservaIds = reservasResult.map((r) => r.id)
    let anotacionesMap = {}

    if (reservaIds.length > 0) {
      const allAnotaciones = await db
        .select()
        .from(anotaciones)
        .where(inArray(anotaciones.reservaId, reservaIds))

      for (const nota of allAnotaciones) {
        if (!anotacionesMap[nota.reservaId]) {
          anotacionesMap[nota.reservaId] = []
        }
        anotacionesMap[nota.reservaId].push(nota)
      }
    }

    const formattedReservas = reservasResult.map((r) => {
      const { casaNombre, estadoNombre, ...rest } = r
      return {
        ...rest,
        casa: casaNombre,
        estado: estadoNombre,
        anotaciones: anotacionesMap[r.id] || [],
      }
    })

    res.json(formattedReservas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener reservas' })
  }
})

// Crear una reserva
app.post('/reservas', async (req, res) => {
  const {
    nombre,
    casaId,
    cantPersonas,
    estadoId,
    total,
    abono,
    comisionBooking,
    estadoComision,
    fechaInicio,
    fechaFin,
  } = req.body
  try {
    const result = await db.insert(reservas).values({
      nombre,
      casaId,
      cantPersonas,
      estadoId,
      total,
      abono,
      comisionBooking,
      estadoComision,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    })
    res.status(201).json({ message: 'Reserva creada', id: result[0].insertId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear reserva' })
  }
})

// Actualizar una reserva
app.put('/reservas/:id', async (req, res) => {
  const { id } = req.params
  const {
    nombre,
    casaId,
    cantPersonas,
    estadoId,
    total,
    abono,
    comisionBooking,
    estadoComision,
    fechaInicio,
    fechaFin,
  } = req.body
  try {
    await db
      .update(reservas)
      .set({
        nombre,
        casaId,
        cantPersonas,
        estadoId,
        total,
        abono,
        comisionBooking,
        estadoComision,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      })
      .where(eq(reservas.id, Number(id)))
    res.json({ message: 'Reserva actualizada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar reserva' })
  }
})

// Eliminar una reserva
app.delete('/reservas/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.delete(reservas).where(eq(reservas.id, Number(id)))
    res.json({ message: 'Reserva eliminada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar reserva' })
  }
})

// Agregar una anotación
app.post('/anotaciones', async (req, res) => {
  const { reservaId, contenido } = req.body || {}
  try {
    const result = await db.insert(anotaciones).values({
      reservaId,
      contenido,
    })
    res.status(201).json({
      message: 'Anotación agregada',
      id: result[0].insertId,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al agregar anotación' })
  }
})

// Eliminar una anotación
app.delete('/anotaciones/:id', async (req, res) => {
  const { id } = req.params
  try {
    await db.delete(anotaciones).where(eq(anotaciones.id, Number(id)))
    res.json({ message: 'Anotación eliminada' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar anotación' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
