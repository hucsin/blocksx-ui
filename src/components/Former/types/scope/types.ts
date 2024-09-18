
export interface Scope {
    $type: 'scope',
    value: any
}

export interface ScopeValue {
    $type: 'value',
    value: string | ScopeType[]
}

export interface ScopeFunction {
    $type: 'function',
    name: string,
    parameters: ScopeType[]
}

export type ScopeType = Scope | ScopeValue | ScopeFunction ;
