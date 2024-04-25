import { h } from 'preact';

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
    const { progress } = files[fileIDs[i]];
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

function UploadStatus({
  files,
  i18n,
  isAllComplete,
  isAllErrored,
  isAllPaused,
  inProgressNotPausedFiles,
  newFiles,
  processingFiles
}) {
  const uploadingState = getUploadingState(isAllErrored, isAllComplete, isAllPaused, files);

  switch (uploadingState) {
    case 'uploading':
      return i18n('uploadingXFiles', { smart_count: inProgressNotPausedFiles.length });
    case 'preprocessing':
    case 'postprocessing':
      return i18n('processingXFiles', { smart_count: processingFiles.length });
    case 'paused':
      return i18n('uploadPaused');
    case 'waiting':
      return i18n('xFilesSelected', { smart_count: newFiles.length });
    case 'complete':
      return i18n('uploadComplete');
    case 'error':
      return i18n('error');
    default:
  }
}

function PanelTopBar(props) {
  const { i18n, isAllComplete, hideCancelButton, maxNumberOfFiles, toggleAddFilesPanel, uppy } = props;
  let { allowNewUpload } = props;
  // TODO maybe this should be done in ../Dashboard.jsx, then just pass that down as `allowNewUpload`
  if (allowNewUpload && maxNumberOfFiles) {
    // eslint-disable-next-line react/destructuring-assignment
    allowNewUpload = props.totalFileCount < props.maxNumberOfFiles;
  }

  return (
    <div className="uppy-DashboardContent-bar">
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
        className="uppy-dashboard-button-base uppy-dashboard-text-button"
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
            className="uppy-dashboard-button-base uppy-dashboard-text-button"
            type="button"
            aria-label={props.i18n('rejectAll')}
            title={props.i18n('rejectAll')}
            onClick={() => props.rejectAll()}
          >
            {props.i18n('rejectAll')}
          </button>

          <button
            className="uppy-dashboard-button-base uppy-dashboard-text-button"
            type="button"
            aria-label={props.i18n('acceptAll')}
            title={props.i18n('acceptAll')}
            onClick={() => props.confirmAll()}
          >
            {props.i18n('acceptAll')}
          </button>
        </div>
      )}

      <div className="uppy-dashboard-right-buttons">
        {allowNewUpload && (
          <button
            className="uppy-dashboard-button-base uppy-dashboard-text-button"
            type="button"
            aria-label={props.i18n('addMoreFiles')}
            title={props.i18n('addMoreFiles')}
            onClick={() => props.toggleAddFilesPanel(true)}
          >
            {props.i18n('addMore')}
          </button>
        )}
        {!props.autoProceed && (
          <button
            className="uppy-dashboard-button-base uppy-dashboard-text-button"
            type="button"
            disabled={props.isAllComplete && props.state.totalProgress === 100}
            onClick={() => {
              props.validateFilesPolicy(Object.values(props.files));
            }}
          >
            {props.i18n('proceed')}
          </button>
        )}
        <button
          className="uppy-dashboard-button-base uppy-dashboard-text-button"
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

export default PanelTopBar;
