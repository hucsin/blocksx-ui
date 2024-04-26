class EditorConfig {
    
    private config: any ;

    public constructor() {
        this.config = {};
    }

    /**
     * 是否存在
     * @param key 
     * @returns 
     */
    public has(key: string) {
        return !!this.config[this.toUpperCase(key)]
    }
    /**
     * 获取配置
     * @param key 
     * @returns 
     */
    public get(key: string) {
        return this.config[this.toUpperCase(key)]
    }
    /**
     *  设置配置
     * @param key 
     * @param value 
     * @returns 
     */
    public set(key: string, value: string) {
        return this.config[this.toUpperCase(key)] = value;
    }

    public toUpperCase(key: string) {
        return key ? key.toUpperCase() : '';
    }
}


export default new EditorConfig();