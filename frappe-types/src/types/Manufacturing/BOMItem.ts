
export interface BOMItem{
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
	/**	Item operation : Link - Operation	*/
	operation?: string
	/**	Do Not Explode : Check	*/
	do_not_explode?: 0 | 1
	/**	BOM No : Link - BOM	*/
	bom_no?: string
	/**	Source Warehouse : Link - Warehouse	*/
	source_warehouse?: string
	/**	Allow Alternative Item : Check	*/
	allow_alternative_item?: 0 | 1
	/**	Is Stock Item : Check	*/
	is_stock_item?: 0 | 1
	/**	Item Description : Text Editor	*/
	description?: string
	/**	Image : Attach	*/
	image?: string
	/**	Image View : Image	*/
	image_view?: string
	/**	Qty : Float	*/
	qty: number
	/**	UOM : Link - UOM	*/
	uom: string
	/**	Stock Qty : Float	*/
	stock_qty?: number
	/**	Stock UOM : Link - UOM	*/
	stock_uom?: string
	/**	Conversion Factor : Float	*/
	conversion_factor?: number
	/**	Rate : Currency	*/
	rate: number
	/**	Basic Rate (Company Currency) : Currency	*/
	base_rate?: number
	/**	Amount : Currency	*/
	amount?: number
	/**	Amount (Company Currency) : Currency	*/
	base_amount?: number
	/**	Qty Consumed Per Unit : Float	*/
	qty_consumed_per_unit?: number
	/**	Has Variants : Check	*/
	has_variants?: 0 | 1
	/**	Include Item In Manufacturing : Check	*/
	include_item_in_manufacturing?: 0 | 1
	/**	Original Item : Link - Item	*/
	original_item?: string
	/**	Sourced by Supplier : Check	*/
	sourced_by_supplier?: 0 | 1
}