import React from 'react';
import { Outlet } from "react-router-dom";

import Sidebar  from '../Sidebar';
import withRouter from '../utils/withRouter';
import './style.scss';

interface LayoutProps {
    router: any;
    menu: any[]
    roadmap: any[]
    currentKey: string;
    onChange: Function
}

interface LayoutState {
    currentKey: string
}

class Layout extends  React.Component<LayoutProps, LayoutState> {
    public constructor(props: LayoutProps) {
        super(props);
        this.state = {
            currentKey: props.currentKey
        }
    }
    private getPathByMenuKey(menuKey: string) {
        return ['/', menuKey.replace('.', '/')].join('')
    }
    
    private goMenuKey(menuKey: string) {
        let path: string = this.getPathByMenuKey(menuKey);
        this.props.router.naviagte(path)

        
    }

    public render() {
        console.log(JSON.stringify(this.props.menu), 999)
        return (
            <div className='ui-layout'>
                <Sidebar
                    menu={this.props.menu}
                    roadmap={this.props.roadmap}
                    currentKey={this.state.currentKey}
                    onChange={(menuKey)=> {
                        //this.props.onChange(menuKey)
                        this.setState({
                            currentKey: menuKey
                        })
                        this.goMenuKey(menuKey)
                    }}
                />
                <div className='ui-layout-content'>
                    <Outlet/>
                </div>
            </div>
        )

    }
}

export default withRouter(Layout); 