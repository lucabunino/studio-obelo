import {HomeIcon} from '@sanity/icons'

export default {
	name: 'homepage',
	type: 'document',
	icon: HomeIcon,
	fields: [
		{
			name: 'title',
			type: 'string',
			hidden: true,
		},
		{
			name: 'separator',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'projects',
			type: 'array',
			of: [{
				type: 'reference',
				to: [{type: 'work'}],
				validation: Rule => Rule.warning().custom(async (ref, context) => {
					if (!ref?._ref) return true
					const client = context.getClient({apiVersion: '2025-01-01'})
					const work = await client.fetch(`*[_id == $id][0]{ homepage }`, {id: ref._ref})
					if (!work?.homepage) return 'This work has no homepage media set'
					return true
				}),
			}],
			validation: Rule => Rule.unique(),
		},
	],
}
