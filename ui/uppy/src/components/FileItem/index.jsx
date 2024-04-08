import { h, Component } from 'preact';
import classNames from 'classnames';
import shallowEqual from 'is-shallow-equal';
import FilePreviewAndLink from '@uppy/dashboard/lib/components/FileItem/FilePreviewAndLink';
import FileProgress from './FileProgress/index';
import FileInfo from './FileInfo/index';
import Buttons from './Buttons/index';

export default class FileItem extends Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  componentDidMount() {
    const { file } = this.props;
    if (!file.preview) {
      this.props.handleRequestThumbnail(file);
    }
  }

  componentWillUnmount() {
    const { file } = this.props;
    if (!file.preview) {
      this.props.handleCancelThumbnail(file);
    }
  }

  render() {
    const { file } = this.props;

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
      <div className={dashboardItemClass} id={`uppy_${file.id}`} role={this.props.role}>
        <div className="uppy-dashboard-item-preview">
          <FilePreviewAndLink file={file} showLinkToFileUploadResult={this.props.showLinkToFileUploadResult} />
        </div>
        <div class="uppy-dashboard-item-fileInfoAndButtons">
          <FileInfo
            file={file}
            id={this.props.id}
            acquirers={this.props.acquirers}
            containerWidth={this.props.containerWidth}
            containerHeight={this.props.containerHeight}
            i18n={this.props.i18n}
            isSingleFile={this.props.isSingleFile}
            externalMessages={this.props.externalMessages}
          />
          <Buttons
            file={file}
            error={error}
            hideRetryButton={this.props.hideRetryButton}
            showRemoveButton={showRemoveButton}
            validateAndRetry={this.props.validateAndRetry}
            successfulUploadButton={this.props.successfulUploadButton}
            removeFile={this.props.removeFile}
            retryUpload={this.props.retryUpload}
            i18n={this.props.i18n}
          />
        </div>
        <FileProgress file={file} error={error} isUploaded={isUploaded} />
      </div>
    );
  }
}
