(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('layout')!=='1'||!window.ALTER_ECO_TEST_MODE)return;

  const STORE='alterEcoLayoutDraftV3';
  const pages={home:'Accueil',s1:'Statut',s2:'Situation',s3:'Objectifs',s4:'Imposition',s5:'Épargne',s6:'Dernières informations',s7:'Analyse',s8:'Potentiel réel'};
  const controls=[
    {key:'pageY',label:'Bloc de la page',min:-200,max:400,step:1,unit:'px'},
    {key:'dialogY',label:'Dialogue Walter',min:-150,max:250,step:1,unit:'px',form:true},
    {key:'titleY',label:'Titre',min:-150,max:400,step:1,unit:'px'},
    {key:'contentY',label:'Contenu principal',min:-200,max:400,step:1,unit:'px'},
    {key:'gap',label:'Vide vertical entre les réponses',min:0,max:24,step:1,unit:'px',choices:true,defaultValue:3},
    {key:'choiceHeight',label:'Hauteur des réponses',min:72,max:110,step:1,unit:'%',choices:true,defaultValue:100},
    {key:'buttonY',label:'Bouton',min:-200,max:400,step:1,unit:'px'},
    {key:'noteY',label:'Mention confidentielle',min:-150,max:300,step:1,unit:'px',note:true}
  ];
  const independentBlocks={
    s5:[
      {id:'help',label:'Texte explicatif',selector:'#s5 > .savings-help'},
      {id:'monthly',label:'Jauge mensuelle',selector:'#s5 > #slider-monthly'},
      {id:'total',label:'Jauge épargne totale',selector:'#s5 > #slider-total'},
      {id:'devices',label:'Bulle des dispositifs',selector:'#s5 > #est-live'}
    ],
    s6:[
      {id:'postal',label:'Code postal',selector:'#s6 > #field-postal'},
      {id:'city',label:'Ville de résidence',selector:'#s6 > #field-city'},
      {id:'city-status',label:'Information sur la ville',selector:'#s6 > #city-lookup-status'},
      {id:'birth',label:'Année de naissance',selector:'#s6 > #field-birth'}
    ],
    s8:[
      {id:'subtitle',label:'Texte sous le titre',selector:'#s8 > .sh2'},
      {id:'objectifs',label:'Bloc Objectifs',selector:'#s8 > .recap-box'},
      {id:'potentiel',label:'Bloc Potentiel',selector:'#s8 .result-potential-card'},
      {id:'pistes',label:'Bloc Pistes',selector:'#s8 .result-paths-card'},
      {id:'coord-title',label:'Titre Coordonnées',selector:'#s8 .contact-section-heading'},
      {id:'names',label:'Prénom et nom',selector:'#s8 .name-fields-row'},
      {id:'phone',label:'Téléphone',selector:'#s8 .contact-fields > .inp-wrap'}
    ]
  };
  let data={};
  try{data=JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){data={};}
  let lastScope='';
  let directMode=false;
  let dragState=null;

  const toggle=document.createElement('button');
  toggle.className='layout-editor-toggle';toggle.type='button';toggle.textContent='⚙ Réglages';
  const panel=document.createElement('aside');panel.className='layout-editor-panel';panel.hidden=true;
  panel.innerHTML='<div class="layout-editor-head"><div><strong>Ajuster la mise en page réelle</strong><small id="layout-editor-page"></small></div><button class="layout-editor-close" type="button" aria-label="Fermer">×</button></div><div id="layout-editor-controls"></div><div id="layout-editor-choice-controls"></div><div class="layout-editor-actions"><button type="button" data-direct>Déplacer sur la page réelle</button><button type="button" data-copy>Copier mes réglages</button><button type="button" data-reset>Réinitialiser cette page</button></div><textarea class="layout-editor-code" readonly hidden aria-label="Code des réglages"></textarea><p class="layout-editor-help">L’écran reste figé aux dimensions réelles du téléphone. Touchez « Déplacer sur la page réelle », puis faites glisser verticalement les éléments entourés. Il n’y a aucun canevas ni défilement de prévisualisation.</p>';
  document.body.append(toggle,panel);

  const controlsHost=panel.querySelector('#layout-editor-controls');
  const choiceControlsHost=panel.querySelector('#layout-editor-choice-controls');
  controls.forEach(def=>{
    const row=document.createElement('div');row.className='layout-editor-row';row.dataset.control=def.key;
    row.innerHTML='<label>'+def.label+'</label><input type="range" min="'+def.min+'" max="'+def.max+'" step="'+def.step+'"><output>0'+def.unit+'</output>';
    const input=row.querySelector('input');
    input.addEventListener('input',()=>{const scope=currentScope();ensure(scope)[def.key]=Number(input.value);save();apply(scope);row.querySelector('output').textContent=input.value+def.unit;});
    controlsHost.appendChild(row);
  });

  function currentScope(){
    if(!document.body.classList.contains('show-form'))return'home';
    return document.querySelector('.screen.active')?.id||'s1';
  }
  function ensure(scope){if(!data[scope])data[scope]={};return data[scope];}
  function value(scope,def){return ensure(scope)[def.key]??def.defaultValue??0;}
  function targets(scope,key){
    if(scope==='home'){
      return {
        pageY:['.approved-mobile-copy'],titleY:['.approved-mobile-copy h1'],contentY:['.approved-mobile-benefits'],
        buttonY:['.approved-start-button-summary'],noteY:['.approved-summary-trust']
      }[key]||[];
    }
    const root='#'+scope;
    return {
      pageY:[root],dialogY:['.genie-row'],titleY:[root+' > .sh1'],
      contentY:scope==='s5'?[root+' > .slider-section',root+' > #est-live']:scope==='s6'?[root+' > .inp-wrap',root+' > .city-lookup-status']:scope==='s8'?[root+' > .recap-box',root+' > .result-insights',root+' > .contact-section']:[root+' > .opts'],
      gap:[root+' > .opts'],choiceHeight:[root+' > .opts .opt'],
      buttonY:scope==='s8'?[root+' .cta-full']:[root+' > .nav'],
      noteY:scope==='s8'?[root+' .reassure']:[root+' > .step-reassure']
    }[key]||[];
  }
  function each(scope,key,callback){targets(scope,key).forEach(selector=>document.querySelectorAll(selector).forEach(callback));}
  function choiceElements(scope){
    if(scope==='home')return[];
    return Array.from(document.querySelectorAll('#'+scope+' > .opts .opt'));
  }
  function choiceValue(scope,index){
    const values=ensure(scope).choiceOffsets;
    return Array.isArray(values)&&Number.isFinite(values[index])?values[index]:0;
  }
  function setChoiceValue(scope,index,next){
    if(!Array.isArray(ensure(scope).choiceOffsets))ensure(scope).choiceOffsets=[];
    ensure(scope).choiceOffsets[index]=next;
  }
  function applyIndividualChoices(scope){
    choiceElements(scope).forEach((el,index)=>{el.style.setProperty('translate','0 '+choiceValue(scope,index)+'px','important');});
  }
  function blockValue(scope,id){
    const values=ensure(scope).blockOffsets;
    return values&&Number.isFinite(values[id])?values[id]:0;
  }
  function setBlockValue(scope,id,next){
    if(!ensure(scope).blockOffsets)ensure(scope).blockOffsets={};
    ensure(scope).blockOffsets[id]=next;
  }
  function blockEntries(scope){
    return (independentBlocks[scope]||[]).map(def=>({...def,element:document.querySelector(def.selector)})).filter(item=>item.element);
  }
  function baseTranslate(scope,element){
    let total=0;
    controls.forEach(def=>{
      if(def.key==='gap'||def.key==='choiceHeight')return;
      const isTarget=targets(scope,def.key).some(selector=>Array.from(document.querySelectorAll(selector)).includes(element));
      if(isTarget)total+=value(scope,def);
    });
    return total;
  }
  function applyIndependentBlocks(scope){
    blockEntries(scope).forEach(item=>{item.element.style.setProperty('translate','0 '+(baseTranslate(scope,item.element)+blockValue(scope,item.id))+'px','important');});
  }
  function apply(scope){
    controls.forEach(def=>{
      const v=value(scope,def);
      each(scope,def.key,el=>{
        if(def.key==='gap')el.style.setProperty('row-gap',v+'px','important');
        else if(def.key==='choiceHeight'){el.style.setProperty('height',v+'%','important');el.style.alignSelf=v<100?'center':'';}
        else el.style.setProperty('translate','0 '+v+'px','important');
      });
    });
    applyIndividualChoices(scope);
    applyIndependentBlocks(scope);
  }
  function available(scope,def){
    if(def.form&&scope==='home')return false;
    if(def.choices)return targets(scope,def.key).some(s=>document.querySelector(s));
    if(def.note)return targets(scope,def.key).some(s=>document.querySelector(s));
    return targets(scope,def.key).length>0;
  }
  function refresh(force){
    const scope=currentScope();
    if(!force&&scope===lastScope)return;
    lastScope=scope;panel.querySelector('#layout-editor-page').textContent=pages[scope]||scope;
    controls.forEach(def=>{
      const row=controlsHost.querySelector('[data-control="'+def.key+'"]');
      row.hidden=!available(scope,def);
      const v=value(scope,def);row.querySelector('input').value=v;row.querySelector('output').textContent=v+def.unit;
    });
    buildChoiceControls(scope);
    buildBlockControls(scope);
    apply(scope);
    if(directMode)markDirectTargets(scope);
  }
  function save(){localStorage.setItem(STORE,JSON.stringify(data));}
  function buildChoiceControls(scope){
    choiceControlsHost.innerHTML='';
    const choices=choiceElements(scope);
    if(!choices.length)return;
    const title=document.createElement('div');
    title.className='layout-editor-subtitle';
    title.textContent='Position individuelle des réponses';
    choiceControlsHost.appendChild(title);
    choices.forEach((choice,index)=>{
      const row=document.createElement('div');row.className='layout-editor-row';
      row.innerHTML='<label>Réponse '+(index+1)+'</label><input type="range" min="-45" max="45" step="1"><output>'+choiceValue(scope,index)+'px</output>';
      const input=row.querySelector('input');input.value=choiceValue(scope,index);
      input.addEventListener('input',()=>{
        const activeScope=currentScope();
        setChoiceValue(activeScope,index,Number(input.value));save();applyIndividualChoices(activeScope);
        row.querySelector('output').textContent=input.value+'px';
      });
      choiceControlsHost.appendChild(row);
    });
  }
  function buildBlockControls(scope){
    const blocks=blockEntries(scope);
    if(!blocks.length)return;
    const title=document.createElement('div');
    title.className='layout-editor-subtitle';
    title.textContent='Position individuelle des sections';
    choiceControlsHost.appendChild(title);
    blocks.forEach(item=>{
      const row=document.createElement('div');row.className='layout-editor-row';
      row.innerHTML='<label>'+item.label+'</label><input type="range" min="-500" max="500" step="1"><output>'+blockValue(scope,item.id)+'px</output>';
      const input=row.querySelector('input');input.value=blockValue(scope,item.id);
      input.addEventListener('input',()=>{
        const activeScope=currentScope();
        setBlockValue(activeScope,item.id,Number(input.value));save();applyIndependentBlocks(activeScope);
        row.querySelector('output').textContent=input.value+'px';
      });
      choiceControlsHost.appendChild(row);
    });
  }
  function showCode(){
    const code=JSON.stringify(data);
    const area=panel.querySelector('.layout-editor-code');area.hidden=false;area.value=code;area.focus();area.select();
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(code).catch(()=>{});
  }
  function clearDirectTargets(){
    document.querySelectorAll('.layout-direct-target').forEach(el=>{
      el.classList.remove('layout-direct-target','layout-direct-moving');
      delete el.dataset.layoutDragKey;
    });
  }
  function markDirectTargets(scope){
    clearDirectTargets();
    const directKeys=independentBlocks[scope]?.length
      ?['dialogY','titleY','buttonY','noteY']
      :['dialogY','titleY','contentY','buttonY','noteY'];
    directKeys.forEach(key=>each(scope,key,el=>{
      if(el.closest('.layout-editor-panel'))return;
      el.dataset.layoutDragKey=key;
      el.classList.add('layout-direct-target');
    }));
    choiceElements(scope).forEach((el,index)=>{
      el.dataset.layoutDragKey='choiceY:'+index;
      el.classList.add('layout-direct-target');
    });
    blockEntries(scope).forEach(item=>{
      item.element.dataset.layoutDragKey='blockY:'+item.id;
      item.element.classList.add('layout-direct-target');
    });
  }
  function stopDirectMode(){
    directMode=false;dragState=null;clearDirectTargets();
    document.documentElement.classList.remove('layout-direct-mode');
    toggle.textContent='⚙ Réglages';
  }
  toggle.addEventListener('click',()=>{
    if(directMode){
      stopDirectMode();panel.hidden=false;toggle.hidden=true;refresh(true);return;
    }
    panel.hidden=false;toggle.hidden=true;refresh(true);
  });
  panel.querySelector('.layout-editor-close').addEventListener('click',()=>{panel.hidden=true;toggle.hidden=false;});
  panel.querySelector('[data-direct]').addEventListener('click',()=>{
    directMode=true;panel.hidden=true;toggle.hidden=false;toggle.textContent='✓ Terminer le déplacement';
    document.documentElement.classList.add('layout-direct-mode');
    markDirectTargets(currentScope());
  });
  panel.querySelector('[data-copy]').addEventListener('click',showCode);
  panel.querySelector('[data-reset]').addEventListener('click',()=>{const scope=currentScope();delete data[scope];save();location.reload();});
  document.addEventListener('pointerdown',event=>{
    if(!directMode)return;
    const target=event.target.closest?.('[data-layout-drag-key]');
    if(!target)return;
    const scope=currentScope();
    const key=target.dataset.layoutDragKey;
    const choiceMatch=key.match(/^choiceY:(\d+)$/);
    const blockMatch=key.match(/^blockY:(.+)$/);
    const def=choiceMatch?{key,min:-120,max:120,step:1}:blockMatch?{key,min:-500,max:500,step:1}:controls.find(item=>item.key===key);
    if(!def)return;
    event.preventDefault();event.stopPropagation();
    const choiceIndex=choiceMatch?Number(choiceMatch[1]):null;
    const blockId=blockMatch?blockMatch[1]:null;
    const startValue=choiceIndex!==null?choiceValue(scope,choiceIndex):blockId!==null?blockValue(scope,blockId):value(scope,def);
    const screen=document.querySelector('.screen.active');
    dragState={target,scope,key,def,choiceIndex,blockId,startY:event.clientY,startValue,screen};
    target.classList.add('layout-direct-moving');
    try{target.setPointerCapture(event.pointerId);}catch(e){}
  },true);
  document.addEventListener('pointermove',event=>{
    if(!dragState)return;
    event.preventDefault();event.stopPropagation();
    const raw=dragState.startValue+(event.clientY-dragState.startY);
    const next=Math.max(dragState.def.min,Math.min(dragState.def.max,Math.round(raw/dragState.def.step)*dragState.def.step));
    if(dragState.choiceIndex!==null){
      setChoiceValue(dragState.scope,dragState.choiceIndex,next);save();applyIndividualChoices(dragState.scope);
    }else if(dragState.blockId!==null){
      setBlockValue(dragState.scope,dragState.blockId,next);save();applyIndependentBlocks(dragState.scope);
    }else{
      ensure(dragState.scope)[dragState.key]=next;save();apply(dragState.scope);
    }
  },{capture:true,passive:false});
  function endDrag(event){
    if(!dragState)return;
    event.preventDefault();event.stopPropagation();
    dragState.target.classList.remove('layout-direct-moving');
    dragState=null;
  }
  document.addEventListener('pointerup',endDrag,true);
  document.addEventListener('pointercancel',endDrag,true);
  setInterval(()=>refresh(false),250);
  document.documentElement.classList.add('layout-editor-enabled');
  refresh(true);
})();
