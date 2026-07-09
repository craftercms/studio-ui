import { h } from 'preact';
import copyToClipboard from '../../../utils/copyToClipboard.js';

function EditButton({ file, uploadInProgressOrComplete, metaFields, canEditFile, i18n, onClick }) {
	if (
		(!uploadInProgressOrComplete && metaFields && metaFields.length > 0) ||
		(!uploadInProgressOrComplete && canEditFile(file))
	) {
		return (
			<button
				className="uppy-u-reset uppy-c-btn uppy-Dashboard-Item-action uppy-Dashboard-Item-action--edit"
				type="button"
				aria-label={i18n('editFileWithFilename', { file: file.meta.name })}
				title={i18n('editFileWithFilename', { file: file.meta.name })}
				onClick={() => onClick()}
			>
				<svg aria-hidden="true" focusable="false" className="uppy-c-icon" width="14" height="14" viewBox="0 0 14 14">
					<g fillRule="evenodd">
						<path
							d="M1.5 10.793h2.793A1 1 0 0 0 5 10.5L11.5 4a1 1 0 0 0 0-1.414L9.707.793a1 1 0 0 0-1.414 0l-6.5 6.5A1 1 0 0 0 1.5 8v2.793zm1-1V8L9 1.5l1.793 1.793-6.5 6.5H2.5z"
							fillRule="nonzero"
						/>
						<rect x="1" y="12.293" width="11" height="1" rx=".5" />
						<path fillRule="nonzero" d="M6.793 2.5L9.5 5.207l.707-.707L7.5 1.793z" />
					</g>
				</svg>
			</button>
		);
	}
	return null;
}

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

function CopyLinkButton({ file, uppy, i18n }) {
	const copyLinkToClipboard = (event) => {
		copyToClipboard(file.uploadURL, i18n('copyLinkToClipboardFallback'))
			.then(() => {
				uppy.log('Link copied to clipboard.');
				uppy.info(i18n('copyLinkToClipboardSuccess'), 'info', 3000);
			})
			.catch(uppy.log)
			// avoid losing focus
			.then(() => event.target.focus({ preventScroll: true }));
	};

	return (
		<button
			className="uppy-u-reset uppy-Dashboard-Item-action uppy-Dashboard-Item-action--copyLink"
			type="button"
			aria-label={i18n('copyLink')}
			title={i18n('copyLink')}
			onClick={(event) => copyLinkToClipboard(event)}
		>
			<svg aria-hidden="true" focusable="false" className="uppy-c-icon" width="14" height="14" viewBox="0 0 14 12">
				<path d="M7.94 7.703a2.613 2.613 0 0 1-.626 2.681l-.852.851a2.597 2.597 0 0 1-1.849.766A2.616 2.616 0 0 1 2.764 7.54l.852-.852a2.596 2.596 0 0 1 2.69-.625L5.267 7.099a1.44 1.44 0 0 0-.833.407l-.852.851a1.458 1.458 0 0 0 1.03 2.486c.39 0 .755-.152 1.03-.426l.852-.852c.231-.231.363-.522.406-.824l1.04-1.038zm4.295-5.937A2.596 2.596 0 0 0 10.387 1c-.698 0-1.355.272-1.849.766l-.852.851a2.614 2.614 0 0 0-.624 2.688l1.036-1.036c.041-.304.173-.6.407-.833l.852-.852c.275-.275.64-.426 1.03-.426a1.458 1.458 0 0 1 1.03 2.486l-.852.851a1.442 1.442 0 0 1-.824.406l-1.04 1.04a2.596 2.596 0 0 0 2.683-.628l.851-.85a2.616 2.616 0 0 0 0-3.697zm-6.88 6.883a.577.577 0 0 0 .82 0l3.474-3.474a.579.579 0 1 0-.819-.82L5.355 7.83a.579.579 0 0 0 0 .819z" />
			</svg>
		</button>
	);
}

function ConfirmActionIcon({ i18n, onClick, labelKey }) {
	return (
		<button
			className="uppy-dashboard-button-base uppy-dashboard-icon-button edgeEnd"
			tabIndex="0"
			type="button"
			aria-label={i18n(labelKey)}
			title={i18n(labelKey)}
			onClick={() => onClick()}
		>
			<svg className="uppy-dashboard-svg-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M9 16.17L5.53 12.7a.9959.9959 0 00-1.41 0c-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41a.9959.9959 0 00-1.41 0L9 16.17z"></path>
			</svg>
		</button>
	);
}

export default function Buttons(props) {
	const {
		uppy,
		file,
		uploadInProgressOrComplete,
		canEditFile,
		metaFields,
		showLinkToFileUploadResult,
		showRemoveButton,
		i18n,
		toggleFileCard,
		openFileEditor,
		validateAndRetry,
		confirmOverwrite
	} = props;
	const editAction = () => {
		if (metaFields && metaFields.length > 0) {
			toggleFileCard(true, file.id);
		} else {
			openFileEditor(file);
		}
	};

	return (
		<div className="uppy-Dashboard-Item-actionWrapper">
			<EditButton
				i18n={i18n}
				file={file}
				uploadInProgressOrComplete={uploadInProgressOrComplete}
				canEditFile={canEditFile}
				metaFields={metaFields}
				onClick={editAction}
			/>
			{showRemoveButton ? <RemoveButton i18n={i18n} file={file} onClick={() => uppy.removeFile(file.id)} /> : null}

			{file.meta.validating === false &&
				file.meta.allowed &&
				file.meta.suggestedName &&
				!file.meta.overwriteRequired && (
					<ConfirmActionIcon i18n={i18n} labelKey="validateAndRetry" onClick={() => validateAndRetry(file.id)} />
				)}
			{file.meta.validating === false && file.meta.overwriteRequired && (
				<ConfirmActionIcon i18n={i18n} labelKey="confirmOverwrite" onClick={() => confirmOverwrite(file.id)} />
			)}
			{showLinkToFileUploadResult && file.uploadURL ? <CopyLinkButton file={file} uppy={uppy} i18n={i18n} /> : null}
		</div>
	);
}
