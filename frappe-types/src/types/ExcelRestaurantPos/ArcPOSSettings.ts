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
	/**	Title : Data	*/
	title?: string
	/**	Short Description : Small Text	*/
	short_description?: string
	/**	Logo : Attach Image	*/
	logo?: string
	/**	Default Order Type : Select	*/
	default_order_type?: "Pay later" | "Pay first" | "Both"
	/**	Default Customer : Link - Customer	*/
	customer?: string
	/**	Taxes and Charges Template : Link - Sales Taxes and Charges Template	*/
	taxes_and_charges_template?: string
	/**	Tax Rate : Data	*/
	tax_rate?: string
	/**	Charge Type : Data	*/
	charge_type?: string
	/**	Default Company : Link - Company	*/
	company?: string
	/**	Default Print Format : Link - Print Format	*/
	print_format_for_order?: string
	/**	Variants View : Select	*/
	variants_view?: "In Modal" | "Individual Item"
	/**	Discount Allocation : Table - Discount Allocation	*/
	discount_allocation?: DiscountAllocation[]
	/**	Code List : Table - Restaurant Coupon	*/
	code_list?: RestaurantCoupon[]
	/**	Website Logo : Attach Image	*/
	website_logo?: string
	/**	Variants View : Select	*/
	variants_view_website?: "In Modal" | "Individual Item"
	/**	Banner Image List : Table - Attachment	*/
	banner_image_list?: Attachment[]
}