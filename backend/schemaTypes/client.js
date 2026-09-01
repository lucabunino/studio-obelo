import {CaseIcon} from '@sanity/icons/Case'

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
