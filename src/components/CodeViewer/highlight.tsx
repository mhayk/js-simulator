import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "await", "async", "new", "import", "from", "export", "default", "class",
  "extends", "try", "catch", "finally", "throw", "typeof", "instanceof",
  "of", "in", "yield", "void", "delete", "this", "super", "true", "false",
  "null", "undefined",
]);

/**
 * Tiny, dependency-free JS tokenizer for read-only display. Not a full parser
 * — good enough to colour keywords, strings, numbers, comments, and calls.
 */
export function highlightLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (cls: string, text: string) =>
    nodes.push(
      <span key={key++} className={cls}>
        {text}
      </span>,
    );

  while (i < line.length) {
    const rest = line.slice(i);

    // Line comment
    const com = rest.match(/^\/\/.*/);
    if (com) {
      push("ds-tok-com", com[0]);
      break;
    }

    // Strings (single, double, template — single line)
    const str = rest.match(/^(['"`])(?:\\.|(?!\1).)*\1?/);
    if (str) {
      push("ds-tok-str", str[0]);
      i += str[0].length;
      continue;
    }

    // Numbers
    const num = rest.match(/^\d[\d_.]*/);
    if (num) {
      push("ds-tok-num", num[0]);
      i += num[0].length;
      continue;
    }

    // Identifiers / keywords / function calls
    const word = rest.match(/^[A-Za-z_$][\w$]*/);
    if (word) {
      const w = word[0];
      const after = line.slice(i + w.length).match(/^\s*\(/);
      if (KEYWORDS.has(w)) push("ds-tok-kw", w);
      else if (after) push("ds-tok-fn", w);
      else nodes.push(<span key={key++}>{w}</span>);
      i += w.length;
      continue;
    }

    // Punctuation
    const punct = rest.match(/^[{}()[\].,;:=+\-*/%<>!&|?]+/);
    if (punct) {
      push("ds-tok-punct", punct[0]);
      i += punct[0].length;
      continue;
    }

    // Whitespace / anything else
    const other = rest.match(/^\s+|^./);
    if (other) {
      nodes.push(<span key={key++}>{other[0]}</span>);
      i += other[0].length;
    } else {
      i += 1;
    }
  }

  return nodes;
}
