
import { ContextMenuItem } from '../ContextMenu/typing';

export type WidgetDirectionType = 'top' | 'bottom' | 'right' | 'left' | 'center';

export interface ContextMenuMap {
    [namespace: string]: ContextMenuItem[]
}