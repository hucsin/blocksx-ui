import React from 'react';
import { utils } from '@blocksx/core';
import SmartPage from '../../../SmartPage';
import { Drawer } from 'antd';

interface ButtonDrawerProps {
    record: any;
    meta: any;
    open: boolean;
    onClose?: Function
}

interface ButtonDrawerState {
    open: boolean;
    pageMeta: any;
}

export default class ButtonDrawer extends React.Component<ButtonDrawerProps, ButtonDrawerState> {

    public constructor(props: ButtonDrawerProps) {
        super(props);

        this.state = {
            open: props.open,
            pageMeta: {}
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
                <SmartPage
                    pageURI={meta.path}
                    name={name}
                    icon={meta.icon}
                    onInitPage={(pageInit: any)=> {
                        
                        this.setState({
                            pageMeta: pageInit.pageMeta
                        })
                        Object.assign(pageInit, {
                            noFolder: true,
                            noHeader: false,
                            
                            noTitle: true,
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