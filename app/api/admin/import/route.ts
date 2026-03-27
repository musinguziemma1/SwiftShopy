import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, action, ids, data: importData } = body;

    if (importData && Array.isArray(importData)) {
      const results: Array<{ row: number; success: boolean; error?: string }> = [];
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < importData.length; i++) {
        try {
          const row = importData[i];
          if (!row.name && !row.email && !row.id) {
            results.push({ row: i + 1, success: false, error: "Missing required fields" });
            failedCount++;
            continue;
          }
          results.push({ row: i + 1, success: true });
          successCount++;
        } catch (e) {
          results.push({ row: i + 1, success: false, error: e instanceof Error ? e.message : "Unknown error" });
          failedCount++;
        }
      }

      return NextResponse.json({
        type,
        totalCount: importData.length,
        successCount,
        failedCount,
        results,
        importedAt: new Date().toISOString(),
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs or data provided" }, { status: 400 });
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        results.push({ id, success: true });
        successCount++;
      } catch (e) {
        results.push({ id, success: false, error: e instanceof Error ? e.message : "Unknown error" });
        failedCount++;
      }
    }

    return NextResponse.json({
      type,
      action,
      totalCount: ids.length,
      successCount,
      failedCount,
      results,
      executedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[api/admin/import] Error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
