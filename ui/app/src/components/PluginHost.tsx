/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { req } from '../utils/amd';

export function IntegratedPluginHost(props: any) {

  const [Component, setComponent] = React.useState(null);

  useEffect(() => {
    let didUnmount = false;
    req('org.craftercms.plugin.reactApp').then((main) => {
      (!didUnmount) && setComponent(() => main.App);
    });
    return () => {
      didUnmount = true;
    }
  }, []);

  return (
    <section className="craftercms-plugin-host">
      {Component && <Component hours={9} minutes={38}/>}
    </section>
  );

}

export function IndependentPluginHost(props: any) {

  const ref = React.useRef();
  useEffect(() => {

    let didUnmount = false;
    let unmount;

    req('org.craftercms.plugin.reactApp').then((main) => {
      if (!didUnmount) {
        unmount = main({ element: ref.current });
      }
    });

    return () => {
      didUnmount = true;
      unmount && unmount();
    };

  }, []);

  return (
    <section className="craftercms-plugin-host" ref={ref}/>
  );

}

export default function PluginHost(props: any) {
  const id = props.id;
  return (
    (id === 'org.craftercms.plugin.vanilla')
      ? <IndependentPluginHost/>
      : <IntegratedPluginHost/>
  );
}
