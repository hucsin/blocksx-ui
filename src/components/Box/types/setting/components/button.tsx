import React from 'react';
import * as Icons from '../../../../Icons';
import { Button, Dropdown } from 'antd';
import SmartAction from '../../../../core/SmartAction';
import SmartRequest from '../../../../utils/SmartRequest';


export default class BoxSettingButton extends React.Component<any> {
    public render() {
        let setting: any = Object.assign({}, this.props);
        let value: any = this.props.object;
        
        if (setting.menus) {
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
                                this.doAction(it, value)
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
                            this.doAction(setting, value)
                        }
                    }}
                >{setting.label}</Button>
            )
        }
    }
    public doAction(smartaction: any, value: any = {}) {

        if (smartaction.contentKey) {
            smartaction.content = value[smartaction.contentKey]
        }
        if (smartaction.smartaction == 'modal') {
            SmartAction.doAction(smartaction, () => {
                if (smartaction.okLink) {
                    let helper: any = SmartRequest.makePostRequest(smartaction.okLink)
                    return new Promise((resole, reject) => {
                        helper().then((d)=> {
                            window.location.reload()
                            resole(d)
                        }).catch(reject)
                    })
                }
            })
        } else {
            SmartAction.doAction(smartaction)
        }
    }
}
