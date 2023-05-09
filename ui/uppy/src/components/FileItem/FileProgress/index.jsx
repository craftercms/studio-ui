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

function onPauseResumeCancelRetry(props) {
  if (props.isUploaded) return;

  if (props.error && !props.hideRetryButton) {
    props.retryUpload(props.file.id);
    return;
  }

  if (props.resumableUploads && !props.hidePauseResumeButton) {
    props.pauseUpload(props.file.id);
  } else if (props.individualCancellation && !props.hideCancelButton) {
    props.cancelUpload(props.file.id);
  }
}

function progressIndicatorTitle(props) {
  if (props.isUploaded) {
    return props.i18n('uploadComplete');
  }

  if (props.error) {
    return props.i18n('retryUpload');
  }

  if (props.resumableUploads) {
    if (props.file.isPaused) {
      return props.i18n('resumeUpload');
    }
    return props.i18n('pauseUpload');
  } else if (props.individualCancellation) {
    return props.i18n('cancelUpload');
  }

  return '';
}

function ProgressIndicatorButton(props) {
  return (
    <div class="uppy-Dashboard-Item-progress">
      <button
        class="uppy-u-reset uppy-c-btn uppy-Dashboard-Item-progressIndicator"
        type="button"
        aria-label={progressIndicatorTitle(props)}
        title={progressIndicatorTitle(props)}
        onclick={() => onPauseResumeCancelRetry(props)}
      >
        {props.children}
      </button>
    </div>
  );
}

function ProgressCircleContainer({ children }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="70"
      height="70"
      viewBox="0 0 36 36"
      class="uppy-c-icon uppy-Dashboard-Item-progressIcon--circle"
    >
      {children}
    </svg>
  );
}

function ProgressCircle({ progress }) {
  // circle length equals 2 * PI * R
  const circleLength = 2 * Math.PI * 15;

  return (
    <g>
      <circle class="uppy-Dashboard-Item-progressIcon--bg" r="15" cx="18" cy="18" stroke-width="2" fill="none" />
      <circle
        class="uppy-Dashboard-Item-progressIcon--progress"
        r="15"
        cx="18"
        cy="18"
        transform="rotate(-90, 18, 18)"
        stroke-width="2"
        fill="none"
        stroke-dasharray={circleLength}
        stroke-dashoffset={circleLength - (circleLength / 100) * progress}
      />
    </g>
  );
}

function ProgressBar({ width, type }) {
  return (
    <div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      class={`uppy-file-progress-bar ${type}`}
      style={{ width: width }}
    />
  );
}

export default function FileProgress({ file, isUploaded, error }) {
  // Nothing if upload has not started
  if (!file.progress.uploadStarted) {
    return null;
  }

  // Green checkmark when complete
  if (isUploaded) {
    return (
      <div class="uppy-dashboard-item-progress">
        <ProgressBar type="complete" width="100%" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="uppy-dashboard-item-progress">
        <ProgressBar type="error" width="100%" />
      </div>
    );
  }

  // Just progress when buttons are disabled
  return (
    <div className="uppy-dashboard-item-progress">
      <ProgressBar width={`${file.progress.percentage}%`} />
    </div>
  );
}
