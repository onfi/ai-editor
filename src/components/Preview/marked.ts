import { marked, type Tokens } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/felipec.css";
import "./marked.css";
import katex from "katex";

const escapeReplacements: { [index: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(html: string, encode?: boolean) {
  if (encode) {
    html = html.replace(/[&<>"']/g, (ch) => escapeReplacements[ch]);
  }
  return html.replace(/[&<>"']/g, (ch) => escapeReplacements[ch]);
}

function cleanUrl(href: string) {
  try {
    href = encodeURI(href);
  } catch {
    return null;
  }
  return href;
}

const renderer = new marked.Renderer();

// レンダラーの設定
renderer.space = (token: Tokens.Space): string => {
  return "";
};
renderer.space = (token: Tokens.Space): string => {
  return "";
};

renderer.code = ({ text, lang }: Tokens.Code): string => {
  if (lang === "math") {
    return `<div class="katex">${katex.renderToString(text, { throwOnError: false })}</div>\n`;
  }
  const langString = (lang || "").match(/^[^:]*/)?.[0] ?? "";
  const fileName = (lang || "").split(":", 2).pop() ?? "";
  const code = text.replace(/\n$/, "") + "\n";

  const language = hljs.getLanguage(langString);
  if (language) {
    const highlighted = hljs.highlight(code, { language: langString }).value;
    return `<pre><code class="hljs language-${escapeHtml(langString)}" style="white-space: pre-wrap;">${lang ? `<div style="padding: 0 6px;position: relative; top: -16px;left: -16px;background-color: #2c4b44;height: min-content;width: min-content;">${escapeHtml(lang)}</div>` : ""}${highlighted}</code></pre>\n`;
  } else {
    return `<pre><code class="hljs" style="white-space: pre-wrap;">${lang ? `<div style="padding: 0 6px; position: relative;top: -16px;left: -16px;background-color: #2c4b44;height: min-content;width: min-content;">${escapeHtml(lang)}</div>` : ""}${escapeHtml(code)}</code></pre>\n`;
  }
};

renderer.blockquote = ({ tokens }: Tokens.Blockquote): string => {
  const body = marked.Parser.parse(tokens);
  return `<blockquote>\n${body}</blockquote>\n`;
};

renderer.html = ({ text }: Tokens.HTML | Tokens.Tag): string => {
  return text;
};

renderer.heading = ({ tokens, depth }: Tokens.Heading): string => {
  return `<h${depth + 1}>${marked.Parser.parseInline(tokens)}</h${depth + 1}>\n`;
};

renderer.hr = (token: Tokens.Hr): string => {
  return "<hr>\n";
};

renderer.list = (token: Tokens.List): string => {
  const ordered = token.ordered;
  const start = token.start;

  let body = "";
  for (let j = 0; j < token.items.length; j++) {
    const item = token.items[j];
    body += renderer.listitem(item);
  }

  const type = ordered ? "ol" : "ul";
  const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
  return "<" + type + startAttr + ">\n" + body + "</" + type + ">\n";
};

renderer.listitem = (item: Tokens.ListItem): string => {
  let itemBody = "";
  if (item.task) {
    const checkbox = renderer.checkbox({ checked: !!item.checked });
    if (item.loose) {
      if (item.tokens[0]?.type === "paragraph") {
        item.tokens[0].text = checkbox + " " + item.tokens[0].text;
        if (
          item.tokens[0].tokens &&
          item.tokens[0].tokens.length > 0 &&
          item.tokens[0].tokens[0].type === "text"
        ) {
          item.tokens[0].tokens[0].text =
            checkbox + " " + escapeHtml(item.tokens[0].tokens[0].text);
          item.tokens[0].tokens[0].escaped = true;
        }
      } else {
        item.tokens.unshift({
          type: "text",
          raw: checkbox + " ",
          text: checkbox + " ",
          escaped: true,
        });
      }
    } else {
      itemBody += checkbox + " ";
    }
  }

  itemBody += marked.Parser.parse(item.tokens);

  return `<li>${itemBody}</li>\n`;
};

renderer.checkbox = ({ checked }: Tokens.Checkbox): string => {
  return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
};

renderer.paragraph = ({ tokens }: Tokens.Paragraph): string => {
  return `<p>${marked.Parser.parseInline(tokens)}</p>\n`;
};

renderer.table = (token: Tokens.Table): string => {
  let header = "";

  // header
  let cell = "";
  for (let j = 0; j < token.header.length; j++) {
    cell += renderer.tablecell(token.header[j]);
  }
  header += renderer.tablerow({ text: cell });

  let body = "";
  for (let j = 0; j < token.rows.length; j++) {
    const row = token.rows[j];

    cell = "";
    for (let k = 0; k < row.length; k++) {
      cell += renderer.tablecell(row[k]);
    }

    body += renderer.tablerow({ text: cell });
  }
  if (body) body = `<tbody>${body}</tbody>`;

  return "<table>\n" + "<thead>\n" + header + "</thead>\n" + body + "</table>\n";
};

renderer.tablerow = ({ text }: Tokens.TableRow): string => {
  return `<tr>\n${text}</tr>\n`;
};

renderer.tablecell = (token: Tokens.TableCell): string => {
  const content = marked.Parser.parseInline(token.tokens);
  const type = token.header ? "th" : "td";
  const tag = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
  return tag + content + `</${type}>\n`;
};

renderer.strong = ({ tokens }: Tokens.Strong): string => {
  return `<strong>${marked.Parser.parseInline(tokens)}</strong>`;
};

renderer.em = ({ tokens }: Tokens.Em): string => {
  return `<em>${marked.Parser.parseInline(tokens)}</em>`;
};

renderer.codespan = ({ text }: Tokens.Codespan): string => {
  return `<code class="codespan">${escapeHtml(text)}</code>`;
};

renderer.br = (token: Tokens.Br): string => {
  return "<br>";
};

renderer.del = ({ tokens }: Tokens.Del): string => {
  return `<del>${marked.Parser.parseInline(tokens)}</del>`;
};

renderer.link = ({ href, title, tokens }: Tokens.Link): string => {
  const text = marked.Parser.parseInline(tokens);
  const cleanHref = cleanUrl(href);
  if (cleanHref === null) {
    return text;
  }
  href = cleanHref;
  let out = '<a target="_blank" rel="noopener" href="' + href + '"';
  if (title) {
    out += ' title="' + escapeHtml(title) + '"';
  }
  out += ">" + text + "</a>";
  return out;
};

renderer.image = ({ href, title, text }: Tokens.Image): string => {
  const cleanHref = cleanUrl(href);
  if (cleanHref === null) {
    return escapeHtml(text);
  }
  href = cleanHref;

  let out = `<img src="${href}" alt="${text}"`;
  if (title) {
    out += ` title="${escapeHtml(title)}"`;
  }
  out += ">";
  return out;
};

renderer.text = (token: Tokens.Text | Tokens.Escape): string => {
  return "tokens" in token && token.tokens
    ? marked.Parser.parseInline(token.tokens)
    : "escaped" in token && token.escaped
      ? token.text
      : escapeHtml(token.text);
};

// markedの設定を適用
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
});

// 設定済みのmarkedインスタンスをエクスポート
export const configuredMarked = marked;

// 必要に応じて個別の関数もエクスポート
export { escapeHtml, cleanUrl };
