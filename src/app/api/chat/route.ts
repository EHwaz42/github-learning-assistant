import { NextRequest } from "next/server";
import { getAnthropic } from "@/lib/anthropic/client";
import { getOpenAI } from "@/lib/openai/client";
import { buildSystemPrompt } from "@/lib/anthropic/prompt-builder";
import { readSettings, effectiveConfig } from "@/lib/settings/config";
import { ChatContext } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const context = body.context as ChatContext | undefined;
    const systemPrompt = buildSystemPrompt(context);

    const settings = await readSettings();
    const config = effectiveConfig(settings);

    if (config.provider === "openai") {
      return handleOpenAI(systemPrompt, messages, config.apiKey, config.model, config.baseURL);
    }
    return handleAnthropic(systemPrompt, messages, config.apiKey, config.model);
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

async function handleAnthropic(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  apiKey?: string,
  model?: string,
) {
  const anthropic = getAnthropic(apiKey);

  const stream = anthropic.messages.stream({
    model: model || "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => {
      const role = m.role === "system" ? "user" : m.role;
      return {
        role: role as "user" | "assistant",
        content: m.content,
      };
    }),
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
            `data: ${JSON.stringify({ type: "done", messageId: message.id, usage: message.usage })}\n\n`
          )
        );
        controller.close();
      });

      stream.on("error", (err) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: err instanceof Error ? err.message : "未知错误" })}\n\n`
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
}

async function handleOpenAI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  apiKey?: string,
  model?: string,
  baseURL?: string,
) {
  const openai = getOpenAI(apiKey, baseURL);

  const openaiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => {
      const role = m.role === "system" ? "user" : m.role;
      return {
        role: role as "user" | "assistant",
        content: m.content,
      };
    }),
  ];

  const stream = await openai.chat.completions.create({
    model: model || "gpt-4o",
    messages: openaiMessages,
    max_tokens: 4096,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text_delta", content: delta })}\n\n`
              )
            );
          }
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: err instanceof Error ? err.message : "未知错误" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
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
}
