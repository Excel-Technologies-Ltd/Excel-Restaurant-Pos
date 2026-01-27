import { DynamicLink } from '../Core/DynamicLink'

export interface Address{
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
	/**	Address Title : Data	*/
	address_title?: string
	/**	Address Type : Select	*/
	address_type: "Billing" | "Shipping" | "Office" | "Personal" | "Plant" | "Postal" | "Shop" | "Subsidiary" | "Warehouse" | "Current" | "Permanent" | "Other"
	/**	Address Line 1 : Data	*/
	address_line1: string
	/**	Address Line 2 : Data	*/
	address_line2?: string
	/**	City/Town : Data	*/
	city: string
	/**	County : Data	*/
	county?: string
	/**	State/Province : Data	*/
	state?: string
	/**	Country : Link - Country	*/
	country: string
	/**	Postal Code : Data	*/
	pincode?: string
	/**	Email Address : Data	*/
	email_id?: string
	/**	Phone : Data	*/
	phone?: string
	/**	Fax : Data	*/
	fax?: string
	/**	Tax Category : Link - Tax Category	*/
	tax_category?: string
	/**	Preferred Billing Address : Check	*/
	is_primary_address?: 0 | 1
	/**	Preferred Shipping Address : Check	*/
	is_shipping_address?: 0 | 1
	/**	Disabled : Check	*/
	disabled?: 0 | 1
	/**	Is Your Company Address : Check	*/
	is_your_company_address?: 0 | 1
	/**	Links : Table - Dynamic Link	*/
	links?: DynamicLink[]
}