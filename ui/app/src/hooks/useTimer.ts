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

import { useEffect, useState } from 'react';
import useUpdateRefs from './useUpdateRefs';

export const useTimer = (seconds: number, onComplete?: () => void) => {
  const [countdown, setCountdown] = useState(seconds);
  const onCompleteRef = useUpdateRefs(onComplete);

  useEffect(() => {
    if (seconds > 0) {
      let num = seconds;
      const timer = setInterval(() => {
        setCountdown(--num);
        if (num === 0) {
          clearInterval(timer);
          onCompleteRef.current?.();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [seconds, onCompleteRef]);

  return countdown;
};

export default useTimer;
