import { keypath } from '@blocksx/core';
import React from 'react';
import { TablerUtils, Former, FormerTypes } from '@blocksx/ui';
import { StructuralSchemaFields } from '@blocksx/structural';

import './style.scss';

interface InputParamsProps {
    startNodes: any;
    onSubmit: Function;
}
interface InputParamsState {
    startNodes: any;
}

export default class InputParams extends React.Component<InputParamsProps, InputParamsState> {
    public constructor(props: InputParamsProps) {
        super(props);

        this.state = {
            startNodes: props.startNodes
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<InputParamsProps>, nextContext: any): void {
        if (nextProps.startNodes != this.state.startNodes) {
            this.setState({
                startNodes: nextProps.startNodes
            })
        }
    }
    private getStartParamsSchema(startNode: any) {
       
        if (startNode) {
            let inputs: any = keypath.get(startNode, 'props.input.inputs');
            
            return inputs ? TablerUtils.getDefaultSchema(StructuralSchemaFields.toFormerFields(inputs).map(it => TablerUtils.makeField(it))) : null
        }
        return null;
    }
    public render() {
        let { startNodes } = this.state;
        let startNode: any = startNodes.find(it => it.componentName == 'Thinking.start')
        let schema: any = this.getStartParamsSchema(startNode);
        
        if (schema) {
            return (
                <div className='ui-runtest-input'>
                    <FormerTypes.notice icon={startNode.icon} color={startNode.color} value="Enter test data to run the test. The system will execute the test based on the data you provide and complete the process flow."/>
                    <Former 
                        schema={schema}
                        size="default"
                        okText='Run test'
                        okIcon="CaretRightFilled"
                    />
                </div>
            )
        }

        return (
            <p>d</p>
        )
    }
}