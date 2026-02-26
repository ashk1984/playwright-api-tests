import {test as base} from '@playwright/test'

export type TestOptions = {
    envURL:string
}

export const test = base.extend<TestOptions>({
    envURL: ['', {option: true}]
})