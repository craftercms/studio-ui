import React, { useRef, CSSProperties, useLayoutEffect, forwardRef } from 'react';
import cn from 'classnames';
import { mergeRefs } from 'react-advanced-cropper';

interface AdjustableImageProps {
	src?: string;
	className?: string;
	brightness?: number;
	saturation?: number;
	contrast?: number;
	style?: CSSProperties;
}

/** Util component that helps with the rendering of the background image with adjustments like brightness, saturation and contrast. */
// https://advanced-cropper.github.io/react-advanced-cropper/docs/tutorials/image-editor/
export const AdjustableImage = forwardRef<HTMLCanvasElement, AdjustableImageProps>((props, ref) => {
	const { src, className, brightness = 0, saturation = 0, contrast = 0, style } = props;
	const imageRef = useRef<HTMLImageElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const drawImage = () => {
		const image = imageRef.current;
		const canvas = canvasRef.current;
		if (canvas && image && image.complete) {
			const ctx = canvas.getContext('2d');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			if (ctx) {
				ctx.filter = [
					`brightness(${100 + brightness * 100}%)`,
					`contrast(${100 + contrast * 100}%)`,
					`saturate(${100 + saturation * 100}%)`
				].join(' ');

				ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
			}
		}
	};

	useLayoutEffect(() => {
		drawImage();
	}, [src, brightness, saturation, contrast]);

	return (
		<>
			<canvas
				key={`${src}-canvas`}
				ref={mergeRefs([ref, canvasRef])}
				className={cn('adjustable-image-element', className)}
				style={style}
			/>
			{src ? (
				<img
					key={`${src}-img`}
					ref={imageRef}
					className={'adjustable-image-source'}
					src={src}
					onLoad={drawImage}
					style={{ display: 'none' }}
				/>
			) : null}
		</>
	);
});

export default AdjustableImage;
