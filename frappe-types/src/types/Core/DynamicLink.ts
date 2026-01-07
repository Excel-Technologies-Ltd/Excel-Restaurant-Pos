
export interface DynamicLink{
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
	/**	Link Document Type : Link - DocType	*/
	link_doctype: string
	/**	Link Name : Dynamic Link	*/
	link_name: string
	/**	Link Title : Read Only	*/
	link_title?: string
}