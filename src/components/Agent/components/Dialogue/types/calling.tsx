import { keypath } from '@blocksx/core';
import React from 'react';

import TablerUtils from '../../../../utils/tool';

export default class Calling extends React.Component<{payload: any, onCalling: Function}> {
    public render() {
        let { payload ={} } = this.props;
        return (
            <div className='thinking'>{payload.app && TablerUtils.renderIconComponent(payload.app)} {this.getDefaultTitle(payload)}</div>
        )
    }
    public componentDidMount(): void {
        if (this.props.onCalling) {
            this.props.onCalling()
        }
    }
    private getDefaultTitle(payload: any) {
        let title: string = keypath.get(payload, 'schema.title') || '';

        return title ? title.replace(/\.$/,'') : title;
    }   
}