import * as core from '@actions/core';
import path from 'path';
import { ExecutionUtils } from './ExecutionUtils.js';
import { InputUtils } from './InputUtils.js';

// const errorToken = `[91merror[0m[90m TS`;
// const ignoreError = `[91merror[0m[90m TS2688: [0mCannot find type definition file for '../modules/types'.`;

export async function run(): Promise<void> {
    try {
        const applicationName = InputUtils.getInput('application-name');
        const dockerfileLocation = InputUtils.getInput('dockerfile-location');
        const dockerUsername = InputUtils.getInput('docker-username');
        const dockerPassword = InputUtils.getInput('docker-password');
        const dockerOrganization = InputUtils.getInput('docker-organization');
        const installDependencies = InputUtils.getBooleanInput('install-dependencies');
        const npmrc = InputUtils.getInput('npmrc');

        const fullPath = path.resolve(dockerfileLocation);
        if (installDependencies) {
            if (npmrc) {
                ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath, 'Creating .npmrc');
            }
            ExecutionUtils.run('npm install', fullPath, 'Installing NPM dependencies');
            if (npmrc) {
                ExecutionUtils.run(`rm -rf .npmrc`, fullPath, 'Removing .npmrc');
            }
        }
        // try {
        core.startGroup('Build and Push Docker Image');
        ExecutionUtils.run('docker buildx create --name codbex-builder', fullPath);
        ExecutionUtils.run('docker buildx use codbex-builder', fullPath);
        ExecutionUtils.run(`docker buildx build --tag ${applicationName} -o type=image --platform=linux/arm64,linux/amd64 .`, fullPath);
        ExecutionUtils.run(`docker login ghcr.io -u ${dockerUsername} -p ${dockerPassword}`, fullPath);
        ExecutionUtils.run(`docker buildx build --push --tag ghcr.io/${dockerOrganization}/${applicationName}:latest -o type=image --platform=linux/arm64,linux/amd64 .`, fullPath);
        core.endGroup();
        // } catch (e: unknown) {
        //     ignoreKnownErrors(e as ExecException);
        // }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

// function ignoreKnownErrors(e: ExecException) {
//     let errors = e.stdout;
//     if (errors) {
//         errors = errors?.replaceAll(ignoreError, '');
//     }
//     if (!errors || errors.includes(errorToken)) {
//         core.error(e.message);
//         core.error(e.stdout ?? '');
//         core.error(e.stderr ?? '');
//         throw e;
//     }
//     core.warning('Ignoring codbex "sdk" related errors');
// }
