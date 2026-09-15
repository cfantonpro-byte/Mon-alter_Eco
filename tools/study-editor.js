(function(){
  const params=new URLSearchParams(location.search);
  const editMode=params.get('edit')==='1';
  const STORE='alterEcoStudyCustomizationsV1';
  const CONFIG_URL='tools/study-customizations.json';
  const candidates='h1,h2,h3,p,a,button,.tv-eyebrow,.risk-pill,.pcard-type,.studyz-brand,.chip,.shell-badge-star,.mini-badge,.premium-icon-badge,.card,.hero-piste,.hero-piste-body,.hero-piste-media,.pcard,.pcard-head,.pcard-media,.pcard-foot,.tv-row,.tv-col,.next-study-step,.impact-note,.contact-card,.tv-banner,.tv-banner-copy,.plan-step,.plan-stepper,.synthesis-badges,.synthesis-featured,.synthesis-profile-main,.synthesis-capacity,.prospect-strip,img';
  let config={version:1,pages:{}},selected=null,drag=null,applyTimer=0;

  const currentView=()=>location.hash.replace('#','')||'potentiel';
  const pageData=()=>config.pages[currentView()]||(config.pages[currentView()]={});
  const signature=el=>{
    const cls=[...el.classList].filter(c=>!c.startsWith('study-editor')).sort().join('.');
    const all=[...document.querySelectorAll('#study '+candidates)].filter(node=>{
      const c=[...node.classList].filter(x=>!x.startsWith('study-editor')).sort().join('.');
      return node.tagName===el.tagName&&c===cls;
    });
    return `${el.tagName.toLowerCase()}${cls?'.'+cls:''}:${Math.max(0,all.indexOf(el))}`;
  };
  function discover(){
    document.querySelectorAll('#study '+candidates).forEach(el=>{
      if(el.closest('.solution-drawer'))return;
      el.dataset.studyEditable=signature(el);
    });
  }
  function applyValue(el,value){
    if(!el||!value)return;
    el.style.setProperty('translate',`${value.x||0}px ${value.y||0}px`,'important');
    el.style.setProperty('scale',`${(value.scaleX||100)/100} ${(value.scaleY||100)/100}`,'important');
    el.style.transformOrigin=value.origin||'center center';
    if(value.fontSize&&/^(H[1-3]|P|SPAN|DIV|B|SMALL)$/.test(el.tagName))el.style.setProperty('font-size',value.fontSize+'px','important');
    if(value.text!==undefined&&el.tagName!=='IMG'&&el.innerHTML!==value.text)el.innerHTML=value.text;
    if(value.src&&el.tagName==='IMG'&&el.getAttribute('src')!==value.src)el.setAttribute('src',value.src);
    if(value.opacity!==undefined)el.style.opacity=value.opacity/100;
  }
  function applyAll(){
    discover();
    const data=config.pages[currentView()]||{};
    document.querySelectorAll('#study [data-study-editable]').forEach(el=>applyValue(el,data[el.dataset.studyEditable]));
    if(editMode)document.documentElement.classList.add('study-editor-active');
  }
  function scheduleApply(){clearTimeout(applyTimer);applyTimer=setTimeout(applyAll,30)}
  function loadLocal(){try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch{return null}}
  async function load(){
    try{const response=await fetch(CONFIG_URL+'?t='+Date.now(),{cache:'no-store'});if(response.ok)config=await response.json()}catch(e){config=loadLocal()||config}
    const local=loadLocal();if(local&&local.updatedAt>(config.updatedAt||0))config=local;
    applyAll();if(editMode)buildEditor();
  }
  function record(){
    if(!selected)return null;
    const key=selected.dataset.studyEditable;
    return pageData()[key]||(pageData()[key]={});
  }
  function persistDraft(){config.updatedAt=Date.now();localStorage.setItem(STORE,JSON.stringify(config))}
  function setStatus(text,state=''){const el=document.querySelector('.study-editor-status');if(!el)return;el.textContent=text;el.className='study-editor-status '+(state?'is-'+state:'')}
  function buildEditor(){
    const launch=document.createElement('button');launch.className='study-editor-launch';launch.textContent='✦ Modifier la page';
    const panel=document.createElement('aside');panel.className='study-editor-panel';panel.hidden=true;
    panel.innerHTML=`<div class="study-editor-head"><div><strong>Éditeur des résultats</strong><small>Page : <span data-page></span></small></div><button class="study-editor-close" type="button">×</button></div>
      <p class="study-editor-status">Touchez « Choisir un élément », puis un texte, une image ou un bloc.</p>
      <div data-selection hidden>
        <label class="study-editor-field" data-text-field><span>Texte / contenu HTML</span><textarea data-text></textarea></label>
        <label class="study-editor-field" data-image-field><span>Image ou icône</span><input type="text" data-src placeholder="assets/mon-image.png"><input type="file" data-file accept="image/*"></label>
        <div class="study-editor-slider"><label>Position horizontale</label><input data-prop="x" type="range" min="-400" max="400" value="0"><output>0px</output></div>
        <div class="study-editor-slider"><label>Position verticale</label><input data-prop="y" type="range" min="-600" max="900" value="0"><output>0px</output></div>
        <div class="study-editor-slider"><label>Largeur</label><input data-prop="scaleX" type="range" min="30" max="200" value="100"><output>100%</output></div>
        <div class="study-editor-slider"><label>Hauteur</label><input data-prop="scaleY" type="range" min="30" max="200" value="100"><output>100%</output></div>
        <div class="study-editor-slider" data-font-row><label>Taille du texte</label><input data-prop="fontSize" type="range" min="7" max="80" value="16"><output>16px</output></div>
        <div class="study-editor-slider"><label>Opacité</label><input data-prop="opacity" type="range" min="0" max="100" value="100"><output>100%</output></div>
      </div>
      <div class="study-editor-actions"><button class="study-editor-pick" type="button">Choisir un élément sur la page</button><button data-undo type="button">Annuler cet élément</button><button class="study-editor-reset" data-reset type="button">Réinitialiser la page</button><button class="study-editor-save" type="button">Valider tous mes changements</button></div>`;
    document.body.append(launch,panel);
    const refreshPage=()=>panel.querySelector('[data-page]').textContent=currentView();refreshPage();
    launch.onclick=()=>{panel.hidden=false;launch.hidden=true;refreshPage()};
    panel.querySelector('.study-editor-close').onclick=()=>{panel.hidden=true;launch.hidden=false;stopPick()};
    panel.querySelector('.study-editor-pick').onclick=()=>{panel.hidden=true;launch.hidden=false;document.documentElement.classList.add('study-editor-picking');setStatus('Touchez maintenant l’élément à modifier.')};
    panel.querySelectorAll('[data-prop]').forEach(input=>input.addEventListener('input',()=>{
      const value=record();if(!value)return;value[input.dataset.prop]=Number(input.value);persistDraft();applyValue(selected,value);input.nextElementSibling.value=input.value+(input.dataset.prop==='x'||input.dataset.prop==='y'||input.dataset.prop==='fontSize'?'px':'%');
    }));
    panel.querySelector('[data-text]').addEventListener('input',event=>{const value=record();if(!value)return;value.text=event.target.value;persistDraft();applyValue(selected,value)});
    panel.querySelector('[data-src]').addEventListener('change',event=>{const value=record();if(!value)return;value.src=event.target.value.trim();persistDraft();applyValue(selected,value)});
    panel.querySelector('[data-file]').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file||!selected)return;
      if(file.size>8*1024*1024){setStatus('Image trop lourde : 8 Mo maximum.','error');return}
      const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file)});
      try{const response=await fetch('/api/upload-study-asset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,data})});if(!response.ok)throw new Error();const result=await response.json();record().src=result.path;panel.querySelector('[data-src]').value=result.path;persistDraft();applyValue(selected,record());setStatus('Image importée. Validez pour enregistrer.','success')}catch(e){setStatus('Import impossible : utilise le serveur d’édition.','error')}
    });
    panel.querySelector('[data-undo]').onclick=()=>{if(!selected)return;delete pageData()[selected.dataset.studyEditable];persistDraft();location.reload()};
    panel.querySelector('[data-reset]').onclick=()=>{if(!confirm('Réinitialiser uniquement cette page ?'))return;delete config.pages[currentView()];persistDraft();location.reload()};
    panel.querySelector('.study-editor-save').onclick=saveToProject;
    addEventListener('hashchange',()=>{selected=null;scheduleApply();refreshPage()});
  }
  function stopPick(){document.documentElement.classList.remove('study-editor-picking')}
  function selectElement(el){
    document.querySelectorAll('.study-editor-selected').forEach(node=>node.classList.remove('study-editor-selected'));
    selected=el;selected.classList.add('study-editor-selected');stopPick();
    const panel=document.querySelector('.study-editor-panel');panel.hidden=false;document.querySelector('.study-editor-launch').hidden=true;
    panel.querySelector('[data-selection]').hidden=false;
    const isImage=el.tagName==='IMG';panel.querySelector('[data-image-field]').hidden=!isImage;panel.querySelector('[data-text-field]').hidden=isImage;
    panel.querySelector('[data-font-row]').hidden=isImage||!el.matches('h1,h2,h3,p,.tv-eyebrow,.risk-pill,.pcard-type,.studyz-brand,.chip,.shell-badge-star');
    const value=record();
    if(isImage)panel.querySelector('[data-src]').value=value.src||el.getAttribute('src')||'';else panel.querySelector('[data-text]').value=value.text??el.innerHTML;
    panel.querySelectorAll('[data-prop]').forEach(input=>{const prop=input.dataset.prop;const computed=parseFloat(getComputedStyle(el).fontSize)||16;input.value=value[prop]??(prop==='scaleX'||prop==='scaleY'||prop==='opacity'?100:prop==='fontSize'?computed:0);input.nextElementSibling.value=input.value+(prop==='x'||prop==='y'||prop==='fontSize'?'px':'%')});
    setStatus(`Élément sélectionné : ${el.tagName.toLowerCase()}. Fais-le glisser ou utilise les réglages.`,'success');
  }
  document.addEventListener('pointerdown',event=>{
    if(!editMode)return;
    if(event.target.closest('.study-editor-panel,.study-editor-launch'))return;
    const el=event.target.closest('[data-study-editable]');if(!el)return;
    if(document.documentElement.classList.contains('study-editor-picking')){event.preventDefault();event.stopPropagation();selectElement(el);return}
    if(el!==selected)return;
    event.preventDefault();event.stopPropagation();
    const value=record();drag={el,startX:event.clientX,startY:event.clientY,x:value.x||0,y:value.y||0};el.classList.add('study-editor-dragging');try{el.setPointerCapture(event.pointerId)}catch(e){}
  },true);
  document.addEventListener('pointermove',event=>{if(!drag)return;event.preventDefault();const value=record();value.x=Math.round(drag.x+event.clientX-drag.startX);value.y=Math.round(drag.y+event.clientY-drag.startY);persistDraft();applyValue(selected,value)}, {capture:true,passive:false});
  document.addEventListener('pointerup',()=>{if(drag){drag.el.classList.remove('study-editor-dragging');drag=null}},true);
  async function saveToProject(){
    const button=document.querySelector('.study-editor-save');button.disabled=true;setStatus('Enregistrement dans le projet…');persistDraft();
    try{const response=await fetch('/api/save-study-editor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config)});if(!response.ok)throw new Error();const result=await response.json();setStatus(`Changements validés à ${result.savedAt}. Ils sont maintenant communs à tous les appareils.`,'success')}
    catch(e){setStatus('Sauvegarde locale effectuée, mais le serveur d’édition est indisponible.','error')}
    finally{button.disabled=false}
  }
  new MutationObserver(scheduleApply).observe(document.getElementById('study'),{childList:true,subtree:true});
  load();
})();
