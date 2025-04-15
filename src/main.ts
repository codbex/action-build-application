import * as core from '@actions/core';
import path from 'path';
import { ExecutionUtils } from './ExecutionUtils.js';
import { InputUtils } from './InputUtils.js';

export async function run(): Promise<void> {
    try {
        const name = InputUtils.getInput('name');
        const tag = InputUtils.getInput('tag');
        const installDependencies = InputUtils.getBooleanInput('install-dependencies');
        const dockerfileLocation = InputUtils.getInput('dockerfile-location');
        const npmrc = InputUtils.getInput('npmrc');
        const dockerUsername = InputUtils.getInput('docker-username');
        const dockerPassword = InputUtils.getInput('docker-password');
        const dockerOrganization = InputUtils.getInput('docker-organization');

        const fullPath = path.resolve(dockerfileLocation);

        if (installDependencies) {
            installNpmDependencies(npmrc, fullPath);
        }

        core.startGroup('Build and Push Docker Image');
        ExecutionUtils.run('docker buildx create --name codbex-builder', fullPath);
        ExecutionUtils.run('docker buildx use codbex-builder', fullPath);
        ExecutionUtils.run(`docker buildx build --tag ${name} -o type=image --platform=linux/arm64,linux/amd64 .`, fullPath);
        if (dockerUsername && dockerPassword && dockerOrganization) {
            ExecutionUtils.run(`docker login ghcr.io -u ${dockerUsername} -p ${dockerPassword}`, fullPath);
            ExecutionUtils.run(`docker buildx build --push --tag ghcr.io/${dockerOrganization}/${name}:${tag} -o type=image --platform=linux/arm64,linux/amd64 .`, fullPath);
        }
        core.endGroup();
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

function installNpmDependencies(npmrc: string, fullPath: string) {
    if (npmrc) {
        ExecutionUtils.run(`echo "${npmrc}" > .npmrc`, fullPath, 'Creating .npmrc');
    }
    ExecutionUtils.run('npm install', fullPath, 'Installing NPM dependencies');
    if (npmrc) {
        ExecutionUtils.run(`rm -rf .npmrc`, fullPath, 'Removing .npmrc');
    }
}
