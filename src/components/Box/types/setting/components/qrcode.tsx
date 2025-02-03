import React from 'react';
import { utils } from '@blocksx/core'
import { Space, Popover } from 'antd';
import  * as Icons from '../../../../Icons';
import { QRCodeCanvas } from 'qrcode.react';
import TablerUtils from '../../../../utils/tool'

import './qrcode.scss';

export default class BoxSettingSelect extends React.Component<any, {value: boolean, loading: boolean}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: props.value || false,
            loading: false
        }
    }
    
    public renderQrcode() {
        
        let qrcode: string = utils.template(this.props.qrcode || '', {
            value: (this.props.value||"").replace(/^\+/,''),
            ...this.props.object
        });
        
        return (
            <div className='qrcode-inner'>
                <QRCodeCanvas size={200} level="M" value={qrcode} />
                {this.props.icon && TablerUtils.renderIconComponent(this.props)}
                {<p>{this.props.value ? this.props.text: this.props.defaultText}</p>}
            </div>
        )
    }
    
    public render() {
        return (
            <div className='setting-qrcode-wrapper'>
                 <Popover content={this.renderQrcode()}>    
                    <Space>
                        <Icons.QrcodeOutlined/>
                        <span>{this.props.value|| this.props.defaultValue}</span>
                    </Space>
                </Popover>
            </div>
        )
    }
}