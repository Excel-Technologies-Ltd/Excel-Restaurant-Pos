import { DiscountAllocation } from './DiscountAllocation'
import { RestaurantCoupon } from './RestaurantCoupon'
import { Attachment } from './Attachment'

export interface ArcPOSSettings{
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
	/**	Title (Line 1) : Data	*/
	title?: string
	/**	Title (Line 2) : Data	*/
	title_line_2?: string
	/**	Short Description : Small Text	*/
	short_description?: string
	/**	Logo : Attach Image	*/
	logo?: string
	/**	Logo (Dark) : Attach Image	*/
	pos_logo_dark?: string
	/**	Print Format Logo : Attach Image	*/
	print_format_logo?: string
	/**	Order View : Select	*/
	pos_order_view?: "Item Name with Image" | "Only Item Name"
	/**	Default Order Type : Select	*/
	default_order_type?: "Pay Later" | "Pay First" | "Both"
	/**	Default Customer : Link - Customer	*/
	customer?: string
	/**	Default Taxes and Charges Template : Link - Sales Taxes and Charges Template	*/
	taxes_and_charges_template?: string
	/**	Tax Rate : Data	*/
	tax_rate?: string
	/**	Charge Type : Data	*/
	charge_type?: string
	/**	Tips : Select	*/
	pos_tips?: "Not Allowed" | "Required" | "Optional"
	/**	Default Delivery Print Format : Link - Print Format	*/
	default_delivery_pf?: string
	/**	Print Format QR : Attach Image	*/
	print_format_qr?: string
	/**	FavIcon : Attach Image - An icon file with dimension 16 x 16 px.	*/
	favicon?: string
	/**	FavIcon (Dark) : Attach Image	*/
	pos_favicon_dark?: string
	/**	Heading Title : Data	*/
	heading_title?: string
	/**	Default Company : Link - Company	*/
	company?: string
	/**	Default Print Format : Link - Print Format	*/
	print_format_for_order?: string
	/**	Variants View : Select	*/
	variants_view?: "In Modal" | "Individual Item"
	/**	Allowed Kitchen Order Print? : Select	*/
	allowed_kop?: "Yes" | "No"
	/**	Default KOP Format : Link - Print Format	*/
	default_kop_format?: string
	/**	Discount Allocation : Table - Discount Allocation	*/
	discount_allocation?: DiscountAllocation[]
	/**	Code List : Table - Restaurant Coupon	*/
	code_list?: RestaurantCoupon[]
	/**	Web Order Portal URL : Data	*/
	portal_base_url?: string
	/**	POS Base URL : Data	*/
	pos_base_url?: string
	/**	Website Logo : Attach Image	*/
	website_logo?: string
	/**	Website Logo (Dark) : Attach Image	*/
	website_logo_dark?: string
	/**	Allow Delivery Charge : Check	*/
	allow_delivery_charge?: 0 | 1
	/**	DCA : Currency	*/
	dca?: number
	/**	Tips : Select	*/
	website_tips?: "Not Allowed" | "Required" | "Optional"
	/**	Branding Text : Data	*/
	branding_text?: string
	/**	Branding URL : Data	*/
	branding_url?: string
	/**	Signup Logo : Attach Image	*/
	website_signup_logo?: string
	/**	Signup Logo (Dark) : Attach Image	*/
	website_signup_logo_dark?: string
	/**	FavIcon : Attach Image - An icon file with dimension 16 x 16 px.	*/
	website_fabicon?: string
	/**	FavIcon (Dark) : Attach Image	*/
	website_favicon_dark?: string
	/**	Variants View : Select	*/
	variants_view_website?: "In Modal" | "Individual Item"
	/**	Allow Service Charge : Check	*/
	allow_service_charge?: 0 | 1
	/**	SFA : Currency	*/
	sfa?: number
	/**	Policy (If Any) : Small Text	*/
	comments?: string
	/**	Banner Image List : Table - Attachment - Preferred dimension is 1920 x 425 px	*/
	banner_image_list?: Attachment[]
}