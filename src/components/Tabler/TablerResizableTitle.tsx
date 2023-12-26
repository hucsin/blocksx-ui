import React from 'react';
import { Resizable } from 'react-resizable';

interface ResizableTitleProps  {
    onResize: Function,
    width: number,

}

export default class ResizableTitle extends React.Component<ResizableTitleProps> {
    public constructor (props: ResizableTitleProps) {
        super(props);
    }
    public render() {
        const { onResize, width, ...restProps } = this.props;

        if (!width) {
          return <th {...restProps} />;
        }
      
        return (
          <Resizable
            width={width}
            height={0}
            
            handle={
              <span
                className="react-resizable-handle"
                onClick={e => {
                  e.stopPropagation();
                }}
              />
            }
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
          >
            <th {...restProps} />
          </Resizable>
        );
    }
}