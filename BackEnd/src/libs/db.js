import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

db.$use(async (params, next) => {
  if (params.model === "User") {
    if (params.action === "create") {
      const password = params.args.data.password;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        params.args.data.password = hashedPassword;
      }
    }

    if (params.action === "update") {
      const password = params.args.data.password;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        params.args.data.password = hashedPassword;
      }
    }
  }

  return next(params)
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
