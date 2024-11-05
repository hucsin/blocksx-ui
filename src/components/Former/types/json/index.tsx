import React from 'react';

//import FormerCode from '../code';
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
            <pre>
                {JSON.stringify(this.props.value, null,2)}
            </pre>
            
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
        
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    public render() {
        return (
            <pre>{this.state.value}</pre>
        )
       /* 
        return (
            <FormerCode title={'Editor the '+ this.props.fieldName} value={this.state.value} language='json' onChangeValue={this.onChangeValue} />
        )*/
    }
}