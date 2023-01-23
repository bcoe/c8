export type Watermark = [number, number];

export declare class Report {
  constructor(opts: {
    exclude?: string | string[],
    extension?: string | string[],
    excludeAfterRemap?: boolean,
    include?: string | string[],
    reporter: string[],
    reportsDirectory?: string,
    reporterOptions?: Record<string, Record<string, unknown>>
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
    allowExternal?: boolean,
    skipFull?: boolean,
    excludeNodeModules?: boolean
  })
  run(): Promise<void>;
}
