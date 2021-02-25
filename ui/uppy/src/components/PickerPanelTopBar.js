const { h } = require('preact');
const classNames = require('classnames');

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

      <button
        className={classNames({
          'MuiButtonBase-root': true,
          'MuiButton-root': true,
          'MuiButton-text': true,
          'MuiButton-textPrimary': true,
          'Mui-disabled': props.isAllComplete && props.state.totalProgress === 100
        })}
        type="button"
        aria-label={props.i18n('cancelPending')}
        title={props.i18n('cancelPending')}
        disabled={props.isAllComplete && props.state.totalProgress === 100}
        onClick={props.cancelPending}
      >
        {props.i18n('cancelPending')}
      </button>

      {props.hasInvalidFiles && (
        <div className="uppy-dashboard-validation-buttons">
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary"
            type="button"
            aria-label={props.i18n('rejectAll')}
            title={props.i18n('rejectAll')}
            onClick={() => props.rejectAll()}
          >
            {props.i18n('rejectAll')}
          </button>

          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary"
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
            class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary"
            type="button"
            aria-label={props.i18n('addMoreFiles')}
            title={props.i18n('addMoreFiles')}
            onclick={() => props.toggleAddFilesPanel(true)}
          >
            {props.i18n('addMore')}
          </button>
        )}
        <button
          className={classNames({
            'MuiButtonBase-root': true,
            'MuiButton-root': true,
            'MuiButton-text': true,
            'MuiButton-textPrimary': true,
            'Mui-disabled': props.completeFiles.length === 0
          })}
          type="button"
          aria-label={props.i18n('clearCompleted')}
          title={props.i18n('clearCompleted')}
          onClick={props.clearCompleted}
          disabled={props.completeFiles.length === 0}
        >
          {props.i18n('clearCompleted')}
        </button>
      </div>
    </div>
  );
}

module.exports = PanelTopBar;
