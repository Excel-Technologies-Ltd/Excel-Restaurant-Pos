import { BOMItem } from './BOMItem'
import { BOMOperation } from './BOMOperation'
import { BOMScrapItem } from './BOMScrapItem'
import { BOMExplosionItem } from './BOMExplosionItem'

export interface BOM{
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
	/**	Item : Link - Item - Item to be manufactured or repacked	*/
	item: string
	/**	Company : Link - Company	*/
	company: string
	/**	Item UOM : Link - UOM	*/
	uom?: string
	/**	Quantity : Float - Quantity of item obtained after manufacturing / repacking from given quantities of raw materials	*/
	quantity: number
	/**	Display Name : Data	*/
	custom_display_name?: string
	/**	Is Active : Check	*/
	is_active?: 0 | 1
	/**	Is Default : Check	*/
	is_default?: 0 | 1
	/**	With Ingredients? : Select	*/
	custom_with_ingredients?: "Yes" | "No"
	/**	Allow Alternative Item : Check	*/
	allow_alternative_item?: 0 | 1
	/**	Set rate of sub-assembly item based on BOM : Check	*/
	set_rate_of_sub_assembly_item_based_on_bom?: 0 | 1
	/**	Project : Link - Project	*/
	project?: string
	/**	Image : Attach Image	*/
	image?: string
	/**	Rate Of Materials Based On : Select	*/
	rm_cost_as_per?: "Valuation Rate" | "Last Purchase Rate" | "Price List"
	/**	Price List : Link - Price List	*/
	buying_price_list?: string
	/**	Price List Currency : Link - Currency	*/
	price_list_currency?: string
	/**	Price List Exchange Rate : Float	*/
	plc_conversion_rate?: number
	/**	Currency : Link - Currency	*/
	currency: string
	/**	Conversion Rate : Float	*/
	conversion_rate: number
	/**	Items : Table - BOM Item	*/
	items: BOMItem[]
	/**	With Operations : Check - Manage cost of operations	*/
	with_operations?: 0 | 1
	/**	Transfer Material Against : Select	*/
	transfer_material_against?: "" | "Work Order" | "Job Card"
	/**	Routing : Link - Routing	*/
	routing?: string
	/**	FG based Operating Cost : Check	*/
	fg_based_operating_cost?: 0 | 1
	/**	Operating Cost Per BOM Quantity : Currency	*/
	operating_cost_per_bom_quantity?: number
	/**	Operations : Table - BOM Operation	*/
	operations?: BOMOperation[]
	/**	Scrap Items : Table - BOM Scrap Item	*/
	scrap_items?: BOMScrapItem[]
	/**	% Process Loss : Percent	*/
	process_loss_percentage?: number
	/**	Process Loss Qty : Float	*/
	process_loss_qty?: number
	/**	Operating Cost : Currency	*/
	operating_cost?: number
	/**	Raw Material Cost : Currency	*/
	raw_material_cost?: number
	/**	Scrap Material Cost : Currency	*/
	scrap_material_cost?: number
	/**	Operating Cost (Company Currency) : Currency	*/
	base_operating_cost?: number
	/**	Raw Material Cost (Company Currency) : Currency	*/
	base_raw_material_cost?: number
	/**	Scrap Material Cost(Company Currency) : Currency	*/
	base_scrap_material_cost?: number
	/**	Total Cost : Currency	*/
	total_cost?: number
	/**	Total Cost (Company Currency) : Currency	*/
	base_total_cost?: number
	/**	Item Name : Data	*/
	item_name?: string
	/**	Item Description : Small Text	*/
	description?: string
	/**	Has Variants : Check	*/
	has_variants?: 0 | 1
	/**	Quality Inspection Required : Check	*/
	inspection_required?: 0 | 1
	/**	Quality Inspection Template : Link - Quality Inspection Template	*/
	quality_inspection_template?: string
	/**	Exploded Items : Table - BOM Explosion Item	*/
	exploded_items?: BOMExplosionItem[]
	/**	Show in Website : Check	*/
	show_in_website?: 0 | 1
	/**	Route : Small Text	*/
	route?: string
	/**	Website Image : Attach Image - Item Image (if not slideshow)	*/
	website_image?: string
	/**	Thumbnail : Data	*/
	thumbnail?: string
	/**	Show Items : Check	*/
	show_items?: 0 | 1
	/**	Show Operations : Check	*/
	show_operations?: 0 | 1
	/**	Website Description : Text Editor	*/
	web_long_description?: string
	/**	Amended From : Link - BOM	*/
	amended_from?: string
}