import React from 'react';
import { SmartPage, FormerTypes, Icons } from '@blocksx/ui';
import './style.scss';


interface FlowPagesProps {
    name: string;
}

export default class FlowPages extends React.Component<FlowPagesProps, {value: any, avatar: any} > {
    
    public constructor(props: any) {
        super(props);
        this.state = {
            value: {},
            avatar: null
        }
    }

    public render() {
        return (
            <div
                className='ui-pages-wrapper'
            >
                
                <div className='ui-pages-inner'>
                    <div className='ui-pages-avatar'><FormerTypes.avatar size={32} icon ={this.state.avatar} /></div>
                    <SmartPage  name={this.props.name} onInitPage={(v) => {
                        let { pageMeta = {}}  = v;

                        this.setState({
                            avatar: pageMeta.avatar
                        })
                        
                    }} onClose={()=> {
                        
                    }} onChangeValue={(v)=> {this.setState({value: v})}} pageURI='/api/pages/findPage' />
                    
                </div>
                <div className='ui-pages-copyright'><Icons.AnyhubsBrandFilled/> This page is created using <a href="https://anyhubs.com/" target='_blank'>anyhubs</a>, and the data is used solely for process automation.</div>
            </div>
        )
    }
}