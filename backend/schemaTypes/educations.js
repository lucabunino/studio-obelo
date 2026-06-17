import {BookIcon, InlineElementIcon} from '@sanity/icons'
import wysiwyg from './fields/wysiwyg'

export default {
	name: 'educations',
	type: 'document',
	icon: BookIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			hidden: true
		},
		wysiwyg('description'),
		{
			name: 'items',
			type: 'array',
			validation: Rule => Rule.custom(items => {
				const refs = (items ?? []).filter(i => i._type === 'education' && i._ref).map(i => i._ref)
				return refs.length === new Set(refs).size || 'Education references must be unique'
			}),
			of: [
				{
					name: 'education',
					type: 'reference',
					to: [{type: 'education'}],
					validation: Rule => Rule.required(),
				},
				{
					name: 'gap',
					type: 'object',
					icon: InlineElementIcon,
					fields: [
						{
							name: 'gap',
							type: 'number',
							validation: Rule => Rule.required().min(1).max(8).integer(),
						},
					],
				},
			],
		},
	],
}
