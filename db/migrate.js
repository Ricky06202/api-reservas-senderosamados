import { db } from './index.js'
import { migrate } from 'drizzle-orm/mysql2/migrator'

async function runMigration() {
  console.log('Running migrations...')
  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migrations applied successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error applying migrations:', error)
    process.exit(1)
  }
}

runMigration()
