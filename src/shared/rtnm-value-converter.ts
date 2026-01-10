import {
    InvalidRenderArgsPassedError,
    UninspectableRenderArgError,
    InvalidRenderArgError,
    InvalidRenderArgsCyclicReferenceError,
    InvalidRenderArgValueError
} from "../diagnostics/legacy/shared/legacy-render-arg-errors.js";

import RenderArgs from "./render-args.js";

import { RntmVars, RntmVarsMutable, RntmValue, RntmValueArray, RntmValueObject } from "./rntm-types.js";


export default class RntmValueConverter {
    public static validateAndConvertToRtnmVars(renderArgs: RenderArgs, filePath: string): RntmVars {
        let vars: RntmVarsMutable = Object.create(null);
        
        if (renderArgs === null || typeof renderArgs !== 'object' || Object.getPrototypeOf(renderArgs) !== Object.prototype) {
            // not a plain object - invalid
            throw new InvalidRenderArgsPassedError(renderArgs, filePath);
        }
        
        // store seen values
        const seenValues: WeakSet<object> = new WeakSet();
        
        for (const argName of Object.keys(renderArgs)) {
            // try to get descriptor of value
            const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(renderArgs, argName);
            
            if (desc === undefined) {
                // property cannot be accessed properly - something went wrong
                throw new UninspectableRenderArgError(argName, filePath);
            }
            
            if (!("value" in desc)) {
                throw new InvalidRenderArgError("Usage of getters/setters detected, which is not allowed. Only plain, stable data without dynamic properties may be used.", argName, filePath);
            }
            
            vars[argName] = RntmValueConverter.toRntmValue(
                argName,
                desc.value,
                seenValues,
                filePath
            );
        }
        
        return vars;
    }
    
    private static toRntmValue(
        argName: string,
        value: any,
        seenValues: WeakSet<object>,
        filePath: string
    ): RntmValue {
        // handle primitives
        const type = typeof value;
        
        if (value === null || type === "boolean" || type === "number" || type === "string") {
            return value;
        }
        
        // handle arrays and objects
        if (type === "object") {
            // cyclic reference detection
            if (seenValues.has(value)) {
                // detected cycle
                throw new InvalidRenderArgsCyclicReferenceError(filePath);
            }
            
            // mark value as seen already
            seenValues.add(value);
            
            // handle arrays
            if (Array.isArray(value)) {
                // convert items to rntm values
                const items = value.map((v, i) => RntmValueConverter.toRntmValue(argName, v, seenValues, filePath));
                
                // create and return array (will be frozen internally, no need to do it here)
                return new RntmValueArray(items);
            }
            
            // should be plain object
            if (Object.getPrototypeOf(value) !== Object.prototype) {
                // not a object - invalid
                throw new InvalidRenderArgValueError(argName, value, filePath, "Objects must be plain, stable data.");
            }
            
            const props: { [key: string]: RntmValue } = Object.create(null);
            
            for (const key of Object.keys(value)) {
                // try to get descriptor of value
                const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, key);
                
                if (desc === undefined) {
                    // property cannot be accessed properly - something went wrong
                    throw new UninspectableRenderArgError(key, filePath);
                }
                
                if (!("value" in desc)) {
                    throw new InvalidRenderArgError("Usage of getters/setters detected, which is not allowed. Only plain, stable data without dynamic properties may be used.", key, filePath);
                }
                
                props[key] = RntmValueConverter.toRntmValue(
                    key,
                    desc.value,
                    seenValues,
                    filePath
                );
            }
            
            return new RntmValueObject(props);
        }
        
        // everything else is invalid
        throw new InvalidRenderArgValueError(argName, value, filePath);
    }
    
    public static toHtmlString(value: RntmValue): string {
        if (value instanceof RntmValueArray) {
            // array
            
            const values: readonly RntmValue[] = value.values;
            const VALUES_LEN: number = values.length;
            
            const result: string[] = [];
            
            for (let i = 0; i < VALUES_LEN; i++) {
                result.push(RntmValueConverter.toHtmlString(values[i]!));
            }
            
            return `[${result.join(", ")}]`;
        }
        
        if (value instanceof RntmValueObject) {
            // object
            
            const values: { readonly [key: string]: RntmValue } = value.props;
            
            const result: string[] = [];
            
            for (const key of Object.keys(values)) {
                result.push(`${key}: ${RntmValueConverter.toHtmlString(values[key]!)}`);
            }
            
            return `{ ${result.join(", ")} }`;
        }
        
        // primitive - use default converting function
        return String(value);
    }
}
