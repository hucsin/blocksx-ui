
class ScopeManger {
    private cache: Record<string, any>;
    private cacheName: string;
    
    public constructor(cacheName: string = 'name') {
        this.cache = {};
        this.cacheName = cacheName
    }

    public set(key: string, value: any) {
        return this.cache[key] = value;
    }

    public get(key: string) {
        return this.cache[key];
    }

    public has(key: string) {
        return !!this.get(key)
    }

    public register(key: any, value?: any) {

        if (typeof key !=='string') {

            // 如果是
            if (Array.isArray(key)) {

                key.forEach(it => {
                    this.set(it[this.cacheName], it)
                })
            } else {

                Object.keys(key).forEach(it => {
                    this.set(it, key[it])
                })
            }
        } else {
            return this.set(key, value)
        }
    }

    public findGroup(group?:string) {
        let groupCache: any = {};
        for(let key in this.cache) {
            let item = this.cache[key];
            let group = item.group;

            if (!groupCache[group]) {
                groupCache[group] = []
            }

            groupCache[group].push(item)
        }
    }
}


export default new ScopeManger()