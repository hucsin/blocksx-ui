
import ScopeManger from './core/ScopeManger';


const functionconfig = {
    Math: ["abs:1:Group1", "acos:1:Group1", "asin:1:Group1", "atan:2:Group1", "ceil:2:Group2", "cos:1:Group2", "cosh:3:Group2", "floor:n:Group3", "log:2:Group3", "log2:1:Group3", "log10:1:Group3", "max:n:Group3", "min:n:Group3", "sin:2:Group3"],
    String: ["endsWith:1:GC", "startsWith:1:GC", "substring:2:GC", "toUpperCase:0:GC","trim:0:GC"],
    Array: ["from:n:GA:ArrayObject", "copyWithin:2:GQ:Number", "findIndex:1:GQ", "find:1:GQ", "findLast:1:GQ","findLastIndex:1:GQ","includes:1:GQ", "sort:1:FUN"],
    Object: ["keys:1:GP1", "assign:n:GP1", "entries:1:GP1:Number", "fromEntries:n:GP2"]
}

const DefaultType = {
    'Math': 'Number',
    'String': 'String',
    'Array': 'ArrayString',
    'Object': 'Object'
}
Object.keys(functionconfig).forEach(objectKey => {

    let funclist: any = functionconfig[objectKey];

    ScopeManger.register(funclist.map(fun=> {
        let split: string[] = fun.split(':');
        
        return {
            type: 'function',
            group: split[2],
            name: objectKey + '.'+split[0],
            description: objectKey + '.'+split[0] + objectKey + '.'+split[0] + 'regardless of its sign',
            parameters: split[1] == 'n' ?  [
                {
                    dataType: split[3] || DefaultType[objectKey],
                    name: 'n1',
                    description: 'n1'
                },
                {
                    type: 'rest',
                    maxLength: 4,
                    description: 'rest'
                }
            ] : Array.from({length:parseInt(split[1],10)}).map((it,idx)=> {
                return {
                    dataType:split[3] ||  DefaultType[objectKey],
                    name: [split[0], idx].join(''),
                    description: [split[0], idx].join('') +' call params'
                }
            }),
            returns: {
                dataType: DefaultType[objectKey]
            }
        }
    }))

})

const Scopeconfig = {
    Math: ["PI", "E"]
}
Object.keys(Scopeconfig).forEach(objectKey => {
    ScopeManger.register( Scopeconfig[objectKey].map(fun => {

        let split: string[] = fun.split(':');
        
        return {
            type: 'variable',
            group: split[2] ||'Default',
            name: objectKey + '.'+split[0],
            dataType: 'number',
            description: objectKey + '.'+split[0] + objectKey + '.'+split[0] + 'const of its sign',
            value: window[objectKey] && window[objectKey][fun] && split[0]
        }
    }))
})

console.log(ScopeManger)