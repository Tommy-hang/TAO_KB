// Derived HTML boundaries keep source boilerplate and empty personal notes out of search.
// The canonical Markdown file is never changed.
export default function sections() {
  return (tree) => {
    const out = [];
    let open = false;
    const text = (node) => node.value || (node.children || []).map(text).join('');
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type === 'heading' && node.depth === 2) {
        if (open) out.push({ type: 'html', value: '</section>' });
        const title = text(node);
        const ignored = ['Source', 'My Notes'].includes(title);
        if (title === 'My Notes') {
          let end = i + 1;
          while (
            end < tree.children.length &&
            !(tree.children[end].type === 'heading' && tree.children[end].depth === 2)
          )
            end++;
          const meaningful = tree.children
            .slice(i + 1, end)
            .filter((n) => !['heading', 'thematicBreak'].includes(n.type))
            .map(text)
            .join('')
            .trim();
          if (!meaningful) {
            i = end - 1;
            open = false;
            continue;
          }
        }
        out.push({ type: 'html', value: `<section${ignored ? ' data-pagefind-ignore' : ''}>` });
        open = true;
      } else if (!open) {
        out.push({ type: 'html', value: '<section data-pagefind-ignore>' });
        open = true;
      }
      out.push(node);
    }
    if (open) out.push({ type: 'html', value: '</section>' });
    tree.children = out;
  };
}
