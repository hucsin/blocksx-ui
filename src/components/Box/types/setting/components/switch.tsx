import React from 'react';
import { Switch } from 'antd';

export default class BoxSettingSelect extends React.Component<any, {value: boolean, loading: boolean}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: props.value || false,
            loading: false
        }
    }
    
    
    private onSelect = (value: boolean) => {
        
        this.setState({ value });
        if (this.props.onSubmit ) {
            this.setState({ loading: true });
            this.props.onSubmit(this.props.dataKey|| this.props.valueKey, value ).then(()=> {
                this.setState({ loading: false });
            }).finally(()=> {
                this.setState({ loading: false });
            })
        }
    }
    public render() {

        return <Switch size='default' checked={this.state.value} onChange={this.onSelect} />
    }
}