import React from 'react';
import { Decode } from '@blocksx/encrypt'; 
import { Button } from 'antd';
import withRouter from '../../../../utils/withRouter';

import { OpenWindowUtilityOutlined } from '../../../../Icons';

interface LinkProps {
    url: string;
    text: string;
    router: any;
}

export default class Link extends React.Component<LinkProps> {
    private onClick = ()=> {
        let url: string = this.props.url || this.props['link'];
        
        // 现在只处理内站跳转
        if (this.isSelfURL(url)) {
            let pathmap: any = this.getRouterMap(url);
            if (window['RouterUtils']) {
                window['RouterUtils'].go(pathmap.path, pathmap.query)
            }
            
        } else {
            window.open(url);
        }
    }
    private getRouterMap(url:string) {
        let u: URL = new URL(url);
        let path: string = u.pathname;
        let h5match = path.match(/\/h5\/(.*)/);
        let query: string = String(u.search).replace(/^\?/, '');

        if (h5match && h5match[1]) {
            if (h5match[1].length>20) {
                let truepath: any = Decode.decode(h5match[1]) || '';
                
                return {
                    path: truepath.split('|')[0],
                    query
                }
            }
        }

        return {
            path,
            query
        };
    }
    private isSelfURL(url: string) {
        return !!url.match(/(console.anyhubs.com)/)
    }
    public render() {
        
        let props: any = this.props;
        return (
                <Button icon={<OpenWindowUtilityOutlined/>} onClick={this.onClick} type="default" size="small" block >{props.text || props.title}</Button>
        )
    }
}
