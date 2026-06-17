import {SparkleIcon} from '@sanity/icons'

export default {
	name: 'service',
	type: 'document',
	icon: SparkleIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
		},
		{
			name: 'slug',
			type: 'slug',
			validation: Rule => Rule.required(),
			options: {source: 'title', maxLength: 96},
		},
	],
}
