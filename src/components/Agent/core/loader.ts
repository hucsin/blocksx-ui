export default class AgentLoader {
    public static BASE_PATH = 'https://izao.cc/agent/';
    public path: string;
    private name: string;
    public static loadMap: any = {};
    public static loadSounds: any = {};
    public static loadAgent: any = {};
    public constructor(name: string) {
        this.path = AgentLoader.BASE_PATH + name;
        this.name = name;
    }
    public async load() {
        let map: any = await this.loadMap(this.path);
        //let sounds: any = await this.loadSounds(this.name, this.path);
        let agent: any = await this.loadAgent(this.name, this.path);

        return {
            map,
            sounds: {},
            agent
        }
    }
    /**加载map */
    private async loadMap(path: string) {
        return new Promise((resolve, reject) => {

            if (AgentLoader.loadMap[path]) {
                return resolve(true);
            }
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.setAttribute('src', path + '/map.png');
        });
    }
    private async loadSounds(name: string, path: string) {
        return new Promise((resolve, reject) => {
            if (AgentLoader.loadSounds[name]) {
                return resolve(AgentLoader.loadSounds[name]);
            }


            let audio = document.createElement('audio');
            let canPlayMp3 = !!audio.canPlayType && "" != audio.canPlayType('audio/mpeg');
            let canPlayOgg = !!audio.canPlayType && "" != audio.canPlayType('audio/ogg; codecs="vorbis"');

            if (!canPlayMp3 && !canPlayOgg) {
                resolve({});
            } else {
                // load
                this.loadScript(
                    path + (canPlayMp3 ? '/sounds-mp3.js' : '/sounds-ogg.js')
                );

                AgentLoader.loadSounds[name] = {
                    resolve
                }
            }
        });
    }
    private async loadAgent(name: string, path: string) {
        return new Promise((resolve, reject) => {
            if (AgentLoader.loadAgent[name]) {
                return resolve(AgentLoader.loadAgent[name]);
            }
            this.loadScript(path + '/agent.js');
            AgentLoader.loadAgent[name] = {
                resolve
            }
        });
    }

    private loadScript(src: string) {

        let script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('async', 'async');
        script.setAttribute('type', 'text/javascript');
        document.head.appendChild(script);
    }

    public agentReady(name: string, data: any) {
        if (AgentLoader.loadAgent[name] && AgentLoader.loadAgent[name].resolve) {
            AgentLoader.loadAgent[name].resolve(data);
            AgentLoader.loadAgent[name] = data;
        }
    }
    public soundsReady(name: string, data: any) {
        if (AgentLoader.loadSounds[name] && AgentLoader.loadSounds[name].resolve) {
            AgentLoader.loadSounds[name].resolve(data);
            AgentLoader.loadSounds[name] = data;
        }
    }
}
