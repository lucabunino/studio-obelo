import {TextIcon, ImageIcon, LinkIcon} from '@sanity/icons'
import {mediaFields} from './fields/media'
import wysiwyg from './fields/wysiwyg'

function mediaPreview(items) {
	const item = items?.[0]
	if (!item) return null
	if (item.type === 'image') return item.image
	if (item.type === 'gif') return item.gifFrames?.[0]
	if (item.type === 'video') return item.videoCover
	return null
}

export const mediaBlock = {
	name: 'mediaBlock',
	title: 'Media',
	icon: ImageIcon,
	type: 'object',
	fields: [
		{
			name: 'items',
			type: 'array',
			of: [{type: 'object', fields: [
				...mediaFields,
				{
					name: 'contain',
					type: 'boolean',
					initialValue: false,
				},
				{
					name: 'objectAlignment',
					title: 'Object position',
					type: 'string',
					options: {
						list: ['left', 'center', 'right'],
						layout: 'radio',
					},
					initialValue: 'left',
					hidden: ({parent}) => !parent?.contain,
				},
			]}],
			options: {layout: 'grid'},
			validation: Rule => Rule.required().min(1).max(2),
		},
		{
			name: 'width',
			type: 'string',
			options: {
				list: [
					{title: 'Fullscreen', value: 'full'},
					{title: '3/4', value: 'three-quarters'},
					{title: '1/2', value: 'half'},
				],
				layout: 'radio',
			},
			initialValue: 'full',
		},
		{
			name: 'alignment',
			type: 'string',
			options: {
				list: ['left', 'center', 'right'],
				layout: 'radio',
			},
			initialValue: 'left',
			hidden: ({parent}) => parent?.width === 'full',
		},
		{
			name: 'caption',
			type: 'text',
			rows: 3,
			hidden: ({parent}) => parent?.width === 'full',
		},
	],
	preview: {
		select: {items: 'items', width: 'width'},
		prepare({items, width}) {
			const count = items?.length || 0
			return {
				title: `Media (${count}) — ${width || 'full'}`,
				media: mediaPreview(items),
			}
		},
	},
}

export const textBlock = {
	name: 'textBlock',
	title: 'Text',
	icon: TextIcon,
	type: 'object',
	fields: [
		wysiwyg('text'),
		{
			name: 'width',
			type: 'string',
			options: {
				list: [
					{title: 'Fullscreen', value: 'full'},
					{title: '3/4', value: 'three-quarters'},
					{title: '1/2', value: 'half'},
				],
				layout: 'radio',
			},
			initialValue: 'full',
		},
		{
			name: 'alignment',
			type: 'string',
			options: {
				list: ['left', 'center', 'right'],
				layout: 'radio',
			},
			initialValue: 'left',
			hidden: ({parent}) => parent?.width === 'full',
		},
	],
	preview: {
		select: {text: 'text'},
		prepare({text}) {
			const first = text?.[0]?.children?.[0]?.text || ''
			return {title: first || 'Empty text'}
		},
	},
}

export const workReferenceBlock = {
	name: 'workReference',
	icon: LinkIcon,
	type: 'object',
	fields: [
		{
			name: 'work',
			type: 'reference',
			to: [{type: 'work'}],
			validation: Rule => Rule.required(),
		},
		{
			name: 'marginBottom',
			type: 'boolean',
			initialValue: false,
		},
	],
	preview: {
		select: {title: 'work.title'},
		prepare({title}) {
			return {title: title || 'No work selected'}
		},
	},
}
