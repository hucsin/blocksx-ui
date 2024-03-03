
export interface IconProps {
    [key: string]: any;
    onClick?: Function;
}

export default class IconType {
    public static Directivity= 'directivity';/** 方向性 */
    public static Suggestion= 'suggestion'; /** 提示建议性 */
    public static Utility= 'utility'; /** 工具类 */
    public static Data= 'data'; /** 数据类 */

    public static Brand= 'brand'; /** 品牌标识 */

    public static Common= 'common'; /** 通用 */
}
