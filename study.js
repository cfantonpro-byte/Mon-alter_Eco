/* Compatibilité des anciennes pages. */
const etudeScript=document.createElement('script');
etudeScript.src=new URL('etude.js?v=091405b',document.currentScript.src).href;
document.head.appendChild(etudeScript);
