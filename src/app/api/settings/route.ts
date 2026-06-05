import { NextRequest } from "next/server";
import { readSettings, writeSettings, maskSettings } from "@/lib/settings/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
  "provider",
  "anthropicApiKey",
  "anthropicModel",
  "openaiApiKey",
  "openaiModel",
  "openaiBaseURL",
  "githubToken",
  "giteeToken",
];

export async function GET() {
  try {
    const settings = await readSettings();
    return Response.json({ success: true, data: maskSettings(settings) });
  } catch {
    return Response.json(
      { success: false, error: { message: "读取配置失败" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const partial: Record<string, string> = {};

    for (const key of ALLOWED_FIELDS) {
      if (typeof body[key] === "string") {
        partial[key] = body[key];
      }
    }

    const settings = await writeSettings(partial);
    return Response.json({ success: true, data: maskSettings(settings) });
  } catch {
    return Response.json(
      { success: false, error: { message: "保存配置失败" } },
      { status: 500 }
    );
  }
}
