
class SmartActionWindow {
    public doAction(params: Record<string, any>, callback: Function) {
        
        let screenWidth = window.screen.width;
        let screenHeight = window.screen.height;
        let windowWidth = Math.min(1000, screenWidth -  300);
        let windowHeight = Math.min(700, screenHeight - 200);

        window.open(params.url, params.id, `width=${windowWidth},height=${windowHeight},top=${(screenHeight-windowHeight)/2},left=${(screenWidth-windowWidth)/2},menubar=no,toolbar=no,resizable=no,focus=1`)

        let timer = setInterval((message) => {
            //console.log(currentWindow,122, currentWindow.closed, 33333)
            
            if (message = localStorage.getItem("message")) {
                callback(message);
                clearInterval(timer);
                localStorage.removeItem('message')
            }
        }, 200)
    }
}

const instance = new SmartActionWindow();

export default (params: any ,callback: Function)=> {
    instance.doAction(params, callback)
}