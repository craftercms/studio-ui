import { Component, h } from 'preact';
import FadeIn from './FadeIn.js';
import TransitionGroup from './TransitionGroup.js';

export default class Informer extends Component {
	render() {
		// Get info from the uppy instance passed in props
		const { info } = this.props.uppy.getState();

		return (
			<div className="uppy uppy-Informer">
				<TransitionGroup>
					{info.map((info) => (
						<FadeIn key={info.message}>
							<p role="alert">
								{info.message}{' '}
								{info.details && (
									// biome-ignore lint/a11y/useKeyWithClickEvents: don't think it's needed
									<span
										aria-label={info.details}
										data-microtip-position="top-left"
										data-microtip-size="medium"
										role="tooltip"
										onClick={() => alert(`${info.message} \n\n ${info.details}`)}
									>
										?
									</span>
								)}
							</p>
						</FadeIn>
					))}
				</TransitionGroup>
			</div>
		);
	}
}
