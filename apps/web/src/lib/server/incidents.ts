import { prisma } from './prisma';

export async function listIncidents(userId?: string, role?: string) {
  try {
    const where: any = {};
    if (role !== 'ADMIN' && role !== 'SUPERADMIN' && userId) {
      where.order = {
        OR: [
          { buyerId: userId },
          { shop: { OR: [{ ownerId: userId }, { memberships: { some: { userId } } }] } },
        ],
      };
    }

    const incidents = await prisma.orderIncident.findMany({
      where,
      include: { order: { include: { shop: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return incidents.map((inc) => ({
      id: inc.id,
      orderId: inc.orderId,
      orderNumber: inc.order?.orderNumber || 'CMD-UNKNOWN',
      shopId: inc.order?.shopId,
      reporterName: inc.reporterName,
      reporterPhone: inc.reporterPhone || undefined,
      category: inc.category,
      title: inc.title,
      description: inc.description,
      evidenceUrls: inc.evidenceUrls,
      status: inc.status,
      resolution: inc.resolution || undefined,
      proposedOutcome: inc.proposedOutcome || undefined,
      resolvedAt: inc.resolvedAt?.toISOString(),
      createdAt: inc.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export const getIncidents = listIncidents;

export async function createIncident(userId: string, data: {
  orderId: string;
  reporterName?: string;
  reporterPhone?: string;
  category?: any;
  title: string;
  description: string;
  evidenceUrls?: string[];
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const created = await prisma.orderIncident.create({
    data: {
      orderId: data.orderId,
      reporterName: data.reporterName || user?.name || 'Client',
      reporterPhone: data.reporterPhone || user?.phone || null,
      category: data.category || 'OTHER',
      title: data.title,
      description: data.description,
      evidenceUrls: data.evidenceUrls || [],
      status: 'OPEN',
    },
    include: { order: true },
  });

  return {
    id: created.id,
    orderId: created.orderId,
    orderNumber: created.order?.orderNumber,
    reporterName: created.reporterName,
    title: created.title,
    description: created.description,
    evidenceUrls: created.evidenceUrls,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function resolveIncident(
  userId: string,
  role: string | undefined,
  id: string,
  body: { resolution: string; proposedOutcome?: string }
) {
  const updated = await prisma.orderIncident.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolution: body.resolution,
      proposedOutcome: body.proposedOutcome || null,
      resolvedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    resolution: updated.resolution,
    resolvedAt: updated.resolvedAt?.toISOString(),
  };
}
