/**
 * Post-processes astro-d2 (inline mode) diagrams for two gaps:
 *
 * 1. Dark mode: astro-d2 embeds each diagram's dark palette behind a
 *    `prefers-color-scheme` media query, which follows the OS instead of
 *    this site's `.dark` class toggle. The media blocks are rewritten into
 *    `html.dark`-prefixed rules so diagrams track the toggle exactly. Safe
 *    because inlined SVG <style> rules are already scoped to a unique
 *    per-diagram class (`.d2-<hash>`).
 *
 * 2. Accessibility: astro-d2 0.13.0 never injects its <title>/data
 *    attributes in inline mode (it checks for a `d2version` property, but
 *    hast camelCases `data-d2-version` to `dataD2Version`). Diagrams get
 *    `role="img"` and an aria-label from the nearest preceding heading,
 *    matching what the previous client-side Mermaid renderer did.
 */

const MEDIA_QUERY = /@media[^{]*\(prefers-color-scheme:\s*dark\)\s*\{/;

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  children?: HastNode[];
};

export function rehypeD2Dark() {
  return (tree: HastNode) => {
    let lastHeading = '';

    const walk = (node: HastNode) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
        lastHeading = textContent(node).trim();
      }
      if (node.type === 'raw' && node.value?.includes('d2-svg')) {
        node.value = addA11yAttributes(retargetDarkStyles(node.value), lastHeading);
      }
      node.children?.forEach(walk);
    };

    walk(tree);
  };
}

function textContent(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textContent).join('');
}

function addA11yAttributes(svg: string, heading: string): string {
  const label = heading ? `Diagram: ${heading}` : 'Diagram';
  return svg.replace('<svg ', `<svg role="img" aria-label="${label.replaceAll('"', '&quot;')}" `);
}

function retargetDarkStyles(svg: string): string {
  let match = MEDIA_QUERY.exec(svg);
  while (match) {
    const open = match.index + match[0].length;
    let depth = 1;
    let end = open;
    while (end < svg.length && depth > 0) {
      if (svg[end] === '{') depth += 1;
      else if (svg[end] === '}') depth -= 1;
      end += 1;
    }
    const rules = svg
      .slice(open, end - 1)
      .split('}')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => `html.dark ${rule}}`)
      .join('\n');
    svg = svg.slice(0, match.index) + rules + svg.slice(end);
    match = MEDIA_QUERY.exec(svg);
  }
  return svg;
}
