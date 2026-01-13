
export interface ContactEmail{
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
	/**	Email ID : Data	*/
	email_id: string
	/**	Is Primary : Check	*/
	is_primary?: 0 | 1
}