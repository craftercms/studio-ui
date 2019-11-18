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

export function commentless(xml: string) {
  return xml.replace(/<!--[\s\S\n]*?-->/g, '');
}
