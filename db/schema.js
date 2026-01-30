import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const estado = mysqlTable('estado', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
})

export const casas = mysqlTable('casas', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
})

export const reservas = mysqlTable('reservas', {
  id: int('id').primaryKey().autoincrement(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  casaId: int('casa_id').references(() => casas.id),
  cantPersonas: int('cant_personas').notNull(),
  estadoId: int('estado_id').references(() => estado.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  abono: decimal('abono', { precision: 10, scale: 2 }).default('0.00'),
  comisionBooking: decimal('comision_booking', { precision: 10, scale: 2 }).default('0.00'),
  estadoComision: varchar('estado_comision', { length: 50 }).default('pendiente'),
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
})

export const anotaciones = mysqlTable('anotaciones', {
  id: int('id').primaryKey().autoincrement(),
  reservaId: int('reserva_id').references(() => reservas.id),
  contenido: varchar('contenido', { length: 1000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const reservasRelations = relations(reservas, ({ many, one }) => ({
  anotaciones: many(anotaciones),
  casa: one(casas, {
    fields: [reservas.casaId],
    references: [casas.id],
  }),
  estado: one(estado, {
    fields: [reservas.estadoId],
    references: [estado.id],
  }),
}))

export const anotacionesRelations = relations(anotaciones, ({ one }) => ({
  reserva: one(reservas, {
    fields: [anotaciones.reservaId],
    references: [reservas.id],
  }),
}))
