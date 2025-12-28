import { SalesTaxesandCharges } from './SalesTaxesandCharges'

export interface SalesTaxesandChargesTemplate{
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
	/**	Title : Data	*/
	title: string
	/**	Default : Check	*/
	is_default?: 0 | 1
	/**	Disabled : Check	*/
	disabled?: 0 | 1
	/**	Company : Link - Company	*/
	company: string
	/**	Tax Category : Link - Tax Category	*/
	tax_category?: string
	/**	Sales Taxes and Charges : Table - Sales Taxes and Charges - * Will be calculated in the transaction.	*/
	taxes?: SalesTaxesandCharges[]
}