import React from 'react';
import Manger from '../../core/SmartPageManger';
import Box from '../../../Box';

export default class SmartPageBlocks extends React.Component<{schema: any}> {



    public render() {
        let {schema = {}} = this.props;
        let blocks: any [] = !Array.isArray(schema.blocks) ? [schema.blocks] : schema.blocks;
        return (
            <Box dataSource={blocks || []}></Box>
        )
    }
}

Manger.registoryComponent('blocks', SmartPageBlocks);