import { ModeofPaymentAccount } from './ModeofPaymentAccount'

export interface ModeofPayment{
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
	/**	Mode of Payment : Data	*/
	mode_of_payment: string
	/**	Enabled : Check	*/
	enabled?: 0 | 1
	/**	Type : Select	*/
	type?: "Cash" | "Bank" | "General" | "Phone"
	/**	Accounts : Table - Mode of Payment Account	*/
	accounts?: ModeofPaymentAccount[]
}