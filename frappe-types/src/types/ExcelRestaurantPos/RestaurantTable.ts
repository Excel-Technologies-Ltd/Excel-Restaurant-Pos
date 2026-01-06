
export interface RestaurantTable{
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
	/**	Display Name : Data	*/
	id: string
	/**	Criteria : Select	*/
	criteria: "Table" | "Delivery" | "Pickup"
	/**	Floor : Link - Restaurant Floor	*/
	restaurant_floor: string
	/**	Section : Link - Restaurant Section	*/
	section?: string
	/**	Table No : Int	*/
	table_no: number
	/**	Seat : Int	*/
	seat: number
	/**	Company : Link - Company	*/
	company: string
	/**	Status : Select	*/
	status?: "Available" | "Occupied" | "Unavailable"
	/**	Running Order : Link - Sales Invoice	*/
	running_order?: string
	/**	Website URL : Data	*/
	website_url?: string
	/**	Is Temporary? : Check	*/
	is_temporary?: 0 | 1
	/**	Type : Select	*/
	type?: "" | "Rectangle" | "Circle" | "Road"
	/**	Bg Color : Data	*/
	bg_color?: string
	/**	Position : JSON	*/
	position?: any
	/**	Length : Data	*/
	length?: string
	/**	Breadth : Data	*/
	breadth?: string
	/**	File Path : Data	*/
	file_path?: string
	/**	Rotation : Data	*/
	rotation?: string
}