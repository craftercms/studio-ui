/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { getContent } from '../services/content';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { palette } from "../styles/theme";

const useStyles = makeStyles(() => ({
  previewEditor: {
    width: '930px',
    height: '600px',
    margin: '0',
    backgroundColor: palette.gray.medium3,
    border: 'none'
  }
}));

interface EditorProps {
  mode: string;
  data: any;
}

export default function Editor(props: EditorProps) {
  const {data, mode} = props;
  const classes = useStyles({});
  useEffect(() => {
    // @ts-ignore
    var aceEditor = ace.edit('preview-editor', {
      mode: mode,
      showPrintMargin: false,
      fontSize: "12px",
      readOnly: true,
    });
    aceEditor.setValue(data, -1);
    aceEditor.focus();
  }, []);

  return (
    <pre id='preview-editor' className={classes.previewEditor}></pre>
  )
}

