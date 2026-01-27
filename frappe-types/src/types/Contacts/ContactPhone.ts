
export interface ContactPhone{
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
	/**	Number : Data	*/
	phone: string
	/**	Is Primary Phone : Check	*/
	is_primary_phone?: 0 | 1
	/**	Is Primary Mobile : Check	*/
	is_primary_mobile_no?: 0 | 1
}