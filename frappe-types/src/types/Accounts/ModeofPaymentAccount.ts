
export interface ModeofPaymentAccount{
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
	/**	Company : Link - Company	*/
	company?: string
	/**	Default Account : Link - Account - Default account will be automatically updated in POS Invoice when this mode is selected.	*/
	default_account?: string
}