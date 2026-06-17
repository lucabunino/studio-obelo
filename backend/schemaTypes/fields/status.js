export const status = {
	name: 'status',
	type: 'string',
	options: {
		list: [
			{title: 'Public', value: 'public'},
			{title: 'Hidden', value: 'hidden'},
		],
		layout: 'radio',
	},
	initialValue: 'public',
}
