import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';

interface PaneProps {
  children: any;
  className?: string;
  split?: string;
  size?: number | string;
  eleRef?: any;
  style?: any
}

class Pane extends React.PureComponent<PaneProps> {
  render() {
    const {
      children,
      className,
      split,
      style: styleProps,
      size,
      eleRef,
    } = this.props;

    const classes = ['Pane', split, className];

    let style:any = {
      flex: 1,
      position: 'relative',
      outline: 'none',
    };

    if (size !== undefined) {
      if (split === 'vertical') {
        style.width = size;
      } else {
        style.height = size;
        style.display = 'flex';
      }
      style.flex = 'none';
    }

    style = Object.assign({}, style, styleProps || {});

    return (
      <div ref={eleRef} className={classes.join(' ')} style={style}>
        {children}
      </div>
    );
  }
}
 // @ts-ignore
Pane.propTypes = {
  //className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  split: PropTypes.oneOf(['vertical', 'horizontal']),
  style: stylePropType,
  eleRef: PropTypes.func,
};
// @ts-ignore
Pane.defaultProps = {};

export default Pane;
