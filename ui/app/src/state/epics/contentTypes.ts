/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { ofType } from 'redux-observable';
import {
  associateTemplate as associateTemplateActionCreator,
  associateTemplateComplete,
  associateTemplateFailed,
  dissociateTemplate as dissociateTemplateActionCreator,
  dissociateTemplateComplete,
  dissociateTemplateFailed,
  fetchComponentsByContentType,
  fetchComponentsByContentTypeComplete,
  fetchComponentsByContentTypeFailed,
  fetchContentTypes,
  fetchContentTypesComplete,
  fetchContentTypesFailed,
  setContentTypeFilter
} from '../actions/preview';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { fetchItemsByContentType } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import GlobalState from '../../models/GlobalState';
import { Observable, of } from 'rxjs';
import {
  associateTemplate as associateTemplateService,
  dissociateTemplate as dissociateTemplateService,
  fetchContentTypes as fetchContentTypesService
} from '../../services/contentTypes';
import { CrafterCMSEpic } from '../store';
import ContentType from '../../models/ContentType';
import { AjaxError } from 'rxjs/ajax';
import { reversePluckProps } from '../../utils/object';
import { sessionTimeout } from '../actions/user';
import { ComponentsContentTypeParams, LookupTable } from '../../models';

export default [
  // region fetchContentTypes
  (action$, state$) =>
    action$.pipe(
      ofType(fetchContentTypes.type),
      withLatestFrom(state$),
      exhaustMap(
        ([
          ,
          {
            sites: { active: site }
          }
        ]) =>
          fetchContentTypesService(site).pipe(map(fetchContentTypesComplete), catchAjaxError(fetchContentTypesFailed))
      )
    ),
  // endregion
  // region fetchComponentsByContentType
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(fetchComponentsByContentType.type, setContentTypeFilter.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        let currentMaxExpansions = 50;
        let query = { ...state.preview.components.query };
        let serviceArgs: [
          site: string,
          contentTypes: string[],
          contentTypesLookup: LookupTable<ContentType>,
          options?: ComponentsContentTypeParams
        ] = [
          state.sites.active,
          state.preview.components.contentTypeFilter === 'all'
            ? Object.values(state.contentTypes.byId)
                .filter(
                  (contentType: ContentType) =>
                    contentType.type === 'component' && !contentType.id.includes('/level-descriptor')
                )
                .map((contentType) => contentType.id)
            : state.preview.components.contentTypeFilter,
          state.contentTypes.byId,
          query
        ];
        let catchErrorFn, createServiceObservable;
        catchErrorFn = (error) => {
          if (error.name === 'AjaxError') {
            // TODO: Awaiting search-specific code and backend updates. Must update the `1000` to the new search-specific code.
            // const studioResponseCode = error.response?.response?.code;
            if (
              // studioResponseCode === 1000 &&
              currentMaxExpansions > 1
            ) {
              currentMaxExpansions = Math.floor(currentMaxExpansions / 2);
              serviceArgs[3].maxExpansions = currentMaxExpansions || 1;
              return createServiceObservable();
            } else {
              const ajaxError: Partial<AjaxError> = reversePluckProps(error, 'xhr', 'request') as any;
              ajaxError.response = ajaxError.response?.response ?? {
                code: ajaxError.status,
                message: 'An unknown error has occurred.'
              };
              const actions = [fetchComponentsByContentTypeFailed(ajaxError)];
              if (ajaxError.status === 401) {
                actions.push(sessionTimeout());
              }
              return of(...actions);
            }
          } else {
            return [
              fetchComponentsByContentTypeFailed({
                response: {
                  code: '1000',
                  message: 'An unknown error has occurred.'
                }
              })
            ];
          }
        };
        createServiceObservable = () =>
          fetchItemsByContentType
            .apply(null, serviceArgs)
            .pipe(map(fetchComponentsByContentTypeComplete), catchError(catchErrorFn));
        return createServiceObservable();
      })
    ),
  // endregion
  // region associateTemplate
  (action$, state$) =>
    action$.pipe(
      ofType(associateTemplateActionCreator.type),
      withLatestFrom(state$),
      switchMap(
        ([
          { payload },
          {
            sites: { active }
          }
        ]) =>
          associateTemplateService(active, payload.contentTypeId, payload.displayTemplate).pipe(
            map(() =>
              associateTemplateComplete({
                contentTypeId: payload.contentTypeId,
                displayTemplate: payload.displayTemplate
              })
            ),
            catchAjaxError(associateTemplateFailed)
          )
      )
    ),
  // endregion
  // region dissociateTemplate
  (action$, state$) =>
    action$.pipe(
      ofType(dissociateTemplateActionCreator.type),
      withLatestFrom(state$),
      switchMap(
        ([
          { payload },
          {
            sites: { active }
          }
        ]) =>
          dissociateTemplateService(active, payload.contentTypeId).pipe(
            map(() => dissociateTemplateComplete({ contentTypeId: payload.contentTypeId })),
            catchAjaxError(dissociateTemplateFailed)
          )
      )
    )
  // endregion
] as CrafterCMSEpic[];
