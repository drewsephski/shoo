"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
}

export function CodeBlock({
    code,
    language = "typescript",
    filename,
    showLineNumbers = true,
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-6 rounded-xl overflow-hidden bg-[#1c1917] shadow-lg">
            {/* Header with filename and copy button */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#292524] border-b border-[#44403c]">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                        <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    </div>
                    {filename && (
                        <span className="text-xs text-stone-400 font-medium ml-2">
                            {filename}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-[#44403c] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    aria-label={copied ? "Copied!" : "Copy code"}
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code content with syntax highlighting */}
            <Highlight
                theme={themes.nightOwl}
                code={code.trim()}
                language={language}
            >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={`${className} overflow-x-auto p-4 text-sm leading-relaxed`}
                        style={{
                            ...style,
                            background: "transparent",
                            margin: 0,
                            fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                        }}
                    >
                        {tokens.map((line, i) => {
                            const lineProps = getLineProps({ line });
                            return (
                                <div
                                    key={i}
                                    {...lineProps}
                                    className={`${lineProps.className} table-row`}
                                >
                                    {showLineNumbers && (
                                        <span className="table-cell text-right pr-4 select-none text-stone-600 w-12">
                                            {i + 1}
                                        </span>
                                    )}
                                    <span className="table-cell">
                                        {line.map((token, key) => {
                                            const tokenProps = getTokenProps({ token });
                                            // Override comment color for better visibility
                                            if (token.types.includes("comment")) {
                                                return (
                                                    <span
                                                        key={key}
                                                        {...tokenProps}
                                                        style={{
                                                            ...tokenProps.style,
                                                            color: "#6b7280",
                                                        }}
                                                    />
                                                );
                                            }
                                            return <span key={key} {...tokenProps} />;
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}
