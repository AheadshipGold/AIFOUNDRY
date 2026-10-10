import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthUserFromRequest } from "@/lib/server/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { resolution, proposedOutcome } = body;

    const incident = await prisma.orderIncident.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolution,
        proposedOutcome: proposedOutcome || undefined,
        resolvedAt: new Date(),
      },
    });

    // Log admin action
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: user.email }
    });

    if (adminUser) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: adminUser.id,
          action: "RESOLVE_DISPUTE",
          targetResource: "OrderIncident",
          targetId: id,
          afterState: JSON.parse(JSON.stringify(incident)),
        }
      });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Failed to resolve dispute:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
