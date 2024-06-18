import React from 'react';
import  * as HoofsIcons  from '../Icons';

export  class SideFooter extends React.Component {
    public constructor(props) {
        super(props);
    }
    public render () {
        return (
            <div>footer</div>
        )
    }
}



interface SideHeaderProps {
    onFoldSwitch: Function;
}

export  class SideHeader extends React.Component<SideHeaderProps> {
    public constructor(props: SideHeaderProps) {
        super(props);
    }
    public render () {
        return (
            <div className='hoofs-sidebar-header'>
                <div className='hoofs-sidebar-header-title'>
                    <div className='hoofs-sidebar-header-icon'>
                        <HoofsIcons.DbqueryMiniBrandFilled />
                    </div>
                    <p>anyhubs</p>
                    <span>Connect anything</span>
                    <div className='hoofs-sidebar-header-fold' onClick={()=> {this.props.onFoldSwitch()}}>
                        <HoofsIcons.DoubleLeftOutlined/>
                    </div>
                    <div className='hoofs-sidebar-header-fold-open' onClick={()=> {this.props.onFoldSwitch()}}>
                        <HoofsIcons.DoubleRightOutlined/>
                    </div>
                </div>
            </div>
        )
    }
}


export default {
    SideHeader,
    SideFooter
}