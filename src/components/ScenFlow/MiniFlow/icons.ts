let iconstring: any = {
    filter: `<svg viewBox="0 0 1024 1024" version="1.1" width="1em" height="1em" ><path d="M641.066667 500.821333v231.424l-256.213334 206.08V500.778667L84.736 213.333333V85.333333h854.826667v128z" {fill} ></path><path d="M641.066667 500.821333v231.424l-256.213334 206.08V500.778667L84.736 213.333333V85.333333h854.826667v128l-298.496 287.488z m-42.666667 210.986667v-229.12l298.496-287.488V128H127.402667v67.114667l300.117333 287.488v366.634666l170.88-137.429333z"></path></svg>`
}
export default {
    getEmptyFilter: ()=> {
        return iconstring.filter.replace(/\{fill\}/, 'fill="#FFFFFF"')
    },
    getFullFilter: () => {
        return iconstring.filter.replace(/\{fill\}/, '')
    }

}