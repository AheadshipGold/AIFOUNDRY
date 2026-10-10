import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthUserFromRequest } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incidents = await prisma.orderIncident.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Failed to fetch disputes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
