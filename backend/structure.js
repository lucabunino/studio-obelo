import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {HomeIcon} from '@sanity/icons/Home'
import {BookIcon} from '@sanity/icons/Book'
import {BookmarkIcon} from '@sanity/icons/Bookmark'
import {TagsIcon} from '@sanity/icons/Tags'
import {CaseIcon} from '@sanity/icons/Case'
import {UsersIcon} from '@sanity/icons/Users'
import {AccessDeniedIcon} from '@sanity/icons/AccessDenied'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {ProjectsIcon} from '@sanity/icons/Projects'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {RobotIcon} from '@sanity/icons/Robot'
import {PinIcon} from '@sanity/icons/Pin'
import {PresentationIcon} from '@sanity/icons/Presentation'
import {ClockIcon} from '@sanity/icons/Clock'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export const myStructure = (S, context) => {
	const entities = [
		S.divider(),
		S.listItem()
			.title('Homepage')
			.icon(HomeIcon)
			.child(S.document().schemaType('homepage').documentId('homepage')),
		orderableDocumentListDeskItem({type: 'work', title: 'Works', icon: ProjectsIcon, S, context}),
		S.listItem()
			.title('About')
			.icon(InfoOutlineIcon)
			.child(S.document().schemaType('about').documentId('about')),
		S.listItem()
			.title('Education')
			.icon(BookIcon)
			.child(
				S.list()
					.title('Education')
					.items([
						S.listItem()
							.title('Education')
							.icon(BookIcon)
							.child(S.document().schemaType('educations').documentId('educations')),
						S.divider(),
						S.documentTypeListItem('education').title('Educations').icon(BookmarkIcon).id('entries'),
					])
			),
		S.listItem()
			.title('Teaching')
			.icon(PresentationIcon)
			.child(
				S.list()
					.title('Teaching')
					.items([
						orderableDocumentListDeskItem({type: 'teaching', title: 'Ongoing', icon: ClockIcon, S, context, filter: '_type == "teaching" && ongoing == true'}),
						S.divider(),
						S.documentTypeListItem('teaching').title('Teachings').icon(PresentationIcon).id('teaching-entries'),
					])
			),
		S.divider(),
		S.documentTypeListItem('service').title('Services').icon(SparklesIcon),
		S.documentTypeListItem('tag').title('Tags').icon(TagsIcon),
		S.documentTypeListItem('place').title('Places').icon(PinIcon),
		S.documentTypeListItem('person').title('People').icon(UsersIcon),
		S.documentTypeListItem('client').title('Clients').icon(CaseIcon),
	]

	const siteSettings = [
		S.divider(),
		S.listItem()
			.title('Seo')
			.icon(EarthGlobeIcon)
			.child(S.document().schemaType('seo').documentId('seo')),
		S.listItem()
			.title('Privacy')
			.icon(AccessDeniedIcon)
			.child(S.document().schemaType('policy').documentId('privacy')),
		S.listItem()
			.title('Cookies')
			.icon(RobotIcon)
			.child(S.document().schemaType('policy').documentId('cookies')),
	]

	return S.list()
		.title('Content')
		.items([...entities, ...siteSettings])
}
