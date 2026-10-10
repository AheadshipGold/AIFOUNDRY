import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthUserFromRequest } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.purchaseRequest.findMany({
      include: {
        buyer: {
          select: {
            name: true,
          }
        },
        proposals: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch D02 bespoke requests", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
