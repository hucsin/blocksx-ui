class SmartPageManger {
    private pageComponentMap:Map<string, any> = new Map()

    public has(type:string) {
        return this.pageComponentMap.has(type);
    }

    public registoryComponent(type: string, component: any) {
        return this.pageComponentMap.set(type, component)
    }

    public findComponentByType (type: string) {
        if (this.has(type)) {
            return this.pageComponentMap.get(type)
        }
    }
}

export default new SmartPageManger();