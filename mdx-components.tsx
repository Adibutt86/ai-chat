import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-slate-900 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2
        id={id}
        className="text-2xl font-bold mt-8 mb-3 text-slate-900 border-b border-slate-200 pb-2"
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="text-xl font-semibold mt-6 mb-2 text-slate-900">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-slate-800">
        {children}
      </h4>
    ),

    // Paragraph & inline
    p: ({ children }) => (
      <p className="text-slate-600 leading-relaxed mb-4 text-base">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-slate-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-800">{children}</em>
    ),

    // Links
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-[#1E3A8A] hover:text-[#2563eb] font-medium underline underline-offset-2 transition-colors"
      >
        {children}
      </Link>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-4 text-slate-600 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-4 text-slate-600 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    // Block elements
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#1E3A8A] pl-4 py-2 my-5 bg-blue-50/60 rounded-r-lg text-slate-700 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-slate-200 my-8" />,

    // Code
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-slate-100 text-[#1E3A8A] px-1.5 py-0.5 rounded text-sm font-mono font-medium">
            {children}
          </code>
        );
      }
      return (
        <code className={className}>{children}</code>
      );
    },
    pre: ({ children }) => (
      <pre className="rounded-xl overflow-x-auto my-6 text-sm bg-slate-900 text-slate-100 p-4 border border-slate-800">
        {children}
      </pre>
    ),

    // Table
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-slate-700">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-slate-50/80 transition-colors">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-3">{children}</td>,

    // Image
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto", borderRadius: "0.75rem" }}
        className="my-6 border border-slate-200 shadow-sm"
        {...(props as ImageProps)}
        alt={props.alt ?? "Blog image"}
      />
    ),

    ...components,
  };
}
