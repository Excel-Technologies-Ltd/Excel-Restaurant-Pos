import { ContactEmail } from '../Contacts/ContactEmail'
import { ContactPhone } from '../Contacts/ContactPhone'
import { OutletSchedules } from '../ExcelRestaurantPos/OutletSchedules'
import { OutletwiseCounters } from '../ExcelRestaurantPos/OutletwiseCounters'
import { TargetDetail } from './TargetDetail'

export interface Territory{
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
	/**	Territory Name : Data	*/
	territory_name: string
	/**	Parent Territory : Link - Territory	*/
	parent_territory?: string
	/**	Is Group : Check	*/
	is_group?: 0 | 1
	/**	Close Outlet : Check	*/
	custom_close_outlet?: 0 | 1
	/**	Re-open Date : Date	*/
	custom_reopen_date?: string
	/**	Territory Manager : Link - Sales Person - For reference	*/
	territory_manager?: string
	/**	lft : Int	*/
	lft?: number
	/**	rgt : Int	*/
	rgt?: number
	/**	old_parent : Link - Territory	*/
	old_parent?: string
	/**	Region of Items : Data	*/
	custom_region_of_items?: string
	/**	Email IDs : Table - Contact Email	*/
	custom_email_ids?: ContactEmail[]
	/**	Contact Numbers : Table - Contact Phone	*/
	custom_contact_numbers?: ContactPhone[]
	/**	Outlet Schedules : Table - Outlet Schedules	*/
	custom_outlet_schedules?: OutletSchedules[]
	/**	Remarks : Small Text	*/
	custom_remarks?: string
	/**	Latitude : Float	*/
	custom_latitude?: number
	/**	Longitude : Float	*/
	custom_longitude?: number
	/**	Outlet Address : Small Text	*/
	custom_outlet_address?: string
	/**	Outlet Location : Geolocation	*/
	custom_outlet_location?: any
	/**	Outlet wise Counters : Table - Outlet wise Counters	*/
	custom_outlet_wise_counters?: OutletwiseCounters[]
	/**	Targets : Table - Target Detail	*/
	targets?: TargetDetail[]
}