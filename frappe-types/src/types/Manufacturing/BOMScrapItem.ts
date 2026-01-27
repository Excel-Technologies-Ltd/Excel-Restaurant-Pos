
export interface BOMScrapItem{
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
	/**	Qty : Float	*/
	stock_qty: number
	/**	Rate : Currency	*/
	rate?: number
	/**	Amount : Currency	*/
	amount?: number
	/**	Stock UOM : Link - UOM	*/
	stock_uom?: string
	/**	Basic Rate (Company Currency) : Currency	*/
	base_rate?: number
	/**	Basic Amount (Company Currency) : Currency	*/
	base_amount?: number
}