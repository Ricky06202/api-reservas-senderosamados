import express from 'express'
import cors from 'cors'
import { db } from './db/index.js'
import { casas, estado, reservas, anotaciones } from './db/schema.js'
import { eq } from 'drizzle-orm'

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'https://reservas-senderosamados.rsanjur.com',
  'http://localhost',
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
    const allReservas = await db.query.reservas.findMany({
      with: {
        casa: {
          columns: {
            nombre: true,
          },
        },
        estado: {
          columns: {
            nombre: true,
          },
        },
        anotaciones: true,
      },
    })

    // Mapear para mantener compatibilidad con el formato anterior si es necesario,
    // o simplemente devolver el objeto con anotaciones.
    const formattedReservas = allReservas.map((r) => ({
      ...r,
      casa: r.casa?.nombre,
      estado: r.estado?.nombre,
    }))

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
  const { reservaId, contenido } = req.body
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
