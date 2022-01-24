const paths: string[] = [];

export const getPaths = (): Readonly<string[]> => paths;

export const addPath = (path: string) => paths.push(path);
