import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import lua from "highlight.js/lib/languages/lua";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import cpp from "highlight.js/lib/languages/cpp";

hljs.registerLanguage("lua", lua);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("cpp", cpp);

interface HighlightedCodeProps {
  code: string;
  language: "lua" | "python" | "javascript" | "cpp";
}

export function HighlightedCode({ code, language }: HighlightedCodeProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute("data-highlighted");
      ref.current.textContent = code;
      hljs.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className="font-mono text-sm whitespace-pre-wrap break-all m-0 bg-transparent p-0">
      <code ref={ref} className={`language-${language} bg-transparent !p-0`}>
        {code}
      </code>
    </pre>
  );
}
