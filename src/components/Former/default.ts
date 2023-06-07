/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-11-03 21:59:49
 */

import { IFormerObject } from './typings';

class FormerDefault {
    public getDefaultValueByProps(props: IFormerObject) {
        return this.getDefaultValue(props);
    }

    public getDefaultValue(props: any) {
        switch(props.type) {
            case 'Object':
                let defaultValue = {};
                if (props.properties) {
                    for(let prop in props.properties) {
                        defaultValue[prop] = this.getDefaultValue(props.properties[prop]);
                    }
                }
                return defaultValue;
            default: 
                return props.defaultValue;
        }
    }
}


export default new FormerDefault();
