export type Watermark = [number, number];

export declare class Report {
    constructor(opts: {
        exclude?: any[],
        include?: any[],
        reporter: string[],
        reportsDirectory?: string,
        tempDirectory?: string,
        watermarks?: Partial<{
            statements: Watermark;
            functions: Watermark;
            branches: Watermark;
            lines: Watermark;
        }>,
        omitRelative?: boolean,
        wrapperLength?: number,
        resolve?: string,
        all?: boolean,
        src?: Array<string>,
        allowExternal: boolean
    })
    run(): Promise<void>;
}
