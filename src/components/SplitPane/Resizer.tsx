import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';

export const RESIZER_DEFAULT_CLASSNAME = 'Resizer';

interface ResizerProps {
  className?:string,
  onClick?:Function,
  onDoubleClick?:Function,
  onMouseDown?:Function,
  onTouchEnd?:Function,
  onTouchStart?:Function,
  resizerClassName?:string,
  split?:string,
  style?: any,
}

class Resizer extends React.Component<ResizerProps> {
  render() {
    const {
      className,
      onClick,
      onDoubleClick,
      onMouseDown,
      onTouchEnd,
      onTouchStart,
      resizerClassName,
      split,
      style,
    } = this.props;
    const classes = [resizerClassName, split, className];

    return (
      <span
        role="presentation"
        className={classes.join(' ')}
        style={style}
        // @ts-ignore
        onMouseDown={event => onMouseDown(event)}
        onTouchStart={event => {
          event.preventDefault();
          // @ts-ignore
          onTouchStart(event);
        }}
        onTouchEnd={event => {
          event.preventDefault();
          // @ts-ignore
          onTouchEnd(event);
        }}
        onClick={event => {
          if (onClick) {
            event.preventDefault();
            onClick(event);
          }
        }}
        onDoubleClick={event => {
          if (onDoubleClick) {
            event.preventDefault();
            onDoubleClick(event);
          }
        }}
      />
    );
  }
}
// @ts-ignore
Resizer.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onMouseDown: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func.isRequired,
  onTouchEnd: PropTypes.func.isRequired,
  split: PropTypes.oneOf(['vertical', 'horizontal']),
  style: stylePropType,
  resizerClassName: PropTypes.string.isRequired,
};
// @ts-ignore
Resizer.defaultProps = {
  resizerClassName: RESIZER_DEFAULT_CLASSNAME,
};

export default Resizer;
