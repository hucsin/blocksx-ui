
import { FetchPageResult, FetchResult } from '@blocksx/ui';

export interface FetchMap {
    [key:string]: (...any)=> Promise<FetchPageResult | FetchResult>
}