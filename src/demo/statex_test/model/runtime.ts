
import StateModel from '../../../components/StateX/Model'


interface RuntimeStateProps {
    c: number;
}

export default class RuntimeState extends StateModel<RuntimeStateProps> {

    public constructor(namespace: string, props) {
        super(namespace, props)
    }
    public actions = {
        add: () => {
            this.setState({
                c: this.state.c + 1
            })
        }
    }
}