const FileList = require('./FileList');
const AddFiles = require('@uppy/dashboard/lib/components/AddFiles');
const AddFilesPanel = require('@uppy/dashboard/lib/components/AddFilesPanel');
const PanelTopBar = require('./PickerPanelTopBar');
const Slide = require('@uppy/dashboard/lib/components/Slide');
const classNames = require('classnames');
const isDragDropSupported = require('@uppy/utils/lib/isDragDropSupported');
const { h } = require('preact');

// http://dev.edenspiekermann.com/2016/02/11/introducing-accessible-modal-dialog
// https://github.com/ghosh/micromodal

const WIDTH_XL = 900;
const WIDTH_LG = 700;
const WIDTH_MD = 576;
const HEIGHT_MD = 400;

module.exports = function Dashboard(props) {
  const noFiles = props.totalFileCount === 0;
  const isSizeMD = props.containerWidth > WIDTH_MD;

  const wrapperClassName = classNames({
    'uppy-Root': props.isTargetDOMEl
  });

  const dashboardClassName = classNames({
    'uppy-Dashboard': true,
    'uppy-Dashboard--animateOpenClose': props.animateOpenClose,
    'uppy-Dashboard--isClosing': props.isClosing,
    'uppy-Dashboard--isDraggingOver': props.isDraggingOver,
    'uppy-Dashboard--modal': !props.inline,
    'uppy-size--md': props.containerWidth > WIDTH_MD,
    'uppy-size--lg': props.containerWidth > WIDTH_LG,
    'uppy-size--xl': props.containerWidth > WIDTH_XL,
    'uppy-size--height-md': props.containerHeight > HEIGHT_MD,
    'uppy-Dashboard--isAddFilesPanelVisible': props.showAddFilesPanel,
    'uppy-Dashboard--isInnerWrapVisible': props.areInsidesReadyToBeVisible
  });

  // Important: keep these in sync with the percent width values in `src/components/FileItem/index.scss`.
  let itemsPerRow = 1;

  const showFileList = props.showSelectedFiles && !noFiles;

  const dashboard = (
    <div
      class={dashboardClassName}
      data-uppy-theme={props.theme}
      data-uppy-num-acquirers={props.acquirers.length}
      data-uppy-drag-drop-supported={isDragDropSupported()}
      aria-hidden={props.inline ? 'false' : props.isHidden}
      aria-label={!props.inline ? props.i18n('dashboardWindowTitle') : props.i18n('dashboardTitle')}
      onpaste={props.handlePaste}
      onDragOver={props.handleDragOver}
      onDragLeave={props.handleDragLeave}
      onDrop={props.handleDrop}
    >
      <div class="uppy-Dashboard-overlay" tabindex={-1} onclick={props.handleClickOutside} />

      <div
        class="uppy-Dashboard-inner"
        aria-modal={!props.inline && 'true'}
        role={!props.inline && 'dialog'}
        style={{
          width: props.inline && props.width ? props.width : '',
          height: props.inline && props.height ? props.height : ''
        }}
      >
        {!props.inline ? (
          <button
            class="uppy-u-reset uppy-Dashboard-close"
            type="button"
            aria-label={props.i18n('closeModal')}
            title={props.i18n('closeModal')}
            onclick={props.closeModal}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        ) : null}

        <div class="uppy-Dashboard-innerWrap">
          <div class="uppy-Dashboard-dropFilesHereHint">{props.i18n('dropHint')}</div>
          {showFileList ? (
            <FileList {...props} itemsPerRow={itemsPerRow} />
          ) : (
            <div
              style={{
                textAlign: 'center',
                verticalAlign: 'middle',
                top: '50%',
                position: 'relative',
                transform: 'translate(0, -50%)'
              }}
            >
              <div>
                <AddFiles {...props} isSizeMD={isSizeMD} />
              </div>
              <div>
                <div
                  className="uppy-Dashboard-AddFiles"
                  style={{
                    color: '#949494',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}
                >
                  {props.externalMessages.maxFiles}
                </div>
              </div>
            </div>
          )}

          <Slide>
            {props.showAddFilesPanel ? <AddFilesPanel key="AddFiles" {...props} isSizeMD={isSizeMD} /> : null}
          </Slide>

          <div className="uppy-Dashboard-progressindicators">
            {props.progressindicators.map((target) => {
              return props.getPlugin(target.id).render(props.state);
            })}
          </div>

          {showFileList && <PanelTopBar {...props} />}
        </div>
      </div>
    </div>
  );

  return (
    // Wrap it for RTL language support
    <div class={wrapperClassName} dir={props.direction}>
      <div class="uppy-dashboard-header">
        <h2 className="MuiTypography-root MuiTypography-h6 uppy-dashboard-header-title">
          {props.title} {Boolean(props.totalFileCount) && `(${props.completeFiles.length}/${props.totalFileCount})`}
        </h2>
        <div class="uppy-dashboard-header-actions">
          <button
            title={props.i18n('minimize')}
            onClick={props.onMinimized}
            className="MuiButtonBase-root MuiIconButton-root"
            tabIndex="0"
            type="button"
          >
            <span className="MuiIconButton-label">
              <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
              </svg>
            </span>
            <span className="MuiTouchRipple-root" />
          </button>
          <button
            title={props.i18n('close')}
            onClick={props.onClose}
            className="MuiButtonBase-root MuiIconButton-root"
            tabIndex="0"
            type="button"
            aria-label="close"
          >
            <span className="MuiIconButton-label">
              <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.3 5.71a.9959.9959 0 00-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
              </svg>
            </span>
            <span className="MuiTouchRipple-root" />
          </button>
        </div>
      </div>
      {dashboard}
    </div>
  );
};
