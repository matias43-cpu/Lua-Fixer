import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import hljs from "highlight.js/lib/core";
import lua from "highlight.js/lib/languages/lua";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import php from "highlight.js/lib/languages/php";
import sql from "highlight.js/lib/languages/sql";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import ruby from "highlight.js/lib/languages/ruby";
import { Terminal, ChevronLeft, Activity } from "lucide-react";

hljs.registerLanguage("lua", lua);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("php", php);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("ruby", ruby);

type LangKey =
  | "cpp" | "java" | "python" | "javascript" | "typescript"
  | "csharp" | "php" | "sql" | "rust" | "go"
  | "swift" | "kotlin" | "ruby" | "lua";

const LANGUAGES: { key: LangKey; label: string; ext: string }[] = [
  { key: "cpp",        label: "C++",        ext: "cpp" },
  { key: "java",       label: "Java",       ext: "java" },
  { key: "python",     label: "Python",     ext: "py" },
  { key: "javascript", label: "JavaScript", ext: "js" },
  { key: "typescript", label: "TypeScript", ext: "ts" },
  { key: "csharp",     label: "C#",         ext: "cs" },
  { key: "php",        label: "PHP",        ext: "php" },
  { key: "sql",        label: "SQL",        ext: "sql" },
  { key: "rust",       label: "Rust",       ext: "rs" },
  { key: "go",         label: "Go",         ext: "go" },
  { key: "swift",      label: "Swift",      ext: "swift" },
  { key: "kotlin",     label: "Kotlin",     ext: "kt" },
  { key: "ruby",       label: "Ruby",       ext: "rb" },
  { key: "lua",        label: "Lua",        ext: "lua" },
];

const EXAMPLES: Record<LangKey, string> = {
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
  python: `def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Python"))`,
  javascript: `function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("JavaScript"));`,
  typescript: `function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

const message: string = greet("TypeScript");
console.log(message);`,
  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from C#!");
    }
}`,
  php: `<?php

function greet(string $name): string {
    return "Hello, $name!";
}

echo greet("PHP");
?>`,
  sql: `-- Create a simple table and query it
CREATE TABLE users (
    id   INT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO users VALUES (1, 'Alice');

SELECT id, name
FROM   users
WHERE  id = 1;`,
  rust: `fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("{}", greet("Rust"));
}`,
  go: `package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println(greet("Go"))
}`,
  swift: `func greet(_ name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet("Swift"))`,
  kotlin: `fun greet(name: String): String {
    return "Hello, $name!"
}

fun main() {
    println(greet("Kotlin"))
}`,
  ruby: `def greet(name)
  "Hello, #{name}!"
end

puts greet("Ruby")`,
  lua: `function greet(name)
    return "Hello, " .. name .. "!"
end

print(greet("Lua"))`,
};

export default function Languages() {
  const [selected, setSelected] = useState<LangKey>("cpp");
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute("data-highlighted");
      codeRef.current.textContent = EXAMPLES[selected];
      hljs.highlightElement(codeRef.current);
    }
  }, [selected]);

  const lang = LANGUAGES.find((l) => l.key === selected)!;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 scanline-container">
      {/* Header */}
      <header className="w-full max-w-5xl mb-8 flex items-end justify-between border-b border-primary/30 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-wider glitch-glow uppercase">
              LANG_LIBRARY // V1.0
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary/50" />
              All Programming Languages Reference
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs text-primary/50 uppercase tracking-widest text-right">
          SYS_STATUS: <span className="text-primary glitch-glow">ONLINE</span>
          <br />
          LANGS: <span className="text-primary glitch-glow">{LANGUAGES.length} LOADED</span>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-6 relative z-10 flex-grow">
        {/* Language grid selector */}
        <section className="terminal-panel">
          <div className="bg-secondary/50 border-b border-border px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Select Language
            </span>
            <span className="text-xs text-muted-foreground uppercase">{LANGUAGES.length} languages</span>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.key}
                onClick={() => setSelected(l.key)}
                data-testid={`button-lang-${l.key}`}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                  selected === l.key
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "bg-transparent text-primary/70 border-primary/30 hover:border-primary/70 hover:text-primary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Code display */}
        <section className="terminal-panel flex flex-col">
          <div className="bg-secondary/50 border-b border-border px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-bold text-primary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 rotate-180" />
              example.{lang.ext}
            </span>
            <span className="text-xs text-muted-foreground uppercase">{lang.label} — Hello World</span>
          </div>
          <div className="p-6 overflow-auto max-h-[500px] scrollbar-custom bg-background/30">
            <pre className="m-0 bg-transparent">
              <code
                ref={codeRef}
                className={`language-${selected} !bg-transparent text-sm font-mono`}
              >
                {EXAMPLES[selected]}
              </code>
            </pre>
          </div>
          <div className="border-t border-border p-2 bg-background/50 flex justify-end">
            <button
              onClick={() => navigator.clipboard.writeText(EXAMPLES[selected])}
              data-testid="button-copy-example"
              className="text-xs text-primary/70 hover:text-primary hover:underline uppercase tracking-wider font-bold px-4 py-1 transition-colors"
            >
              [ Copy to Clipboard ]
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full max-w-5xl text-center pb-8 z-10 relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono group"
        >
          <span className="text-primary/50 group-hover:text-primary transition-colors">&lt;</span>
          Back to Code Validator
          <span className="inline-block w-2 h-4 bg-primary/50 group-hover:bg-primary animate-pulse ml-1 align-middle" />
        </Link>
      </footer>
    </div>
  );
}
