import {UserIcon} from '@sanity/icons'

export default {
	name: 'person',
	type: 'document',
	icon: UserIcon,
	fields: [
		{
			name: 'name',
			type: 'string',
			validation: Rule => Rule.required(),
		},
		{
			name: 'surname',
			type: 'string',
			validation: Rule => Rule.required(),
		},
	],
	preview: {
		select: {name: 'name', surname: 'surname'},
		prepare({name, surname}) {
			return {title: [name, surname].filter(Boolean).join(' ')}
		},
	},
}
