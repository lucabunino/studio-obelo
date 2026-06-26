export const mediaFields = [
	{
		name: 'type',
		type: 'string',
		options: {
			list: [
				{title: 'Image', value: 'image'},
				{title: 'Video (mp4 + cover)', value: 'video'},
			],
		},
		initialValue: 'image',
		validation: Rule => Rule.required(),
	},
	{
		name: 'image',
		type: 'image',
		hidden: ({parent}) => parent?.type !== 'image',
		validation: Rule =>
			Rule.custom((v, c) => (c.parent.type === 'image' && !v ? 'Required' : true)),
	},
	{
		name: 'imageMobile',
		title: 'Image (mobile)',
		type: 'image',
		hidden: ({parent}) => parent?.type !== 'image',
	},
	{
		name: 'video',
		type: 'file',
		options: {accept: 'video/mp4'},
		hidden: ({parent}) => parent?.type !== 'video',
		validation: Rule =>
			Rule.custom((v, c) => (c.parent.type === 'video' && !v ? 'Required' : true)),
	},
	{
		name: 'videoMobile',
		title: 'Video (mobile)',
		type: 'file',
		options: {accept: 'video/mp4'},
		hidden: ({parent}) => parent?.type !== 'video',
	},
	{
		name: 'videoPoster',
		type: 'image',
		hidden: ({parent}) => parent?.type !== 'video',
		validation: Rule =>
			Rule.custom((v, c) => (c.parent.type === 'video' && !v ? 'Required' : true)),
	},
	{
		name: 'videoPosterMobile',
		title: 'Video poster (mobile)',
		type: 'image',
		hidden: ({parent}) => parent?.type !== 'video',
	},
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
]

export function media(name) {
	return {name, type: 'object', fields: mediaFields}
}
