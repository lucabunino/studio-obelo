import {orderRankField} from '@sanity/orderable-document-list'
import {SquareIcon} from '@sanity/icons'
import {status} from './fields/status'
import wysiwyg from './fields/wysiwyg'
import {media} from './fields/media'
import {mediaBlock, textBlock, workReferenceBlock} from './blocks'
import seoFields from './fields/seoFields'

export default {
	name: 'work',
	type: 'document',
	icon: SquareIcon,
	groups: [
		{name: 'Info'},
		{name: 'Description'},
		{name: 'Media'},
		{name: 'Seo'},
	],
	fieldsets: [
		{name: 'date', title: 'Date', options: {columns: 2}},
	],
	fields: [
		orderRankField({type: 'work'}),
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
			group: 'Info',
		},
		{
			name: 'slug',
			type: 'slug',
			validation: Rule => Rule.required(),
			options: {source: 'title', maxLength: 96},
			group: 'Info',
		},
		{...status, group: 'Info'},
		{
			name: 'ongoing',
			type: 'boolean',
			initialValue: false,
			group: 'Info',
		},
		{
			name: 'startDate',
			title: 'Start',
			type: 'date',
			group: 'Info',
			fieldset: 'date',
		},
		{
			name: 'endDate',
			title: 'End',
			type: 'date',
			hidden: ({document}) => !!document?.ongoing,
			group: 'Info',
			fieldset: 'date',
		},
		{
			name: 'place',
			type: 'reference',
			to: [{type: 'place'}],
			group: 'Info',
		},
		{
			name: 'services',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'service'}]}],
			group: 'Info',
			validation: Rule => Rule.unique(),
		},
		{
			name: 'tags',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'tag'}]}],
			group: 'Info',
			validation: Rule => Rule.unique(),
		},
		{
			name: 'team',
			type: 'array',
			of: [{type: 'reference', to: [{type: 'person'}]}],
			group: 'Info',
		},
		{
			name: 'link',
			type: 'object',
			fields: [
				{name: 'label', type: 'string'},
				{
					name: 'href',
					type: 'string',
					validation: Rule =>
						Rule.custom(href => {
							if (!href) return true
							return /^https?:\/\//.test(href) ? true : 'Must be a valid URL'
						}),
				},
			],
			group: 'Info',
		},
		wysiwyg('description', 'Info'),
		{...media('homepage'), group: 'Media'},
		{...media('thumbnail'), group: 'Media'},
		{
			name: 'blocks',
			type: 'array',
			of: [mediaBlock, textBlock, workReferenceBlock],
			options: {layout: 'list'},
			group: 'Media',
		},
		...seoFields('Seo'),
	],
	preview: {
		select: {
			title: 'title',
			startDate: 'startDate',
			endDate: 'endDate',
			ongoing: 'ongoing',
			coverType: 'thumbnail.type',
			image: 'thumbnail.image',
			videoCover: 'thumbnail.videoCover',
		},
		prepare({title, startDate, endDate, ongoing, coverType, image, videoCover}) {
			const start = startDate ? String(startDate).slice(0, 4) : ''
			const end = ongoing ? 'Ongoing' : endDate ? String(endDate).slice(0, 4) : ''
			const subtitle = [start, end].filter(Boolean).join(' – ') || 'No date'
			let previewMedia = null
			if (coverType === 'image') previewMedia = image
			if (coverType === 'video') previewMedia = videoCover
			return {title, subtitle, media: previewMedia}
		},
	},
}
