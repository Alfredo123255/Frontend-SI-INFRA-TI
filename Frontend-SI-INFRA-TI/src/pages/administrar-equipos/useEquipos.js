import { useEffect, useState } from "react";
import { listarServidores, listarStorage, listarSwitches, listarChasisBlades } from "../../api/client";

const CATEGORIA_LABEL = {
  servidores: "Servidor",
  storage: "Storage",
  switches: "Switch",
  "chasis-blades": "Chasis Blade",
};

export function useEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [servidores, storage, switches, chasis] = await Promise.all([
          listarServidores(),
          listarStorage(),
          listarSwitches(),
          listarChasisBlades(),
        ]);
        if (cancelled) return;
        const build = (list, categoria) =>
          list.map((dto) => ({
            key: `${categoria}:${dto.id}`,
            id: dto.id,
            hostname: dto.hostname,
            categoria,
            categoriaLabel: CATEGORIA_LABEL[categoria],
          }));
        setEquipos([
          ...build(servidores, "servidores"),
          ...build(storage, "storage"),
          ...build(switches, "switches"),
          ...build(chasis, "chasis-blades"),
        ]);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { equipos, loading, error };
}
