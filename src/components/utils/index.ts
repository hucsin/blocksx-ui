
class Utils {

  getClientWidth() {
    return document.body.clientWidth
  }
  getClientHeight() {
    return document.documentElement.clientHeight;
  }
  setStorageItem(key: string, data: any) {

    let string = JSON.stringify(data);
    localStorage.setItem(key, string)
  }
  getStorageItem(key: string) {
    var state = localStorage.getItem(key);
    if (state) {
      return JSON.parse(state)
    }
  }

  dispatchResizeEvent() {
    let evt: any = document.createEvent('UIEvents');
    evt.initUIEvent('resize')
    window.dispatchEvent(evt);
  }
  getOffsetXY(evt: any) {
    if (evt.offsetX && evt.offsetY) {
      return { x: evt.offsetX, y: evt.offsetY };
    }

    var ele = evt.target || evt.srcElement;
    var o = ele;

    var x = 0;
    var y = 0;
    while (o.offsetParent) {
      x += o.offsetLeft;
      y += o.offsetTop;
      o = o.offsetParent;
    }
    // 处理当元素处于滚动之后的情况
    var left = 0;
    var top = 0
    while (ele.parentNode) {
      left += ele.scrollLeft;
      top += ele.scrollTop;
      ele = ele.parentNode;
    }
    return { x: evt.pageX + left - x, y: evt.pageY + top - y };

  }
}

export default new Utils();