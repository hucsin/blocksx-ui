/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-09-24 08:28:10
 */
//import jsplumb from 'jsplumb'
const jsplumb = require('./ps');


for (let p in jsplumb.jsPlumb) {
    if (typeof jsplumb.jsPlumb[p] == 'string') {
        jsplumb.jsPlumb[p] = jsplumb.jsPlumb[p].replace(/jtk-/, 'flowchart-')
    }
}

export default jsplumb;
