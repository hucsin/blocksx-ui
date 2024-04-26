import React from 'react';
import classnames from 'classnames';

import FormerObjectItem from './item';
import { IFormerObject } from '../../typings';

import "./style.scss";

interface IFormerObjectS extends IFormerObject {
  size: any;
  value: any;

  children?:any;
}
export default class FormerObject extends React.Component<IFormerObjectS, {}> {

    static Item = FormerObjectItem;

    public constructor(props: IFormerObjectS) {
        super(props);
    }

    public render() {
        return (
            <div className={
                classnames("former-object", {
                  [`former-object-viewer`]: this.props.viewer,
                  [`former-object-${this.props.size}`]: this.props.size
                })
            }>
                {this.props.children}
            </div>
        )
    }
}