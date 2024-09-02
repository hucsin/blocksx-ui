import React from 'react';
import i18n from '@blocksx/i18n';
import { SmartPage } from '@blocksx/ui';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { StructuralMiniFlow } from '@blocksx/structural';
import { Space, message, Segmented, Button, Tooltip, Tag, Radio, DatePicker } from 'antd';
import { Icons, Tabler } from '@blocksx/ui';
import { FetchMap } from '../../typing';
import './style.scss';


export interface IRuntTest {
    router: any;
    openType: string;
    fetchMap: FetchMap;
    historyType: string;
    getSchema: Function;
    switchRunStatus: Function;
    historyStartDate: string;
    historyEndDate: string;
    runId: string;
    reflush: any;
    disabled: any;
    onOpenLogPanel?: Function;
}

export interface SRuntTest {
    openType: string;
    loading: boolean;
    reflush: any;
    forceReflush: any;

    historyType: string;
    historyStartDate: any;
    historyEndDate: any;
    runId: string;
    disabled: any;
}

export default class RunTest extends React.Component<IRuntTest, SRuntTest> {
    private router: any;
    private dateFormat: string = 'YYYY/MM/DD';
    private colorMap: any = {
        Runing: '#2db7f5',
        Success: '#87d068',
        Error: '#f50'
    }
    private actionTypeMap: any = [
        'run', 'remoting', 'workflow'
    ]
    public constructor(props) {
        super(props);
        this.state = {
            reflush: props.reflush,
            openType: props.openType,
            historyType: props.historyType,
            historyStartDate: props.historyStartDate,
            historyEndDate: props.historyEndDate,
            runId: props.runId,
            loading: false,
            disabled: props.disabled,
            forceReflush: props.reflush
        }
        this.router = props.router;
    }
    public componentWillUpdate(newProps: any) {
        this.router = newProps.router;
        if (newProps.openType != this.state.openType) {
            this.setState({
                openType: newProps.openType
            })
        }
        
        if (newProps.disabled != this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
            })
        }

        if (newProps.reflush != this.state.reflush) {
            this.setState({
                reflush: newProps.reflush,
                forceReflush: newProps.reflush
            })
        }

        if (newProps.historyType != this.state.historyType) {
            this.setState({
                historyType: newProps.historyType,
                forceReflush: +new Date()
            })
        }

        if (newProps.historyStartDate != this.state.historyStartDate) {
            this.setState({
                historyStartDate: newProps.historyStartDate
            })
        }

        if (newProps.historyEndDate != this.state.historyEndDate) {
            this.setState({
                historyEndDate: newProps.historyEndDate
            })
        }
        if (newProps.runId != this.state.runId) {
            this.setState({
                runId: newProps.runId
            })
        }
    }

    public onChange =(value: string)=> {
        let { utils } = this.router;
        utils.goQuery({
            type: value,
            status: '',
            startDate: '',
            endDate: ''
        });
    }
    public openLogPanel =(id: any) => {
        let { utils } = this.router;
        utils.goQuery({
            logs: id
        });

        this.props.onOpenLogPanel && this.props.onOpenLogPanel(id)

    }
    public onChangeType= (e: any) => {
        let { utils } = this.router;
        utils.goQuery({
            status: e.target.value
        });
    }
    public onChangeRangeDate = (e: any) => {
        
        let { utils } = this.router;
        if (e && e.length == 2) {
            utils.goQuery({
                startDate: e[0].format(this.dateFormat),
                endDate: e[1].format(this.dateFormat)
            });
        } else {
            utils.goQuery({
                startDate:'',
                endDate: ''
            });
        }
    }
    public onExpand=()=> {
        let { utils } = this.router;
        utils.goQuery({
            type: ''          
        })
    }
    private renderHistoryBody () {
        
        return (
            <SmartPage
                reflush = {this.state.forceReflush}
                name={'taskhistory'}
                props ={{
                    selectedRow: {
                        id: this.state.runId
                    },
                    avatarReverseColor: true,
                    value: [this.state.runId],
                    optional: true
                }}

                onSelectedValue={(v)=>{
                    this.openLogPanel(v.id)
                }}
                onGetDependentParameters={()=> {
                    let type: string = this.state.historyType;
                    let extendsd: any = {};
                    if (['test', 'prod'].includes(type)) {
                        extendsd.type = type == 'test' ? 'test' : 'interval'
                    } else {
                        if (type) {
                            extendsd.status = type;
                        }
                    }
                    return {
                        job: this.props.router.params.id,
                        ...extendsd
                    }
                }}
            />
        )
    }
    private renderBody =()=> {
        switch(this.state.openType) {
            case 'history':
                return this.renderHistoryBody()
        }
        return null;
    }
    private dealMiss(fields: any[]) {
        let map: any = {};
        fields.forEach(it => map[it.name] = it)
        
        this.props.switchRunStatus('miss', map)
    }
    public runTest = ()=> {
        let schema: any = this.props.getSchema();

        StructuralMiniFlow.validateFlowConfiguration(schema).then(e=> {
            this.setState({loading: true})

            this.props.switchRunStatus('running')
            this.props.fetchMap.runtest({
                id: this.props.router.params.id,
                ...this.props.getSchema(),
            }).then((result: any)=> {

                switch(result.type) {
                    case 'miss': // 配置错误
                        this.dealMiss(result.fields)
                        break;
                    case 'done':
                    default:
                        this.props.switchRunStatus('runed', StructuralMiniFlow.walkThroughSnapshot(result.snapshot));
                    
                }
                //
                //this.setState({loading: false})
            }).catch((msg)=> {
               // this.setState({loading: false})
              // message.error(msg.message);
               this.props.switchRunStatus('')

            }).finally(()=> this.setState({loading: false}))

        }).catch(e=> {
            // tishi
        }) 

        
        
    }
    public render() {
       
        return (
            <div  className={classnames({
                'ui-runtest-toolbar': true,
                'ui-body-hidden': !this.state.openType
            })}>
                <div className='ui-header'>
                    <div className='ui-runtest-bar' >
                        <Button disabled={this.state.disabled} size='large' loading={this.state.loading} onClick={this.runTest} icon={<Icons.CaretRightFilled/>}>{i18n.t('Run test')}</Button>
                    </div>
                    <div className='ui-runtest-action'>
                        <Space size='large'>
                            <Segmented value={this.state.openType} options={[
                                {
                                    label: (<span><Icons.HistoryOutlined/> {i18n.t('Run History')}</span>),
                                    value: 'history'
                                }/*,
                                {
                                    label: (<span><Icons.IStatistics/> {i18n.t('Statistics')}</span>),
                                    value: 'statistics'
                                }*/
                            ]} onChange={this.onChange}></Segmented>
                        </Space>
                    </div>

                    <div className='ui-exte'>
                        <Space>
                            {false && this.state.openType=='history' && <Tooltip title={i18n.t('Filter dates for the history')}>
                                <DatePicker.RangePicker
                                    defaultValue={[this.state.historyStartDate && dayjs(decodeURIComponent(this.state.historyStartDate), this.dateFormat), this.state.historyEndDate && dayjs(decodeURIComponent(this.state.historyEndDate), this.dateFormat)]}
                                    format={this.dateFormat}
                                    size='small'
                                    onChange={this.onChangeRangeDate}
                                />
                            </Tooltip>}
                            {this.state.openType=='history' &&
                                <Radio.Group size="small"  value={this.state.historyType} onChange={this.onChangeType}>
                                    <Radio.Button value="test">{i18n.t('Test')}</Radio.Button>
                                    <Radio.Button value="prod">{i18n.t('Prod')}</Radio.Button>
                                    <Radio.Button value="completed">{i18n.t('Success')}</Radio.Button>
                                    <Radio.Button value="failed">{i18n.t('Failed')}</Radio.Button>
                                </Radio.Group>
                            }
                            <Tooltip title={i18n.t('Close the panel')}>
                                <Button onClick={this.onExpand} size="small" icon={<Icons.DownDirectivityOutlined/>}></Button>
                            </Tooltip>
                        </Space>
                    </div>
                </div>

                <div className='ui-body'>
                    {this.renderBody()}
                </div>
            </div>
        )
    }
}