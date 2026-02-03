import React, { useState, useMemo } from 'react';

// --- MOCK DATA PARA EVIDENCIAS ---
const MOCK_APPLICANT_EVIDENCES = {
  "grado_licenciatura": [
    { id: 101, name: "Titulo_Licenciatura_UNISON.pdf", url: "#", source: "PORTAL", reviewed_by: "Dr. Roberto", reviewed_at: "2023-11-01" }
  ],
  "experiencia_docencia": [
    { id: 102, name: "Constancia_Semestre_2022_2.pdf", url: "#", source: "UPLOAD", reviewed_by: "Dra. Ana L.", reviewed_at: "2023-11-02" },
    { id: 103, name: "Constancia_Semestre_2023_1.pdf", url: "#", source: "UPLOAD", reviewed_by: null, reviewed_at: null }
  ]
};

const SECTION_HEADERS = {
  "I.":  { A: "En Matemáticas", B: "En Área Afín", C: "-" },
  "DEFAULT": { A: "Área Concurso", B: "Otras Matemáticas", C: "Otras Afines" }
};

// ==========================================
// COMPONENTE: VISOR DE EVIDENCIAS
// ==========================================
const EvidenceViewer = ({ evidenceKind }) => {
  if (!evidenceKind) return null;
  const files = MOCK_APPLICANT_EVIDENCES[evidenceKind] || [];
  if (files.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 max-w-sm">
      {files.map(file => {
        const isReviewed = Boolean(file.reviewed_by);
        const isPortal = file.source === "PORTAL";

        return (
          <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 truncate pr-2">
              <span title={isPortal ? "Documento del Portal" : "Subido por usuario"} className="text-base leading-none">
                {isPortal ? "🏛️" : "☁️"} 
              </span>
              <a href={file.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate">
                {file.name}
              </a>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center justify-end">
              {isReviewed ? (
                <div className="flex flex-col text-right">
                  <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Revisado
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">por {file.reviewed_by}</span>
                </div>
              ) : (
                <button className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-2.5 py-1 rounded text-xs font-bold transition-colors">
                  Validar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};;


// ==========================================
// COMPONENTE PRINCIPAL DE EVALUACIÓN
// ==========================================
export default function EvaluationView({ evaluationData }) {
  const [valores, setValores] = useState({});

  const handleRadioClick = (sectionId, item, selectedKey) => {
    const uniqueKey = `${sectionId}_${item.id}_${selectedKey}`;
    const estaSeleccionado = valores[uniqueKey] === 1;
    const nuevos = { ...valores };
    item.inputs.forEach(inp => { nuevos[`${sectionId}_${item.id}_${inp.key}`] = 0; });
    if (!estaSeleccionado) nuevos[uniqueKey] = 1;
    setValores(nuevos);
  };

  const handleNumberChange = (sectionId, item, selectedKey, value) => {
    const uniqueKey = `${sectionId}_${item.id}_${selectedKey}`;
    const intValue = parseInt(value, 10);
    setValores(prev => ({ ...prev, [uniqueKey]: !isNaN(intValue) && intValue >= 0 ? intValue : 0 }));
  };

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


  const InputCell = ({ item, columnKey, uniqueGroupName, sectionId, color }) => {
    const inputMap = item.inputsMap[columnKey];
    const bgClass = color === 'blue' ? 'bg-blue-50/10' : color === 'yellow' ? 'bg-amber-50/20' : 'bg-orange-50/20';
    const accentClass = color === 'blue' ? 'accent-blue-600' : color === 'yellow' ? 'accent-amber-500' : 'accent-orange-500';

    if (!inputMap) return <td className={`text-center border-r border-slate-100 ${bgClass}`}><span className="text-slate-200">-</span></td>;

    if (item.input_type === 'number') {
      return (
        <td className={`text-center border-r border-slate-100 p-2 align-middle ${bgClass}`}>
          <input type="number" min="0" value={inputMap.cantidad || ''} 
            onChange={(e) => handleNumberChange(sectionId, item, columnKey, e.target.value)}
            className="w-16 text-center py-1.5 border border-slate-300 rounded focus:border-blue-500 font-bold shadow-sm" placeholder="0" />
        </td>
      );
    }
    return (
      <td className={`text-center border-r border-slate-100 align-middle ${bgClass}`}>
        <div className="flex justify-center items-center h-full py-2">
          <input type="radio" name={uniqueGroupName} checked={inputMap.cantidad === 1} 
            onClick={() => handleRadioClick(sectionId, item, columnKey)} readOnly 
            className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${accentClass}`} />
        </div>
      </td>
    );
  };

  if (!evaluationData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Cargando evaluación...</div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-32">
      
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Evaluación Curricular</h1>
              <p className="text-slate-500 text-sm mt-1">Universidad de Sonora • Campus Hermosillo</p>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-10 bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Postulante a Evaluar</span>
            <h2 className="text-xl font-black text-slate-800">Postulante 1</h2>
            <p className="text-sm font-medium text-slate-500">Departamento de Matemáticas</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-400 font-bold uppercase">Evaluador:</span>
            <span className="text-sm font-bold text-slate-700">Dr. Adrian</span>
          </div>
        </div>

        <div className="space-y-8">
          {seccionesCalculadas.map((seccion) => {
            const headers = SECTION_HEADERS[seccion.id] || SECTION_HEADERS["DEFAULT"];
            const tieneB = seccion.items.some(i => i.inputsMap && i.inputsMap['col_B']);
            const tieneC = seccion.items.some(i => i.inputsMap && i.inputsMap['col_C']);

            return (
              <div key={seccion.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg">
                
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">Sección {seccion.id}</span>
                      <h2 className="text-lg font-bold text-slate-800">{seccion.titulo}</h2>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${seccion.excede ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="text-2xl font-bold leading-none">{seccion.totalSeccion.toFixed(2)}</span>
                    <div className="flex flex-col text-[10px] font-bold uppercase leading-tight opacity-70">
                      <span>pts</span><span>/ {seccion.max_puntos} max</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                        <th className="px-6 py-4 text-left bg-slate-50 w-[45%]">Concepto y Evidencias</th>
                        <th className="w-16 text-center bg-blue-50/60 border-l border-slate-200 text-blue-600">Valor</th>
                        <th className="w-24 text-center bg-blue-50 text-blue-800 border-r border-slate-200">{headers.A}</th>
                        {tieneB && <>
                          <th className="w-16 text-center bg-amber-50/60 text-amber-600">Valor</th>
                          <th className="w-24 text-center bg-amber-50 text-amber-800 border-r border-slate-200">{headers.B}</th>
                        </>}
                        {tieneC && <>
                          <th className="w-16 text-center bg-orange-50/60 text-orange-600">Valor</th>
                          <th className="w-24 text-center bg-orange-50 text-orange-800 border-r border-slate-200">{headers.C}</th>
                        </>}
                        <th className="px-6 py-4 text-right bg-slate-50 w-32">Total</th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100">
                      {seccion.items.map((item, idx) => {
                        if (item.tipo === "subtitulo") {
                          return (
                            <tr key={idx} className="bg-slate-100/80">
                              <td colSpan="10" className="px-6 py-3">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                  {item.id} {item.concepto}
                                </span>
                                {/* AHORA TAMBIÉN RENDERIZAMOS EVIDENCIAS AQUÍ */}
                                {item.evidence_kind && (
                                  <div className="mt-1">
                                    <EvidenceViewer evidenceKind={item.evidence_kind} />
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        };

                        const uniqueGroup = `radio_${seccion.id}_${idx}`;

                        // --- CORRECCIÓN 1: LÓGICA PARA OCULTAR "autoid_" ---
                        const esIdReal = item.tipo === "item" && !item.id.startsWith("autoid_");

                        return (
                          <tr key={idx} className="group hover:bg-slate-50 transition-colors duration-150">
                            
                            <td className="px-6 py-4 align-top">
                              <div className={`flex flex-col ${item.tipo === "subitem" ? "pl-4 border-l-2 border-slate-300" : ""}`}>
                                 {/* CORRECCIÓN 1: Solo renderiza el ID si es real */}
                                 {esIdReal && <span className="text-[10px] font-bold text-slate-400 mb-0.5">{item.id}</span>}
                                 
                                 <span className="text-sm font-medium text-slate-700 leading-snug">{item.concepto}</span>
                                 
                                 {item.evidence_kind && (
                                    <EvidenceViewer evidenceKind={item.evidence_kind} />
                                 )}
                              </div>
                            </td>

                            <td className="text-center font-mono text-xs text-slate-400 bg-blue-50/5 border-l border-slate-100 align-middle">{item.inputsMap['col_A']?.valor_unitario || '-'}</td>
                            <InputCell item={item} columnKey="col_A" uniqueGroupName={uniqueGroup} sectionId={seccion.id} color="blue" />
                            
                            {tieneB && <>
                              <td className="text-center font-mono text-xs text-slate-400 bg-amber-50/5 align-middle">{item.inputsMap['col_B']?.valor_unitario || '-'}</td>
                              <InputCell item={item} columnKey="col_B" uniqueGroupName={uniqueGroup} sectionId={seccion.id} color="yellow" />
                            </>}
                            
                            {tieneC && <>
                              <td className="text-center font-mono text-xs text-slate-400 bg-orange-50/5 align-middle">{item.inputsMap['col_C']?.valor_unitario || '-'}</td>
                              <InputCell item={item} columnKey="col_C" uniqueGroupName={uniqueGroup} sectionId={seccion.id} color="orange" />
                            </>}

                            <td className="px-6 py-4 text-right align-middle">
                               <span className={`text-sm font-bold ${item.totalItem > 0 ? 'text-blue-700' : 'text-slate-300'}`}>
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
      </div>

      {/* --- CORRECCIÓN 2 y 3: FOOTER MEJORADO Y TOTAL VISIBLE --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-[100]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-xs text-slate-500 hidden md:block">
                * Revisa que los subtotales no excedan el límite de cada sección.
             </div>
             
             <div className="flex items-center gap-6">
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puntuación Total</div>
                    {/* CORRECCIÓN 2: Texto de color sólido (blue-700) para asegurar que se vea */}
                    <div className="text-3xl font-black text-blue-700 leading-none">
                        {seccionesCalculadas.reduce((acc, sec) => acc + Math.min(sec.totalSeccion, sec.max_puntos), 0).toFixed(2)}
                    </div>
                 </div>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    Finalizar Evaluación
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
}
