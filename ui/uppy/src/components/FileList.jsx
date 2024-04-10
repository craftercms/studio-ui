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
import { useMemo } from 'preact/hooks';
import FileItem from './FileItem/index';
import VirtualList from '@uppy/utils/lib/VirtualList';

function chunks(list, size) {
  const chunked = [];
  let currentChunk = [];
  list.forEach((item) => {
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

export default ({
  uppy,
  id,
  error,
  i18n,
  files,
  acquirers,
  resumableUploads,
  hideRetryButton,
  hidePauseResumeButton,
  hideCancelButton,
  showLinkToFileUploadResult,
  showRemoveButtonAfterComplete,
  isWide,
  metaFields,
  isSingleFile,
  toggleFileCard,
  handleRequestThumbnail,
  handleCancelThumbnail,
  recoveredState,
  individualCancellation,
  itemsPerRow,
  openFileEditor,
  canEditFile,
  toggleAddFilesPanel,
  containerWidth,
  containerHeight,
  totalFileCount,
  log,
  info,
  retryUpload,
  validateAndRetry,
  pauseUpload,
  cancelUpload,
  removeFile,
  externalMessages,
  successfulUploadButton
}) => {
  const rowHeight = totalFileCount ? (totalFileCount * 140 - 20) / totalFileCount : 140;

  // Sort files by file.isGhost, ghost files first, only if recoveredState is present
  const rows = useMemo(() => {
    const sortByGhostComesFirst = (file1, file2) => files[file2].isGhost - files[file1].isGhost;

    const fileIds = Object.keys(files);
    if (recoveredState) fileIds.sort(sortByGhostComesFirst);
    return chunks(fileIds, itemsPerRow);
  }, [files, itemsPerRow, recoveredState]);

  const renderRow = (row) => (
    // The `role="presentation` attribute ensures that the list items are properly
    // associated with the `VirtualList` element.
    // We use the first file ID as the key—this should not change across scroll rerenders
    <div class="uppy-Dashboard-filesInner" role="presentation" key={row[0]}>
      {row.map((fileID) => (
        <FileItem
          uppy={uppy}
          key={fileID}
          log={log}
          info={info}
          id={id}
          error={error}
          i18n={i18n}
          externalMessages={externalMessages}
          // features
          acquirers={acquirers}
          resumableUploads={resumableUploads}
          individualCancellation={individualCancellation}
          // visual options
          hideRetryButton={hideRetryButton}
          hidePauseResumeButton={hidePauseResumeButton}
          hideCancelButton={hideCancelButton}
          showLinkToFileUploadResult={showLinkToFileUploadResult}
          showRemoveButtonAfterComplete={showRemoveButtonAfterComplete}
          successfulUploadButton={successfulUploadButton}
          isWide={isWide}
          metaFields={metaFields}
          recoveredState={recoveredState}
          isSingleFile={isSingleFile}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          // callbacks
          toggleFileCard={toggleFileCard}
          handleRequestThumbnail={handleRequestThumbnail}
          handleCancelThumbnail={handleCancelThumbnail}
          role="listitem"
          openFileEditor={openFileEditor}
          canEditFile={canEditFile}
          toggleAddFilesPanel={toggleAddFilesPanel}
          file={files[fileID]}
          retryUpload={retryUpload}
          validateAndRetry={validateAndRetry}
          pauseUpload={pauseUpload}
          cancelUpload={cancelUpload}
          removeFile={removeFile}
        />
      ))}
    </div>
  );

  if (isSingleFile) {
    return <div class="uppy-Dashboard-files">{renderRow(rows[0])}</div>;
  }

  return (
    <VirtualList class="uppy-Dashboard-files" role="list" data={rows} renderRow={renderRow} rowHeight={rowHeight} />
  );
};
