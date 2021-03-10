const FileItem = require('./FileItem/index.js');
const VirtualList = require('@uppy/dashboard/lib/components/VirtualList');
const classNames = require('classnames');
const { h } = require('preact');

function chunks(list, size) {
  const chunked = [];
  let currentChunk = [];
  list.forEach((item, i) => {
    if (currentChunk.length < size) {
      currentChunk.push(item);
    } else {
      chunked.push(currentChunk);
      currentChunk = [item];
    }
  });
  if (currentChunk.length) chunked.push(currentChunk);
  return chunked;
}

module.exports = (props) => {
  const noFiles = props.totalFileCount === 0;
  const dashboardFilesClass = classNames('uppy-Dashboard-files', { 'uppy-Dashboard-files--noFiles': noFiles });

  const rowHeight = props.totalFileCount ? (props.totalFileCount * 140 - 20) / props.totalFileCount : 140;

  const fileProps = {
    // FIXME This is confusing, it's actually the Dashboard's plugin ID
    id: props.id,
    error: props.error,
    // TODO move this to context
    i18n: props.i18n,
    log: props.log,
    info: props.info,
    // features
    acquirers: props.acquirers,
    containerWidth: props.containerWidth,
    resumableUploads: props.resumableUploads,
    individualCancellation: props.individualCancellation,
    // visual options
    hideRetryButton: props.hideRetryButton,
    hidePauseResumeButton: props.hidePauseResumeButton,
    hideCancelButton: props.hideCancelButton,
    showLinkToFileUploadResult: props.showLinkToFileUploadResult,
    showRemoveButtonAfterComplete: props.showRemoveButtonAfterComplete,
    isWide: props.isWide,
    metaFields: props.metaFields,
    // callbacks
    retryUpload: props.retryUpload,
    validateAndRetry: props.validateAndRetry,
    pauseUpload: props.pauseUpload,
    cancelUpload: props.cancelUpload,
    toggleFileCard: props.toggleFileCard,
    removeFile: props.removeFile,
    handleRequestThumbnail: props.handleRequestThumbnail,
    handleCancelThumbnail: props.handleCancelThumbnail
  };

  const rows = chunks(Object.keys(props.files), props.itemsPerRow);

  function renderRow(row) {
    return (
      // The `role="presentation` attribute ensures that the list items are properly associated with the `VirtualList` element
      // We use the first file ID as the key—this should not change across scroll rerenders
      <div role="presentation" key={row[0]} class="uppy-dashboard-files-list-row">
        {row.map((fileID) => (
          <FileItem
            key={fileID}
            {...fileProps}
            role="listitem"
            openFileEditor={props.openFileEditor}
            canEditFile={props.canEditFile}
            file={props.files[fileID]}
          />
        ))}
      </div>
    );
  }

  return (
    <VirtualList class={dashboardFilesClass} role="list" data={rows} renderRow={renderRow} rowHeight={rowHeight} />
  );
};
