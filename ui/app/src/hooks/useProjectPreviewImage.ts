/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { useCallback, useEffect, useState } from 'react';
import { fetchContentByCommitId } from '../services/content';
import { Subscription } from 'rxjs';

export function useProjectPreviewImage(siteId: string, fallbackImageSrc?: string): [string, () => Subscription] {
  const [dataUrl, setDataUrl] = useState<string>(null);
  const fetch = useCallback(
    () =>
      fetchContentByCommitId(siteId, '/.crafter/screenshots/default.png', 'HEAD').subscribe({
        next(img) {
          setDataUrl(img as string);
        },
        error() {
          // No preview image for this project
          fallbackImageSrc && setDataUrl(fallbackImageSrc);
        }
      }),
    [siteId, fallbackImageSrc]
  );
  useEffect(() => {
    const sub = fetch();
    return () => sub.unsubscribe();
  }, [fetch]);
  return [dataUrl, fetch];
}

export default useProjectPreviewImage;
