
export interface TIPSCriteria{
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
	/**	For POS? : Check	*/
	for_pos?: 0 | 1
	/**	For Website? : Check	*/
	for_website?: 0 | 1
	/**	Disabled? : Check	*/
	disabled?: 0 | 1
	/**	In Percentage : Float	*/
	in_percentage?: number
	/**	In Amount : Currency	*/
	in_amount?: number
	/**	Charge Type : Select	*/
	charge_type: "" | "Actual" | "On Net Total" | "On Previous Row Amount" | "On Previous Row Total" | "On Item Quantity"
	/**	Account Head : Link - Account	*/
	account_head: string
}