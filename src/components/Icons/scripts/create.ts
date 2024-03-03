/**
 * 根据svg写文件
 */
const glob = require('glob');
const fs = require('fs');
const lodash = require('lodash');


const filledIcons = glob.sync('../assets/svg/filled/*');
const outlinedIcons = glob.sync('../assets/svg/outlined/*')

function getIconTemplate(iconPath: string, name: string) {
    return `import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import iconsvg from '${iconPath}';

export default class ${name} extends React.Component<IconProps> {
    public render() {
        let  props: any = this.props;
        return <Icon component={iconsvg} {...props} />
    }
}
`
}

const classifyMap: any = {};
const iconList: any = [];

function writeFile(page: string) {
    let fileName: string = page.replace('../assets/svg/', '');
    let split: any = fileName.replace(/\.svg/, '').split('/');
    let splitLine: any = split[1].split('-');
    let classify: string = splitLine[splitLine.length-1];

    if (!classifyMap[classify]) {
        classifyMap[classify] = [];
    }

    let type: string = lodash.upperFirst(split[0]);
    let file: string = lodash.upperFirst(lodash.camelCase(split[1])) + type



    

    let iconTemplate: string = getIconTemplate(page.replace('\.\/assets',''), file);

    fs.writeFileSync('../assets/'+ file +'.tsx', iconTemplate);

    iconList.push(file);
    classifyMap[classify].push(file);
    
}

filledIcons.forEach(writeFile)
outlinedIcons.forEach(writeFile);

// 写index.ts
fs.writeFileSync('../assets/index.tsx', iconList.map(ic => {
    return `export { default as ${ic} } from './${ic}';`
}).join('\n'));


// 写icommap

const keys = Object.keys(classifyMap);
const iconmap: string[] = [
    'export const map:any = ' + JSON.stringify(classifyMap, null, 4)
];



fs.writeFileSync('../iconmap/icon.ts', iconmap.join('\n'))


console.log(lodash.merge({a: [12,23,4], b: []}, {a: [3333],b: [32323]}))