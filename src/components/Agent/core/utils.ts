import { utils } from '@blocksx/core';


export default class AgentUtils {

  public static css(element: any, property: any, value?: string): any {
    // 获取匹配的元素

    // 如果未提供 value，表示获取样式
    if (value === undefined && utils.isString(property)) {
      // 返回第一个匹配元素的指定样式
      return getComputedStyle(element)[property];
    } else {
      // 设置每个匹配元素的指定样式
      if (utils.isPlainObject(property)) {
        Object.keys(property).forEach(key => {
          element.style[key] = property[key];
        });
      } else {
        element.style[property] = value;
      }
    }

    return element;
  }

  public static proxy(fn, context) {
    // 返回一个新的函数
    return function (...args) {
      // 使用 apply 来调用原函数，设置上下文为 context，并传递参数
      return fn.apply(context, args);
    };
  }

  public static animate(element, properties, duration, callback) {
    const start = performance.now(); // 获取动画开始时间
    const initialStyles = {};

    // 存储初始样式
    for (let prop in properties) {
      initialStyles[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
    }

    function step(timestamp) {
      // 计算已过去的时间
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1); // 确保进度不超过 1

      // 更新样式
      for (let prop in properties) {
        const startValue = initialStyles[prop];
        const endValue = properties[prop];
        const currentValue = startValue + (endValue - startValue) * progress;
        element.style[prop] = currentValue + (isNaN(endValue) ? '' : 'px'); // 处理单位
      }

      // 如果动画未完成，继续调用 step
      if (progress < 1) {
        requestAnimationFrame(step);
      } else if (callback) {
        callback(); // 动画完成后调用回调
      }
    }

    requestAnimationFrame(step); // 开始动画
  }

  public static clientWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }
  public static clientHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }
  public static clientScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  public static clientScrollLeft() {
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0; // 获取当前的 scrollLeft 值

  }
  public static Deferred() {
    let state = 'pending'; // 状态: pending, resolved, rejected
    let resolvedCallbacks: any = [];
    let rejectedCallbacks: any = [];
    let value;

    function resolve(val) {
      if (state === 'pending') {
        state = 'resolved';
        value = val;
        resolvedCallbacks.forEach(callback => callback(value));
      }
    }

    function reject(val) {
      if (state === 'pending') {
        state = 'rejected';
        value = val;
        rejectedCallbacks.forEach(callback => callback(value));
      }
    }

    function getState() {
      return state;
    }

    function then(onResolved, onRejected) {
      if (state === 'resolved') {
        onResolved(value);
      } else if (state === 'rejected') {
        onRejected(value);
      } else {
        if (onResolved) {
          resolvedCallbacks.push(onResolved);
        }
        if (onRejected) {
          rejectedCallbacks.push(onRejected);
        }
      }
    }

    function done(callback) {
      if (state === 'resolved') {
        callback(value);
      } else if (state === 'pending') {
        resolvedCallbacks.push(callback);
      }
    }

    function promise() {
      return {
        getState: getState,
        then: then,
      };
    }

    return {
      resolve: resolve,
      reject: reject,
      state: getState,
      then: then,
      done,
      promise: promise,
    };
  }

  public static on(element, event, handler) {
    element.addEventListener(event, handler);
  }

  public static off(element, event, handler) {
    element.removeEventListener(event, handler);
  }
  public static offset(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }
  public static outerWidth(element, includeMargin = false) {
    const width = element.offsetWidth; // 包括边框和内边距
    return includeMargin ? width + parseFloat(getComputedStyle(element).marginLeft) + parseFloat(getComputedStyle(element).marginRight) : width;
  }
  public static outerHeight(element, includeMargin = false) {
    const height = element.offsetHeight; // 包括边框和内边距
    return includeMargin ? height + parseFloat(getComputedStyle(element).marginTop) + parseFloat(getComputedStyle(element).marginBottom) : height;
  }

  public static setStorage(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(utils.compress( value)));
    } catch (e) {
      console.error(e);
    }
  }
  public static getStorage(key: string, defaultValue: any = '[]') {
    try {
      let value: any = localStorage.getItem(key);

      let result: any = value ? utils.decompress(JSON.parse( value)) : null;
      console.log(result, 333)
      // TODO 
      
      return result.map(it => {
        return {
          ...it, 
          context: 'DrunkPerson'
        }
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
