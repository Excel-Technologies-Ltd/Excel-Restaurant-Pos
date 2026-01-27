
export interface Nutritions{
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
	/**	Name : Data	*/
	name1: string
	/**	Value : Float	*/
	value: number
	/**	UOM : Link - UOM	*/
	uom: string
}