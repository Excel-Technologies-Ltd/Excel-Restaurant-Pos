import { ItemDefault } from '../Stock/ItemDefault'
import { ItemTax } from '../Stock/ItemTax'
import { ItemWebsiteSpecification } from '../Stock/ItemWebsiteSpecification'
import { WebsiteFilterField } from '../Portal/WebsiteFilterField'
import { WebsiteAttribute } from '../Portal/WebsiteAttribute'

export interface ItemGroup{
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Item Group Name : Data	*/
	item_group_name: string
	/**	Parent Item Group : Link - Item Group	*/
	parent_item_group?: string
	/**	Is Group : Check - Only leaf nodes are allowed in transaction	*/
	is_group?: 0 | 1
	/**	Publish to POS : Check	*/
	is_restaurant_pos?: 0 | 1
	/**	Publish to Website : Check	*/
	custom_publish_to_website?: 0 | 1
	/**	Priority : Float	*/
	custom_priority?: number
	/**	Is Add Ons : Check	*/
	is_add_ons?: 0 | 1
	/**	Image : Attach Image	*/
	image?: string
	/**	Item Group Defaults : Table - Item Default	*/
	item_group_defaults?: ItemDefault[]
	/**	Taxes : Table - Item Tax	*/
	taxes?: ItemTax[]
	/**	Route : Data	*/
	route?: string
	/**	Title : Data	*/
	website_title?: string
	/**	Description : Text Editor - HTML / Banner that will show on the top of product list.	*/
	description?: string
	/**	Show in Website : Check - Make Item Group visible in website	*/
	show_in_website?: 0 | 1
	/**	Include Descendants : Check - Include Website Items belonging to child Item Groups	*/
	include_descendants?: 0 | 1
	/**	Weightage : Int	*/
	weightage?: number
	/**	Slideshow : Link - Website Slideshow - Show this slideshow at the top of the page	*/
	slideshow?: string
	/**	Website Specifications : Table - Item Website Specification	*/
	website_specifications?: ItemWebsiteSpecification[]
	/**	Item Fields : Table - Website Filter Field	*/
	filter_fields?: WebsiteFilterField[]
	/**	Attributes : Table - Website Attribute	*/
	filter_attributes?: WebsiteAttribute[]
	/**	lft : Int	*/
	lft?: number
	/**	rgt : Int	*/
	rgt?: number
	/**	old_parent : Link - Item Group	*/
	old_parent?: string
}