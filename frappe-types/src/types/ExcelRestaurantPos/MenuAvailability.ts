
export interface MenuAvailability{
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
	/**	Outlet Name : Link - Territory	*/
	outlet_name: string
	/**	Days : Select	*/
	days: "" | "Everyday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
	/**	From Time : Time	*/
	time: string
	/**	To Time : Time	*/
	to_time: string
	/**	POS? : Check	*/
	publish_pos?: 0 | 1
	/**	Website? : Check	*/
	publish_website?: 0 | 1
}