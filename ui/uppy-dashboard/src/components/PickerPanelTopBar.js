const { h } = require('preact');

const uploadStates = {
  STATE_ERROR: 'error',
  STATE_WAITING: 'waiting',
  STATE_PREPROCESSING: 'preprocessing',
  STATE_UPLOADING: 'uploading',
  STATE_POSTPROCESSING: 'postprocessing',
  STATE_COMPLETE: 'complete',
  STATE_PAUSED: 'paused'
};

function getUploadingState(isAllErrored, isAllComplete, isAllPaused, files = {}) {
  if (isAllErrored) {
    return uploadStates.STATE_ERROR;
  }

  if (isAllComplete) {
    return uploadStates.STATE_COMPLETE;
  }

  if (isAllPaused) {
    return uploadStates.STATE_PAUSED;
  }

  let state = uploadStates.STATE_WAITING;
  const fileIDs = Object.keys(files);
  for (let i = 0; i < fileIDs.length; i++) {
    const progress = files[fileIDs[i]].progress;
    // If ANY files are being uploaded right now, show the uploading state.
    if (progress.uploadStarted && !progress.uploadComplete) {
      return uploadStates.STATE_UPLOADING;
    }
    // If files are being preprocessed AND postprocessed at this time, we show the
    // preprocess state. If any files are being uploaded we show uploading.
    if (progress.preprocess && state !== uploadStates.STATE_UPLOADING) {
      state = uploadStates.STATE_PREPROCESSING;
    }
    // If NO files are being preprocessed or uploaded right now, but some files are
    // being postprocessed, show the postprocess state.
    if (progress.postprocess && state !== uploadStates.STATE_UPLOADING && state !== uploadStates.STATE_PREPROCESSING) {
      state = uploadStates.STATE_POSTPROCESSING;
    }
  }
  return state;
}

function UploadStatus(props) {
  const uploadingState = getUploadingState(props.isAllErrored, props.isAllComplete, props.isAllPaused, props.files);

  switch (uploadingState) {
    case 'uploading':
      return props.i18n('uploadingXFiles', { smart_count: props.inProgressNotPausedFiles.length });
    case 'preprocessing':
    case 'postprocessing':
      return props.i18n('processingXFiles', { smart_count: props.processingFiles.length });
    case 'paused':
      return props.i18n('uploadPaused');
    case 'waiting':
      return props.i18n('xFilesSelected', { smart_count: props.newFiles.length });
    case 'complete':
      return props.i18n('uploadComplete');
  }
}

function PanelTopBar(props) {
  let allowNewUpload = props.allowNewUpload;
  // TODO maybe this should be done in ../index.js, then just pass that down as `allowNewUpload`
  if (allowNewUpload && props.maxNumberOfFiles) {
    allowNewUpload = props.totalFileCount < props.maxNumberOfFiles;
  }

  const hasInvalidFiles = Object.values(props.invalidFiles).some((value) => value);

  return (
    <div class="uppy-DashboardContent-bar">
      <div className="uppy-dashboard-progress-indicator">
        <div
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          className={`uppy-file-progress-bar ${props.isAllComplete ? 'complete' : ''}`}
          style={{ width: `${props.state.totalProgress}%` }}
        />
      </div>
      {!props.isAllComplete && !props.hideCancelButton && (
        <button
          class="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary"
          type="button"
          onclick={props.cancelAll}
        >
          {props.i18n('cancel')}
        </button>
      )}

      {hasInvalidFiles && (
        <div className="uppy-dashboard-validation-buttons">
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary"
            type="button"
            aria-label={props.i18n('rejectAll')}
            title={props.i18n('rejectAll')}
            onClick={() => props.rejectAll()}
          >
            {props.i18n('rejectAll')}
          </button>

          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary"
            type="button"
            aria-label={props.i18n('acceptAll')}
            title={props.i18n('acceptAll')}
            onClick={() => props.confirmAll()}
          >
            {props.i18n('acceptAll')}
          </button>
        </div>
      )}

      {/*<div class="uppy-DashboardContent-title" role="heading" aria-level="1">*/}
      {/*  <UploadStatus {...props} />*/}
      {/*</div>*/}

      <div className="uppy-dashboard-right-buttons">
        {allowNewUpload && (
          <button
            class="MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-outlinedPrimary"
            type="button"
            aria-label={props.i18n('addMoreFiles')}
            title={props.i18n('addMoreFiles')}
            onclick={() => props.toggleAddFilesPanel(true)}
          >
            {props.i18n('addMore')}
          </button>
        )}
        {props.isAllComplete && (
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary"
            type="button"
            aria-label={props.i18n('clear')}
            title={props.i18n('clear')}
            onClick={() => props.doneButtonHandler()}
          >
            {props.i18n('clear')}
          </button>
        )}
      </div>
    </div>
  );
}

module.exports = PanelTopBar;
