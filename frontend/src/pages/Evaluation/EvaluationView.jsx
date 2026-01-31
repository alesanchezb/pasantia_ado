import React, { useState, useMemo } from 'react';

// Títulos de columnas
const SECTION_HEADERS = {
  "I.":  { A: "En Matemáticas", B: "En Área Afín", C: "-" },
  "DEFAULT": { A: "Área Concurso", B: "Otras Matemáticas", C: "Otras Afines" }
};

export default function EvaluationView({ evaluationData }) {
  const [valores, setValores] = useState({});

  // --- LOGICA MODIFICADA PARA DESELECCIONAR ---
  const handleRadioClick = (sectionId, item, selectedKey) => {
    const uniqueKey = `${sectionId}_${item.id}_${selectedKey}`;
    const estaSeleccionado = valores[uniqueKey] === 1;

    const nuevos = { ...valores };

    // 1. Primero reseteamos TODA la fila a 0 (para limpiar cualquier selección previa)
    item.inputs.forEach(inp => { 
        nuevos[`${sectionId}_${item.id}_${inp.key}`] = 0; 
    });

    // 2. Si NO estaba seleccionado, lo seleccionamos (1).
    //    Si YA estaba seleccionado, no hacemos nada (se queda en 0 por el paso 1), logrando el efecto de deselección.
    if (!estaSeleccionado) {
        nuevos[uniqueKey] = 1;
    }

    setValores(nuevos);
  };

  // Cálculos
  const seccionesCalculadas = useMemo(() => {
    if (!evaluationData) return [];
    
    return evaluationData.map(seccion => {
      let totalSeccion = 0;
      const items = seccion.items.map(item => {
        let totalItem = 0;
        const inputsMap = {}; 
        item.inputs.forEach(inp => {
          const k = `${seccion.id}_${item.id}_${inp.key}`;
          const cantidad = valores[k] || 0;
          const subtotal = cantidad * inp.valor_unitario;
          totalItem += subtotal;
          inputsMap[inp.key] = { ...inp, cantidad, subtotal };
        });
        totalSeccion += totalItem;
        return { ...item, inputsMap, totalItem };
      });
      return { ...seccion, items, totalSeccion, excede: totalSeccion > seccion.max_puntos };
    });
  }, [evaluationData, valores]);

  if (!evaluationData) return <div className="p-10 text-center font-bold text-gray-500">Cargando evaluación...</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">Evaluación Curricular</h1>
        <p className="text-gray-500">Complete los rubros seleccionando la opción correspondiente. Puede hacer clic nuevamente para desmarcar.</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {seccionesCalculadas.map((seccion) => {
          const headers = SECTION_HEADERS[seccion.id] || SECTION_HEADERS["DEFAULT"];
          const tieneB = seccion.items.some(i => i.inputsMap && i.inputsMap['col_B']);
          const tieneC = seccion.items.some(i => i.inputsMap && i.inputsMap['col_C']);

          return (
            <div key={seccion.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              
              {/* ENCABEZADO DE TARJETA */}
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                     Sección {seccion.id}
                   </span>
                   <h2 className="text-xl font-bold text-gray-800">{seccion.titulo}</h2>
                </div>
                
                <div className={`flex items-center px-4 py-2 rounded-lg border ${
                    seccion.excede ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                   <div className="text-right">
                      <span className="block text-2xl font-bold leading-none">{seccion.totalSeccion.toFixed(2)}</span>
                      <span className="text-[10px] font-bold uppercase opacity-70">Max: {seccion.max_puntos} pts</span>
                   </div>
                </div>
              </div>

              {/* TABLA */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 text-left w-[40%]">Concepto</th>
                      
                      {/* Cabecera A */}
                      <th className="w-20 text-center bg-blue-100 text-blue-800 border-l border-white">Valor</th>
                      <th className="w-24 text-center bg-blue-50 text-blue-800 border-r border-gray-200">{headers.A}</th>

                      {/* Cabecera B */}
                      {tieneB && <>
                        <th className="w-20 text-center bg-yellow-100 text-yellow-800 border-l border-white">Valor</th>
                        <th className="w-24 text-center bg-yellow-50 text-yellow-800 border-r border-gray-200">{headers.B}</th>
                      </>}

                      {/* Cabecera C */}
                      {tieneC && <>
                        <th className="w-20 text-center bg-orange-100 text-orange-800 border-l border-white">Valor</th>
                        <th className="w-24 text-center bg-orange-50 text-orange-800 border-r border-gray-200">{headers.C}</th>
                      </>}

                      <th className="px-6 py-4 text-right bg-gray-50 text-gray-700">Total</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100">
                    {seccion.items.map((item, idx) => {
                      
                      if (item.tipo === "subtitulo") {
                        return (
                          <tr key={idx} className="bg-gray-50">
                            <td colSpan="10" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {item.id} {item.concepto}
                            </td>
                          </tr>
                        );
                      }

                      const uniqueGroupName = `radio_group_${seccion.id}_row_${idx}`;

                      return (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150 group">
                          
                          {/* Columna Concepto */}
                          <td className="px-6 py-4">
                            <div className={`flex flex-col ${item.tipo === "subitem" ? "pl-4 border-l-2 border-gray-300" : ""}`}>
                               {item.tipo === "item" && (
                                 <span className="text-[10px] font-bold text-gray-400 mb-1">{item.id}</span>
                               )}
                               <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                   {item.concepto}
                               </span>
                            </div>
                          </td>

                          {/* --- Columna A --- */}
                          <td className="text-center bg-gray-50/50 border-l border-gray-100">
                              <span className="text-xs font-mono font-bold text-gray-400">
                                  {item.inputsMap['col_A']?.valor_unitario || '-'}
                              </span>
                          </td>
                          <td className="text-center border-r border-gray-100 relative">
                            {item.inputsMap['col_A'] ? (
                                <div className="flex justify-center items-center h-full py-2">
                                  <input 
                                    type="radio" 
                                    name={uniqueGroupName}
                                    checked={item.inputsMap['col_A'].cantidad === 1}
                                    // CAMBIO IMPORTANTE: onClick en lugar de onChange para detectar clicks repetidos
                                    onClick={() => handleRadioClick(seccion.id, item, 'col_A')}
                                    readOnly // Evita warning de React ya que controlamos con onClick
                                    className="w-5 h-5 cursor-pointer accent-blue-600" 
                                  />
                                </div>
                            ) : <span className="text-gray-200">-</span>}
                          </td>

                          {/* --- Columna B --- */}
                          {tieneB && <>
                            <td className="text-center bg-gray-50/50 border-l border-gray-100">
                                <span className="text-xs font-mono font-bold text-gray-400">
                                    {item.inputsMap['col_B']?.valor_unitario || '-'}
                                </span>
                            </td>
                            <td className="text-center border-r border-gray-100">
                              {item.inputsMap['col_B'] ? (
                                  <div className="flex justify-center items-center h-full py-2">
                                    <input 
                                      type="radio" 
                                      name={uniqueGroupName}
                                      checked={item.inputsMap['col_B'].cantidad === 1}
                                      onClick={() => handleRadioClick(seccion.id, item, 'col_B')}
                                      readOnly
                                      className="w-5 h-5 cursor-pointer accent-yellow-600" 
                                    />
                                  </div>
                              ) : <span className="text-gray-200">-</span>}
                            </td>
                          </>}

                          {/* --- Columna C --- */}
                          {tieneC && <>
                            <td className="text-center bg-gray-50/50 border-l border-gray-100">
                                <span className="text-xs font-mono font-bold text-gray-400">
                                    {item.inputsMap['col_C']?.valor_unitario || '-'}
                                </span>
                            </td>
                            <td className="text-center border-r border-gray-100">
                              {item.inputsMap['col_C'] ? (
                                  <div className="flex justify-center items-center h-full py-2">
                                    <input 
                                      type="radio" 
                                      name={uniqueGroupName}
                                      checked={item.inputsMap['col_C'].cantidad === 1}
                                      onClick={() => handleRadioClick(seccion.id, item, 'col_C')}
                                      readOnly
                                      className="w-5 h-5 cursor-pointer accent-orange-600" 
                                    />
                                  </div>
                              ) : <span className="text-gray-200">-</span>}
                            </td>
                          </>}

                          {/* Total Fila */}
                          <td className="px-6 py-4 text-right bg-gray-50/30">
                             <span className={`text-sm font-bold ${item.totalItem > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                {item.totalItem > 0 ? item.totalItem.toFixed(2) : '-'}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER TOTAL */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="text-xs text-gray-400 hidden sm:block">
                * Verifique no exceder los topes establecidos en cada sección.
             </div>
             <div className="flex items-center gap-4">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total General</span>
                 <span className="text-3xl font-black text-gray-800">
                    {seccionesCalculadas.reduce((acc, sec) => acc + Math.min(sec.totalSeccion, sec.max_puntos), 0).toFixed(2)}
                 </span>
             </div>
          </div>
      </div>
      
      <div className="h-20"></div>
    </div>
  );
}
