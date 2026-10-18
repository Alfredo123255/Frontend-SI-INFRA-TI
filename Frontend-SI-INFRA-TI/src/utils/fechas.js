export function fechaHoraLima(valor, vacio = "—") {
  if (!valor) return vacio;
  let texto = String(valor);
  if (/^\d{4}-\d\d-\d\d[T ]/.test(texto) && !/(Z|[+-]\d\d:\d\d)$/i.test(texto)) {
    texto = `${texto.replace(" ", "T")}Z`;
  }
  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) return vacio;
  return `${fecha.toLocaleString("es-PE", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima",
  })} (Lima)`;
}
