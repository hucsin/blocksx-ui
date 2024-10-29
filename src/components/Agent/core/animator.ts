import AgentUtils from './utils';

export default class AgentAnimator {
    private _el:any;
    private _data:any;
    private _path:string;
    private _currentFrameIndex:number;
    private _currentFrame:any;
    private _exiting:boolean;
    private _currentAnimation:any;
    private _endCallback:any;
    private _started:boolean;
    private _sounds:any;
    private _overlays:any[];
    private _loop:any;
    public currentAnimationName?:any;

    public static States = { WAITING: 1, EXITED: 0 };

    constructor(el, path, data, sounds) {
        this._el = el;
        this._data = data;
        this._path = path;
        this._currentFrameIndex = 0;
        this._currentFrame = undefined;
        this._exiting = false;
        this._currentAnimation = undefined;
        this._endCallback = undefined;
        this._started = false;
        this._sounds = {};
        this.currentAnimationName = undefined;
        //this.preloadSounds(sounds);
        this._overlays = [this._el];
        let curr = this._el;

        this._setupElement(this._el);
        for (let i = 1; i < this._data.overlayCount; i++) {
            const inner = this._setupElement(document.createElement('div'));
            //curr.append(inner);
            curr.appendChild(inner);
            this._overlays.push(inner);
            curr = inner;
        }
    }
    public getFrameSize() {
        return this._data.framesize;
    }
    _setupElement(el) {
        const frameSize = this._data.framesize;
        
        return AgentUtils.css(el, {
            display: "none",
            width: frameSize[0] +'px',
            height: frameSize[1] +'px',
            background: `url(${this._path}/map.png) no-repeat`
        })
    }

    animations() {
        const r:any[] = [];
        const d = this._data.animations;
        for (const n in d) {
            r.push(n);
        }
        return r;
    }

    preloadSounds(sounds) {
        for (let i = 0; i < this._data.sounds.length; i++) {
            const snd = this._data.sounds[i];
            const uri = sounds[snd];
            if (!uri) continue;
            this._sounds[snd] = new Audio(uri);
        }
    }

    hasAnimation(name) {
        return !!this._data.animations[name];
    }

    exitAnimation() {
        this._exiting = true;
    }

    showAnimation(animationName, stateChangeCallback) {
        this._exiting = false;

        if (!this.hasAnimation(animationName)) {
            return false;
        }

        this._currentAnimation = this._data.animations[animationName];
        this.currentAnimationName = animationName;

        if (!this._started) {
            this._step();
            this._started = true;
        }

        this._currentFrameIndex = 0;
        this._currentFrame = undefined;
        this._endCallback = stateChangeCallback;

        return true;
    }

    _draw() {
        let images = [];
        if (this._currentFrame) images = this._currentFrame.images || [];

        for (let i = 0; i < this._overlays.length; i++) {
            if (i < images.length) {
                const xy = images[i];
                const bg = -xy[0] + 'px ' + -xy[1] + 'px';
                AgentUtils.css(this._overlays[i], {
                    'background-position': bg,
                    display: 'block'
                });
            } else {
                AgentUtils.css(this._overlays[i], 'display', 'none');
            }
        }
    }

    _getNextAnimationFrame() {
        if (!this._currentAnimation) return undefined;
        if (!this._currentFrame) return 0;
        const currentFrame = this._currentFrame;
        const branching = this._currentFrame.branching;

        if (this._exiting && currentFrame.exitBranch !== undefined) {
            return currentFrame.exitBranch;
        } else if (branching) {
            let rnd = Math.random() * 100;
            for (let i = 0; i < branching.branches.length; i++) {
                const branch = branching.branches[i];
                if (rnd <= branch.weight) {
                    return branch.frameIndex;
                }
                rnd -= branch.weight;
            }
        }

        return this._currentFrameIndex + 1;
    }

    _playSound() {
        const s = this._currentFrame.sound;
        if (!s) return;
        //const audio = this._sounds[s];
        //if (audio) audio.play();
    }

    _atLastFrame() {
        return this._currentFrameIndex >= this._currentAnimation.frames.length - 1;
    }

    _step() {
        if (!this._currentAnimation) return;
        const newFrameIndex = Math.min(this._getNextAnimationFrame(), this._currentAnimation.frames.length - 1);
        const frameChanged = !this._currentFrame || this._currentFrameIndex !== newFrameIndex;
        this._currentFrameIndex = newFrameIndex;

        if (!(this._atLastFrame() && this._currentAnimation.useExitBranching)) {
            this._currentFrame = this._currentAnimation.frames[this._currentFrameIndex];
        }

        this._draw();
        this._playSound();

        this._loop = window.setTimeout(() => this._step(), this._currentFrame.duration);

        if (this._endCallback && frameChanged && this._atLastFrame()) {
            if (this._currentAnimation.useExitBranching && !this._exiting) {
                this._endCallback(this.currentAnimationName, AgentAnimator.States.WAITING);
            } else {
                this._endCallback(this.currentAnimationName, AgentAnimator.States.EXITED);
            }
        }
    }

    pause() {
        window.clearTimeout(this._loop);
    }

    resume() {
        this._step();
    }
}
