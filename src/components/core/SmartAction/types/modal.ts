import { Modal } from 'antd';
export default (params: any, callback: Function, cancel?: Function)  => {
    Modal.confirm({
        title: params.title,
        content: params.content || '',
        okText: params.okText || 'Submit',
        onOk: () => {
            return callback && callback()
        },
        onCancel: () => {
            return cancel && cancel();
        }
    })
}