import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';

import SmartPage from '../../../SmartPage';
import { Drawer, Alert } from 'antd';

interface ButtonDrawerProps {
    record: any;
    meta: any;
    open: boolean;
    onClose?: Function
}

interface ButtonDrawerState {
    open: boolean;
}

export default class ButtonDrawer extends React.Component<ButtonDrawerProps, ButtonDrawerState> {

    public constructor(props: ButtonDrawerProps) {
        super(props);

        this.state = {
            open: props.open
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<ButtonDrawerProps>): void {
        if (nextProps.open !== this.state.open) {
            this.setState({
                open: nextProps.open
            })
        }
    }
    public render() {
        let { meta = {}, record = {} } = this.props;
        let name: string = '';

        if (utils.isString(meta.params)) {
            name = record[meta.params]
        }
        return (
            <Drawer
                title={meta.title || meta.name}
                open={this.state.open}
                width={760}
                className='ui-former ui-smartpage-drawer ui-button-drawer'
                onClose={()=>{
                    this.props.onClose && this.props.onClose();
                }}
            >
                <Alert key={2} showIcon message={'dddd'} type='warning' />
                <SmartPage
                    pageURI={meta.path}
                    name={name}
                    
                    onInitPage={(pageInit: any)=> {
                        console.log(pageInit, 3333)
                        Object.assign(pageInit, {
                            noFolder: true,
                            noHeader: false,
                            noToolbar: false,
                            rowSelection: true,
                            mode: 'tabler'
                        })
                        
                    }}
                />
            </Drawer>
        )
    }
}