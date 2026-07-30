import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();
  
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelsWithSoftDelete = ["User", "Account", "Transaction", "Budget"];
          
          if (modelsWithSoftDelete.includes(model) && args) {
            if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'findFirstOrThrow', 'findUniqueOrThrow'].includes(operation)) {
              args.where = { ...args.where, deletedAt: null };
            }
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          const modelsWithSoftDelete = ["User", "Account", "Transaction", "Budget"];
          if (modelsWithSoftDelete.includes(model)) {
            return prisma[model].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          const modelsWithSoftDelete = ["User", "Account", "Transaction", "Budget"];
          if (modelsWithSoftDelete.includes(model)) {
            return prisma[model].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        }
      }
    }
  });
};

export const db = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
