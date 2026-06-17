import {EarthGlobeIcon} from '@sanity/icons'

export default {
	name: 'seo',
	type: 'document',
	icon: EarthGlobeIcon,
	fields: [
		{
			name: 'seoTitle',
			type: 'string',
		},
		{
			name: 'seoDescription',
			type: 'text',
			rows: 5,
		},
		{
			name: 'seoImage',
			description: 'Recommended size: 1200×630',
			type: 'image',
		},
	],
}
