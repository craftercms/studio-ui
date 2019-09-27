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

import React, { useEffect, useRef } from 'react';
import { Core, XHRUpload, Dashboard, Form } from 'uppy';

import 'uppy/src/style.scss';

interface MultipleFileUploadProps {
  elementId: string;
  formTarget: string;
  url: string;
  onComplete?(result: any): void;
}

function MultipleFileUpload(props: MultipleFileUploadProps) {

  const
    {
      url,
      elementId,
      formTarget,
      onComplete
    } = props,
    uppy = Core();

  const elementRef = (node) => {
    
    uppy
      .use(Dashboard, {
        inline: true,
        target: node
      })
      .use(Form, {
        target: formTarget,
        getMetaFromForm: true,
        addResultToForm: true,
        submitOnSuccess: false,
        triggerUploadOnSubmit: false
      })
      .use(XHRUpload, {
        endpoint: url,
        formData: true,
        fieldName: 'file',
        limit: 1,
        meta: {
          site: 'editorial',
          path: '/static-assets/images'
        }
      });

    uppy.on('complete', (result) => {
      onComplete(result);
    });

  };

  return (
    <div ref={elementRef}></div>
  );
}

export default MultipleFileUpload;
