import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useImmutableRef } from '@mertsolak/use-immutable-ref';

import { Coordinates, Props, defaultProps } from './CanvasMakeVisible.config';

export const CanvasMakeVisible: React.FC<Props> = ({
  width,
  height,
  backgroundImage,
  className = defaultProps.className,
  backgroundColor = defaultProps.backgroundColor,
  radiusIncrease = defaultProps.radiusIncrease,
  opacityIncrease = defaultProps.opacityIncrease,
  renderTimeout = defaultProps.renderTimeout,
  radius = defaultProps.radius,
}) => {
  const [canvas, setCanvas] = useImmutableRef<HTMLCanvasElement>();
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [image, setImage] = useState<HTMLImageElement>();
  const [imageCoordinates, setImageCoordinates] = useState<Coordinates[]>();
  const [mouseCoordinates, setMouseCoordinates] = useState<Coordinates>();
  const shouldDrawRef = useRef<boolean>(true);

  const draw = useCallback(
    (
      currentContext: CanvasRenderingContext2D,
      currentImage: HTMLImageElement,
      currentMouseCoordinates: Coordinates,
      currentImageCoordinates: Coordinates[],
      currentOpacity: number,
      currentRadius: number,
    ) => {
      if (currentOpacity > 1 && currentRadius > radius) {
        return;
      }

      if (!shouldDrawRef.current) {
        currentContext.clearRect(0, 0, width, height);
        return;
      }

      currentContext.globalCompositeOperation = 'source-over';

      for (let index = 0; index < currentImageCoordinates.length; index += 1) {
        const coordinate = currentImageCoordinates[index];
        currentContext.drawImage(currentImage, coordinate.x, coordinate.y);
      }

      currentContext.globalCompositeOperation = 'destination-in';

      currentContext.beginPath();
      currentContext.fillStyle = `rgba(0,0,0,${currentOpacity})`;
      currentContext.arc(currentMouseCoordinates.x, currentMouseCoordinates.y, currentRadius, 0, Math.PI * 2);
      currentContext.fill();
      currentContext.closePath();

      const newOpacity = currentOpacity > 1 ? currentOpacity : currentOpacity + opacityIncrease;
      const newRadius = currentRadius > radius ? currentRadius : currentRadius + radiusIncrease;

      requestAnimationFrame(() =>
        draw(
          currentContext,
          currentImage,
          currentMouseCoordinates,
          currentImageCoordinates,
          newOpacity,
          newRadius,
        ),
      );
    },
    [width, height],
  );

  useEffect(() => {
    if (!canvas) {
      return;
    }

    canvas?.setAttribute('width', width.toString());
    canvas?.setAttribute('height', height.toString());
  }, [canvas, width, height]);

  useEffect(() => {
    if (!canvas) {
      return () => {};
    }

    const context2D = canvas?.getContext('2d');
    setContext(context2D);

    let setMouseTimeout: ReturnType<typeof setTimeout>;

    const mouseMove = (event: MouseEvent) => {
      shouldDrawRef.current = false;
      clearTimeout(setMouseTimeout);
      setMouseCoordinates((previousCoordinates) => {
        if (previousCoordinates) {
          return undefined;
        }

        return previousCoordinates;
      });

      setMouseTimeout = setTimeout(() => {
        shouldDrawRef.current = true;
        setMouseCoordinates({ x: event.offsetX, y: event.offsetY });
      }, renderTimeout);
    };

    canvas?.addEventListener('mousemove', mouseMove);
    return () => canvas?.removeEventListener('mousemove', mouseMove);
  }, [canvas]);

  useEffect(() => {
    if (!context || !image || !mouseCoordinates || !imageCoordinates) {
      return;
    }

    draw(context, image, mouseCoordinates, imageCoordinates, 0, 0);
  }, [mouseCoordinates, image, context]);

  useEffect(() => {
    let coveredWidth = 0;
    let coveredHeight = 0;
    let isWidthCovered = false;
    let isHeightCovered = false;
    const horizontalCoordinates: Coordinates[] = [];
    const verticalCoordinates: Coordinates[] = [];

    const imageSource = new Image();
    imageSource.src = backgroundImage;
    imageSource.onload = () => {
      while (!isWidthCovered) {
        if (width > coveredWidth) {
          horizontalCoordinates.push({ x: coveredWidth, y: 0 });
          coveredWidth += imageSource.width;
        } else {
          isWidthCovered = true;
        }
      }

      coveredHeight += imageSource.height;

      while (!isHeightCovered) {
        if (height > coveredHeight) {
          horizontalCoordinates.forEach((horizontalCoordinate) => {
            verticalCoordinates.push({ x: horizontalCoordinate.x, y: coveredHeight });
          });

          coveredHeight += imageSource.height;
        } else {
          isHeightCovered = true;
        }
      }

      setImageCoordinates(horizontalCoordinates.concat(verticalCoordinates));
      setImage(imageSource);
    };
  }, [height, width, backgroundImage]);

  return (
    <canvas
      style={{ backgroundColor, margin: 0, padding: 0, display: 'block' }}
      ref={setCanvas}
      className={className}
    />
  );
};
