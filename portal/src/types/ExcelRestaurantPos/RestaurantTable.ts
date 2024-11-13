export interface RestaurantTable {
  name?: string;
  creation?: string;
  modified?: string;
  owner?: string;
  modified_by?: string;
  docstatus?: 0 | 1 | 2;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  idx?: number;
  /**	Company : Link - Company	*/
  company: string;
  /**	Floor : Link - Restaurant Floor	*/
  restaurant_floor: string;
  /**	Seat : Int	*/
  seat: number | string;
  /**	Type : Select	*/
  type: TableType;
  /**	Bg Color : Data	*/
  bg_color?: string;
  /**	Position : JSON	*/
  position: {
    x: number;
    y: number;
  };
  /**	Length : Data	*/
  length: number;
  /**	Breadth : Data	*/
  breadth: number;
  /**	File Path : Data	*/
  file_path?: string;
  /**	Id : Data	*/
  id: string;
  /**	Rotation : Data	*/
  rotation?: string;
  /**	Table No : Int	*/
  table_no: number | string;
}

export type TableType = "Rectangle" | "Circle" | "Road";
