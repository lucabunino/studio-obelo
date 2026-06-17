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
		name: 'video',
		type: 'file',
		options: {accept: 'video/mp4'},
		hidden: ({parent}) => parent?.type !== 'video',
		validation: Rule =>
			Rule.custom((v, c) => (c.parent.type === 'video' && !v ? 'Required' : true)),
	},
	{
		name: 'videoPoster',
		type: 'image',
		hidden: ({parent}) => parent?.type !== 'video',
		validation: Rule =>
			Rule.custom((v, c) => (c.parent.type === 'video' && !v ? 'Required' : true)),
	},
]

export function media(name) {
	return {name, type: 'object', fields: mediaFields}
}
