import XLSX from "xlsx";

export type ImportedOrder = {
  platform: "shopee" | "tiktok";
  orderNumber: string;
  quantity: number;
};

export function parseImportedOrders(
  platform: "shopee" | "tiktok",
  fileBuffer: Buffer,
  filename: string
): ImportedOrder[] {
  if (filename.endsWith(".csv")) {
    const rows = fileBuffer.toString("utf8").trim().split(/\r?\n/);

    return rows.slice(1).map((line) => {
      const [orderNumber, quantity] = line.split(",");
      return {
        platform,
        orderNumber,
        quantity: Number(quantity),
      };
    });
  }

  const workbook = XLSX.read(fileBuffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ order_number: string; quantity: number }>(sheet);

  return rows.map((row) => ({
    platform,
    orderNumber: row.order_number,
    quantity: Number(row.quantity),
  }));
}
