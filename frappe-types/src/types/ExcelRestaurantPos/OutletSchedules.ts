
export interface OutletSchedules{
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
	/**	Days : Select	*/
	days: "" | "Everyday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
	/**	Opening Time : Time	*/
	opening_time: string
	/**	Closing Time : Time	*/
	closing_time: string
}