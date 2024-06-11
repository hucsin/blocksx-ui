import React from 'react';
import FormerSelect, { FormerSelectProps } from '../select';

import './style.scss';

interface FormerTagsProps extends FormerSelectProps {

}

interface FormerTagsState {
    value: any;
    runtimeValue: any;
}

export default class FormerTags extends React.Component<FormerTagsProps, FormerTagsState> {

    public constructor(props: FormerSelectProps) {
        super(props);
        this.state ={
            value: props.value ,
            runtimeValue: props.runtimeValue
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: FormerSelectProps) {
        if (newProps.value != this.state.value) {
            this.setState({
                value:  newProps.value 
            })
        }

        if (newProps.runtimeValue != this.state.runtimeValue) {
            this.setState({
                runtimeValue: newProps.runtimeValue
            })
        }

    }
    private onChangeValue = (value:any) =>{
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    public render () {
        return (
            <div className='former-tags-wrapper'>
            <FormerSelect 
                {...this.props}
                mode="tags"
                popupClassName="former-tags-popup"
                value={this.state.value || []}
                runtimeValue={this.state.runtimeValue}
                onChangeValue={this.onChangeValue}
           />
           </div>
        )
    }
}



