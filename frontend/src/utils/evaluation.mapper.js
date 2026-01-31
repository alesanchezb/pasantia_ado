export function buildEvaluationStructure(rows) {
  const map = {};

  rows.forEach(r => {
    if (!map[r.seccion_id]) {
      map[r.seccion_id] = {
        id: r.seccion_id,
        name: r.seccion_nombre,
        max: Number(r.seccion_max),
        items: {},
      };
    }

    if (!map[r.seccion_id].items[r.item_id]) {
      map[r.seccion_id].items[r.item_id] = {
        id: r.item_id,
        name: r.item_nombre,
        options: [],
      };
    }

    map[r.seccion_id].items[r.item_id].options.push({
      id: r.opcion,
      points: Number(r.puntaje),
    });
  });

  return Object.values(map).map(sec => ({
    ...sec,
    items: Object.values(sec.items),
  }));
}
