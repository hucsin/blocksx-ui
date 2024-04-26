
import { ContextMenuItem } from '@blocksx/ui'

export type WidgetDirectionType = 'top' | 'bottom' | 'right' | 'left' | 'center';

export interface ContextMenuMap {
    [namespace: string]: ContextMenuItem[]
}