import {PresentationIcon} from '@sanity/icons'
import {orderRankField} from '@sanity/orderable-document-list'

export default {
	name: 'teaching',
	type: 'document',
	icon: PresentationIcon,
	fieldsets: [
		{name: 'date', title: 'Date', options: {columns: 2}},
	],
	fields: [
		orderRankField({type: 'teaching'}),
		{
			name: 'title',
			type: 'string',
			validation: Rule => Rule.required(),
		},
		{
			name: 'ongoing',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'startDate',
			title: 'Start',
			type: 'date',
			fieldset: 'date',
		},
		{
			name: 'endDate',
			title: 'End',
			type: 'date',
			hidden: ({document}) => !!document?.ongoing,
			fieldset: 'date',
		},
	],
	preview: {
		select: {title: 'title', startDate: 'startDate', endDate: 'endDate', ongoing: 'ongoing'},
		prepare({title, startDate, endDate, ongoing}) {
			const start = startDate ? String(startDate).slice(0, 4) : ''
			const end = ongoing ? 'Ongoing' : endDate ? String(endDate).slice(0, 4) : ''
			return {title, subtitle: [start, end].filter(Boolean).join(' – ')}
		},
	},
}
