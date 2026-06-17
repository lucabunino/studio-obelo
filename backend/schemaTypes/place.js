import {PinIcon} from '@sanity/icons'

export default {
	name: 'place',
	type: 'document',
	icon: PinIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
		},
	],
	preview: {
		select: {title: 'title'},
	},
}
