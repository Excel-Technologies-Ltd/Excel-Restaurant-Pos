
export interface GuestChoice{
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
	/**	Subject : Data	*/
	subject?: string
	/**	Levels : Small Text - Levels are separated by commas. e.g. No Spicy, Mild, etc.	*/
	levels?: string
}