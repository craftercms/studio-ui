import { Epic, ofType } from 'redux-observable';
import { CHANGE_SITE } from '../actions/sites';
import { ignoreElements, tap, withLatestFrom } from 'rxjs/operators';
import { setSiteCookie } from '../../utils/auth';

const changeSite: Epic = (action$, state$) => action$.pipe(
  ofType(CHANGE_SITE),
  withLatestFrom(state$),
  tap(
    (
      [
        { payload: { nextSite } },
        { env: { SITE_COOKIE } }
      ]
    ) => (
      setSiteCookie(SITE_COOKIE, nextSite)
    )
  ),
  ignoreElements()
);

export default [
  changeSite
] as Epic[];
