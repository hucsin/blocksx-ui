/**
 * 全局状态管理
 */

import StateModel from '../../../components/StateX/Model'

interface GlobalStateProps {
    current: string | number;
    windows?: any;
}

export default class GlobalState extends StateModel<GlobalStateProps> {
    public static StateName = 'globalState';

    public constructor(props) {
        super(props)
    }
    public actions = {
        current: (current) => {
            this.setState({
                current: current
            })
        }
    }
}