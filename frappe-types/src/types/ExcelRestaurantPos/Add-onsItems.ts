
export interface AddOnsItems{
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
	/**	Item Code : Link - Item	*/
	item_code: string
	/**	Item Name : Data	*/
	item_name?: string
	/**	Item Group : Data	*/
	item_group?: string
}