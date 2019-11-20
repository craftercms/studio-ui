// @ts-ignore
import prettierXmlPlugin from '@prettier/plugin-xml/src/plugin';
import prettier from 'prettier/standalone';

export function fromString(xml: string) {
  return (xml != null) ? new DOMParser().parseFromString(xml, 'text/xml') : null
}

export function deserialize() {
  throw new Error('deserialize error is not implemented.');
}

export function minify(xml: string) {
  throw new Error('minify error is not implemented.');
}

export function beautify(xml: string) {
  return prettier.format(xml, {
    // @ts-ignore
    parser: 'xml',
    plugins: [prettierXmlPlugin]
  });
}

export function getInnerHtml(element: Element, options = { trim: true }) {
  let content = element ? element.innerHTML : null;
  if (content) {
    // @ts-ignore downlevelIteration
    const matches = [...content.matchAll(/<!\[CDATA\[([\s\S\n]*?)\]\]>/g)];
    if (matches.length > 0) {
      content = matches[0][1].trim();
    }
  }
  return (options.trim) ? content.trim() : content;
}

export function getInnerHtmlNumber(element: Element): number {
  const content = getInnerHtml(element);
  const num = parseInt(content);
  if (content === null || content === '') {
    return null;
  } else if (isNaN(num)) {
    console.error(`[utils/xml/getInnerHtmlNumber] Expected number but got NaN. Received value was "${content}".`);
    return null;
  } else {
    return num;
  }
}

export function extractLocalizedElements(nodes: Array<Element> | NodeListOf<Element>) {
  const items: any = {};
  if (!Array.isArray(nodes)) {
    nodes = Array.from(nodes);
  }
  nodes.forEach((tag) => {
    const tagName = tag.tagName;
    const lang = tag.getAttribute('lang');
    if (lang === null) {
      items[tagName] = getInnerHtml(tag);
    } else {
      items[`tagName_${lang}`] = getInnerHtml(tag);
    }
  });
  return items;
}

export function commentless(xml: string) {
  return xml.replace(/<!--[\s\S\n]*?-->/g, '');
}
