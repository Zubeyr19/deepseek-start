import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import Markdown from "react-markdown";
import { Send, Loader2, User2, Bot, MessageSquare } from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

type Message = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
};

type MessageWithThinking = Message & {
  finishedThinking?: boolean;
  think?: string;
};

function useMessagesWithThinking(messages: Message[]) {
  return useMemo(
    () =>
      messages.map((m: Message): MessageWithThinking => {
        if (m.role === "assistant") {
          if (m.content.includes("</think>")) {
            return {
              ...m,
              finishedThinking: true,
              think: m.content
                .split("</think>")[0]
                .replace("</think>", "")
                .replace("<think>", ""),
              content: m.content.split("</think>")[1],
            };
          } else {
            return {
              ...m,
              finishedThinking: false,
              think: m.content.replace("<think>", ""),
              content: "",
            };
          }
        }
        return m;
      }),
    [messages]
  );
}

function streamAsyncIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder("utf-8");
  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          yield decoder.decode(value);
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}

export const Route = createFileRoute("/")({
  component: Test,
});

const chat = createServerFn(
  "POST",
  async ({ messages }: { messages: Message[] }) => {
    return fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:32b",
        streaming: true,
        messages: [...messages.filter(({ role }) => role !== "system")],
      }),
    });
  }
);

function Test() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInput("");
    setLoading(true);

    const messagesWithInput: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(messagesWithInput);

    const stream = await chat({ messages: messagesWithInput });
    if (stream.body) {
      let assistantResponse = "";
      const reader = stream.body.getReader();
      for await (const value of streamAsyncIterator(reader)) {
        const {
          message: { content },
        } = JSON.parse(value);
        assistantResponse += content;
        setMessages([
          ...messagesWithInput,
          {
            role: "assistant",
            content: assistantResponse,
          },
        ]);
      }
    }
    setLoading(false);
  };

  const messagesWithThinkingSplit = useMessagesWithThinking(messages);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="flex-1 p-4 container mx-auto max-w-4xl space-y-4 pb-32">
        {messagesWithThinkingSplit
          .filter(({ role }) => role === "user" || role === "assistant")
          .map((m, index) => (
            <div
              key={index}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  m.role === "user"
                    ? "bg-primary text-black"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {m.role === "user" ? (
                    <User2 className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                </div>
                {m.think && (
                  <div className="mb-2 text-sm italic border-l-2 border-gray-600 pl-2 py-1 text-gray-300">
                    <Markdown>{m.think}</Markdown>
                  </div>
                )}
                {m.role === "assistant" && !m.finishedThinking && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <article
                  className={`prose max-w-none ${
                    m.role === "user"
                      ? "prose-invert prose-p:text-black prose-headings:text-black prose-strong:text-black prose-li:text-black"
                      : "prose-invert prose-p:text-gray-100 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-li:text-gray-100"
                  }`}
                >
                  <Markdown>{m.content}</Markdown>
                </article>
              </div>
            </div>
          ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="flex-1 bg-gray-900 border-gray-700 text-gray-100 pl-10"
                value={input}
                disabled={loading}
                placeholder="Ask about your local deepseek..."
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
