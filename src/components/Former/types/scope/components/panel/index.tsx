import React from 'react';

interface ScopePanelProps {
    scope: any;
}
interface ScopePanelState {

}

export default class ScopePanel extends React.Component<ScopePanelProps, ScopePanelState> {
    public constructor(props: ScopePanelProps) {
        super(props);
        
    }
    public render() {
       return  (
            <div className='ui-scope-panel-inner'
                onMouseDown={(e)=> {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >dd
            </div>
        )
    }
}