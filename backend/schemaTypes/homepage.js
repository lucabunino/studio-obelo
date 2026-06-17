import {HomeIcon} from '@sanity/icons'

export default {
	name: 'homepage',
	type: 'document',
	icon: HomeIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			hidden: true,
		},
		{
			name: 'separator',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'projects',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'work'}]}],
			validation: Rule => Rule.unique(),
		},
	],
}
