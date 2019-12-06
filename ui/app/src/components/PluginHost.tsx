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
