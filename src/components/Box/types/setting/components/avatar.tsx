import React from 'react';
import classnames from 'classnames';
import { Avatar,Space,Tooltip, Spin } from 'antd';
export default class BoxSettingAvatar extends React.Component<any, {value: any, loading: boolean}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: props.value || '',
            loading: false
        }
    }
    public render() {
        return <Spin spinning={this.state.loading}><Space className='box-setting-avatar'>
            {this.renderAvatar()}
        </Space></Spin>
    }
    public onSubmit(value: any) {
        if (this.state.loading) {
            return;
        }
        this.setState({ loading: true });
        
        this.props.onSubmit(this.props.valueKey, value).then((res: any)=> {
            if (res.success) {
                this.setState({ loading: false, value })
            }
        }).finally(()=> {
            this.setState({ loading: false })
        })
    }
    public renderAvatar() {
        let { dataSource = [] } = this.props;
        
        return dataSource.map((item: any, index: number) => {
            return <Tooltip key={index} title={item.label || item.value}><Avatar className={classnames({
                'box-setting-avatar-active': item.value === this.state.value
            })} size='large' src={item.avatar}  onClick={()=> this.onSubmit(item.value)}/></Tooltip>
        })
    }
}