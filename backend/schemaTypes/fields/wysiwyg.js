export default function wysiwyg(fieldName, groupName) {
	return {
		name: fieldName || 'body',
		type: 'array',
		of: [
			{
				type: 'block',
				styles: [
					{value: 'normal', title: 'Normal'},
					{value: 'h2', title: 'H2'},
				],
				marks: {
					decorators: [
						{title: 'Italic', value: 'em'},
					],
					annotations: [
						{
							name: 'link',
							type: 'object',
							fields: [
								{
									name: 'href',
									type: 'string',
									validation: Rule =>
										Rule.custom(href => {
											if (!href) return true
											return /^(https?:\/\/|mailto:|tel:)/.test(href)
												? true
												: 'Must be a valid URL, mailto:, or tel: link'
										}),
								},
								{
									title: 'Open in new tab',
									name: 'blank',
									type: 'boolean',
								},
							],
						},
					],
				},
			},
		],
		group: groupName,
	}
}
