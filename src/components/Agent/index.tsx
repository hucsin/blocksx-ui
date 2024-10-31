import React from 'react';
import { utils } from '@blocksx/core';

import SmartRequest from '../utils/SmartRequest';

import AgentAnimator from './core/animator';
import AgentLoader from './core/loader';
import AgentUtils from './core/utils';
import AgentQueue from './core/queue';
import Dialogue from './components/Dialogue';
import './style.scss';

interface AgentProps {
    name: string;
}


function _test_getMessages(name: string) {
    let testMessages = [
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you?`,
            display: {
                type: 'value',
                value: Array.from({length: 11}).map((_, index) => ({
                    userName: `user${index}@izao.cc`,
                    Avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                    Email: `user${index}@izao.cc`,
                    Phone: `1380013800${index}`,
                    Company: 'Anyhubs',
                    Department: 'Development',
                    Position: 'Developer',
                }))
            }
        },
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you?`,
            display: {
                type: 'value',
                value: {
                    userName: 'user@izao.cc',
                    Avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                    Email: 'user@izao.cc',
                    Phone: '13800138000',
                    Company: 'Anyhubs',
                    Department: 'Development',
                    Position: 'Developer',
                }
            }
            
        },
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you?`,
            display: {
                type: 'feedback',
                status: 'success',
                message: 'Create Success  [link to](http://a.com.xxxx)',
            }
        },
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you ?`,
            display: {
                type: 'feedback',
                status: 'error',
                message: 'Create Error [link to](http://a.com.xxxx) ',
            }
        },
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you?`,
            display: {
                type: 'choose',
                //tips: 'Please select one {name} below.',
                dataSource: Array.from({length: 10}).map((_, index) => ({
                    value: `value${index}`,
                    label: `label${index}`,
                    description: `description${index}`,
                })),
                app: {
                    name: 'GoogleSheet',
                    icon: 'GoogleSheetsBrandFilled',
                }
            }
            
        },
        {
            type: 'assistant',
            content: `Hello, I am your assistant ${name}. How can I help you?`,
            display: {
                type: 'former',
                app: {
                    name: 'GoogleSheet',
                    icon: 'GoogleSheetsBrandFilled',
                },
                first: {
                    name: 'ddid',
                    type: 'choose',
                    dataSource: Array.from({length: 10}).map((_, index) => ({
                        value: `value${index}`,
                        label: `label${index}`,
                        description: `description${index}`,
                    }))
                },
                value: {},
                schema: {
                    type: 'object',
                    properties: {
                        userName: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            
                        },
                        whereEvent: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            default: 'userName',
                            enum: ["userName", "classType"]
                        },
                        place: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            maxLength: 255
                        },
                        number: {
                            type: 'number',
                            description: 'Please input one xx below.',
                            minimum: 1,
                            maximum: 100
                        },
                        boolean: {
                            type: 'boolean',
                            description: 'Please select one xx below.',
                        },
                        date: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            format: 'date'
                        },
                        datetime: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            format: 'date-time'
                        },
                        time: {
                            type: 'string',
                            description: 'Please select one xx below.',
                            format: 'time'
                        }
                    },
                    required: ['userName', 'number', 'whereEvent', 'date', 'datetime', 'time']
                }
            }
            
        }
    ]

    let index: number = Math.floor(Math.random() * (testMessages.length));
    
    return testMessages[index] || testMessages[0];
}


export default class Agent extends React.Component<AgentProps, {open: boolean}> {
    private animator:AgentAnimator;
    private queue:AgentQueue;
    private loader:AgentLoader;
    private ref: React.RefObject<HTMLDivElement>;
    private enterTimeout: any;
    private isDraging: any;
    private _hidden:boolean;
    private _idleDfd:any;
    private _targetX:any;
    private _targetY:any;
    private _offset:any;
    private _moveHandle:any;
    private _upHandle:any;
    private _dragUpdateLoop:any;
    private searching:boolean;
    private sendHelper: any;

    public constructor(props: any) {
        super(props);
        //hooks
        window['Agent'] = this;

        this.ref = React.createRef();
        this.loader = new AgentLoader(props.name);
        
        this.sendHelper = SmartRequest.makePostRequest('/api/agent/send');

        this.state = {
            open: false,
        }
    }
    public async componentDidMount() {
        let { sounds, agent}:any = await this.loader.load()
        this.queue = new AgentQueue(this.onQueueEmpty);
        this.animator = new AgentAnimator(
            this.ref.current, 
            this.loader.path, 
            agent, 
            sounds
        );
        this.searching = false;
        this._setupEvents();

        setTimeout(()=> {
            this.show();
        }, 1000)
    }
    /***
     *
     * @param {Number} x
     * @param {Number} y
     */
    public gestureAt (x:number, y:number) {
        let d:any = this._getDirection(x, y);
        let gAnim = 'Gesture' + d;
        let lookAnim = 'Look' + d;

        let animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
        return this.play(animation);
    }

    /***
     *
     * @param {Boolean=} fast
     *
     */
    public hide (fast:boolean, callback:any) {
        this._hidden = true;
        let el = this.ref.current;
        if (!el) return;

        this.stop();
        if (fast) {
            el.style.display = 'none';
            this.stop();
            this.pause();
            if (callback) callback();
            return;
        }

        return this.playInternal('Hide', function () {
            
            el.style.display = 'none';
            this.pause();
            if (callback) callback();
        })
    }


    public moveTo (x, y, duration) {
        var dir = this._getDirection(x, y);
        var anim = 'Move' + dir;
        if (duration === undefined) duration = 1000;

        this.addToQueue(function (complete) {
            // the simple case
            if (duration === 0) {
                AgentUtils.css(this.ref.current, {top:y + 'px', left:x + 'px'});
                
                this.reposition();
                complete();
                return;
            }

            // no animations
            if (!this.hasAnimation(anim)) {
                AgentUtils.animate(this.ref.current, {top:y + 'px', left:x + 'px'}, duration, complete);
                return;
            }

            var callback = AgentUtils.proxy(function (name:string, state:number) {
                // when exited, complete
                if (state === AgentAnimator.States.EXITED) {
                    complete();
                }
                // if waiting,
                if (state === AgentAnimator.States.WAITING) {
                    AgentUtils.animate(this.ref.current, {top:y, left:x}, duration, AgentUtils.proxy(function () {
                        // after we're done with the movement, do the exit animation
                        this.animator.exitAnimation();
                    }, this));
                }

            }, this);

            this.playInternal(anim, callback);
        }, this);
    }

    private playInternal  = (animation:string, callback:any)=> {

        // if we're inside an idle animation,
        if (this._isIdleAnimation() && this._idleDfd && this._idleDfd.state() === 'pending') {
            this._idleDfd.done(AgentUtils.proxy(function () {
                this.playInternal(animation, callback);
            }, this))
        }

        this.animator.showAnimation(animation, callback);
    }

    public play (animation:string, timeout:number = 5000, cb?:any) {
        if (!this.hasAnimation(animation)) return false;

        this.addToQueue(function (complete) {
            var completed = false;
            // handle callback
            var callback = function (name:string, state:number) {
                if (state === AgentAnimator.States.EXITED) {
                    completed = true;
                    if (cb) cb();
                    complete();
                }
            };

            // if has timeout, register a timeout function
            if (timeout) {
                window.setTimeout(AgentUtils.proxy(function () {
                    if (completed) return;
                    // exit after timeout
                    this.animator.exitAnimation();
                }, this), timeout)
            }

            this.playInternal(animation, callback);
        }, this);

        return true;
    }

    /***
     *
     * @param {Boolean=} fast
     */
    public show (fast?: boolean) {

        this._hidden = false;

        if (!this.ref.current) return;

        if (fast) {
            this.ref.current.style.display = 'block';
            this.resume();
            this.onQueueEmpty();
            return;
        }
        
        //if (this.ref.current.style.top === 'auto' || (!AgentUtils.css(this.ref.current, 'left') as any == 'auto')) {
        let frameSize = this.animator.getFrameSize();
        var left = AgentUtils.clientWidth() - frameSize[0];
        var top = (AgentUtils.clientHeight() + AgentUtils.clientScrollTop()) - frameSize[1] - 20;
        AgentUtils.css(this.ref.current, {top:top + 'px', left:left + 'px'});
        //}

        this.resume();
        return this.play('Show');
    }

    /***
     *
     * @param {String} text
     */
    public speak (text:string, hold:boolean) {
        this.addToQueue(function (complete) {
            //this._balloon.speak(complete, text, hold);
        }, this);
    }


    /***
     * Close the current balloon
     */
    public closeBalloon () {
       // this._balloon.hide();
    }

    public delay (time:number) {
        time = time || 250;

        this.addToQueue(function (complete) {
            this.onQueueEmpty();
            window.setTimeout(complete, time);
        });
    }

    /***
     * Skips the current animation
     */
    public stopCurrent () {
        this.animator.exitAnimation();
        //this._balloon.close();
    }


    public stop () {
        // clear the queue
        this.queue.clear();
        this.animator.exitAnimation();
        //this._balloon.hide();
    }

    /***
     *
     * @param {String} name
     * @returns {Boolean}
     */
    public hasAnimation (name:string) {
        return this.animator.hasAnimation(name);
    }

    /***
     * Gets a list of animation names
     *
     * @return {Array.<string>}
     */
    public animations () {
        return this.animator.animations();
    }

    /***
     * Play a random animation
     * @return {jQuery.Deferred}
     */
    public animate () {
        let animations = this.animations();
        let anim = animations[Math.floor(Math.random() * animations.length)];
        // skip idle animations
        if (anim.indexOf('Idle') === 0) {
            return this.animate();
        }
        return this.play(anim);
    }

    /**************************** Utils ************************************/

    /***
     *
     * @param {Number} x
     * @param {Number} y
     * @return {String}
     * @private
     */
    private _getDirection (x:number, y:number) {
        if (!this.ref.current) return;
        let offset = AgentUtils.offset(this.ref.current);
        let h = AgentUtils.outerHeight(this.ref.current);
        let w = AgentUtils.outerWidth(this.ref.current);

        let centerX = (offset.left + w / 2);
        let centerY = (offset.top + h / 2);


        let a = centerY - y;
        let b = centerX - x;

        let r = Math.round((180 * Math.atan2(a, b)) / Math.PI);

        // Left and Right are for the character, not the screen :-/
        if (-45 <= r && r < 45) return 'Right';
        if (45 <= r && r < 135) return 'Up';
        if (135 <= r && r <= 180 || -180 <= r && r < -135) return 'Left';
        if (-135 <= r && r < -45) return 'Down';

        // sanity check
        return 'Top';
    }

    /**************************** Queue and Idle handling ************************************/

    /***
     * Handle empty queue.
     * We need to transition the animation to an idle state
     * @private
     */
    private onQueueEmpty =()=> {
        if (this._hidden || this._isIdleAnimation()) return;
        let idleAnim = this._getIdleAnimation();
        this._idleDfd = AgentUtils.Deferred();

        this.animator.showAnimation(idleAnim, AgentUtils.proxy(this._onIdleComplete, this));
    }   

    private _onIdleComplete (name:string, state:number) {
        if (state === AgentAnimator.States.EXITED) {
            this._idleDfd.resolve();
        }
    }


    /***
     * Is the current animation is Idle?
     * @return {Boolean}
     * @private
     */
    private  _isIdleAnimation () {
        let c = this.animator.currentAnimationName;
        return c && c.indexOf('Idle') === 0;
    }


    /**
     * Gets a random Idle animation
     * @return {String}
     * @private
     */
    private _getIdleAnimation () {
        let animations = this.animations();
        let r:any = [];
        for (let i = 0; i < animations.length; i++) {
            let a = animations[i];
            if (a.indexOf('Idle') === 0) {
                r.push(a);
            }
        }

        // pick one
        var idx = Math.floor(Math.random() * r.length);
        return r[idx];
    }

    /**************************** Events ************************************/

    private _setupEvents () {
        AgentUtils.on(window, 'resize', this.reposition);

        AgentUtils.on(this.ref.current, 'mousedown', this._onMouseDown);
        AgentUtils.on(this.ref.current, 'mouseenter', this.lazyShowDialogure);
        AgentUtils.on(this.ref.current, 'mouseleave', () => {
            clearTimeout(this.enterTimeout);
        });
        AgentUtils.on(this.ref.current, 'mouseover', this._onDoubleClick);
    }   

    private _onDoubleClick = () => {
        if (!this.play('ClickedOn')) {
            this.animate();
        }
    }

    private lazyShowDialogure =()=> {

        if (this.isDraging) return;
        if (this.enterTimeout) {
            window.clearTimeout(this.enterTimeout);
            this.enterTimeout = null;
        }
        this.enterTimeout = window.setTimeout(()=> {
            this.setState({open: true});
        }, 500);
    }

    private reposition = () => {
        
        if (!this.ref.current || !AgentUtils.css(this.ref.current, 'display') as any === 'none') return;

        var o = AgentUtils.offset(this.ref.current);
        var bH = AgentUtils.outerHeight(this.ref.current);
        var bW = AgentUtils.outerWidth(this.ref.current);

        var wW = AgentUtils.clientWidth();
        var wH = AgentUtils.clientHeight();
        var sT = AgentUtils.clientScrollTop();
        var sL = AgentUtils.clientScrollLeft();

        var top = o.top - sT;
        var left = o.left - sL;
        var m = 5;
        if (top - m < 0) {
            top = m;
        } else if ((top + bH + m) > wH) {
            top = wH - bH - m;
        }

        if (left - m < 0) {
            left = m;
        } else if (left + bW + m > wW) {
            left = wW - bW - m;
        }

        AgentUtils.css(this.ref.current, {left:left + 'px', top:top +'px'});
        // reposition balloon
       // this._balloon.reposition();
    }

    private _onMouseDown =(e:any) => {
        e.preventDefault();
        this._startDrag(e);
    }


    /**************************** Drag ************************************/

    private _startDrag (e:any) {
        // pause animations
        this.pause();
        //this._balloon.hide(true);
        this._offset = this._calculateClickOffset(e);

        this._moveHandle = this._dragMove;
        this._upHandle = this._finishDrag;

        AgentUtils.on(window, 'mousemove', this._moveHandle);
        AgentUtils.on(window, 'mouseup', this._upHandle);

        this._dragUpdateLoop = window.setTimeout(this._updateLocation, 10);
        this.enterTimeout && window.clearTimeout(this.enterTimeout);
    }

    private _calculateClickOffset (e:any) {
        let mouseX = e.pageX;
        let mouseY = e.pageY;

        if (!this.ref.current) return {top:0, left:0};

        let o = AgentUtils.offset(this.ref.current);
        return {
            top:mouseY - o.top,
            left:mouseX - o.left
        }

    }

    private _updateLocation = () => {
        AgentUtils.css(this.ref.current, {top:this._targetY + 'px', left:this._targetX + 'px'});
        this._dragUpdateLoop = window.setTimeout(this._updateLocation, 10);
    }

    private _dragMove = (e:any) => {
        e.preventDefault();
        let x = e.clientX - this._offset.left;
        let y = e.clientY - this._offset.top;
        this._targetX = x;
        this._targetY = y;
        this.isDraging = true;
        if ( this.state.open) {
            this.enterTimeout && window.clearTimeout(this.enterTimeout);
            this.setState({open: false});
        }
    }

    private _finishDrag = () => {
        window.clearTimeout(this._dragUpdateLoop);
        // remove handles
        AgentUtils.off(window, 'mousemove', this._moveHandle);
        AgentUtils.off(window, 'mouseup', this._upHandle);
        // resume animations
        //this._balloon.show();
        this.isDraging = false;
        this.reposition();
        this.resume();
        
        if (!this.state.open ) {
            this.setState({open: true});
        }
    }

    private addToQueue (func:any, scope?:any) {
        if (scope) func = AgentUtils.proxy(func, scope);
        this.queue.queue(func);
    }

    /**************************** Pause and Resume ************************************/

    public pause () {
        this.animator.pause();
        //this._balloon.pause();

    }

    public resume () {
        this.animator.resume();
        //this._balloon.resume();
    }

    public setSounds(name: string, sounds: any) {
        this.loader.soundsReady(name, sounds);
    }
    public setAgent(name:string, agent: any) {
        this.loader.agentReady(name, agent)
    }
    private onSubmit = (message: any, type: string = 'Searching') => {
        
        this.searching = true;
        this.queue.clear();
        console.log(message, 'showmemeeme')
        this.keepPlay(type, ()=> {
            return !this.searching;
        });

        return this.sendHelper({
            message
        }).then((result: any) => {
            return result;
        }).finally(() => {
            this.searching = false;
        });
    }

    /**
     * 
     * @param action 
     * @param check 
     */
    public keepPlay (action: string, check: () => boolean) {
        this.play(action, undefined, ()=> {
            if (!check()) {
                this.keepPlay(action, check);
            }
        })
    }


    public render() {
        return (
            <div className='agents' ref={this.ref}>
                <Dialogue 
                    name={utils.upperFirst(this.props.name)}
                    onSubmit={this.onSubmit}
                    open={this.state.open}
                    onOpenChange={(open)=> {
                        if (!open) {
                            this.setState({open});
                        }
                    }}
                    efficiency={['Planning', 'Memory', 'Public Data', 'Actions', 'Application', 'Knowledge', 'Helper'].map((it, index) => ({
                        label: it,
                        key: index + 1,
                        icon: 'EfficiencyUtilityOutlined',
                        children: Array.from({length: 10}).map((it, idx) => ({
                            label: `Efficiency ${index + 1}-${idx + 1}`,
                            key: `${index + 1}-${idx + 1}`,
                            children: Array.from({length: 10}).map((it, dd) => ({
                                label: `Efficiency ${index + 1}-${dd + 1}`,
                                key: `${index + 1}-${dd + 1}-${idx + 1}`,
                                assistant: _test_getMessages(this.props.name)
                            }))
                        }))
                    }))}
                >
                    <div className='inner'></div>
                </Dialogue>
            </div>
        )
    }
}