import { NextRequest } from "next/server";
import { getAnthropic } from "@/lib/anthropic/client";
import { buildSystemPrompt } from "@/lib/anthropic/prompt-builder";
import { ChatContext } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const context = body.context as ChatContext | undefined;

    const systemPrompt = buildSystemPrompt(context);
    const anthropic = getAnthropic();

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === "system" ? "user" : m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        stream.on("text", (text) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text_delta", content: text })}\n\n`
            )
          );
        });

        stream.on("finalMessage", (message) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                messageId: message.id,
                usage: message.usage,
              })}\n\n`
            )
          );
          controller.close();
        });

        stream.on("error", (err) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: err instanceof Error ? err.message : "未知错误",
              })}\n\n`
            )
          );
          controller.close();
        });
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: {
          code: "UPSTREAM_ERROR",
          message: err instanceof Error ? err.message : "内部错误",
        },
      },
      { status: 500 }
    );
  }
}
