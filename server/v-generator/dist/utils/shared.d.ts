export declare const rewritePkg: (dir: string, cb: (it: Record<string, string>) => void) => Promise<void>;
export declare const compile: (source: string, data: Record<string, string>) => string;
export declare const copy: () => void;
