import express from 'express'
import cors from 'cors'
import { db } from './db/index.js'
import { casas, estado, reservas } from './db/schema.js'
import { eq } from 'drizzle-orm'

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = ['https://reservas-senderosamados.rsanjur.com']

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origen (como herramientas de servidor o Postman)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'El origen CORS especificado no tiene permiso de acceso.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
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

// Obtener todas las reservas con detalles
app.get('/reservas', async (req, res) => {
  try {
    // Realizamos joins para obtener los nombres de casa y estado
    const allReservas = await db
      .select({
        id: reservas.id,
        nombre: reservas.nombre,
        casa: casas.nombre,
        cantPersonas: reservas.cantPersonas,
        estado: estado.nombre,
        total: reservas.total,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
      })
      .from(reservas)
      .leftJoin(casas, eq(reservas.casaId, casas.id))
      .leftJoin(estado, eq(reservas.estadoId, estado.id))

    res.json(allReservas)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
