import { h } from 'preact';
import prettierBytes from '@transloadit/prettier-bytes';
import truncateString from '@uppy/utils/lib/truncateString';

const renderAcquirerIcon = (acquirer, props) => (
  <span title={props.i18n('fileSource', { name: acquirer.name })}>{acquirer.icon()}</span>
);

const renderFileSource = (props) =>
  props.file.source &&
  props.file.source !== props.id && (
    <div class="uppy-Dashboard-Item-sourceIcon">
      {props.acquirers.map((acquirer) => {
        if (acquirer.id === props.file.source) {
          return renderAcquirerIcon(acquirer, props);
        }
      })}
    </div>
  );

const renderFileName = (props) => {
  // Take up at most 2 lines on any screen
  let maxNameLength;
  let nameClass = 'item-name-pending';
  let suggestedName;

  if (props.file.meta.allowed) {
    nameClass = 'item-name-valid';
    if (props.file.meta.suggestedName) {
      nameClass = 'item-name-invalid';
      suggestedName = props.file.meta.suggestedName;
    }
  } else if (props.file.meta.allowed === false) {
    nameClass = 'item-name-invalid';
  }

  if (props.containerWidth <= 720) {
    maxNameLength = suggestedName ? 30 : 80;
  } else if (props.containerWidth <= 900) {
    maxNameLength = suggestedName ? 40 : 100;
  } else {
    maxNameLength = suggestedName ? 60 : 120;
  }

  return (
    <div
      class="uppy-Dashboard-Item-name"
      title={
        suggestedName
          ? props.i18n('renamingFromTo', {
              from: props.file.meta.name,
              to: suggestedName
            })
          : props.file.meta.name
      }
    >
      <span class={nameClass}>{truncateString(props.file.meta.name, maxNameLength)}</span>
      {suggestedName && (
        <div class="suggested-file-name">
          <svg
            className="suggested-icon"
            focusable="false"
            viewBox="0 0 24 24"
            aria-hidden="true"
            tabIndex="-1"
            title="ForwardRounded"
            data-ga-event-category="material-icons"
            data-ga-event-action="click"
            data-ga-event-label="ForwardRounded"
          >
            <path d="M12 8V6.41c0-.89 1.08-1.34 1.71-.71l5.59 5.59c.39.39.39 1.02 0 1.41l-5.59 5.59c-.63.63-1.71.19-1.71-.7V16H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h7z"></path>
          </svg>
          <span className="item-name-valid">{truncateString(suggestedName, maxNameLength)}</span>
        </div>
      )}
    </div>
  );
};

const renderFileType = (props) =>
  props.file.data.type && <div class="uppy-dashboard-item-statusType">{props.file.data.type}</div>;

const renderFileSize = (props) =>
  props.file.size && <div className="uppy-Dashboard-Item-statusSize">{prettierBytes(props.file.size)}</div>;

const renderPolicyWarning = (props) => {
  const file = props.file;
  const allowed = file.meta.allowed;

  return allowed ? (
    <div class="uppy-dashboard-site-policy-warning">
      {' '}
      <svg
        className="warning-icon"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        tabIndex="-1"
        title="WarningRounded"
        data-ga-event-category="material-icons"
        data-ga-event-action="click"
        data-ga-event-label="WarningRounded"
      >
        <path d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"></path>
      </svg>
      {props.externalMessages.projectPoliciesChangeRequired(file.name)}
    </div>
  ) : (
    <div class="uppy-dashboard-site-policy-warning">
      <svg
        className="warning-icon"
        focusable="false"
        viewBox="0 0 24 24"
        aria-hidden="true"
        tabIndex="-1"
        title="WarningRounded"
        data-ga-event-category="material-icons"
        data-ga-event-action="click"
        data-ga-event-label="WarningRounded"
      >
        <path d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"></path>
      </svg>
      {props.externalMessages.projectPoliciesNoComply(file.name)}
    </div>
  );
};

const ErrorButton = ({ file, onClick }) => {
  if (file.error) {
    return (
      <span
        className="uppy-Dashboard-Item-errorDetails"
        aria-label={file.error}
        data-microtip-position="bottom"
        data-microtip-size="medium"
        role="tooltip"
        onClick={onClick}
      >
        ?
      </span>
    );
  }
  return null;
};

export default function FileInfo(props) {
  return (
    <div className="uppy-Dashboard-Item-fileInfo" data-uppy-file-source={props.file.source}>
      {(props.file.meta.suggestedName || props.file.meta.allowed === false) && renderPolicyWarning(props)}
      {renderFileName(props)}
      <div className="uppy-Dashboard-Item-status">
        {renderFileType(props)} @ {renderFileSize(props)}
        {renderFileSource(props)}
        <ErrorButton
          file={props.file}
          onClick={() => {
            alert(props.file.error);
          }}
        />
      </div>
    </div>
  );
}
