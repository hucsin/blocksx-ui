import React from 'react';
import * as Icons from '../../../../Icons';
import { Button, Dropdown } from 'antd';
import SmartAction from '../../../../core/SmartAction';


export default class BoxSettingButton extends React.Component<any> {
    public render() {
        let setting: any = this.props;
        if (setting.menus) {
            console.log(setting.menus, 23333)
            let menus: any [] = setting.menus;
            let items: any [] = setting.menus.map((item: any)=> ({
                label: item.label,
                key: item.value
            }))

            return (
                <Dropdown.Button 
                    size='large'
                    icon={<Icons.DownOutlined />}
                    menu={{
                        items,
                        onClick: (item)=> {
                            let it: any = menus.find((i: any)=> i.value === item.key);

                            if (it && it.smartaction) {
                                this.doAction(it)
                            }
                        }
                    }}
                >
                    {setting.label}
                </Dropdown.Button>
            )
        } else {
            return (
                <Button 
                    icon={setting.icon} 
                        size='large'
                    type='default'
                    onClick={() => {
                        if (setting.smartaction) {
                            this.doAction(setting)
                        }
                    }}
                >{setting.label}</Button>
            )
        }
    }
    public doAction(smartaction: any) {
        SmartAction.doAction(smartaction)
    }
}
