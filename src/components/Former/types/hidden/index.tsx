/*
 * @Author: your name
 * @Date: 2020-09-18 17:59:23
 * @LastEditTime: 2022-03-02 20:59:54
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/types/textarea/index.tsx
 */
import React from 'react';
import { IFormerBase } from '../../typings';

interface IFormerTextarea extends IFormerBase {
    value: any,
    onChangeValue: Function
}
export default class FormerHidden extends React.Component<IFormerTextarea, { value: any }> {
    public constructor(props: IFormerTextarea) {
        super(props);

    }
    public render() {
        return (
            <span style={{display: 'hidden'}}></span>
        )
    }
}