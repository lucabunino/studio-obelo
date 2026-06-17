export default function seoFields(groupName) {
	return [
		{
			name: 'seoDescription',
			type: 'text',
			rows: 5,
			group: groupName,
		},
		{
			name: 'seoImage',
			description: 'Recommended size: 1200×630',
			type: 'image',
			group: groupName,
		},
	]
}
