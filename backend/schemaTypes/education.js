import {orderRankField} from '@sanity/orderable-document-list'
import {BookmarkIcon} from '@sanity/icons'
import {status} from './fields/status'
import wysiwyg from './fields/wysiwyg'
import {mediaFields} from './fields/media'
import seoFields from './fields/seoFields'

export default {
	name: 'education',
	type: 'document',
	icon: BookmarkIcon,
	groups: [
		{name: 'Content'},
		{name: 'SEO'},
	],
	fields: [
		orderRankField({type: 'education'}),
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
			group: 'Content',
		},
		{
			name: 'slug',
			type: 'slug',
			validation: Rule => Rule.required(),
			options: {source: 'title', maxLength: 96},
			group: 'Content',
		},
		{
			name: 'place',
			type: 'reference',
			to: [{type: 'place'}],
			group: 'Content',
		},
		{...status, group: 'Content'},
		{
			name: 'ongoing',
			type: 'boolean',
			initialValue: false,
			group: 'Content',
		},
		{
			name: 'startDate',
			type: 'date',
			group: 'Content',
		},
		{
			name: 'endDate',
			type: 'date',
			hidden: ({document}) => !!document?.ongoing,
			group: 'Content',
		},
		wysiwyg('description', 'Content'),
		{
			name: 'media',
			type: 'array',
			of: [{type: 'object', fields: mediaFields}],
			options: {layout: 'list'},
			group: 'Content',
		},
		...seoFields('SEO'),
	],
	preview: {
		select: {title: 'title', startDate: 'startDate', endDate: 'endDate', ongoing: 'ongoing'},
		prepare({title, startDate, endDate, ongoing}) {
			const start = startDate ? String(startDate).slice(0, 4) : ''
			const end = ongoing ? 'Ongoing' : endDate ? String(endDate).slice(0, 4) : ''
			return {title, subtitle: [start, end].filter(Boolean).join(' – ') || 'No date'}
		},
	},
}
