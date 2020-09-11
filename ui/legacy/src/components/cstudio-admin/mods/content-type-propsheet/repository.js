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

(function () {

  const { React, ReactDOM } = CrafterCMSNext;
  const { useState } = React;

  function Selector({ initialValue, updateFn, rootPath, validations }) {
    const [value, setValue] = useState(initialValue);

    const onChange = (value) => {
      setValue(value);
      updateFn(value);
    };

    const onBlur = () => {
      if (!value.startsWith(validations.startsWith)) {
        if (value.startsWith('/')) {
          setValue(validations.startsWith + value);
        } else {
          setValue(`${validations.startsWith}${value ? '/' + value : value}`);
        }
      }
      updateFn(value);
    };

    const openPathBrowser = () => {
      let unmount;
      const dialogContainer = document.createElement('div');
      CrafterCMSNext.render(dialogContainer, 'PathBrowserDialog', {
        open: true,
        rootPath,
        initialPath: value.endsWith('/') ? value.slice(0, -1) : value,
        onClose: () => unmount(),
        onOk: (path) => {
          unmount();
          onChange(path);
        }
      }).then((done) => (unmount = done.unmount));
    };

    return (
      <>
        <input
          type="text"
          value={value}
          className="repository-selector--input"
          placeholder='/site/...'
          onBlur={validations.startsWith ? onBlur : null}
          onChange={(e) => onChange(e.target.value)}
        />
        <i
          className="repository-selector--icon fa fa-search"
          aria-hidden="true"
          onClick={openPathBrowser}
        />
      </>
    );
  }

  function Repository(fieldName, container) {
    this.fieldName = fieldName;
    this.container = container;
    this.value = '';
  }

  Repository.prototype = {
    render(initialValue, updateFn, fName, itemId, defaultValue, typeControl, disabled, validations) {
      const element = $('<div class="repository-selector"/>').appendTo(this.container)[0];

      const onChange = (value) => {
        updateFn(null, { fieldName: this.fieldName, value });
      };

      ReactDOM.render(
        <Selector
          initialValue={initialValue}
          rootPath={defaultValue}
          updateFn={onChange}
          validations={validations}
        />,
        element
      );

      this.value = value;
    },
    getValue() {
      return this.value;
    }
  };

  CStudioAuthoring.Module.moduleLoaded(
    'cstudio-console-tools-content-types-proptype-repository',
    Repository
  );

})();
