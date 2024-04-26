import Tabler from './SmartPageTabler';
import Manger from '../core/SmartPageManger';
import Former from './SmartPageFormer';
import Tree from './SmartPageTree'

Manger.registoryComponent('tabler', Tabler);
Manger.registoryComponent('former', Former);
Manger.registoryComponent('tree', Tree);