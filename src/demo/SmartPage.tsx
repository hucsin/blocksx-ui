import React from 'react';
import SmartPage from '../components/SmartPage';


export default class DemoScenFlow extends React.Component {
    public render () {
        //@ts-ignore
        let { location } = window as any;
        
        let searchSplit: any = location.search.match(/page=([^&]+)/);
        let page: string = 'application';
        if (searchSplit ) {
            page= searchSplit[1]
        }

        
        return (
            <SmartPage
                name={page}
                
                router={{}}
            />
        )
    }
}
