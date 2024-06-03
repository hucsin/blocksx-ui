import React from 'react';
import ReactJsonView from 'react-json-view';

import FormerCode from '../code';
import { IFormerBase } from '../../typings';


interface FormerJSONProps extends IFormerBase {
  title: string;
  value: any,
  onChangeValue: Function;
  fieldName?: string;
}
interface FormerCodeState {
  value: any;
}

class FormerJsonViewer extends React.Component<{value: any}> {
    public render() {
        return (
            <ReactJsonView name={false} quotesOnKeys={false} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} src={this.props.value} />
        )
    }
}


export default class FormerJson extends React.Component<FormerJSONProps, FormerCodeState> {
    public static Viewer:any = FormerJsonViewer;
    public constructor(props: FormerJSONProps) {
        super(props);

        this.state = {
            value: props.value
        }
    }
    public onChangeValue = (value: any) => {
        this.setState({
            value
        })
        console.log(value, 3333)
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    public render() {
        console.log(this.props)
        return (
            <FormerCode title={'Editor the '+ this.props.fieldName} value={this.state.value} language='json' onChangeValue={this.onChangeValue} />
        )
    }
}