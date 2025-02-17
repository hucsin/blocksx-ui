import React from 'react';
import { Select } from 'antd';

export default class BoxSettingSelect extends React.Component<any, {value: string, loading: boolean}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: props.value || props.defaultValue || '',
            loading: false
        }
    }
    private getOptions = () => {
        let { options, dataType } = this.props;
        
        if (dataType === 'timezone') {
            
            return Intl.supportedValuesOf('timeZone').map(tz => ({ label: tz, value: tz }));
        }

        return options;
    }
    
    private onSelect = (value: string) => {
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


        return <Select size='large' value={this.state.value} defaultValue={this.props.defaultValue} loading={this.state.loading} onSelect={this.onSelect} showSearch options={this.getOptions()} />
    }
}