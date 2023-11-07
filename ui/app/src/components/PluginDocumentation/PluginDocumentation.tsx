/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { MarketplacePlugin } from '../../models';
import React, { ReactNode, useEffect, useState } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from '../../env/hljs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { FormattedMessage } from 'react-intl';

export interface PluginDocumentationProps {
  plugin: MarketplacePlugin;
}

export function PluginDocumentation(props: PluginDocumentationProps) {
  const { plugin } = props;
  const [markdown, setMarkdown] = useState(null);
  const [link, setLink] = useState(null);
  const [markdownError, setMarkdownError] = useState<boolean>(null);
  useEffect(() => {
    if (plugin.documentation) {
      const marked = new Marked(
        markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
        })
      );
      if (/(\/readme$)|(.md$)/.test(plugin.documentation)) {
        fetch(plugin.documentation)
          .then((r) => r.text())
          .then((content) => {
            setMarkdown(marked.parse(content));
          })
          .catch((error) => {
            setMarkdownError(true);
          });
      } else if (plugin.documentation) {
        setLink(plugin.documentation);
      }
    }
  }, [plugin]);
  return (
    <>
      {markdown && <Typography component="div" dangerouslySetInnerHTML={{ __html: markdown }} />}
      {link && <Link href={link}>{link}</Link>}
      {markdownError && (
        <Typography>
          <FormattedMessage
            id="pluginDetails.markdownError"
            defaultMessage="Unable to render documentation. Visit <a>{link}</a> to view."
            values={{ link: plugin.documentation, a: (text: ReactNode[]) => <a href={text[0] as string}>{text[0]}</a> }}
          />
        </Typography>
      )}
    </>
  );
}

export default PluginDocumentation;
