import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // No Prisma 7, use esta estrutura exata para o db pull
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // Mantenha o migrate para garantir compatibilidade total
  migrate: {
    url: process.env.DATABASE_URL,
  }
});