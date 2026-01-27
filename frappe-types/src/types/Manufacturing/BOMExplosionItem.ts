
export interface BOMExplosionItem{
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
	item_code?: string
	/**	Item Name : Data	*/
	item_name?: string
	/**	Source Warehouse : Link - Warehouse	*/
	source_warehouse?: string
	/**	Operation : Link - Operation	*/
	operation?: string
	/**	Description : Text Editor	*/
	description?: string
	/**	Image : Attach	*/
	image?: string
	/**	Image View : Image	*/
	image_view?: string
	/**	Stock Qty : Float	*/
	stock_qty?: number
	/**	Rate : Currency	*/
	rate?: number
	/**	Qty Consumed Per Unit : Float	*/
	qty_consumed_per_unit?: number
	/**	Stock UOM : Link - UOM	*/
	stock_uom?: string
	/**	Amount : Currency	*/
	amount?: number
	/**	Include Item In Manufacturing : Check	*/
	include_item_in_manufacturing?: 0 | 1
	/**	Sourced by Supplier : Check	*/
	sourced_by_supplier?: 0 | 1
}