import { keypath as UTILKeypath } from '@blocksx/core';
export default {
    getJSONByKeypath(schema:any, keypath:any) {
        let trueKeypath: string = keypath.replace(/^\$[a-zA-Z0-9\_\-]+\./, '').replace(/^outputs(\.?)/,'');

        // 替换[]
        trueKeypath = trueKeypath.replace(/\[\]([\.]?)/img, (_, dot) => {
            // [].  items.properties 
            // [] items
            return dot ? 'items.properties.' : 'items'
        })
        
        let short: any = UTILKeypath.get(schema, trueKeypath);
        
        return short ? {
            ...short,

            name: keypath,
            description: schema.description,
            iterator: schema.iterator,
        }: schema;
    }
}