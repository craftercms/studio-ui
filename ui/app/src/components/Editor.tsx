/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useRef } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import palette from '../styles/palette';

const useStyles = makeStyles(() => ({
  previewEditor: {
    width: '930px',
    height: '600px',
    margin: '0',
    backgroundColor: palette.gray.light0,
    border: 'none'
  }
}));

interface EditorProps {
  mode: string;
  data: any;
}

declare global {
  interface Window {
    ace: any;
  }
}

export default function Editor(props: EditorProps) {
  const { data, mode } = props;
  const classes = useStyles({});
  const editor = useRef(null);
  useEffect(() => {
    let initialized = false;
    const init = () => {
      const aceEditor = window.ace.edit(editor.current, {
        mode,
        showPrintMargin: false,
        fontSize: '12px',
        readOnly: true
      });
      aceEditor.setValue(data, -1);
      aceEditor.focus();
      initialized = true;
    };
    if (!window.ace) {
      const script = document.createElement('script');
      script.src = '/studio/static-assets/libs/ace/ace.js';
      script.onload = init;
      document.head.appendChild(script);
    } else {
      init();
    }
    return () => {
      if (initialized) {
        // TODO: destroy
      }
    }
  }, [data, mode]);
  return (
    <pre ref={editor} className={classes.previewEditor} />
  );
}

