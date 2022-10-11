const { h, Component } = require('preact');
const classNames = require('classnames');
const shallowEqual = require('is-shallow-equal');
const FilePreviewAndLink = require('@uppy/dashboard/lib/components/FileItem/FilePreviewAndLink');
const FileProgress = require('./FileProgress');
const FileInfo = require('./FileInfo');
const Buttons = require('./Buttons');

module.exports = class FileItem extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  componentDidMount() {
    const file = this.props.file;
    if (!file.preview) {
      this.props.handleRequestThumbnail(file);
    }
  }

  componentWillUnmount() {
    const file = this.props.file;
    if (!file.preview) {
      this.props.handleCancelThumbnail(file);
    }
  }

  render() {
    const file = this.props.file;

    const isProcessing = file.progress.preprocess || file.progress.postprocess;
    const isUploaded = file.progress.uploadComplete && !isProcessing && !file.error;
    const uploadInProgressOrComplete = file.progress.uploadStarted || isProcessing;
    const uploadInProgress = (file.progress.uploadStarted && !file.progress.uploadComplete) || isProcessing;
    const error = file.error || false;

    let showRemoveButton = this.props.individualCancellation ? !isUploaded : !uploadInProgress && !isUploaded;

    if (isUploaded && this.props.showRemoveButtonAfterComplete) {
      showRemoveButton = true;
    }

    const dashboardItemClass = classNames({
      'MuiPaper-root MuiCard-root MuiPaper-elevation1 MuiPaper-rounded uppy-dashboard-item-card': true,
      'is-inprogress': uploadInProgress,
      'is-processing': isProcessing,
      'is-complete': isUploaded,
      'is-error': !!error,
      'is-resumable': this.props.resumableUploads,
      'is-noIndividualCancellation': !this.props.individualCancellation
    });

    return (
      <div class={dashboardItemClass} id={`uppy_${file.id}`} role={this.props.role}>
        <div class="uppy-dashboard-item-preview">
          <FilePreviewAndLink file={file} showLinkToFileUploadResult={this.props.showLinkToFileUploadResult} />
        </div>
        <div class="uppy-dashboard-item-fileInfoAndButtons">
          <FileInfo
            file={file}
            id={this.props.id}
            acquirers={this.props.acquirers}
            containerWidth={this.props.containerWidth}
            i18n={this.props.i18n}
            externalMessages={this.props.externalMessages}
          />
          <Buttons
            file={file}
            error={error}
            hideRetryButton={this.props.hideRetryButton}
            showRemoveButton={showRemoveButton}
            validateAndRetry={this.props.validateAndRetry}
            removeFile={this.props.removeFile}
            retryUpload={this.props.retryUpload}
            i18n={this.props.i18n}
          />
        </div>
        <FileProgress file={file} error={error} isUploaded={isUploaded} />
      </div>
    );
  }
};
