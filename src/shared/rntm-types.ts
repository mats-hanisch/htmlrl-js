
export type RntmValuePrimitive = null | boolean | number | string;

export class RntmValueArray {
    constructor(public readonly values: readonly RntmValue[]) {
        Object.freeze(this.values);
        Object.freeze(this);
    }
}

export class RntmValueObject {
    constructor(public readonly props: { readonly [key: string]: RntmValue }) {
        Object.freeze(this.props);
        Object.freeze(this);
    }
}

export type RntmValue = RntmValuePrimitive | RntmValueArray | RntmValueObject;

export type RntmVarsMutable = { [key: string]: RntmValue };

export type RntmVars = { readonly [key: string]: RntmValue };
