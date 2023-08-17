import { pluginManager } from '../../core/manager/index';
import HistoryPanel from './HistoryPanel';


pluginManager.register(['FEEDBACK', 'PANEL', 'HISTORY'], new HistoryPanel())