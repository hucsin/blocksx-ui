import { pluginManager } from '../../core/manager/index';
import HistoryPanel from './HistoryPanel';
import RecordPanel from './RecordPanel';


pluginManager.register(['FEEDBACK', 'PANEL', 'HISTORY'], new HistoryPanel());
pluginManager.register(['FEEDBACK', 'PANEL', 'RECORD'], new RecordPanel());


export { default as HistoryMetaData } from './HistoryPanel/meta';
export { default as RecordMetaData } from './RecordPanel/meta';