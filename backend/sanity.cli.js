import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'h2xygxe5',
    dataset: 'production'
  },
  studioHost: 'obelo',
  deployment: {
    appId: 'stblyc3f555b7sz9zp0fg1lu',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: false,
  }
})
