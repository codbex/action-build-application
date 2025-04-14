import * as core from '@actions/core'
import { wait } from './wait.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    console.log(`Waiting ${ms} milliseconds ...`)
    console.warn(`Waiting ${ms} milliseconds ...`)
    console.error(`Waiting ${ms} milliseconds ...`)
    core.warning(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    console.log(new Date().toTimeString())
    console.warn(new Date().toTimeString())
    console.error(new Date().toTimeString())
    core.warning(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    console.log(new Date().toTimeString())
    console.warn(new Date().toTimeString())
    console.error(new Date().toTimeString())
    core.warning(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
