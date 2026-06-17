import {myStructure} from './structure'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media, mediaAssetSource} from 'sanity-plugin-media'

export default defineConfig({
	name: 'default',
	title: 'Studio òbelo',

	projectId: 'h2xygxe5',
	dataset: 'production',

	plugins: [
		structureTool({structure: myStructure}),
		visionTool(),
		media(),
	],

	schema: {
		types: schemaTypes,
	},

	form: {
		image: {
			assetSources: () => [mediaAssetSource],
		},
	},

	document: {
		badges: [StatusBadge],
	},
})

export function StatusBadge(props) {
	const status = props.published?.status || props.draft?.status
	if (!status) return null

	let color = 'primary'
	if (status === 'public') color = 'success'
	if (status === 'hidden') color = 'warning'

	return {
		label: status.charAt(0).toUpperCase() + status.slice(1),
		title: `Status: ${status}`,
		color,
	}
}
