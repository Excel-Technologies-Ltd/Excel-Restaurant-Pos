import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useState } from "react";
import SearchSelect from "../../components/searchable-select/SearchSelect";
import { useDebounce } from "../../hook/useDebounce";

export default function Wastage() {
  const [sourceWarehouse, setSourceWarehouse] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [rows, setRows] = useState<
    Array<{ item_code: string; qty: number | undefined; searchText: string }>
  >([{ item_code: "", qty: undefined, searchText: "" }]);

  // Add search states
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const debouncedWarehouseSearch = useDebounce(warehouseSearch, 300);

  const { createDoc, loading, error } = useFrappeCreateDoc<any>();

  // Update warehouse query with search filters
  const getWarehouseDropdownList = () => {
    return useFrappeGetDocList("Warehouse", {
      fields: ["name"],
      orderBy: {
        field: "name",
        order: "asc",
      },
      filters: debouncedWarehouseSearch
        ? ([["name", "like", `%${debouncedWarehouseSearch}%`]] as any[])
        : undefined,
      limit: 50,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (rows?.length === 0) {
      setMessage("Please add at least one item.");
      return;
    }
    if (!sourceWarehouse) {
      setMessage("Please select source warehouse.");
      return;
    }
    try {
      const items = rows
        .filter((r) => r.item_code && r.qty && r.qty > 0)
        .map((r) => ({ item_code: r.item_code, qty: r.qty as number }));

      const doc = {
        doctype: "Stock Entry",
        stock_entry_type: "Material Issue",
        from_warehouse: sourceWarehouse,
        docstatus: 1,
        items: items?.map((it) => ({
          item_code: it.item_code,
          qty: it.qty,
          s_warehouse: sourceWarehouse,
        })),
      } as const;

      const res = await createDoc("Stock Entry", doc as any);

      if ((res as any)?.name) {
        setMessage("Stock transferred successfully.");
      } else {
        setMessage("Transfer completed.");
      }
      setSourceWarehouse("");
      setRows([{ item_code: "", qty: undefined, searchText: "" }]);
    } catch (err) {
      // extract the error message
      const errorMessage = (err as any)?.message;
      setMessage("stock transfer failed: " + errorMessage);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Wastage Management</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Source Warehouse
            </label>
            <SearchSelect
              // options={(warehouses ?? []).map((w: any) => w.name)}
              options={
                getWarehouseDropdownList()?.data?.map((w: any) => w.name) ?? []
              }
              value={sourceWarehouse}
              onChange={setSourceWarehouse}
              searchText={warehouseSearch}
              onSearchTextChange={setWarehouseSearch}
              // disabled={isLoadingWarehouses}
              placeholder="Search warehouses..."
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Items</h2>
            <button
              type="button"
              onClick={() =>
                setRows((prev) => [
                  ...prev,
                  { item_code: "", qty: undefined, searchText: "" },
                ])
              }
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Add Row
            </button>
          </div>
          <div className="overflow-auto border rounded p-3 max-h-[500px]">
            <table className="min-w-[580px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2 w-40">Qty</th>
                  <th className="p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row, idx) => (
                  <ItemRow
                    key={idx}
                    row={row}
                    index={idx}
                    rows={rows}
                    setRows={setRows}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primaryColor text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          {error && (
            <span className="text-red-600 text-sm">
              {error?.message ?? "Failed"}
            </span>
          )}
          {message && !error && (
            <span className="text-green-700 text-sm">{message}</span>
          )}
        </div>
      </form>
    </div>
  );
}

// New component for each item row with its own search
function ItemRow({
  row,
  index,
  rows,
  setRows,
}: {
  row: { item_code: string; qty: number | undefined; searchText: string };
  index: number;
  rows: Array<{
    item_code: string;
    qty: number | undefined;
    searchText: string;
  }>;
  setRows: React.Dispatch<
    React.SetStateAction<
      Array<{ item_code: string; qty: number | undefined; searchText: string }>
    >
  >;
}) {
  const debouncedSearchItem = useDebounce(row.searchText, 300);

  const getCustomerDropdownList = (name?: string | null) => {
    return useFrappeGetDocList("Item", {
      fields: ["name"],
      orderBy: {
        field: "modified",
        order: "desc",
      },
      filters: debouncedSearchItem
        ? ([
            ["disabled", "=", 0],
            ["name", "like", `%${debouncedSearchItem}%`],
          ] as any[])
        : ([["disabled", "=", 0]] as any[]),
      limit: 50,
    });
  };

  return (
    <tr className="border-t">
      <td className="p-2">
        <SearchSelect
          // options={(items ?? []).map((i: any) => i.name)}
          options={
            getCustomerDropdownList(debouncedSearchItem)?.data?.map(
              (i: any) => i.name
            ) ?? []
          }
          value={row.item_code}
          onChange={(val) =>
            setRows((prev) =>
              prev.map((r, i) => (i === index ? { ...r, item_code: val } : r))
            )
          }
          // disabled={isLoadingItems}
          searchText={row.searchText}
          onSearchTextChange={(text) =>
            setRows((prev) =>
              prev.map((r, i) => (i === index ? { ...r, searchText: text } : r))
            )
          }
          placeholder="Search items..."
          // isLoading={isLoadingItems}
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          required
          min={0}
          step={0.001}
          value={row.qty ?? ""}
          onChange={(e) =>
            setRows((prev) =>
              prev.map((r, i) =>
                i === index ? { ...r, qty: Number(e.target.value) } : r
              )
            )
          }
          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring"
          placeholder="0"
        />
      </td>
      <td className="p-2 text-center">
        <button
          type="button"
          onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
          className="text-red-600 hover:underline"
          disabled={rows.length === 1}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
