/**
 * 根据svg写文件
 */
const glob = require('glob');
const fs = require('fs');
const lodash = require('lodash');


const filledIcons = glob.sync('../assets/svg/filled/*');
const outlinedIcons = glob.sync('../assets/svg/outlined/*');
const combineIcons = glob.sync('../assets/svg/combine/*')

function getCombineIconTemplate(name: string, main: string, subscript: string) {
    return `import React from 'react';
import { IconProps } from '../type';
import Main from './${main}';
import Subscript from './${subscript}';
    
export default class ${name} extends React.Component<IconProps> {
    public render() {
        return (
            <span className='icons-combine icons-combine-bottomRight'>
                <Main/>
                <Subscript/>
            </span>
        )
    }
}
`
}

function getIconTemplate(iconPath: string, name: string) {
    return `import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import iconsvg from '${iconPath}?react';

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

async function writeFile(page: string) {
    let fileName: string = page.replace('../assets/svg/', '');
    let split: any = fileName.replace(/\.(json|svg)/, '').split('/');
    let splitLine: any = split[1].split('-');
    let classify: string = splitLine[splitLine.length-1];

    if (!classifyMap[classify]) {
        classifyMap[classify] = [];
    }

    let type: string = lodash.upperFirst(split[0]);
    let file: string = lodash.upperFirst(lodash.camelCase(split[1])) + type;

    let isCombine: boolean = !!page.match(/combine\//);
    let iconTemplateText: string;

    if (isCombine) {
        let combineJSON: any =  JSON.parse(fs.readFileSync(page));

        
        iconTemplateText = getCombineIconTemplate(file, combineJSON.main,combineJSON.subscript);
        
    } else {
        iconTemplateText= getIconTemplate(page.replace('\.\/assets',''), file)
    }

    
    
    fs.writeFileSync('../assets/'+ file +'.tsx', iconTemplateText);
    
    iconList.push(file);
    
    classifyMap[classify].push(file);
    
}


filledIcons.forEach(writeFile)
outlinedIcons.forEach(writeFile);
combineIcons.forEach(writeFile)

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