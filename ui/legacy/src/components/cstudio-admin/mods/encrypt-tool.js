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

(function () {

  const {
    i18n,
    React,
    ReactDOM,
    rxjs: { operators: { map } },
    util: { ajax }
  } = CrafterCMSNext;
  const { useState, useRef } = React;
  const format = i18n.intl.formatMessage;
  const messages = {  };

  Object.entries(i18n.messages.encryptToolMessages).forEach(([key, descriptor]) => {
    messages[key] = format(descriptor);
  });

  function copyToClipboard(input) {

    /* Select the text field */
    input.select();
    /* For mobile devices */
    input.setSelectionRange(0, 99999);

    /* Copy the text inside the text field */
    document.execCommand('copy');

    $.notify(messages.successMessage, 'success');

  }

  function Tool() {
    const inputRef = useRef();
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [fetching, setFetching] = useState(null);
    const encrypt = () => {
      if (text) {
        setFetching(true);
        setResult(null);
        ajax.get(`/studio/api/2/security/encrypt.json?text=${text}`).pipe(
          map(({ response }) => response.item)
        ).subscribe((encryptedText) => {
          setFetching(false);
          setText('');
          setResult(encryptedText);
          setTimeout(() => copyToClipboard(inputRef.current), 10);
        });
      }
    };
    const clear = () => {
      setText('');
      setResult(null);
    };
    return (
      <section className="content-types-landing-page">
        <header className="page-header">
          <h1>{messages.pageTitle}</h1>
        </header>
        <div className="form-group">
          <label htmlFor="rawText" className="control-label">{messages.inputLabel}</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-control"
            id="rawText"
            autoFocus
            disabled={fetching}
          />
        </div>
        {
          result &&
          <div className="form-group">
            <input
              readOnly
              type="text"
              ref={inputRef}
              className="well"
              value={`\${enc:${result}\}`}
              onClick={(e) => copyToClipboard(e.target)}
              style={{
                display: 'block',
                width: '100%'
              }}
            />
          </div>
        }
        <div className="form-group">
          <button className="btn btn-primary" onClick={encrypt} disabled={fetching}>
            <span>{messages.buttonText}</span>
          </button>
          {' '}
          <button className="btn btn-default" onClick={clear} disabled={fetching || !result}>
            <span>{messages.clearResultButtonText}</span>
          </button>
        </div>
      </section>
    );
  }

  class EncryptTool {
    constructor(config, el) {
      this.containerEl = el;
      this.config = config;
      this.types = [];
    }

    initialize(config) {
      this.config = config;
    }

    renderWorkarea() {

      const workarea = document.querySelector('#cstudio-admin-console-workarea');
      const el = document.createElement('div');

      $(workarea).html('');
      workarea.appendChild(el);

      ReactDOM.render(
        <Tool/>,
        el
      );

    }
  }

  CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-encrypt-tool', EncryptTool);

})();
