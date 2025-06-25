export const crearMovimiento = async (payload: {
  tipo: string;
  cantidad: number;
  descripcion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}) => {
  const response = await fetch("http://localhost:3000/movimiento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Error al crear el movimiento");
  return await response.json();
};