
export interface BOMOperation{
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
	/**	Sequence ID : Int	*/
	sequence_id?: number
	/**	Operation : Link - Operation	*/
	operation: string
	/**	Workstation Type : Link - Workstation Type	*/
	workstation_type?: string
	/**	Workstation : Link - Workstation	*/
	workstation?: string
	/**	Operation Time  : Float - In minutes	*/
	time_in_mins: number
	/**	Fixed Time : Check - Operation time does not depend on quantity to produce	*/
	fixed_time?: 0 | 1
	/**	Hour Rate : Currency	*/
	hour_rate?: number
	/**	Base Hour Rate(Company Currency) : Currency	*/
	base_hour_rate?: number
	/**	Operating Cost : Currency	*/
	operating_cost?: number
	/**	Operating Cost(Company Currency) : Currency	*/
	base_operating_cost?: number
	/**	Batch Size : Int	*/
	batch_size?: number
	/**	Set Operating Cost Based On BOM Quantity : Check	*/
	set_cost_based_on_bom_qty?: 0 | 1
	/**	Cost Per Unit : Float	*/
	cost_per_unit?: number
	/**	Base Cost Per Unit : Float	*/
	base_cost_per_unit?: number
	/**	Description : Text Editor	*/
	description?: string
	/**	Image : Attach	*/
	image?: string
}