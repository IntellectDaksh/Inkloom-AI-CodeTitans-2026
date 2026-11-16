import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { buildReportData } from "./data";

async function GET_handler(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = buildReportData(id);
    if (!report) return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
