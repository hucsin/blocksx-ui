import { utils } from '@blocksx/core';
import { StateX, StateModel } from '@blocksx/ui/StateX';
import { resourceManager } from '@blocksx/ui/Editor/core/manager';

interface FormerState {
    visible: boolean;
    type: string;
    namespace: string;
    value: any;
}

export default class EditorFormerState extends StateModel<FormerState> {
    
    public constructor() {
        super();
        this.state = {
            visible: false,
            type: '',
            namespace: '',
            value: null
        };
    }

    public getSchema(namespace?: string) {
        let _namespace: string = namespace || this.state.namespace;
        if (resourceManager.has(_namespace)) {
            return resourceManager.find(_namespace)
        }
    }

    public getValue() {
        return this.state.value;
    }

    public hide() {
        this.setState({
            visible: false,
            value: null
            
        })
    }

    public show(namespace: string, value?: any) {
        this.setState({
            visible: true,
            namespace: namespace,
            value: value
        })
    }

    public getVisible() {
        return this.state.visible;
    }
}

StateX.registerModel(new EditorFormerState())

