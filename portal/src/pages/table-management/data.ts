// // data.ts
// export interface TableShape {
//   id: string;
//   shape: "rectangle" | "circle";
//   width: number;
//   height: number;
//   position: {
//     x: number;
//     y: number;
//   };
// }

// const API_URL = "/api/tables"; // Replace with your actual API URL

// export const fetchTables = async (): Promise<TableShape[]> => {
//   const response = await fetch(API_URL);
//   if (!response.ok) {
//     throw new Error("Failed to fetch tables");
//   }
//   return await response.json();
// };

// export const saveTablePosition = async (table: TableShape): Promise<void> => {
//   console.log({ table });
//   await fetch(`${API_URL}/${table.id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(table),
//   });
// };

// export const deleteTable = async (id: string): Promise<void> => {
//   console.log({ id });
//   await fetch(`${API_URL}/${id}`, {
//     method: "DELETE",
//   });
// };
