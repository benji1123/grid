(()=>{"use strict";var e=document.getElementById("app"),t=document.createElement("div");t.classList.add("feed");var n=Array(100).fill(null).map((function(e,t){return n=function(e){return{name:"Random Name - ".concat(e),description:"Random description - - Lorem ipsum sit met, consectetur adipiscing elit",url:"https://www.belvedere.at/sites/default/files/2022-04/912.jpg"}}(t),i=n.name,c=n.description,s=n.url,'<section class="feed__item">\n        <img class="feed__item__img" src="'.concat(s,'" />\n        <div class="feed__item__description">\n            <h2 class="h2-header">').concat(i,'</h2>\n            <p class="p-text">').concat(c,"</p>\n        </div>\n    </section>");var n,i,c,s})).join("").trim();t.innerHTML=n,e.insertAdjacentElement("afterbegin",t)})();