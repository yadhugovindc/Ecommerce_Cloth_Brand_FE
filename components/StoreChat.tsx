"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const markdownComponents: Components = {
  p: ({ children }) => <p className="my-1.5 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href, children }) => {
    if (!href || !/^\/(?:en|ml)\/product\/[a-z0-9-]+$/.test(href)) {
      return <>{children}</>;
    }
    return <a className="underline underline-offset-2" href={href}>{children}</a>;
  },
  code: ({ children }) => {
    const value = String(children).replace(/\n$/, "");
    if (/^\/(?:en|ml)\/product\/[a-z0-9-]+$/.test(value)) {
      return <a className="break-all underline underline-offset-2" href={value}>{value}</a>;
    }
    return <code className="wrap-break-word bg-cream/60 px-1">{children}</code>;
  },
};

function MessageText({ content, isAssistant }: { content: string; isAssistant: boolean }) {
  if (!isAssistant) return <>{content}</>;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

export default function StoreChat() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const { items: cartItems } = useCart();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("greeting") },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const presetQuestions = [
    t("presets.shirts"),
    t("presets.linen"),
    t("presets.order"),
    t("presets.cart"),
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, open]);

  async function sendContent(content: string) {
    content = content.trim();
    if (!content || pending) return;

    const userMessage: ChatMessage = { role: "user", content };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setPending(true);

    try {
      const data = await api<{ reply: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          locale,
          messages: conversation.slice(1).filter((message) => !message.isError),
          guestCart: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            unitPriceINR: item.price,
          })),
        }),
      });
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: t("error"),
          isError: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendContent(draft);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label={t("title")}
          className="mb-3 flex h-[min(520px,calc(100dvh-6rem))] w-[min(380px,calc(100vw-2rem))] flex-col border border-line bg-white shadow-xl"
        >
          <header className="flex items-center justify-between border-b border-line bg-bg px-4 py-3">
            <div>
              <p className="font-display text-lg">{t("title")}</p>
              <p className="text-xs text-muted">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="grid size-9 place-items-center text-xl text-muted hover:text-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[88%] whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-dark text-white"
                    : message.isError
                      ? "chat-error-message mr-auto border"
                      : "mr-auto border border-line bg-bg text-ink"
                }`}
              >
                <MessageText content={message.content} isAssistant={message.role === "assistant"} />
              </div>
            ))}
            {messages.length === 1 && !pending && (
              <div className="flex flex-wrap gap-2 pt-1" aria-label={t("suggestions") }>
                {presetQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendContent(question)}
                    className="max-w-full border border-line bg-white px-3 py-2 text-left text-xs leading-relaxed text-ink transition-colors hover:border-muted hover:bg-bg"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            {pending && (
              <div
                className="mr-auto flex h-10 items-center gap-1.5 border border-line bg-bg px-3"
                role="status"
                aria-label={t("thinking")}
              >
                <span className="sr-only">{t("thinking")}</span>
                <span aria-hidden="true" className="size-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none" />
                <span aria-hidden="true" className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms] motion-reduce:animate-none" />
                <span aria-hidden="true" className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms] motion-reduce:animate-none" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              maxLength={1200}
              disabled={pending}
              className="h-11 min-w-0 flex-1 border border-line bg-white px-3 text-sm outline-none focus:border-muted disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              aria-label={t("send")}
              className="grid size-11 shrink-0 place-items-center bg-dark text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M4 12h15M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        className="ml-auto flex h-12 items-center gap-2 bg-dark px-4 text-sm text-white shadow-lg transition-colors hover:bg-ink"
      >
        {open ? (
          <span aria-hidden="true" className="text-xl leading-none">×</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.2A7.5 7.5 0 1 1 20 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 11h.01M12 11h.01M16 11h.01" strokeLinecap="round" />
          </svg>
        )}
        <span>{open ? t("close") : t("open")}</span>
      </button>
    </div>
  );
}
