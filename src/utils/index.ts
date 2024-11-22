export async function readTextFile(option: {
    description: string,
    accept: object,
    excludeAcceptAllOption: boolean,
    multiple: boolean
}) {
    // @ts-ignore
    let [fileHandle] = await window.showOpenFilePicker({
        types: [option],
    });
    const file: File = await fileHandle.getFile();
    return await readFileAsText(file);
}

export async function readFileAsText(file: File) {
    return new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as string)
        }
        reader.readAsText(file)
    })
}

export function baseName(path: string) {
    if (path.match(/[\\/]/)) return path.split(/[\\/]/).pop()!;
    else return path
}

export function changeExt(path: string, ext: string) {
    return path.replace(/\.\w+$/, ext)
}

export function getLast<T>(input: T[] | string): T | string | undefined {
    if (Array.isArray(input)) {
        return input.length > 0 ? input[input.length - 1] : undefined;
    }else {
        return input.length > 0 ? input.charAt(input.length - 1) : undefined;
    }
}
