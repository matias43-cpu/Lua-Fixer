import { Router } from "express";
import { ValidateCodeBody } from "@workspace/api-zod";

const router = Router();

function validateLua(code: string): { errors: string[]; fixedCode: string } {
  const errors: string[] = [];
  let fixedCode = code;

  const functionCount = (code.match(/\bfunction\b/g) || []).length;
  const endCount = (code.match(/\bend\b/g) || []).length;
  if (functionCount > 0 && endCount < functionCount) {
    const missing = functionCount - endCount;
    errors.push(`Missing ${missing} 'end' keyword(s) to close function block(s).`);
    fixedCode = fixedCode.trimEnd() + "\nend".repeat(missing);
  }

  const ifCount = (code.match(/\bif\b/g) || []).length;
  const thenCount = (code.match(/\bthen\b/g) || []).length;
  if (ifCount > thenCount) {
    errors.push(`Found 'if' without 'then' — each 'if' condition requires a 'then'.`);
    fixedCode = fixedCode.replace(/\bif\b(.*?)(\n|$)/g, (match, cond, ending) => {
      if (cond.includes("then")) return match;
      return `if${cond} then${ending}`;
    });
  }

  const whileCount = (code.match(/\bwhile\b/g) || []).length;
  const doCount = (code.match(/\bdo\b/g) || []).length;
  if (whileCount > 0 && doCount < whileCount) {
    errors.push(`Found 'while' without 'do' — each 'while' loop requires a 'do'.`);
    fixedCode = fixedCode.replace(/\bwhile\b(.*?)(\n|$)/g, (match, cond, ending) => {
      if (cond.includes("do")) return match;
      return `while${cond} do${ending}`;
    });
  }

  const singleQuoteCount = (code.match(/(?<!\\)'/g) || []).length;
  const doubleQuoteCount = (code.match(/(?<!\\)"/g) || []).length;
  if (singleQuoteCount % 2 !== 0) {
    errors.push(`Unclosed string literal — odd number of single quotes (') detected.`);
  }
  if (doubleQuoteCount % 2 !== 0) {
    errors.push(`Unclosed string literal — odd number of double quotes (") detected.`);
  }

  if (/\bif\b[^=]*[^=!<>]=[^=][^=]*\bthen\b/.test(code)) {
    errors.push(`Possible assignment (=) used inside 'if' condition — did you mean equality (==)?`);
  }

  return { errors, fixedCode: errors.length === 0 ? code : fixedCode };
}

function validatePython(code: string): { errors: string[]; fixedCode: string } {
  const errors: string[] = [];
  const lines = code.split("\n");
  const fixedLines = [...lines];

  lines.forEach((line, i) => {
    const trimmed = line.trimEnd();

    if (/^\s*def\s+\w+\s*\(.*\)\s*$/.test(trimmed)) {
      errors.push(`Line ${i + 1}: Function definition 'def' is missing a colon (:) at the end.`);
      fixedLines[i] = trimmed + ":";
    }

    if (
      /^\s*(if|elif|else|for|while|with|class|try|except|finally)\b/.test(trimmed) &&
      !/:\s*(#.*)?$/.test(trimmed)
    ) {
      const keyword = trimmed.match(/^\s*(\w+)/)?.[1] ?? "statement";
      errors.push(`Line ${i + 1}: '${keyword}' block is missing a colon (:) at the end.`);
      fixedLines[i] = trimmed + ":";
    }

    if (/^\s*print\s+[^(]/.test(trimmed)) {
      errors.push(`Line ${i + 1}: 'print' looks like Python 2 syntax — use print() with parentheses.`);
      fixedLines[i] = trimmed.replace(/^(\s*)print\s+(.*)$/, (_, indent, args) => `${indent}print(${args})`);
    }

    if (/==\s*(True|False|None)\b/.test(trimmed)) {
      const val = trimmed.match(/==\s*(True|False|None)/)?.[1];
      errors.push(`Line ${i + 1}: Comparing with ${val} using '==' — prefer 'is ${val}' for identity checks.`);
    }
  });

  return { errors, fixedCode: errors.length === 0 ? code : fixedLines.join("\n") };
}

function validateJavaScript(code: string): { errors: string[]; fixedCode: string } {
  const errors: string[] = [];
  const lines = code.split("\n");
  const fixedLines = [...lines];

  lines.forEach((line, i) => {
    const trimmed = line.trimEnd();

    // function declaration without opening brace
    if (/^\s*function\s+\w+\s*\(.*\)\s*$/.test(trimmed)) {
      errors.push(`Line ${i + 1}: Function declaration is missing opening brace '{'.`);
      fixedLines[i] = trimmed + " {";
    }

    // if/for/while condition without parentheses
    if (/^\s*(if|for|while)\s+[^(]/.test(trimmed)) {
      const keyword = trimmed.match(/^\s*(\w+)/)?.[1];
      errors.push(`Line ${i + 1}: '${keyword}' condition must be wrapped in parentheses ( ).`);
      fixedLines[i] = trimmed.replace(
        /^(\s*)(if|for|while)\s+(.*)$/,
        (_, indent, kw, cond) => `${indent}${kw} (${cond.replace(/\s*\{.*$/, "")}) {`
      );
    }

    // == instead of === (loose equality)
    if (/[^=!<>]==[^=]/.test(trimmed) && !/^\s*(\/\/|\/\*)/.test(trimmed)) {
      errors.push(`Line ${i + 1}: Loose equality '==' found — prefer strict equality '===' in JavaScript.`);
      fixedLines[i] = trimmed.replace(/([^=!<>])==([^=])/g, "$1===$2");
    }

    // != instead of !==
    if (/!=[^=]/.test(trimmed) && !/^\s*(\/\/|\/\*)/.test(trimmed)) {
      errors.push(`Line ${i + 1}: Loose inequality '!=' found — prefer strict '!==' in JavaScript.`);
      fixedLines[i] = fixedLines[i].replace(/!=([^=])/g, "!==$1");
    }

    // var instead of let/const
    if (/^\s*var\s+/.test(trimmed)) {
      errors.push(`Line ${i + 1}: 'var' is legacy — prefer 'let' or 'const' instead.`);
      fixedLines[i] = trimmed.replace(/^(\s*)var\s+/, "$1let ");
    }

    // missing semicolon at end of statement (heuristic)
    if (
      /^\s*(return|throw|break|continue|let\s|const\s|var\s)/.test(trimmed) &&
      !/[;{,](\s*(\/\/.*)?)?$/.test(trimmed)
    ) {
      errors.push(`Line ${i + 1}: Statement appears to be missing a semicolon (;) at the end.`);
      fixedLines[i] = trimmed + ";";
    }
  });

  // Check for unclosed braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    errors.push(`Missing ${missing} closing brace(s) '}' — check that all blocks are properly closed.`);
    fixedLines.push("}".repeat(missing));
  }

  return { errors, fixedCode: errors.length === 0 ? code : fixedLines.join("\n") };
}

function validateCpp(code: string): { errors: string[]; fixedCode: string } {
  const errors: string[] = [];
  const lines = code.split("\n");
  const fixedLines = [...lines];

  lines.forEach((line, i) => {
    const trimmed = line.trimEnd();

    // cout/cin without semicolon
    if (
      /^\s*(cout|cin|std::cout|std::cin)\s*/.test(trimmed) &&
      !/;\s*(\/\/.*)?$/.test(trimmed)
    ) {
      errors.push(`Line ${i + 1}: 'cout'/'cin' statement is missing a semicolon (;) at the end.`);
      fixedLines[i] = trimmed + ";";
    }

    // return without semicolon
    if (/^\s*return\s+/.test(trimmed) && !/;\s*(\/\/.*)?$/.test(trimmed)) {
      errors.push(`Line ${i + 1}: 'return' statement is missing a semicolon (;) at the end.`);
      fixedLines[i] = trimmed + ";";
    }

    // #include without angle brackets or quotes
    if (/^\s*#include\s+[^<"']/.test(trimmed)) {
      errors.push(`Line ${i + 1}: '#include' requires the header in angle brackets <header> or quotes "header".`);
    }

    // using namespace without semicolon
    if (/^\s*using\s+namespace\s+\w+\s*$/.test(trimmed)) {
      errors.push(`Line ${i + 1}: 'using namespace' statement is missing a semicolon (;).`);
      fixedLines[i] = trimmed + ";";
    }
  });

  // main() without return 0
  if (/\bmain\s*\(/.test(code) && !/\breturn\s+0\s*;/.test(code)) {
    errors.push(`Function 'main()' is missing 'return 0;' at the end — required in standard C++.`);
    // Insert return 0 before the last closing brace
    const lastBrace = fixedLines.map((l, i) => ({ l, i })).reverse().find(({ l }) => l.trimEnd() === "}");
    if (lastBrace) {
      fixedLines.splice(lastBrace.i, 0, "    return 0;");
    }
  }

  // Check for unclosed braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    errors.push(`Missing ${missing} closing brace(s) '}' — check that all blocks are properly closed.`);
    fixedLines.push("}".repeat(missing));
  }

  return { errors, fixedCode: errors.length === 0 ? code : fixedLines.join("\n") };
}

router.post("/code/validate", (req, res) => {
  const parseResult = ValidateCodeBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.flatten() });
    return;
  }

  const { code, language } = parseResult.data;

  const { errors, fixedCode } =
    language === "python"
      ? validatePython(code)
      : language === "javascript"
        ? validateJavaScript(code)
        : language === "cpp"
          ? validateCpp(code)
          : validateLua(code);

  res.json({
    valid: errors.length === 0,
    language,
    originalCode: code,
    fixedCode,
    errors,
  });
});

export default router;
