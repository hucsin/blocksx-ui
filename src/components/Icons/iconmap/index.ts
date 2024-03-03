import { map as antdMap } from './antd';
import { map as defaultMap } from './icon';

let defaultMapList: any = antdMap;

function merge(map: any) {
    for(let prop in map) {
        let deflist: any = defaultMapList[prop] || [];
        defaultMapList[prop] = deflist.concat(map[prop])

    }
}

merge(defaultMap)


export const IconMap =  defaultMapList;