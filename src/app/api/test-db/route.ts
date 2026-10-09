import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return new NextResponse(null, { status: 404 });
    }

    try {
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            success: true,
            message: "Database connection successful",
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Database connection failed",
            },
            { status: 500 }
        );
    }
}