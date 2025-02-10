import React from 'react';
import Box from '../../../Box';

export default class FormerBox extends React.Component<any, any> {
    public render() {
        let props: any = this.props['x-type-props'] || this.props.props || {};
        if (!props.dataSource) {
            props = {
                dataSource: [
                    props
                ]
            }
        }
        return (
            <Box {...props} />
        )
    }
}