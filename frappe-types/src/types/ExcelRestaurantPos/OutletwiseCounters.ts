
export interface OutletwiseCounters{
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
	/**	Counter Name : Link - ArcPOS Counter	*/
	counter_name: string
}