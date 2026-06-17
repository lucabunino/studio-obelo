import {CaseIcon} from '@sanity/icons'

export default {
	name: 'client',
	type: 'document',
	icon: CaseIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
		},
	],
}
