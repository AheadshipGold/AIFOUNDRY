import { Injectable, OnModuleInit, OnModuleDestroy, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable({ scope: Scope.DEFAULT })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Mechanism to enforce tenant isolation at the ORM level (Software RLS alternative)
  // Because true PostgreSQL RLS with Prisma requires wrapping every single query in
  // an interactive $transaction to safely execute `SET LOCAL`, which severely degrades
  // performance and exhausts connection pools, we use Prisma Client Extensions
  // to enforce `shopId` where clauses on all tenant-bound models.
  public forShop(shopId: string) {
    return this.$extends({
      query: {
        product: {
          async $allOperations({ operation, args, query }) {
            const a = args as any;
            if (['create', 'createMany'].includes(operation)) {
              a.data = Array.isArray(a.data) 
                ? a.data.map((d: any) => ({ ...d, shopId })) 
                : { ...a.data, shopId };
            } else if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
              a.where = { ...a.where, shopId };
            }
            return query(a);
          },
        },
        productVariant: {
          async $allOperations({ operation, args, query }) {
             const a = args as any;
             if (['findMany', 'findFirst'].includes(operation)) {
               a.where = { ...a.where, product: { shopId } };
             }
             return query(a);
          }
        }
      },
    });
  }
}
