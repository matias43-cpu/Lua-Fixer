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
  let fixedCode = code;
  const lines = code.split("\n");
  const fixedLines = [...lines];

  lines.forEach((line, i) => {
    const trimmed = line.trimEnd();

    // def without colon
    if (/^\s*def\s+\w+\s*\(.*\)\s*$/.test(trimmed)) {
      errors.push(`Line ${i + 1}: Function definition 'def' is missing a colon (:) at the end.`);
      fixedLines[i] = trimmed + ":";
    }

    // if/elif/else/for/while/with/class/try/except/finally without colon
    if (
      /^\s*(if|elif|else|for|while|with|class|try|except|finally)\b/.test(trimmed) &&
      !/:\s*(#.*)?$/.test(trimmed)
    ) {
      const keyword = trimmed.match(/^\s*(\w+)/)?.[1] ?? "statement";
      errors.push(`Line ${i + 1}: '${keyword}' block is missing a colon (:) at the end.`);
      fixedLines[i] = trimmed + ":";
    }

    // print without parentheses (Python 2 style)
    if (/^\s*print\s+[^(]/.test(trimmed)) {
      errors.push(`Line ${i + 1}: 'print' looks like Python 2 syntax — use print() with parentheses.`);
      fixedLines[i] = trimmed.replace(/^(\s*)print\s+(.*)$/, (_, indent, args) => `${indent}print(${args})`);
    }

    // == True/False/None (should use 'is' for identity checks)
    if (/==\s*(True|False|None)\b/.test(trimmed)) {
      const val = trimmed.match(/==\s*(True|False|None)/)?.[1];
      errors.push(`Line ${i + 1}: Comparing with ${val} using '==' — prefer 'is ${val}' for identity checks.`);
    }
  });

  if (errors.length > 0) {
    fixedCode = fixedLines.join("\n");
  }

  return { errors, fixedCode: errors.length === 0 ? code : fixedCode };
}

router.post("/code/validate", (req, res) => {
  const parseResult = ValidateCodeBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.flatten() });
    return;
  }

  const { code, language } = parseResult.data;
  const { errors, fixedCode } =
    language === "python" ? validatePython(code) : validateLua(code);

  res.json({
    valid: errors.length === 0,
    language,
    originalCode: code,
    fixedCode,
    errors,
  });
});

export default router;
