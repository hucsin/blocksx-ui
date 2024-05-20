class BlockManger {
    public map: any ;
    public constructor() {
        this.map = {};
    }

    public set(blockType: string, block: any) {
        this.map[blockType] = block;
    }

    public has(blockType) {
        return this.map[blockType] !== undefined;
    }

    public get(blockType) {
        return this.map[blockType];
    }
}

export default new BlockManger();