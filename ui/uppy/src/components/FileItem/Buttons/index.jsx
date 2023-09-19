/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { h } from 'preact';

function RemoveButton({ i18n, onClick, file }) {
  return (
    <button
      className="uppy-dashboard-button-base uppy-dashboard-icon-button edgeEnd"
      tabIndex="0"
      type="button"
      aria-label={i18n('removeFile')}
      title={i18n('removeFile')}
      onClick={() => onClick()}
    >
      <svg className="uppy-dashboard-svg-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
      </svg>
    </button>
  );
}

function RetryButton({ i18n, onClick }) {
  return (
    <button
      className="uppy-dashboard-button-base uppy-dashboard-icon-button edgeEnd"
      tabIndex="0"
      type="button"
      aria-label={i18n('retryUpload')}
      title={i18n('retryUpload')}
      onClick={() => onClick()}
    >
      <svg className="uppy-dashboard-svg-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>
      </svg>
    </button>
  );
}

function ValidateIcon({ i18n }) {
  return (
    <i className="uppy-dashboard-item-validating" title={i18n('validating')}>
      <svg className="uppy-dashboard-svg-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 2c-1.1 0-2 .9-2 2v3.17c0 .53.21 1.04.59 1.42L10 12l-3.42 3.42c-.37.38-.58.89-.58 1.42V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3.16c0-.53-.21-1.04-.58-1.41L14 12l3.41-3.4c.38-.38.59-.89.59-1.42V4c0-1.1-.9-2-2-2H8zm8 14.5V19c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-2.5l4-4 4 4zm-4-5l-4-4V5c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v2.5l-4 4z"></path>
      </svg>
    </i>
  );
}

function AcceptSuggestedNameIcon({ i18n, onClick }) {
  return (
    <button
      className="uppy-dashboard-button-base uppy-dashboard-icon-button edgeEnd"
      tabIndex="0"
      type="button"
      aria-label={i18n('validateAndRetry')}
      title={i18n('validateAndRetry')}
      onClick={() => onClick()}
    >
      <svg className="uppy-dashboard-svg-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 16.17L5.53 12.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41a.9959.9959 0 00-1.41 0L9 16.17z"></path>
      </svg>
    </button>
  );
}

export default function Buttons(props) {
  const { file, showRemoveButton, i18n, removeFile, error, hideRetryButton, retryUpload, validateAndRetry } = props;

  return (
    <div className="uppy-Dashboard-Item-actionWrapper">
      {error && !hideRetryButton && !file.meta.validating && (
        <RetryButton i18n={i18n} onClick={() => retryUpload(file.id)} />
      )}
      {showRemoveButton && !file.meta.validating ? (
        <RemoveButton i18n={i18n} onClick={() => removeFile(file.id, 'removed-by-user')} />
      ) : null}
      {file.meta.validating && <ValidateIcon i18n={i18n} />}
      {file.meta.validating === false && file.meta.allowed && file.meta.suggestedName && (
        <AcceptSuggestedNameIcon i18n={i18n} onClick={() => validateAndRetry(file.id)} />
      )}
    </div>
  );
}
