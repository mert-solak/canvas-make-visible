export interface Props {
  width: number;
  height: number;
  backgroundImage: any;
  opacityIncrease?: number;
  radius?: number;
  radiusIncrease?: number;
  renderTimeout?: number;
  backgroundColor?: string;
  className?: string;
}

export interface Coordinates {
  x: number;
  y: number;
}

export const defaultProps = {
  opacityIncrease: 0.02,
  radius: 50,
  radiusIncrease: 1,
  renderTimeout: 100,
  backgroundColor: 'rgba(255,255,255,0)',
  className: '',
};
