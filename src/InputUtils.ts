import * as core from '@actions/core';

export class InputUtils {
    static getInput(name: string): string {
        return core.getInput(name);
    }

    static getBooleanInput(name: string): boolean {
        return core.getBooleanInput(name);
    }

    static getArrayInput(name: string): string[] {
        return core.getMultilineInput(name).map((e) => {
            if (e.startsWith('-')) {
                return e.substring(2).trim();
            }
            return e;
        });
    }
}
