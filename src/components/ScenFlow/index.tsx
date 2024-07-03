
import React from 'react';

import { UnlinkUtilityOutlined, RemoveUtilityFilled } from '../Icons'
import classnames from 'classnames';

import MiniFlow from './MiniFlow';

import './style.scss';

export default class ScenFlow extends React.Component<{}, {
    nodes: any[],
    connector: any[],
    actived: 'destory' | 'unlink' | 'none' | 'acting' | 'actived'
}> {
    private miniFlow: any;
    private responsePanel: any;
    private canvasPanel: any;
    private destoryPanel: any;
    private unlinkPanel: any;

    public constructor(props: any) {
        super(props);
        let json: any = null;
        try {
            json = JSON.parse(localStorage.getItem('__data__') || '')
        } catch (e) { }

        this.state = Object.assign({
            actived: 'none'

        }, json || {
            nodes: [
                {
                    id: 'f1',
                    type: 'go',
                    color: '#ffaacc',
                    left: 40,
                    top: 100
                }, {
                    id: 'f2',
                    type: 'router',
                    color: '#ccaadd',
                    left: 240,
                    top: 300
                }, {
                    id: 'f3',
                    type: 'module',
                    color: 'green',
                    left: 440,
                    top: 400
                }, {
                    id: 'f4',
                    type: 'module',
                    color: '#ccffaa',
                    left: 40,
                    top: 400
                }, {
                    id: 'f5',
                    type: 'module',
                    color: '#cfcfaa',
                    left: 640,
                    top: 440
                }, {
                    id: 'f6',
                    type: 'module',
                    color: '#ffeeaa',
                    left: 740,
                    top: 540
                },
                {
                    id: 'f7',
                    type: 'go',
                    color: '#ffaacc',
                    left: 840,
                    top: 400
                },
                {
                    id: 'f8',
                    type: 'go',
                    color: '#ffaacc',
                    left: 840,
                    top: 500
                },
                {
                    id: 'f9',
                    type: 'go',
                    color: '#ffaacc',
                    left: 840,
                    top: 600
                }
            ],
            connector: [
                {
                    source: 'f1',
                    target: 'f2'
                },
                {
                    source: 'f2',
                    target: 'f3'
                },
                {
                    source: 'f2',
                    target: 'f4'
                },
                {
                    source: 'f3',
                    target: 'f5'
                }
            ]
        })
    }
    public componentDidMount() {

        this.miniFlow = new MiniFlow({
            canvas: 'canvas',
            
            unlinkChinampaPanel: this.unlinkPanel,
            destoryChinampaPanel: this.destoryPanel,
            chinampaPanel: this.responsePanel,

            templateMap: {
                router: {
                    type: 'router',
                    color: '#ccaadd'
                },
                new: {
                    type: 'empty',
                    color:'#ccc'
                }
            },
            nodes: this.state.nodes,
            connector: this.state.connector
        });

        this.bindEvent();
    }
    private bindEvent() {
        this.miniFlow.on('onChange', (data) => {

            this.setState({
                nodes: data.nodes,
                connector: data.connector
            }, () => {
                
                localStorage.setItem('__data__', JSON.stringify(data))
            })
        })
    }
    
    public render() {
        return (<div className='scenflow-draggle-wrapper' draggable>
            <div style={{position: 'absolute',padding: 10,left: 0,top: 0,zIndex: 22222222}}>
                <button onClick={() => {
                    this.miniFlow.doFormatNodeCanvas()
                }}>格式化</button>
                <button onClick={()=> {
                    this.miniFlow.cavnasDraggable.setZoom(.5)
                }}>显示区</button>
                
            </div>
            
            <div className={classnames({
                'scenflow-response-wrapper': true
            })}
                ref={(ref) => this.responsePanel = ref}
            >
                <div
                    ref={(ref) => { this.destoryPanel = ref }}
                    className={classnames({
                        'scenflow-response-item': true
                    })
                    }>
                    <RemoveUtilityFilled />
                </div>
                <div
                    ref={(ref) => { this.unlinkPanel = ref }}
                    className={classnames({
                        'scenflow-response-item': true
                    })
                    }>
                    <UnlinkUtilityOutlined />
                </div>
            </div>
            <div
                className='scenflow-wrapper' id="canvas"
                ref={ref => this.canvasPanel = ref}
            >
                {this.state.nodes.map(it => {
                    return (
                        <div key={it.id} className={classnames({
                            'scenflow-node': true,
                            'scenflow-node-new': it.isNew
                        })} style={{ backgroundColor: it.color, left: it.left, top: it.top }} id={it.id}>
                            <div >{it.id}<br />({it.left}, {it.top})</div>
                        </div>
                    )
                })}
            </div>

            <>
                    <div className='scenflow-add' key={1} data-type="router">新增<br />router</div>
                    <div className='scenflow-add' key={22} data-type="module">新增<br />module</div>
                </>
        </div>)
    }
}   