import { Router } from "express";
import { ValidateLuaBody } from "@workspace/api-zod";

const router = Router();

function validateAndFixLua(code: string): {
  valid: boolean;
  errors: string[];
  fixedCode: string;
} {
  const errors: string[] = [];
  let fixedCode = code;

  // Check for unclosed functions (function ... without end)
  const functionMatches = (code.match(/\bfunction\b/g) || []).length;
  const endMatches = (code.match(/\bend\b/g) || []).length;

  if (functionMatches > 0 && endMatches < functionMatches) {
    const missing = functionMatches - endMatches;
    errors.push(
      `Missing ${missing} 'end' keyword(s) to close function block(s).`
    );
    fixedCode = fixedCode.trimEnd() + "\nend".repeat(missing);
  }

  // Check for if without then
  const ifWithoutThen = /\bif\b(?:[^-]|--[^\n]*\n)*?(?!\bthen\b)/;
  const ifMatches = (code.match(/\bif\b/g) || []).length;
  const thenMatches = (code.match(/\bthen\b/g) || []).length;
  if (ifMatches > thenMatches) {
    errors.push(`Found 'if' without 'then' — each 'if' condition requires a 'then'.`);
    fixedCode = fixedCode.replace(/\bif\b(.*?)(?!\bthen\b)(\n|$)/g, (match, cond, ending) => {
      if (cond.includes("then")) return match;
      return `if${cond} then${ending}`;
    });
  }

  // Check for while without do
  const whileMatches = (code.match(/\bwhile\b/g) || []).length;
  const doMatches = (code.match(/\bdo\b/g) || []).length;
  if (whileMatches > doMatches) {
    errors.push(`Found 'while' without 'do' — each 'while' loop requires a 'do'.`);
    fixedCode = fixedCode.replace(/\bwhile\b(.*?)(\n|$)/g, (match, cond, ending) => {
      if (cond.includes("do")) return match;
      return `while${cond} do${ending}`;
    });
  }

  // Check for for without do
  const forMatches = (code.match(/\bfor\b/g) || []).length;
  if (forMatches > doMatches - whileMatches) {
    errors.push(`Found 'for' without 'do' — each 'for' loop requires a 'do'.`);
  }

  // Check for unclosed string literals (basic check: odd number of quotes)
  const singleQuoteCount = (code.match(/(?<!\\)'/g) || []).length;
  const doubleQuoteCount = (code.match(/(?<!\\)"/g) || []).length;
  if (singleQuoteCount % 2 !== 0) {
    errors.push(`Unclosed string literal — odd number of single quotes (') detected.`);
  }
  if (doubleQuoteCount % 2 !== 0) {
    errors.push(`Unclosed string literal — odd number of double quotes (") detected.`);
  }

  // Check for use of = instead of == in conditions
  if (/\bif\b[^=]*[^=!<>]=[^=][^=]*\bthen\b/.test(code)) {
    errors.push(`Possible assignment (=) used inside 'if' condition — did you mean equality (==)?`);
  }

  // Check for undefined print-like calls that are common Lua mistakes
  // (this is a heuristic, not a real parser)
  if (/\bprint\s*\(/.test(code) === false && /\bio\.write\s*\(/.test(code) === false && code.trim().length > 0) {
    // not an error, just a structural check — skip
  }

  const valid = errors.length === 0;
  if (valid) {
    fixedCode = code; // no changes needed
  }

  return { valid, errors, fixedCode };
}

router.post("/lua/validate", (req, res) => {
  const parseResult = ValidateLuaBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.flatten() });
    return;
  }

  const { code } = parseResult.data;
  const { valid, errors, fixedCode } = validateAndFixLua(code);

  res.json({
    valid,
    originalCode: code,
    fixedCode,
    errors,
  });
});

export default router;
