import React from 'react';
import Manger from '../../core/SmartPageManger';
import SmartRequst from '../../../utils/SmartRequest';
import Box from '../../../Box';

import { Skeleton} from 'antd';


interface SmartPageBlocksProps {
    schema: any;
    toolbarRef: any;
}

interface SmartPageBlocksState {
    value: any;
    loading: boolean;
}

export default class SmartPageBlocks extends React.Component<SmartPageBlocksProps, SmartPageBlocksState> {
    private requestHelper: any;
    public constructor(props: SmartPageBlocksProps) {
        super(props);
        
        let {schema = {}} = this.props;
        let { meta = {} } = schema;
        
        if (meta.motion) {
            this.requestHelper = SmartRequst.makeGetRequest(meta.path + meta.motion);
        }

        this.state = {
            value: '',
            loading: !!this.requestHelper 
        }

    }

    public componentDidMount() {
       
       if (this.requestHelper) {
        this.requestHelper({}).then((res: any) => {
            
            this.setState({
                value: res,
                loading: false
            })
        })
       }
    }

    public render() {
        let {schema = {}} = this.props;
        let blocks: any [] = !Array.isArray(schema.blocks) ? [schema.blocks] : schema.blocks;

        if (this.state.loading) {
            return <Skeleton active />
        }
        return (
            <Box dataSource={blocks || []} meta={schema.meta} toolbarRef={this.props.toolbarRef} value={this.state.value}></Box>
        )
    }
}

Manger.registoryComponent('blocks', SmartPageBlocks);