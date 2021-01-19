/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import GlobalState, { GuestData } from '../models/GlobalState';
import { Dispatch, EffectCallback, SetStateAction, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { nnou } from './object';
import { Resource } from '../models/Resource';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import ContentType from '../models/ContentType';
import { MinimizedDialog } from '../models/MinimizedDialog';
import { popDialog, pushDialog } from '../state/reducers/dialogs/minimizedDialogs';
import { fetchSystemVersion } from '../state/actions/env';
import { fetchQuickCreateList } from '../state/actions/content';
import { fetchContentTypes } from '../state/actions/preview';
import LookupTable from '../models/LookupTable';
import { Site } from '../models/Site';
import { fetchSiteLocales } from '../state/actions/translation';
import { fetchSiteUiConfig } from '../state/actions/configuration';
import { MessageDescriptor, useIntl } from 'react-intl';

export function useShallowEqualSelector<T = any>(selector: (state: GlobalState) => T): T {
  return useSelector<GlobalState, T>(selector, shallowEqual);
}

export const useSelection: <T = any>(
  selectorFn: (state: GlobalState) => T,
  equalityFn?: (left: T, right: T) => boolean
) => T =
  process.env.NODE_ENV === 'production'
    ? useSelector
    : <T = any>(selector, equalityFn) => useSelector<GlobalState, T>(selector, equalityFn);

export function useActiveSiteId(): string {
  return useSelector<GlobalState, string>((state) => state.sites.active);
}

export function usePreviewGuest(): GuestData {
  return useSelector<GlobalState, GuestData>((state) => state.preview.guest);
}

export function usePreviewState(): GlobalState['preview'] {
  return useSelector<GlobalState, GlobalState['preview']>((state) => state.preview);
}

export function useEnv(): GlobalState['env'] {
  return useSelector<GlobalState, GlobalState['env']>((state) => state.env);
}

export function usePermissions(): GlobalState['content']['items']['permissionsByPath'] {
  return useSelector<GlobalState, GlobalState['content']['items']['permissionsByPath']>(
    (state) => state.content.items.permissionsByPath
  );
}

export function useQuickCreateState(): GlobalState['content']['quickCreate'] {
  return useSelection((state) => state.content.quickCreate);
}

export function useQuickCreateListResource() {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const quickCreate = useQuickCreateState();
  useEffect(() => {
    site && dispatch(fetchQuickCreateList());
  }, [site, dispatch]);
  return useLogicResource(quickCreate, {
    errorSelector: (source) => source.error,
    resultSelector: (source) => source.items,
    shouldReject: (source) => Boolean(source.error),
    shouldResolve: (source) => Boolean(source.items) && !source.isFetching,
    shouldRenew: (source) => Boolean(source.items) && source.isFetching
  });
}

// TODO: Assess drawbacks & improve.
// Might need to refactor the state to have the isFetching there.
let /* private */ systemVersionRequested = false;
/**
 * Will only fetch the system version once. It's controlled by the
 * `systemVersionRequested` private to control whether it's been requested.
 **/
export function useSystemVersion() {
  const dispatch = useDispatch();
  const env = useEnv();
  useEffect(() => {
    if (!systemVersionRequested && env.version === null) {
      systemVersionRequested = true;
      dispatch(fetchSystemVersion());
    }
  }, [dispatch, env.version]);
  return env.version;
}

export function useSystemVersionResource() {
  return useResolveWhenNotNullResource(useSystemVersion());
}

export function useContentTypes(): LookupTable<ContentType> {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { byId, isFetching } = useSelection((state) => state.contentTypes);
  useEffect(() => {
    if (!byId && site && isFetching === null) {
      dispatch(fetchContentTypes());
    }
  }, [dispatch, site, byId, isFetching]);

  return byId;
}

export function useContentTypeList(): Array<ContentType>;
export function useContentTypeList(filterFn: (type: ContentType) => boolean): Array<ContentType>;
export function useContentTypeList(filterFn: (type: ContentType) => boolean = null): Array<ContentType> {
  const byId = useContentTypes();
  return useMemo(
    () => {
      if (!byId) {
        return null;
      } else {
        const list = Object.values(byId);
        return Boolean(filterFn) ? list.filter(filterFn) : list;
      }
    },
    // Filter omitted purposely to facilitate use without need
    // to memoize filterFn on the consumer side
    // eslint-disable-next-line
    [byId]
  );
}

export function useActiveUser(): GlobalState['user'] {
  return useSelector<GlobalState, GlobalState['user']>((state) => state.user);
}

export function createResource<T>(factoryFn: () => Promise<T>): Resource<T> {
  let result,
    promise,
    resource,
    status = 'pending';
  promise = factoryFn().then(
    (response) => {
      status = 'success';
      result = response;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );
  resource = {
    complete: false,
    error: false,
    read() {
      if (status === 'pending') {
        throw promise;
      } else if (status === 'error') {
        resource.complete = true;
        resource.error = true;
        throw result;
      } else if (status === 'success') {
        resource.complete = true;
        return result;
      }
    }
  };
  return resource;
}

export function createResourceBundle<T>(): [Resource<T>, (value?: unknown) => void, (reason?: any) => void] {
  let resolve, reject;
  let promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return [createResource(() => promise), resolve, reject];
}

export function useResolveWhenNotNullResource<ResultType = unknown>(source: ResultType): Resource<ResultType> {
  const [[resource, resolve], setBundle] = useState(() => createResourceBundle<ResultType>());
  useEffect(() => {
    if (resource.complete) {
      setBundle(createResourceBundle);
    } else if (nnou(source)) {
      resolve(source);
    }
  }, [source, resource, resolve]);
  return resource;
}

interface CustomResourceSelectors<ReturnType = unknown, SourceType = unknown, ErrorType = unknown> {
  shouldResolve: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  shouldReject: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  shouldRenew: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  resultSelector: (source: SourceType, resource: Resource<ReturnType>) => ReturnType;
  errorSelector: (source: SourceType, resource: Resource<ReturnType>) => ErrorType;
}

export function useSelectorResource<ReturnType = unknown, SourceType = GlobalState, ErrorType = unknown>(
  sourceSelector: (state: GlobalState) => SourceType,
  checkers: CustomResourceSelectors<ReturnType, SourceType, ErrorType>
): Resource<ReturnType> {
  const state = useSelection<SourceType>(sourceSelector);
  return useLogicResource<ReturnType, SourceType, ErrorType>(state, checkers);
}

export function useLogicResource<ReturnType = unknown, SourceType = unknown, ErrorType = unknown>(
  source: SourceType,
  checkers: CustomResourceSelectors<ReturnType, SourceType, ErrorType>
): Resource<ReturnType> {
  const checkersRef = useRef<CustomResourceSelectors<ReturnType, SourceType, ErrorType>>();
  const [[resource, resolve, reject], setBundle] = useState(() => createResourceBundle<ReturnType>());

  checkersRef.current = checkers;

  useEffect(() => {
    const { shouldRenew, shouldReject, shouldResolve, errorSelector, resultSelector } = checkersRef.current;
    if (shouldRenew(source, resource)) {
      setBundle(createResourceBundle);
    } else if (shouldReject(source, resource)) {
      reject(errorSelector(source, resource));
    } else if (shouldResolve(source, resource)) {
      resolve(resultSelector(source, resource));
    }
  }, [source, resource, reject, resolve]);

  return resource;
}

export function useMount(onMount: EffectCallback): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onMount, []);
}

export function useUnmount(onUnmount: () => any) {
  useEffect(
    () => () => onUnmount?.(),
    // Suppressing exhaustive deps warning to avoid non-memoized
    // onUnmount props to incur in wrongful unmount calls
    // eslint-disable-next-line
    []
  );
}

export function useDebouncedInput(observer: (keywords: string) => any, time: number = 250): Subject<string> {
  const subject$Ref = useRef(new Subject<string>());
  useEffect(() => {
    const subscription = subject$Ref.current.pipe(debounceTime(time), distinctUntilChanged()).subscribe(observer);
    return () => subscription.unsubscribe();
  }, [observer, time]);
  return subject$Ref.current;
}

export function useSpreadState<S>(initialState: S): [S, Dispatch<SetStateAction<Partial<S>>>] {
  return useReducer((state, nextState) => ({ ...state, ...nextState }), initialState);
}

export function useSubject<T = unknown>(): Subject<T> {
  return useMemo(() => new Subject<T>(), []);
}

export function useMinimizeDialog(initialTab: MinimizedDialog) {
  const dispatch = useDispatch();
  const state = useSelection((state) => state.dialogs.minimizedDialogs[initialTab.id]);

  useEffect(
    () => {
      dispatch(pushDialog(initialTab));
      return () => {
        dispatch(popDialog({ id: initialTab.id }));
      };
    },
    // `initialTab` omitted purposely to facilitate use without memo from consumer side
    // eslint-disable-next-line
    [dispatch, initialTab.id]
  );

  return state?.minimized ?? initialTab.minimized;
}

export function useSitesBranch(): GlobalState['sites'] {
  return useSelection((state) => state.sites);
}

export function useSiteLookup(): LookupTable<Site> {
  return useSitesBranch().byId;
}

export function useSiteList(): Site[] {
  const state = useSitesBranch();
  return useMemo(() => (state.byId ? Object.values(state.byId) : null), [state.byId]);
}

// TODO: 1. Presents issues when call loads 2. Not refreshing when site changes
export function useSiteLocales(): GlobalState['translation']['siteLocales'] {
  const siteLocales = useSelection((state) => state.translation.siteLocales);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!siteLocales.localeCodes && !siteLocales.isFetching && !siteLocales.error) {
      dispatch(fetchSiteLocales());
    }
  }, [dispatch, siteLocales.error, siteLocales.isFetching, siteLocales.localeCodes]);
  return siteLocales;
}

export function useRoles(): GlobalState['user']['rolesBySite'] {
  return useSelection((state) => state.user.rolesBySite);
}

export function useSiteUIConfig(): GlobalState['uiConfig'] {
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const config = useSelection((state) => state.uiConfig);
  useEffect(() => {
    if (config.currentSite !== site && !config.isFetching) {
      dispatch(fetchSiteUiConfig({ site }));
    }
  }, [dispatch, site, config.isFetching, config.currentSite]);
  return config;
}

export function usePreviousValue<T = any>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function usePossibleTranslation(title: string): string;
export function usePossibleTranslation(descriptor: MessageDescriptor): string;
export function usePossibleTranslation(titleOrDescriptor: string | MessageDescriptor): string;
export function usePossibleTranslation(titleOrDescriptor: string | MessageDescriptor): string {
  const { formatMessage } = useIntl();
  return typeof titleOrDescriptor === 'object' ? formatMessage(titleOrDescriptor) : titleOrDescriptor;
}
