const $=id=>document.getElementById(id);
let baseName="documento";
try{pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";}catch(e){}

const drop=$("drop"),file=$("file");
drop.onclick=()=>file.click();
drop.ondragover=e=>{e.preventDefault();drop.classList.add("on")};
drop.ondragleave=()=>drop.classList.remove("on");
drop.ondrop=e=>{e.preventDefault();drop.classList.remove("on");if(e.dataTransfer.files[0])load(e.dataTransfer.files[0])};
file.onchange=()=>{if(file.files[0])load(file.files[0])};

async function load(f){
  $("fn").textContent=f.name;$("st").textContent="Leyendo documento…";
  baseName=f.name.replace(/\.[^.]+$/,"")+"_anonimizado";
  try{
    const ext=f.name.split(".").pop().toLowerCase();let t="";
    const buf=await f.arrayBuffer();
    if(ext==="pdf"){
      const pdf=await pdfjsLib.getDocument({data:buf}).promise;
      for(let i=1;i<=pdf.numPages;i++){
        const c=await (await pdf.getPage(i)).getTextContent();
        let line="";const ls=[];let y=null;
        c.items.forEach(it=>{const yy=it.transform[5];if(y!==null&&Math.abs(yy-y)>3){ls.push(line);line=""}line+=it.str;y=yy});
        ls.push(line);t+=ls.join("\n")+"\n\n";
      }
      if(t.trim().length<20)throw new Error("El PDF parece escaneado (sin texto). Hace falta OCR primero.");
    }else if(ext==="docx"){
      t=(await mammoth.extractRawText({arrayBuffer:buf})).value;
    }else if(ext==="txt"){
      t=new TextDecoder().decode(buf);
    }else throw new Error("Formato no soportado. Para .doc viejo, guardalo como .docx.");
    $("orig").value=t;$("go").disabled=false;$("st").textContent="Listo para anonimizar.";
  }catch(e){$("st").textContent="Error: "+e.message}
}

const U="A-ZÁÉÍÓÚÑ",W="[A-ZÁÉÍÓÚÑa-záéíóúñ]";
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function anonymize(t,o,manual){
  const map={};let n=0,nd=0,md={};
  const person=s=>{const k=s.toLowerCase().replace(/\s+/g," ").trim();return map[k]||(map[k]="[PERSONA "+(++n)+"]")};
  if(o.caratula){
    t=t.replace(/["“«][^"”»\n]{3,200}?\s(?:c\/|s\/|y otros|contra)\s[^"”»\n]*["”»]/gi,"“[CARÁTULA]”");
    t=t.replace(/(autos\s+(?:caratulados|titulados)\s*:?\s*)["“«][^"”»]{3,250}["”»]/gi,"$1“[CARÁTULA]”");
    t=t.replace(/['‘][^'’\n]{3,200}?\s(?:c\/|s\/|y otros|contra)\s[^'’\n]*['’]/gi,"“[CARÁTULA]”");
    t=t.replace(/(caratulad[oa]s?\s*:?\s*)([^"“«'‘\n(][^\n(;]{3,200}?)(?=\s*(?:\(|;|\n|$|expte|expediente|nro|n[°º]))/gi,(m,a,b)=>{const c=b.split(/,\s+(?=[a-záéíóúñ])/)[0];return /\s(?:c\/|c\.|s\/|contra)\s/i.test(c)?a+"“[CARÁTULA]”"+b.slice(c.length):m});
  }
  if(o.expte)t=t.replace(/\b(?:(?:n[°º.]*|nro\.?|número)\s*de\s+)?(?:expte\.?|expdte\.?|expediente|cuij|sac|ipp|causa|legajo|autos|carpeta|incidente)\s*(?:n[°º.]*|nro\.?|número)?\s*:?\s*(?:[A-Z]{1,4}-?)?\d[\d./-]*\d/gi,"[EXPEDIENTE]");
  if(o.expte)t=t.replace(/(?<!(?:decreto|resoluci[oó]n|res\.|disposici[oó]n|dec\.|acordada|circular|ley)\s*(?:n[°º.]*\s*)?)\b\d{4,7}\/(?:19|20)\d{2}\b/gi,"[EXPEDIENTE]");
  if(o.juz)t=t.replace(/\b(?:juzgado|tribunal|c[áa]mara|fiscal[ií]a|defensor[ií]a|secretar[ií]a)\s+(?:(?:nacional|federal|provincial|civil|comercial|laboral|penal|familia|criminal|correccional|contencioso|administrativo|instrucci[óo]n|paz|menores|ejecuci[óo]n|de|del|la|el|en|lo|y|e)\s+){0,8}(?:n[°º.]*\s*|nro\.?\s*|n[úu]mero\s*)?\d{1,3}\b/gi,"[JUZGADO]");
  if(o.veh){
    t=t.replace(/\b(?:dominio|patente|dom\.)\s*(?:n[°º.]*\s*)?:?\s*(?:[A-Z]{3}\s?-?\d{3}|[A-Z]{2}\s?\d{3}\s?[A-Z]{2}|\d{3}\s?[A-Z]{3}|[A-Z]\d{3}[A-Z]{3})\b/gi,"[PATENTE]");
    t=t.replace(/\b[A-Z]{2}\s?\d{3}\s?[A-Z]{2}\b/g,"[PATENTE]");
    t=t.replace(/\b(?!(?:ART|LEY|DEC|RES|DNU|IVA|CBU|DNI|SAC|IPP|TEL|CEL)[\s-]?\d)[A-Z]{3}[\s-]?\d{3}\b/g,"[PATENTE]");
    t=t.replace(/\b(?:chasis|motor|VIN)\s*(?:n[°º.]*\s*)?:?\s*(?=[A-Z0-9]*\d)[A-Z0-9]{6,20}\b/gi,"[CHASIS/MOTOR]");
  }
  if(o.inm)t=t.replace(/\b(?:matr[ií]cula|folio real|partida(?:\s+inmobiliaria)?|nomenclatura catastral|padr[oó]n|inscripci[oó]n dominial)\s*(?:n[°º.]*\s*|nro\.?\s*|número\s*)?:?\s*(?=[\dA-Z./-]*\d)[\dA-Z./-]{3,}\b/gi,"[INMUEBLE]").replace(/\b(?:circ(?:unscripci[oó]n)?|secc(?:i[oó]n)?|mz|manzana|parc(?:ela)?|lote)\.?\s*(?:n[°º.]*\s*)?\d+[A-Za-z]?\b/gi,"[INMUEBLE]");
  if(o.cuit)t=t.replace(/\b(?:20|23|24|27|30|33|34)[-.\s]?\d{8}[-.\s]?\d\b/g,"[CUIT/CUIL]");
  if(o.dni){
    t=t.replace(/\b(?:D\.?N\.?I\.?|documento(?: nacional de identidad)?)(?:\s*(?:N[°º.]|Nro\.?|número))?\s*:?\s*\d{1,2}(?:\.?\d{3}){2}\b/gi,"[DNI]");
    t=t.replace(/\b\d{1,2}\.\d{3}\.\d{3}\b/g,"[DNI]");
  }
  if(o.mail)t=t.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,"[EMAIL]");
  if(o.cbu)t=t.replace(/\b\d{22}\b/g,"[CBU]");
  if(o.tel)t=t.replace(/\b(?:tel(?:éfono)?|cel(?:ular)?|whatsapp|tel\.)\.?\s*:?\s*[\d\s()+-]{6,}/gi,"[TELÉFONO]");
  if(o.dir)t=t.replace(/\b(?:calle|av\.|avenida|pasaje|pje\.|ruta|barrio|b°|domicilio\s+(?:real\s+)?(?:en|sito en|constituido en)?)\s+[^,;\n]{2,45}?\s*(?:n[°º.]*\s*)?\d{1,5}\b/gi,"[DIRECCIÓN]");
  manual.split("\n").map(s=>s.trim()).filter(s=>s.length>1).sort((a,b)=>b.length-a.length).forEach(s=>{
    t=t.replace(new RegExp("(?<![\\wÁÉÍÓÚÑáéíóúñ])"+esc(s).replace(/\s+/g,"\\s+")+"(?![\\wÁÉÍÓÚÑáéíóúñ])","gi"),()=>{if(!/\d/.test(s))return person(s);const k=s.toLowerCase();return md[k]||(md[k]="[DATO "+(++nd)+"]")});
  });
  if(o.nombres){
    t=t.replace(new RegExp("\\b(Sr\\.|Sra\\.|Srta\\.|Dr\\.|Dra\\.|Don|Doña|Lic\\.|Ing\\.|Cdor\\.|Cdora\\.|Esc\\.)\\s+(["+U+"]"+W+"+(?:\\s(?:(?:de|del|de la|y)\\s)?["+U+"]"+W+"+){0,3})","g"),(m,a,b)=>a+" "+person(b));
    t=t.replace(new RegExp("\\b["+U+"]{2,}(?:\\s["+U+"]{2,})*,\\s["+U+"]"+W+"+(?:\\s["+U+"]"+W+"+){0,2}","g"),m=>person(m));
    t=t.replace(new RegExp("\\b(?:["+U+"]{3,}\\s){1,3}["+U+"]{3,}\\b","g"),m=>/^(?:CL[ÁA]USULA|PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[ÉE]PTIMA|OCTAVA|NOVENA|D[ÉE]CIMA|CONTRATO|ANEXO|ADENDA|CONVENIO|ACTA|OBJETO|PRECIO|PLAZO|PARTES|TRIBUNAL|SALA|SECRETAR[ÍI]A|FISCAL[ÍI]A|DEFENSOR[ÍI]A|MINISTERIO|PODER JUDICIAL|JUZGADO|CÁMARA|CAMARA|SUPREMA CORTE|PROVINCIA DE|REPÚBLICA ARGENTINA|AUTOS|SENTENCIA|RESUELVO|VISTOS|CONSIDERANDO|FALLO|PRIMERA INSTANCIA|CIVIL Y COMERCIAL|LABORAL|FAMILIA|PENAL)/.test(m)?m:person(m));
  }
  return t;
}

function summarize(r){
  const L={"DATO":"datos indicados por vos","JUZGADO":"juzgados","CARÁTULA":"carátulas","EXPEDIENTE":"expedientes","DNI":"DNI","CUIT/CUIL":"CUIT/CUIL","EMAIL":"emails","TELÉFONO":"teléfonos","CBU":"CBU","DIRECCIÓN":"direcciones","PATENTE":"patentes","CHASIS/MOTOR":"chasis/motor","INMUEBLE":"datos de inmuebles"};
  const c={},p=new Set();let pm=0;
  (r.match(/\[(?:PERSONA \d+|DATO \d+|JUZGADO|CARÁTULA|EXPEDIENTE|DNI|CUIT\/CUIL|EMAIL|TELÉFONO|CBU|DIRECCIÓN|PATENTE|CHASIS\/MOTOR|INMUEBLE)\]/g)||[]).forEach(m=>{
    const k=m.slice(1,-1).replace(/^DATO \d+$/,"DATO");
    if(k.startsWith("PERSONA")){p.add(k);pm++}else c[k]=(c[k]||0)+1;
  });
  const chips=[];
  if(p.size)chips.push('<span class="chip"><b>'+p.size+'</b> personas <span class="mu">('+pm+' menciones)</span></span>');
  Object.keys(c).forEach(k=>chips.push('<span class="chip"><b>'+c[k]+'</b> '+L[k]+'</span>'));
  $("sum").innerHTML=chips.length?chips.join(""):'<span class="mu">No se detectó ningún dato. Revisá el texto y probá con la lista manual.</span>';
  $("sumc").hidden=false;
}
$("go").onclick=()=>{
  const o={};document.querySelectorAll("#opts input").forEach(c=>o[c.dataset.k]=c.checked);
  try{
    const r=anonymize($("orig").value,o,$("manual").value);
    $("out").value=r;$("dl").disabled=$("dlt").disabled=false;summarize(r);
    $("st").textContent="Hecho. Revisá el texto de la derecha antes de descargar.";
  }catch(e){$("st").textContent="Error: "+e.message}
};
$("clr").onclick=()=>{$("orig").value=$("out").value=$("manual").value="";file.value="";$("fn").textContent="";$("st").textContent="Todo borrado.";$("sumc").hidden=true;$("sum").innerHTML="";$("go").disabled=$("dl").disabled=$("dlt").disabled=true;baseName="documento"};
function save(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
$("dlt").onclick=()=>save(new Blob([$("out").value],{type:"text/plain;charset=utf-8"}),baseName+".txt");
$("dl").onclick=async()=>{
  const x=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const paras=$("out").value.split("\n").map(l=>'<w:p><w:r><w:t xml:space="preserve">'+x(l)+'</w:t></w:r></w:p>').join("");
  const z=new JSZip();
  z.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  z.file("_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file("word/document.xml",'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+paras+'</w:body></w:document>');
  save(await z.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),baseName+".docx");
};
