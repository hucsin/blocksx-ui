import React from 'react';
import * as Icons from '../../../../Icons';
import { InputNumber, Space, Button, Popover,Typography, Tooltip } from 'antd';

export default class BoxSettingInput extends React.Component<any, {object: any,error:string,rebind: boolean,loading: boolean, value: string }> {
    public constructor(props: any) {
        super(props);
        this.state = { 
            value: props.value || '' ,
            error: '',
            loading: false,
            rebind: false,
            object: props.object || {}  
        }
    }
    public onChange = (e: any) => {
        
        this.setState({ value: e })
    }
    public onSubmit = () => {

        // 提交
        if (this.props.onSubmit) {
            this.setState({ loading: true })
            this.props.onSubmit(this.props.valueKey, this.state.value).then((res: any)=> {
                
                this.setState({ loading: false })
                if (!res.success) {
                    this.showError(res.message)
                } else {
                    this.setState({ loading: false, rebind: false, object: res.payload })
                }
            }).finally(()=> {
                this.setState({ loading: false })
            })
        }
    }
    public showError(error: string) {
        this.setState({ error, loading: false }, ()=> {
            setTimeout(()=> {
                this.setState({ error: '' })
            }, 3000)
        })
    }
    private goBackBind() {
        this.setState({ rebind: true })
    }
    public renderBindStatus(object, bindText: string, bindStatus: any) {
        if (typeof bindStatus === 'string') {
            bindStatus = bindText.replace(/{(\w+)}/g, (match: string, p1: string) => {
                
                return object[p1] || match;
            });

            return (<pre style={{textAlign: 'right'}} >
                <Tooltip title="You must bind your account first to send messages to your assistant's account."><Icons.ExclamationCircleFilled/></Tooltip>
                {bindStatus}
                <Tooltip title='Re-bind'><Icons.GoLeftDirectivityFilled onClick={()=> this.goBackBind()}/></Tooltip>
            </pre>)
        } else {
            return <Space>
                    <Typography.Paragraph>{this.props.value}</Typography.Paragraph>
                    <Tooltip title='Re-bind'><Icons.GoLeftDirectivityFilled onClick={()=> this.goBackBind()}/></Tooltip>
                </Space>
        }
    }
    public render() {
        let { value, object= {}, rebind = false } = this.state;
        let { bind = '' } = this.props;
        let bindStatus: any = object[this.props.valueKey + 'Validated'] || '';

        if (!rebind && bindStatus && this.props.bind) {
            
            return (
                this.renderBindStatus(object, bind, bindStatus)
            )
        } else { 
            return (
                <Space.Compact>
                    <InputNumber  style={{width: 180}} min={this.props.min || 0} max={this.props.max || 1000} size='large' onChange={this.onChange} suffix={this.props.suffix} placeholder={this.props.placeholder} value={this.state.value} />
                    <Popover open ={!!this.state.error} content={this.state.error}>
                        <Button size='large' loading={this.state.loading} onClick={this.onSubmit} disabled={value ? (this.props.value == this.state.value) : true} type='default'>{this.props.buttonText || 'Submit'}</Button>
                    </Popover>
                </Space.Compact>
            )
        }
    }
}