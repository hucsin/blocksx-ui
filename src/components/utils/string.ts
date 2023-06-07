/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-11-21 14:42:47
 */
export const  getRealLength = ( str: string) => {
    return str.replace(/[^\x00-\xff]/g, "**").length
}

export const template = (str: string, obj: any) => {
    return str.replace(/\{([^\}]+)\}/, (_, $1)=> {
        return obj[$1];
    })
}