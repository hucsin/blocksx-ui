import React from 'react';
import Manger from '../../core/SmartPageManger';
import Box from '../../../Box';

export default class SmartPageBlocks extends React.Component<{schema: any}> {



    public render() {
        console.log(this.props, 88989)
        let {schema = {}} = this.props;

        return (
            <div>
                <Box dataSource={schema.blocks || []}></Box>
            </div>
        )
    }
}

Manger.registoryComponent('blocks', SmartPageBlocks);