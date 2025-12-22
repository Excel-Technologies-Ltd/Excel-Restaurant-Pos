import { MenuAvailability } from './MenuAvailability'

export interface Menus{
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
	/**	Menu Name : Data	*/
	menu_name: string
	/**	Image : Attach Image	*/
	image?: string
	/**	Enabled : Check	*/
	enabled?: 0 | 1
	/**	Start Date : Date	*/
	start_date?: string
	/**	Expiry Date : Date	*/
	expires_on?: string
	/**	Menu Availability : Table - Menu Availability	*/
	menu_availability?: MenuAvailability[]
}