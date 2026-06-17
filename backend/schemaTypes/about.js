import {InfoOutlineIcon, StarIcon} from '@sanity/icons'
import wysiwyg from './fields/wysiwyg'

export default {
	name: 'about',
	type: 'document',
	icon: InfoOutlineIcon,
	groups: [
		{name: 'Info'},
		{name: 'People'},
		{name: 'Activity'},
		{name: 'Legal'},
	],
	fieldsets: [
		{name: 'address', title: 'Address'},
	],
	fields: [
		{
			name: 'title',
			type: 'string',
			hidden: true,
		},
		wysiwyg('description', 'Info'),
		{
			name: 'mail',
			type: 'string',
			group: 'Info',
		},
		{
			name: 'instagram',
			type: 'object',
			group: 'Info',
			fields: [
				{name: 'handle', type: 'string'},
				{
					name: 'href',
					title: 'URL',
					type: 'string',
					validation: Rule =>
						Rule.custom(href => {
							if (!href) return true
							return /^https?:\/\//.test(href) ? true : 'Must be a valid URL'
						}),
				},
			],
		},
		{
			name: 'team',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'person'}]}],
			group: 'People',
		},
		{
			name: 'clients',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'client'}]}],
			group: 'People',
		},
		{
			name: 'recognitions',
			type: 'array',
			of: [
				{
					type: 'object',
					icon: StarIcon,
					fields: [
						{name: 'title', type: 'string', validation: Rule => Rule.required()},
						{name: 'year', type: 'date', description: 'Select January 1st of the target year'},
					],
					preview: {
						select: {title: 'title', year: 'year'},
						prepare({title, year}) {
							return {title, subtitle: year ? String(year).slice(0, 4) : ''}
						},
					},
				},
			],
			group: 'Activity',
		},
		wysiwyg('applications', 'Activity'),
		{
			name: 'legalName',
			type: 'string',
			group: 'Legal',
		},
		{
			name: 'vat',
			title: 'VAT',
			type: 'string',
			group: 'Legal',
		},
		{
			name: 'addressLabel',
			title: 'Label',
			type: 'text',
			rows: 2,
			fieldset: 'address',
			group: 'Legal',
		},
		{
			name: 'addressHref',
			title: 'URL',
			type: 'string',
			fieldset: 'address',
			group: 'Legal',
			validation: Rule =>
				Rule.custom(href => {
					if (!href) return true
					return /^https?:\/\//.test(href) ? true : 'Must be a valid URL'
				}),
		},
	],
}
