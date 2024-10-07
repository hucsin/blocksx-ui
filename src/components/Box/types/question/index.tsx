import React from 'react';
import classnames from 'classnames';
import { BoxItem } from '../../interface';
import { Icons } from '@blocksx/ui';
import BoxManger from '../../BoxManger';

import './style.scss'



export default class BoxQuestion extends React.Component<BoxItem, {open: any}> {
    public constructor(props: any) {
        super(props);

        this.state = {
            open: []
        }
    }
    public onClick =(index:number)=> {
        let { open } = this.state;

        if (open.includes(index)) {
            open = open.filter(it => it !== index);
        } else {
            open.push(index)
        }

        this.setState({
            open
        })
    }
    public render() {
        let open: any = this.state.open;
        let props: any = this.props;
        return (
            <div className='box-question'>
                <div className='box-question-left'>
                    <h2>{props.title}</h2>
                    <p>{props.slogan|| props.description}</p>
                </div>
                <div className='box-question-right'>
                    {props.items.map((it, index) => {
                        return (
                            <dl key ={index} className={classnames({
                                open: open.includes(index)
                            })}>
                                <dt onClick={()=> this.onClick(index)}>{it.title} {!open.includes(index) ? <Icons.PlusOutlined/>: <Icons.MinusOutlined/>}</dt>
                                <dd>{it.slogan || it.description}</dd>
                            </dl>
                        )
                    })}
                </div>
            </div>
        )
    }
}

BoxManger.set('question', BoxQuestion);