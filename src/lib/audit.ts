import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getClientIp } from "./request";

export async function audit(
  action: string,
  opts: { userId?: string | null; entity?: string; entityId?: string; details?: Prisma.InputJsonValue } = {},
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId: opts.userId ?? null,
        entity: opts.entity,
        entityId: opts.entityId,
        details: opts.details,
        ip: await getClientIp(),
      },
    });
  } catch (e) {
    console.error("[audit] échec d'écriture", e);
  }
}
