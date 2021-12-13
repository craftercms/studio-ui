/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import React, { useEffect, useState } from 'react';
import Marked from 'marked';
import hljs from '../../utils/hljs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { FormattedMessage } from 'react-intl';

export interface PluginDocumentationProps {
  plugin: MarketplacePlugin;
}

export default function PluginDocumentation(props: PluginDocumentationProps) {
  const { plugin } = props;
  const [markdown, setMarkdown] = useState(null);
  const [link, setLink] = useState(null);
  const [markdownError, setMarkdownError] = useState<boolean>(null);
  useEffect(() => {
    // if (plugin.documentation) {
    //   Marked.setOptions({
    //     highlight: function (code, lang) {
    //       return hljs.highlightAuto(code).value;
    //     },
    //     langPrefix: 'hljs language-'
    //   });
    //   if (/(\/readme$)|(.md$)/.test(plugin.documentation)) {
    //     fetch(plugin.documentation)
    //       .then((r) => r.text())
    //       .then((content) => {
    //         setMarkdown(Marked(content));
    //       })
    //       .catch((error) => {
    //         setMarkdownError(true);
    //       });
    //   } else if (plugin.documentation) {
    //     setLink(plugin.documentation);
    //   }
    // }
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
            values={{ link: plugin.documentation, a: (text) => <a href={text}>{text}</a> }}
          />
        </Typography>
      )}
    </>
  );
}
