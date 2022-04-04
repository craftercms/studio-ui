import Link from '@mui/material/Link';
import { FormattedMessage, IntlShape } from 'react-intl';
import React, { useMemo, useState } from 'react';
import { Activities, Activity } from '../../models/Activity';
import GlobalState from '../../models/GlobalState';
import { asLocalizedDateTime } from '../../utils/datetime';
import moment from 'moment';
import { messages } from '../ItemTypeIcon/translations';

export type ActivitiesAndAll = Activities | 'ALL';

export function renderActivity(activity: Activity, dependencies: { formatMessage: IntlShape['formatMessage'] }) {
  const { formatMessage } = dependencies;
  let item = activity.item;
  let systemType: string = activity.item?.systemType;
  if (messages[systemType]) {
    systemType = formatMessage(messages[systemType]).toLowerCase();
  }
  let { id } = activity.package ?? {};
  const anchor = ({ label, previewUrl, systemType }) => {
    return systemType !== 'page' && systemType !== 'component' ? (
      <em>{label}</em>
    ) : (
      <Link onClick={() => console.log(previewUrl)}>{label}</Link>
    );
  };
  const pack = (message) => {
    return <Link onClick={() => console.log(id)}>{message}</Link>;
  };
  switch (activity.actionType) {
    case 'CREATE':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemCreateActivityMessage"
          defaultMessage="Created an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.createActivityMessage"
          defaultMessage="Created <anchor>{item}</anchor> {systemType}"
          values={{ item, systemType, anchor }}
        />
      );
    case 'UPDATE':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemUpdateActivityMessage"
          defaultMessage="Updated a an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.updateActivityMessage"
          defaultMessage="Updated <anchor>{item}</anchor> {systemType}"
          values={{ item, systemType, anchor }}
        />
      );
    case 'DELETE':
      return item.label === null ? (
        <FormattedMessage id="activityDashlet.deletedItemUpdateActivityMessage" defaultMessage="Deleted an item" />
      ) : (
        <FormattedMessage
          id="activityDashlet.deleteActivityMessage"
          defaultMessage="Deleted {label} {systemType}"
          values={{
            label: item.label,
            systemType
          }}
        />
      );
    case 'MOVE':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemMoveActivityMessage"
          defaultMessage="Moved an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.moveActivityMessage"
          defaultMessage="Moved <anchor>{item}</anchor> {systemType}"
          values={{ item, anchor, systemType }}
        />
      );
    case 'REQUEST_PUBLISH':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemRequestPublishActivityMessage"
          defaultMessage="Requested publishing for an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.requestPublishActivityMessage"
          defaultMessage="Requested publishing for <anchor>{item}</anchor> {systemType}"
          values={{ item, anchor, systemType }}
        />
      );
    case 'APPROVE':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemRequestApproveActivityMessage"
          defaultMessage="Approved an item that no longer exists"
          values={{}}
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.approveActivityMessage"
          defaultMessage="Approved <anchor>{item}</anchor>"
          values={{ anchor, item }}
        />
      );
    case 'APPROVE_SCHEDULED':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemApproveScheduleActivityMessage"
          defaultMessage="Approved scheduled an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.approveScheduleActivityMessage"
          defaultMessage="Approved scheduled <anchor>{item}</anchor> {systemType}"
          values={{ item, anchor, systemType }}
        />
      );
    case 'REJECT':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemRejectActivityMessage"
          defaultMessage="Rejected an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.rejectActivityMessage"
          defaultMessage="Rejected <anchor>{item}</anchor> {systemType}"
          values={{ item, anchor, systemType }}
        />
      );
    case 'REVERT':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemRevertActivityMessage"
          defaultMessage="Reverted an item that no longer exists"
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.revertActivityMessage"
          defaultMessage="Reverted <anchor>{item}</anchor> {systemType}"
          values={{ item, anchor, systemType }}
        />
      );
    case 'PUBLISH':
      return item.label === null ? (
        <FormattedMessage
          id="activityDashlet.deletedItemPublishedActivityMessage"
          defaultMessage="Published an item that no longer exists as part of <pack>a package</pack>"
          values={{ pack }}
        />
      ) : (
        <FormattedMessage
          id="activityDashlet.publishedActivityMessage"
          defaultMessage="Published <anchor>{item}</anchor> {systemType} as part of <pack>a package</pack>"
          values={{ item, anchor, pack, systemType }}
        />
      );
    case 'PUBLISHED':
      return (
        <FormattedMessage
          id="activityDashlet.publishedActivityMessage"
          defaultMessage="Published <pack>a package</pack>"
          values={{ pack }}
        />
      );
    case 'INITIAL_PUBLISH':
      return (
        <FormattedMessage
          id="activityDashlet.initialPublishActivityMessage"
          defaultMessage="Performed the site's initial publish"
        />
      );
    // @ts-ignore
    case 'UNKNOWN':
      console.log('[INFO] An unknown activity was received from the server.', activity);
      return (
        <FormattedMessage
          id="activityDashlet.unknownActivityMessage"
          defaultMessage="An unknown activity was performed."
        />
      );
  }
}

export function renderActivityTimestamp(timestamp: string, locale: GlobalState['uiConfig']['locale']) {
  const now = Date.now();
  const date = new Date(timestamp).getTime();
  return now - date < 3.6e7
    ? moment(date).fromNow()
    : asLocalizedDateTime(date, locale.localeCode, locale.dateTimeFormatOptions);
}

export const activityNameLookup: Record<Activities | 'ALL', any> = {
  ALL: <FormattedMessage id="activityDashlet.showActivityByEveryone" defaultMessage="All activities" />,
  APPROVE: <FormattedMessage id="words.approve" defaultMessage="Approve" />,
  APPROVE_SCHEDULED: <FormattedMessage id="operations.approveScheduled" defaultMessage="Approve Scheduled" />,
  CREATE: <FormattedMessage id="words.create" defaultMessage="Create" />,
  DELETE: <FormattedMessage id="words.delete" defaultMessage="Delete" />,
  INITIAL_PUBLISH: <FormattedMessage id="operations.initialPublish" defaultMessage="Initial Publish" />,
  MOVE: <FormattedMessage id="words.move" defaultMessage="Move" />,
  PUBLISH: <FormattedMessage id="words.publish" defaultMessage="Publish" />,
  PUBLISHED: <FormattedMessage id="words.published" defaultMessage="Published" />,
  REJECT: <FormattedMessage id="words.reject" defaultMessage="Reject" />,
  REQUEST_PUBLISH: <FormattedMessage id="operations.requestPublish" defaultMessage="Request Publish" />,
  REVERT: <FormattedMessage id="words.revert" defaultMessage="Revert" />,
  UPDATE: <FormattedMessage id="words.update" defaultMessage="Update" />
};

function getSelectedKeys<K extends string>(selection: Partial<Record<K, boolean>>): K[] {
  return Object.entries<boolean>(selection)
    .filter(([key, value]) => value)
    .map(([key]) => key as K);
}

type UseSelectionLookupState<K extends string> = Partial<Record<K, boolean>>;

export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(): [S, (key: string) => void, string[]];
export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(initialState?: S, resetSelectionKey?: string): [S, (key: string) => void, string[]];
export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(initialState?: S): [S, (key: string) => void, string[]];
export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(initialState?: () => S, resetSelectionKey?: string): [S, (key: string) => void, string[]];
export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(initialState?: () => S): [S, (key: string) => void, string[]];
export function useSelectionLookupState<
  K extends string,
  S extends UseSelectionLookupState<K> = UseSelectionLookupState<K>
>(initialState: S | (() => S) = {} as S, resetSelectionKey: K = 'ALL' as K): [S, (key: K) => void, K[]] {
  const [selected, setSelected] = useState<S>(initialState);
  const [selectedList, setSelectedList] = useState(getSelectedKeys(selected));
  const fn = useMemo<(key: string) => void>(
    () => (id) => {
      let selection: S;
      if (id === resetSelectionKey) {
        selection = { [resetSelectionKey]: true } as S;
        setSelected(selection);
      } else {
        const isSelecting = !selected[id];
        selection = (
          isSelecting ||
          Object.entries(selected).filter(([key, value]) => key !== resetSelectionKey && key !== id && value).length
            ? { ...selected, [resetSelectionKey]: false, [id]: isSelecting }
            : { [resetSelectionKey]: true }
        ) as S;
        setSelected(selection);
      }
      setSelectedList(getSelectedKeys(selection));
    },
    [resetSelectionKey, selected]
  );
  return [selected, fn, selectedList];
}
