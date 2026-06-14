import ReactMarkdown, { type Components } from "react-markdown";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  children: string;
  components?: Components;
};

function parseMarkdownImageSizing(title?: string | null) {
  if (!title) {
    return { title: undefined, width: undefined, height: undefined };
  }

  const widthMatch = title.match(/\bwidth=(\d+)\b/i);
  const heightMatch = title.match(/\bheight=(\d+)\b/i);
  const cleanedTitle = title.replace(/\b(?:width|height)=\d+\b/gi, "").trim() || undefined;

  return {
    title: cleanedTitle,
    width: widthMatch ? Number.parseInt(widthMatch[1], 10) : undefined,
    height: heightMatch ? Number.parseInt(heightMatch[1], 10) : undefined,
  };
}

export function Markdown({ children, components }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        img: ({ className, title, ...props }) => {
          const imageSizing = parseMarkdownImageSizing(title);

          return (
            <img
              {...props}
              title={imageSizing.title}
              width={imageSizing.width}
              height={imageSizing.height}
              className={cn("h-auto", className)}
            />
          );
        },
        ...components,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}