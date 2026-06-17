import {AccessDeniedIcon} from '@sanity/icons'
import wysiwyg from './fields/wysiwyg'

export default {
	name: 'policy',
	type: 'document',
	icon: AccessDeniedIcon,
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
		wysiwyg('content'),
	],
}