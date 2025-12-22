
export interface FoodItemList{
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
	/**	Item Id : Link - Add Ons Item	*/
	item_id?: string
	/**	Item Name : Data	*/
	item_name?: string
}