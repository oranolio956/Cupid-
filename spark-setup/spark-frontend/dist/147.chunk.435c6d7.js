"use strict";(self.webpackChunkspark=self.webpackChunkspark||[]).push([[147],{64335:(I,S,t)=>{t.d(S,{Z:()=>h});var N=t(67294),Z=(0,N.createContext)({});const h=Z},74644:(I,S,t)=>{t.d(S,{ZP:()=>gn});var N=t(72125),Z=t(86288),h=t(4942),A=t(4345),x=t(88182),_=t(95682),Fe=t(37744),K=t(1413),Se=t(44925),B=t(68659),g=t(48976),w=t(25499),ye=t(87462),Ce=t(71002),p=t(67294),ue=t(94184),Ke=t.n(ue),de=t(64335),Nt=t(93379),me=t.n(Nt),At=t(7795),ge=t.n(At),It=t(90569),pe=t.n(It),Qe=t(3565),fe=t.n(Qe),an=t(19216),yt=t.n(an),a=t(44589),ct=t.n(a),H=t(41176),De={};De.styleTagTransform=ct(),De.setAttributes=fe(),De.insert=pe().bind(null,"head"),De.domAPI=ge(),De.insertStyleElement=yt();var rn=me()(H.Z,De);const on=H.Z&&H.Z.locals?H.Z.locals:void 0;var Bt=function(i){var b=(0,p.useContext)(de.Z),O=i.children,U=i.contentWidth,Y=i.className,W=i.style,k=(0,p.useContext)(x.ZP.ConfigContext),j=k.getPrefixCls,F=i.prefixCls||j("pro"),ie=U||b.contentWidth,G="".concat(F,"-grid-content");return p.createElement("div",{className:Ke()(G,Y,{wide:ie==="Fixed"}),style:W},p.createElement("div",{className:"".concat(F,"-grid-content-children")},O))};const Je=Bt;var Wt=t(97435),He=t(65238),xe={};xe.styleTagTransform=ct(),xe.setAttributes=fe(),xe.insert=pe().bind(null,"head"),xe.domAPI=ge(),xe.insertStyleElement=yt();var Ft=me()(He.Z,xe);const Ct=He.Z&&He.Z.locals?He.Z.locals:void 0;var xt=["children","className","extra","style","renderContent"],Et=function(i){var b=i.children,O=i.className,U=i.extra,Y=i.style,W=i.renderContent,k=(0,Se.Z)(i,xt),j=(0,p.useContext)(x.ZP.ConfigContext),F=j.getPrefixCls,ie=i.prefixCls||F("pro"),G="".concat(ie,"-footer-bar"),M=(0,p.useContext)(de.Z),ee=(0,p.useMemo)(function(){var D=M.hasSiderMenu,te=M.isMobile,V=M.siderWidth;if(!!D)return V?te?"100%":"calc(100% - ".concat(V,"px)"):"100%"},[M.collapsed,M.hasSiderMenu,M.isMobile,M.siderWidth]),z=p.createElement(p.Fragment,null,p.createElement("div",{className:"".concat(G,"-left")},U),p.createElement("div",{className:"".concat(G,"-right")},b));return(0,p.useEffect)(function(){return!M||!(M!=null&&M.setHasFooterToolbar)?function(){}:(M==null||M.setHasFooterToolbar(!0),function(){var D;M==null||(D=M.setHasFooterToolbar)===null||D===void 0||D.call(M,!1)})},[]),p.createElement("div",(0,ye.Z)({className:Ke()(O,"".concat(G)),style:(0,K.Z)({width:ee},Y)},(0,Wt.Z)(k,["prefixCls"])),W?W((0,K.Z)((0,K.Z)((0,K.Z)({},i),M),{},{leftWidth:ee}),z):z)};const Kt=Et;var qe=t(16619),ce={};ce.styleTagTransform=ct(),ce.setAttributes=fe(),ce.insert=pe().bind(null,"head"),ce.domAPI=ge(),ce.insertStyleElement=yt();var Ue=me()(qe.Z,ce);const Bn=qe.Z&&qe.Z.locals?qe.Z.locals:void 0;var ln=t(83832),et=t(29439),Le=function(i){if(!i)return 1;var b=i.backingStorePixelRatio||i.webkitBackingStorePixelRatio||i.mozBackingStorePixelRatio||i.msBackingStorePixelRatio||i.oBackingStorePixelRatio||i.backingStorePixelRatio||1;return(window.devicePixelRatio||1)/b},sn=function(i){var b=i.children,O=i.style,U=i.className,Y=i.markStyle,W=i.markClassName,k=i.zIndex,j=k===void 0?9:k,F=i.gapX,ie=F===void 0?212:F,G=i.gapY,M=G===void 0?222:G,ee=i.width,z=ee===void 0?120:ee,D=i.height,te=D===void 0?64:D,V=i.rotate,le=V===void 0?-22:V,ae=i.image,ze=i.content,ke=i.offsetLeft,Ge=i.offsetTop,be=i.fontStyle,$e=be===void 0?"normal":be,Oe=i.fontWeight,Q=Oe===void 0?"normal":Oe,Xe=i.fontColor,bt=Xe===void 0?"rgba(0,0,0,.15)":Xe,ut=i.fontSize,Mt=ut===void 0?16:ut,we=i.fontFamily,Me=we===void 0?"sans-serif":we,pn=i.prefixCls,fn=(0,p.useContext)(x.ZP.ConfigContext),jt=fn.getPrefixCls,Pt=jt("pro-layout-watermark",pn),zt=Ke()("".concat(Pt,"-wrapper"),U),kt=Ke()(Pt,W),Zt=(0,p.useState)(""),Rt=(0,et.Z)(Zt,2),Gt=Rt[0],Tt=Rt[1];return(0,p.useEffect)(function(){var _e=document.createElement("canvas"),ve=_e.getContext("2d"),Pe=Le(ve),$t="".concat((ie+z)*Pe,"px"),mt="".concat((M+te)*Pe,"px"),Xt=ke||ie/2,St=Ge||M/2;if(_e.setAttribute("width",$t),_e.setAttribute("height",mt),ve){ve.translate(Xt*Pe,St*Pe),ve.rotate(Math.PI/180*Number(le));var vn=z*Pe,wt=te*Pe;if(ae){var Ve=new Image;Ve.crossOrigin="anonymous",Ve.referrerPolicy="no-referrer",Ve.src=ae,Ve.onload=function(){ve.drawImage(Ve,0,0,vn,wt),Tt(_e.toDataURL())}}else if(ze){var Vt=Number(Mt)*Pe;ve.font="".concat($e," normal ").concat(Q," ").concat(Vt,"px/").concat(wt,"px ").concat(Me),ve.fillStyle=bt,ve.fillText(ze,0,0),Tt(_e.toDataURL())}}else console.error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301Canvas")},[ie,M,ke,Ge,le,$e,Q,z,te,Me,bt,ae,ze,Mt]),p.createElement("div",{style:(0,K.Z)({position:"relative"},O),className:zt},b,p.createElement("div",{className:kt,style:(0,K.Z)({zIndex:j,position:"absolute",left:0,top:0,width:"100%",height:"100%",backgroundSize:"".concat(ie+z,"px"),pointerEvents:"none",backgroundRepeat:"repeat",backgroundImage:"url('".concat(Gt,"')")},Y)}))};const dn=sn;var cn=["title","content","pageHeaderRender","header","prefixedClassName","extraContent","style","prefixCls","breadcrumbRender"],Ee=["children","loading","className","style","footer","affixProps","ghost","fixedHeader","breadcrumbRender"];function Ht(q){return(0,Ce.Z)(q)==="object"?q:{spinning:q}}var Ut=function(i){var b=i.tabList,O=i.tabActiveKey,U=i.onTabChange,Y=i.tabBarExtraContent,W=i.tabProps,k=i.prefixedClassName;return Array.isArray(b)||Y?p.createElement(w.Z,(0,ye.Z)({className:"".concat(k,"-tabs"),activeKey:O,onChange:function(F){U&&U(F)},tabBarExtraContent:Y},W),b==null?void 0:b.map(function(j,F){return p.createElement(w.Z.TabPane,(0,ye.Z)({},j,{tab:j.tab,key:j.key||F}))})):null},tt=function(i,b,O){return!i&&!b?null:p.createElement("div",{className:"".concat(O,"-detail")},p.createElement("div",{className:"".concat(O,"-main")},p.createElement("div",{className:"".concat(O,"-row")},i&&p.createElement("div",{className:"".concat(O,"-content")},i),b&&p.createElement("div",{className:"".concat(O,"-extraContent")},b))))},je=function(i){var b=useContext(RouteContext);return React.createElement("div",{style:{height:"100%",display:"flex",alignItems:"center"}},React.createElement(_Breadcrumb,_extends({},b==null?void 0:b.breadcrumb,b==null?void 0:b.breadcrumbProps,i)))},un=function(i){var b,O=(0,p.useContext)(de.Z),U=i.title,Y=i.content,W=i.pageHeaderRender,k=i.header,j=i.prefixedClassName,F=i.extraContent,ie=i.style,G=i.prefixCls,M=i.breadcrumbRender,ee=(0,Se.Z)(i,cn),z=(0,p.useMemo)(function(){if(!!M)return M},[M]);if(W===!1)return null;if(W)return p.createElement(p.Fragment,null," ",W((0,K.Z)((0,K.Z)({},i),O)));var D=U;!U&&U!==!1&&(D=O.title);var te=(0,K.Z)((0,K.Z)((0,K.Z)({},O),{},{title:D},ee),{},{footer:Ut((0,K.Z)((0,K.Z)({},ee),{},{breadcrumbRender:M,prefixedClassName:j}))},k),V=te.breadcrumb,le=(!V||!(V!=null&&V.itemRender)&&!(!(V==null||(b=V.routes)===null||b===void 0)&&b.length))&&!M;return["title","subTitle","extra","tags","footer","avatar","backIcon"].every(function(ae){return!te[ae]})&&le&&!Y&&!F?null:p.createElement("div",{className:"".concat(j,"-warp")},p.createElement(Fe.Z,(0,ye.Z)({},te,{breadcrumb:M===!1?void 0:(0,K.Z)((0,K.Z)({},te.breadcrumb),O.breadcrumbProps),breadcrumbRender:z,prefixCls:G}),(k==null?void 0:k.children)||tt(Y,F,j)))},mn=function(i){var b,O,U=i.children,Y=i.loading,W=Y===void 0?!1:Y,k=i.className,j=i.style,F=i.footer,ie=i.affixProps,G=i.ghost,M=i.fixedHeader,ee=i.breadcrumbRender,z=(0,Se.Z)(i,Ee),D=(0,p.useContext)(de.Z),te=(0,p.useContext)(x.ZP.ConfigContext),V=te.getPrefixCls,le=i.prefixCls||V("pro"),ae="".concat(le,"-page-container"),ze=Ke()(ae,k,(b={},(0,h.Z)(b,"".concat(le,"-page-container-ghost"),G),(0,h.Z)(b,"".concat(le,"-page-container-with-footer"),F),b)),ke=(0,p.useMemo)(function(){return U?p.createElement(p.Fragment,null,p.createElement("div",{className:"".concat(ae,"-children-content")},U),D.hasFooterToolbar&&p.createElement("div",{style:{height:48,marginTop:24}})):null},[U,ae,D.hasFooterToolbar]),Ge=(0,p.useMemo)(function(){var Q;return ee==!1?!1:ee||(z==null||(Q=z.header)===null||Q===void 0?void 0:Q.breadcrumbRender)},[ee,z==null||(O=z.header)===null||O===void 0?void 0:O.breadcrumbRender]),be=p.createElement(un,(0,ye.Z)({},z,{breadcrumbRender:Ge,ghost:G,prefixCls:void 0,prefixedClassName:ae})),$e=(0,p.useMemo)(function(){if(p.isValidElement(W))return W;if(typeof W=="boolean"&&!W)return null;var Q=Ht(W);return p.createElement(ln.Z,Q)},[W]),Oe=(0,p.useMemo)(function(){var Q=$e||ke;if(i.waterMarkProps||D.waterMarkProps){var Xe=(0,K.Z)((0,K.Z)({},D.waterMarkProps),i.waterMarkProps);return p.createElement(dn,Xe,Q)}return Q},[i.waterMarkProps,D.waterMarkProps,$e,ke]);return p.createElement("div",{style:j,className:ze},M&&be?p.createElement(Z.Z,(0,ye.Z)({offsetTop:D.hasHeader&&D.fixedHeader?D.headerHeight:0},ie),be):be,Oe&&p.createElement(Je,null,Oe),F&&p.createElement(Kt,{prefixCls:le},F))};const gn=mn},83832:(I,S,t)=>{t.d(S,{Z:()=>K});var N=t(85850),Z=t(11382),h=t(87462),A=t(44925),x=t(67294),_=["isLoading","pastDelay","timedOut","error","retry"],Fe=function(B){var g=B.isLoading,w=B.pastDelay,ye=B.timedOut,Ce=B.error,p=B.retry,ue=(0,A.Z)(B,_);return x.createElement("div",{style:{paddingTop:100,textAlign:"center"}},x.createElement(Z.Z,(0,h.Z)({size:"large"},ue)))};const K=Fe},81274:(I,S,t)=>{t.d(S,{ZP:()=>La});var N=t(23195),Z=t(97183),h=t(4942),A=t(64687),x=t.n(A),_=t(15861),Fe=t(44925),K=t(4345),Se=t(88182),B=t(29439),g=t(1413),w=t(87462),ye=t(93379),Ce=t.n(ye),p=t(7795),ue=t.n(p),Ke=t(90569),de=t.n(Ke),Nt=t(3565),me=t.n(Nt),At=t(19216),ge=t.n(At),It=t(44589),pe=t.n(It),Qe=t(34180),fe={};fe.styleTagTransform=pe(),fe.setAttributes=me(),fe.insert=de().bind(null,"head"),fe.domAPI=ue(),fe.insertStyleElement=ge();var an=Ce()(Qe.Z,fe);const yt=Qe.Z&&Qe.Z.locals?Qe.Z.locals:void 0;var a=t(67294),ct=t(94184),H=t.n(ct),De=t(42473),rn=t.n(De),on=t(21770),Bt=t(38069),Je=t(56725),Wt=t(18806),He=t(12044),xe=t(97435),Ft=t(8100),Ct=t(27754),xt=t(15671),Et=t(43144),Kt=t(79340),qe=t(54062),ce=t(37503),Ue={};Ue.styleTagTransform=pe(),Ue.setAttributes=me(),Ue.insert=de().bind(null,"head"),Ue.domAPI=ue(),Ue.insertStyleElement=ge();var Bn=Ce()(ce.Z,Ue);const ln=ce.Z&&ce.Z.locals?ce.Z.locals:void 0;var et=t(65302),Le={};Le.styleTagTransform=pe(),Le.setAttributes=me(),Le.insert=de().bind(null,"head"),Le.domAPI=ue(),Le.insertStyleElement=ge();var sn=Ce()(et.Z,Le);const dn=et.Z&&et.Z.locals?et.Z.locals:void 0;var cn=t(61330),Ee=t(28682),Ht=t(1351),Ut=t(76629),tt=t(17770),je={};je.styleTagTransform=pe(),je.setAttributes=me(),je.insert=de().bind(null,"head"),je.domAPI=ue(),je.insertStyleElement=ge();var un=Ce()(tt.Z,je);const mn=tt.Z&&tt.Z.locals?tt.Z.locals:void 0;var gn=t(35250),q=t(90860),i=t(93433),b=t(91321),O=t(16165),U=t(69792),Y=t(10537),W={navTheme:"dark",layout:"side",contentWidth:"Fluid",fixedHeader:!1,fixSiderbar:!1,headerHeight:48,iconfontUrl:"",primaryColor:"#1890ff",splitMenus:!1};const k=W;var j=function u(e){return(e||[]).reduce(function(r,n){if(n.key&&r.push(n.key),n.routes){var l=r.concat(u(n.routes)||[]);return l}return r},[])},F={daybreak:"#1890ff",dust:"#F5222D",volcano:"#FA541C",sunset:"#FAAD14",cyan:"#13C2C2",green:"#52C41A",geekblue:"#2F54EB",purple:"#722ED1"};function ie(u){return u&&F[u]?F[u]:u}function G(u){return u.map(function(e){var r=(0,g.Z)({},e);if(!r.name||r.hideInMenu)return null;if(r&&(r==null?void 0:r.routes)){if(!r.hideChildrenInMenu&&r.routes.some(function(n){return n&&n.name&&!n.hideInMenu}))return(0,g.Z)((0,g.Z)({},e),{},{routes:G(r.routes)});delete r.routes}return r}).filter(function(e){return e})}var M=t(88305);function ee(){var u=(0,a.useState)([]),e=(0,B.Z)(u,2),r=e[0],n=e[1];return{flatMenuKeys:r,setFlatMenuKeys:n}}var z=(0,M.f)(ee);const D=z;var te=Ee.Z.SubMenu,V=Ee.Z.ItemGroup,le=(0,b.Z)({scriptUrl:k.iconfontUrl}),ae=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"icon-";if(typeof e=="string"&&e!==""){if((0,U.Z)(e)||(0,Y.Z)(e))return a.createElement(O.Z,{component:function(){return a.createElement("img",{src:e,alt:"icon",className:"ant-pro-sider-menu-icon"})}});if(e.startsWith(r))return a.createElement(le,{type:e})}return e},ze=(0,Et.Z)(function u(e){var r=this;(0,xt.Z)(this,u),this.props=void 0,this.getNavMenuItems=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[],l=arguments.length>1?arguments[1]:void 0;return n.map(function(s){return r.getSubMenuOrItem(s,l)}).filter(function(s){return s})},this.getSubMenuOrItem=function(n,l){if(Array.isArray(n.routes)&&n&&n.routes.length>0){var s=r.getIntlName(n),o=r.props,d=o.subMenuItemRender,c=o.prefixCls,m=o.menu,y=o.iconPrefixes,v=n.icon?a.createElement("span",{className:"".concat(c,"-menu-item"),title:s},!l&&ae(n.icon,y),a.createElement("span",{className:"".concat(c,"-menu-item-title")},s)):a.createElement("span",{className:"".concat(c,"-menu-item"),title:s},s),f=d?d((0,g.Z)((0,g.Z)({},n),{},{isUrl:!1}),v):v,C=(m==null?void 0:m.type)==="group"?V:te;return a.createElement(C,{title:f,key:n.key||n.path,onTitleClick:n.onTitleClick},r.getNavMenuItems(n.routes,!0))}return a.createElement(Ee.Z.Item,{disabled:n.disabled,key:n.key||n.path,onClick:n.onTitleClick},r.getMenuItemPath(n,l))},this.getIntlName=function(n){var l=n.name,s=n.locale,o=r.props,d=o.menu,c=o.formatMessage;return s&&(d==null?void 0:d.locale)!==!1?c==null?void 0:c({id:s,defaultMessage:l}):l},this.getMenuItemPath=function(n,l){var s=r.conversionPath(n.path||"/"),o=r.props,d=o.location,c=d===void 0?{pathname:"/"}:d,m=o.isMobile,y=o.onCollapse,v=o.menuItemRender,f=o.iconPrefixes,C=r.getIntlName(n),E=r.props.prefixCls,R=l?null:ae(n.icon,f),T=a.createElement("span",{className:"".concat(E,"-menu-item")},R,a.createElement("span",{className:"".concat(E,"-menu-item-title")},C)),$=(0,U.Z)(s);if($&&(T=a.createElement("span",{title:C,onClick:function(){var X,ne;(X=window)===null||X===void 0||(ne=X.open)===null||ne===void 0||ne.call(X,s)},className:"".concat(E,"-menu-item ").concat(E,"-menu-item-link")},R,a.createElement("span",{className:"".concat(E,"-menu-item-title")},C))),v){var P=(0,g.Z)((0,g.Z)({},n),{},{isUrl:$,itemPath:s,isMobile:m,replace:s===c.pathname,onClick:function(){return y&&y(!0)},children:void 0});return v(P,T,r.props)}return T},this.conversionPath=function(n){return n&&n.indexOf("http")===0?n:"/".concat(n||"").replace(/\/+/g,"/")},this.props=e}),ke=function(e,r){var n=r.layout,l=r.collapsed,s={};return e&&!l&&["side","mix"].includes(n||"mix")&&(s={openKeys:e}),s},Ge=function(e){var r=e.theme,n=e.mode,l=e.className,s=e.handleOpenChange,o=e.style,d=e.menuData,c=e.menu,m=e.matchMenuKeys,y=e.iconfontUrl,v=e.collapsed,f=e.selectedKeys,C=e.onSelect,E=e.openKeys,R=(0,a.useRef)([]),T=D.useContainer(),$=T.flatMenuKeys,P=(0,Je.Z)(c==null?void 0:c.defaultOpenAll),re=(0,B.Z)(P,2),X=re[0],ne=re[1],J=(0,Je.Z)(function(){return c!=null&&c.defaultOpenAll?j(d)||[]:E===!1?!1:[]},{value:E===!1?void 0:E,onChange:s}),Ne=(0,B.Z)(J,2),se=Ne[0],L=Ne[1],Ae=(0,Je.Z)([],{value:f,onChange:C?function(Ye){C&&Ye&&C(Ye)}:void 0}),Ze=(0,B.Z)(Ae,2),Re=Ze[0],Te=Ze[1];(0,a.useEffect)(function(){(c==null?void 0:c.defaultOpenAll)||E===!1||$.length||m&&(L(m),Te(m))},[m.join("-")]),(0,a.useEffect)(function(){y&&(le=(0,b.Z)({scriptUrl:y}))},[y]),(0,a.useEffect)(function(){if(m.join("-")!==(Re||[]).join("-")&&Te(m),!X&&E!==!1&&m.join("-")!==(se||[]).join("-")){var Ye=m;(c==null?void 0:c.autoClose)===!1&&(Ye=Array.from(new Set([].concat((0,i.Z)(m),(0,i.Z)(se||[]))))),L(Ye)}else(c==null?void 0:c.ignoreFlatMenu)&&X?L(j(d)):$.length>0&&ne(!1)},[m.join("-"),v]);var at=(0,a.useMemo)(function(){return ke(se,e)},[se&&se.join(","),e.layout,e.collapsed]),rt=(0,a.useState)(function(){return new ze(e)}),ot=(0,B.Z)(rt,1),he=ot[0];if(c!=null&&c.loading)return a.createElement("div",{style:n!=null&&n.includes("inline")?{padding:24}:{marginTop:16}},a.createElement(q.Z,{active:!0,title:!1,paragraph:{rows:n!=null&&n.includes("inline")?6:1}}));var Ie=H()(l,{"top-nav-menu":n==="horizontal"});he.props=e,e.openKeys===!1&&!e.handleOpenChange&&(R.current=m);var Be=e.postMenuData?e.postMenuData(d):d;return Be&&(Be==null?void 0:Be.length)<1?null:a.createElement(Ee.Z,(0,w.Z)({},at,{key:"Menu",mode:n,inlineIndent:16,defaultOpenKeys:R.current,theme:r,selectedKeys:Re,style:o,className:Ie,onOpenChange:L},e.menuProps),he.getNavMenuItems(Be,!1))};Ge.defaultProps={postMenuData:function(e){return e||[]}};const be=Ge;var $e=Z.Z.Sider,Oe=function(e){return typeof e=="string"?a.createElement("img",{src:e,alt:"logo"}):typeof e=="function"?e():e},Q=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"menuHeaderRender",n=e.logo,l=e.title,s=e.layout,o=e[r||""];if(o===!1)return null;var d=Oe(n),c=a.createElement("h1",null,l!=null?l:"Ant Design Pro");return o?o(d,e.collapsed?null:c,e):s==="mix"&&r==="menuHeaderRender"?null:a.createElement("a",null,d,e.collapsed?null:c)},Xe=function(e){return e?a.createElement(Ht.Z,null):a.createElement(Ut.Z,null)},bt=function(e){var r,n=e.collapsed,l=e.fixSiderbar,s=e.menuFooterRender,o=e.onCollapse,d=e.theme,c=e.siderWidth,m=e.isMobile,y=e.onMenuHeaderClick,v=e.breakpoint,f=v===void 0?"lg":v,C=e.style,E=e.layout,R=e.menuExtraRender,T=R===void 0?!1:R,$=e.collapsedButtonRender,P=$===void 0?Xe:$,re=e.links,X=e.menuContentRender,ne=e.prefixCls,J=e.onOpenChange,Ne=e.headerHeight,se=e.logoStyle,L="".concat(ne,"-sider"),Ae=D.useContainer(),Ze=Ae.flatMenuKeys,Re=H()("".concat(L),(r={},(0,h.Z)(r,"".concat(L,"-fixed"),l),(0,h.Z)(r,"".concat(L,"-layout-").concat(E),E&&!m),(0,h.Z)(r,"".concat(L,"-light"),d!=="dark"),r)),Te=Q(e),at=T&&T(e),rt=X!==!1&&Ze&&a.createElement(be,(0,w.Z)({},e,{key:"base-menu",mode:"inline",handleOpenChange:J,style:{width:"100%"},className:"".concat(L,"-menu")})),ot=X?X(e,rt):rt;return a.createElement(a.Fragment,null,l&&a.createElement("div",{style:(0,g.Z)({width:n?48:c,overflow:"hidden",flex:"0 0 ".concat(n?48:c,"px"),maxWidth:n?48:c,minWidth:n?48:c,transition:"background-color 0.3s, min-width 0.3s, max-width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)"},C)}),a.createElement($e,{collapsible:!0,trigger:null,collapsed:n,breakpoint:f===!1?void 0:f,onCollapse:function(Ie){m||o==null||o(Ie)},collapsedWidth:48,style:(0,g.Z)({overflow:"hidden",paddingTop:E==="mix"&&!m?Ne:void 0},C),width:c,theme:d,className:Re},Te&&a.createElement("div",{className:H()("".concat(L,"-logo"),(0,h.Z)({},"".concat(L,"-collapsed"),n)),onClick:E!=="mix"?y:void 0,id:"logo",style:se},Te),at&&a.createElement("div",{className:"".concat(L,"-extra ").concat(!Te&&"".concat(L,"-extra-no-logo"))},at),a.createElement("div",{style:{flex:1,overflowY:"auto",overflowX:"hidden"}},ot),a.createElement("div",{className:"".concat(L,"-links")},a.createElement(Ee.Z,{theme:d,inlineIndent:16,className:"".concat(L,"-link-menu"),selectedKeys:[],openKeys:[],mode:"inline"},(re||[]).map(function(he,Ie){return a.createElement(Ee.Z.Item,{className:"".concat(L,"-link"),key:Ie},he)}),P&&!m&&a.createElement(Ee.Z.Item,{className:"".concat(L,"-collapsed-button"),title:!1,key:"collapsed",onClick:function(){o&&o(!n)}},P(n)))),s&&a.createElement("div",{className:H()("".concat(L,"-footer"),(0,h.Z)({},"".concat(L,"-footer-collapsed"),!n))},s(e))))};const ut=bt;var Mt=t(48717),we=t(44219),Me={};Me.styleTagTransform=pe(),Me.setAttributes=me(),Me.insert=de().bind(null,"head"),Me.domAPI=ue(),Me.insertStyleElement=ge();var pn=Ce()(we.Z,Me);const fn=we.Z&&we.Z.locals?we.Z.locals:void 0;var jt=t(24664),Pt=["rightContentRender","prefixCls"],zt=function(e){var r=e.rightContentRender,n=e.prefixCls,l=(0,Fe.Z)(e,Pt),s=(0,a.useState)("auto"),o=(0,B.Z)(s,2),d=o[0],c=o[1],m=(0,jt.Z)(function(){var y=(0,_.Z)(x().mark(function v(f){return x().wrap(function(E){for(;;)switch(E.prev=E.next){case 0:c(f);case 1:case"end":return E.stop()}},v)}));return function(v){return y.apply(this,arguments)}}(),160);return a.createElement("div",{className:"".concat(n,"-right-content"),style:{minWidth:d}},a.createElement("div",{style:{paddingRight:8}},a.createElement(Mt.Z,{onResize:function(v){var f=v.width;m.run(f)}},r&&a.createElement("div",{className:"".concat(n,"-right-content-resize")},r((0,g.Z)((0,g.Z)({},l),{},{rightContentSize:d}))))))},kt=function(e){var r=(0,a.useRef)(null),n=e.theme,l=e.onMenuHeaderClick,s=e.contentWidth,o=e.rightContentRender,d=e.className,c=e.style,m=e.headerContentRender,y=e.layout,v="".concat(e.prefixCls||"ant-pro","-top-nav-header"),f=Q((0,g.Z)((0,g.Z)({},e),{},{collapsed:!1}),y==="mix"?"headerTitleRender":void 0),C=H()(v,d,{light:n==="light"}),E=a.createElement(be,(0,w.Z)({},e,e.menuProps)),R=m?m==null?void 0:m(e,E):E;return a.createElement("div",{className:C,style:c},a.createElement("div",{ref:r,className:"".concat(v,"-main ").concat(s==="Fixed"?"wide":"")},f&&a.createElement("div",{className:"".concat(v,"-main-left"),onClick:l},a.createElement("div",{className:"".concat(v,"-logo"),key:"logo",id:"logo"},f)),a.createElement("div",{style:{flex:1},className:"".concat(v,"-menu")},R),o&&a.createElement(zt,(0,w.Z)({rightContentRender:o,prefixCls:v},e))))};const Zt=kt;var Rt=function(e,r){return e===!1?null:e?e(r,null):r},Gt=function(e){var r=e.isMobile,n=e.logo,l=e.collapsed,s=e.onCollapse,o=e.collapsedButtonRender,d=o===void 0?Xe:o,c=e.rightContentRender,m=e.menuHeaderRender,y=e.onMenuHeaderClick,v=e.className,f=e.style,C=e.layout,E=e.children,R=e.headerTheme,T=R===void 0?"dark":R,$=e.splitMenus,P=e.menuData,re=e.prefixCls,X=(0,a.useContext)(Se.ZP.ConfigContext),ne=X.direction,J="".concat(re,"-global-header"),Ne=H()(v,J,(0,h.Z)({},"".concat(J,"-layout-").concat(C),C&&T==="dark"));if(C==="mix"&&!r&&$){var se=(P||[]).map(function(Re){return(0,g.Z)((0,g.Z)({},Re),{},{children:void 0,routes:void 0})}),L=G(se);return a.createElement(Zt,(0,w.Z)({mode:"horizontal"},e,{splitMenus:!1,menuData:L,theme:T}))}var Ae=H()("".concat(J,"-logo"),(0,h.Z)({},"".concat(J,"-logo-rtl"),ne==="rtl")),Ze=a.createElement("span",{className:Ae,key:"logo"},a.createElement("a",null,Oe(n)));return a.createElement("div",{className:Ne,style:(0,g.Z)({},f)},r&&Rt(m,Ze),r&&d&&a.createElement("span",{className:"".concat(J,"-collapsed-button"),onClick:function(){s&&s(!l)}},d(l)),C==="mix"&&!r&&a.createElement(a.Fragment,null,a.createElement("div",{className:Ae,onClick:y},Q((0,g.Z)((0,g.Z)({},e),{},{collapsed:!1}),"headerTitleRender"))),a.createElement("div",{style:{flex:1}},E),c&&c(e))};const Tt=Gt;var _e=Z.Z.Header,ve=function(u){(0,Kt.Z)(r,u);var e=(0,qe.Z)(r);function r(){var n;(0,xt.Z)(this,r);for(var l=arguments.length,s=new Array(l),o=0;o<l;o++)s[o]=arguments[o];return n=e.call.apply(e,[this].concat(s)),n.renderContent=function(){var d=n.props,c=d.isMobile,m=d.onCollapse,y=d.navTheme,v=d.layout,f=d.headerRender,C=d.headerContentRender,E=v==="top",R=G(n.props.menuData||[]),T=a.createElement(Tt,(0,w.Z)({onCollapse:m},n.props,{menuData:R}),C&&C(n.props,null));return E&&!c&&(T=a.createElement(Zt,(0,w.Z)({theme:y,mode:"horizontal",onCollapse:m},n.props,{menuData:R}))),f&&typeof f=="function"?f(n.props,T):T},n}return(0,Et.Z)(r,[{key:"render",value:function(){var l,s=this.props,o=s.fixedHeader,d=s.layout,c=s.className,m=s.style,y=s.navTheme,v=s.collapsed,f=s.siderWidth,C=s.hasSiderMenu,E=s.isMobile,R=s.prefixCls,T=s.headerHeight,$=o||d==="mix",P=d==="top",re=$&&C&&!P&&!E,X=H()(c,(l={},(0,h.Z)(l,"".concat(R,"-fixed-header"),$),(0,h.Z)(l,"".concat(R,"-fixed-header-action"),!v),(0,h.Z)(l,"".concat(R,"-top-menu"),P),(0,h.Z)(l,"".concat(R,"-header-").concat(y),y&&d!=="mix"),l)),ne=d!=="mix"&&re?"calc(100% - ".concat(v?48:f,"px)"):"100%",J=$?0:void 0;return a.createElement(a.Fragment,null,$&&a.createElement(_e,{style:{height:T,lineHeight:"".concat(T,"px"),background:"transparent"}}),a.createElement(_e,{style:(0,g.Z)({padding:0,height:T,lineHeight:"".concat(T,"px"),width:ne,zIndex:d==="mix"?100:19,right:J},m),className:X},this.renderContent()))}}]),r}(a.Component);const Pe=ve;var $t=t(14779),mt=t.n($t),Xt=function(e,r,n){if(n){var l=(0,i.Z)(n.keys()).find(function(o){return mt()(o).test(e)});if(l)return n.get(l)}if(r){var s=Object.keys(r).find(function(o){return mt()(o).test(e)});if(s)return r[s]}return{path:""}},St=function(e,r){var n=e.pathname,l=n===void 0?"/":n,s=e.breadcrumb,o=e.breadcrumbMap,d=e.formatMessage,c=e.title,m=e.menu,y=m===void 0?{locale:!1}:m,v=r?"":c||"",f=Xt(l,s,o);if(!f)return{title:v,id:"",pageName:v};var C=f.name;return y.locale!==!1&&f.locale&&d&&(C=d({id:f.locale||"",defaultMessage:f.name})),C?r||!c?{title:C,id:f.locale||"",pageName:C}:{title:"".concat(C," - ").concat(c),id:f.locale||"",pageName:C}:{title:v,id:f.locale||"",pageName:v}},vn=function(e,r){return St(e,r).title};const wt=null,Ve={"app.setting.pagestyle":"\u6574\u4F53\u98CE\u683C\u8BBE\u7F6E","app.setting.pagestyle.dark":"\u6697\u8272\u83DC\u5355\u98CE\u683C","app.setting.pagestyle.light":"\u4EAE\u8272\u83DC\u5355\u98CE\u683C","app.setting.pagestyle.realdark":"\u6697\u8272\u98CE\u683C(\u5B9E\u9A8C\u529F\u80FD)","app.setting.content-width":"\u5185\u5BB9\u533A\u57DF\u5BBD\u5EA6","app.setting.content-width.fixed":"\u5B9A\u5BBD","app.setting.content-width.fluid":"\u6D41\u5F0F","app.setting.themecolor":"\u4E3B\u9898\u8272","app.setting.themecolor.dust":"\u8584\u66AE","app.setting.themecolor.volcano":"\u706B\u5C71","app.setting.themecolor.sunset":"\u65E5\u66AE","app.setting.themecolor.cyan":"\u660E\u9752","app.setting.themecolor.green":"\u6781\u5149\u7EFF","app.setting.themecolor.daybreak":"\u62C2\u6653\u84DD\uFF08\u9ED8\u8BA4\uFF09","app.setting.themecolor.geekblue":"\u6781\u5BA2\u84DD","app.setting.themecolor.purple":"\u9171\u7D2B","app.setting.navigationmode":"\u5BFC\u822A\u6A21\u5F0F","app.setting.regionalsettings":"\u5185\u5BB9\u533A\u57DF","app.setting.regionalsettings.header":"\u9876\u680F","app.setting.regionalsettings.menu":"\u83DC\u5355","app.setting.regionalsettings.footer":"\u9875\u811A","app.setting.regionalsettings.menuHeader":"\u83DC\u5355\u5934","app.setting.sidemenu":"\u4FA7\u8FB9\u83DC\u5355\u5E03\u5C40","app.setting.topmenu":"\u9876\u90E8\u83DC\u5355\u5E03\u5C40","app.setting.mixmenu":"\u6DF7\u5408\u83DC\u5355\u5E03\u5C40","app.setting.splitMenus":"\u81EA\u52A8\u5206\u5272\u83DC\u5355","app.setting.fixedheader":"\u56FA\u5B9A Header","app.setting.fixedsidebar":"\u56FA\u5B9A\u4FA7\u8FB9\u83DC\u5355","app.setting.fixedsidebar.hint":"\u4FA7\u8FB9\u83DC\u5355\u5E03\u5C40\u65F6\u53EF\u914D\u7F6E","app.setting.hideheader":"\u4E0B\u6ED1\u65F6\u9690\u85CF Header","app.setting.hideheader.hint":"\u56FA\u5B9A Header \u65F6\u53EF\u914D\u7F6E","app.setting.othersettings":"\u5176\u4ED6\u8BBE\u7F6E","app.setting.weakmode":"\u8272\u5F31\u6A21\u5F0F","app.setting.copy":"\u62F7\u8D1D\u8BBE\u7F6E","app.setting.loading":"\u6B63\u5728\u52A0\u8F7D\u4E3B\u9898","app.setting.copyinfo":"\u62F7\u8D1D\u6210\u529F\uFF0C\u8BF7\u5230 src/defaultSettings.js \u4E2D\u66FF\u6362\u9ED8\u8BA4\u914D\u7F6E","app.setting.production.hint":"\u914D\u7F6E\u680F\u53EA\u5728\u5F00\u53D1\u73AF\u5883\u7528\u4E8E\u9884\u89C8\uFF0C\u751F\u4EA7\u73AF\u5883\u4E0D\u4F1A\u5C55\u73B0\uFF0C\u8BF7\u62F7\u8D1D\u540E\u624B\u52A8\u4FEE\u6539\u914D\u7F6E\u6587\u4EF6"},Vt=(0,g.Z)({},Ve),Wn={"app.setting.pagestyle":"\u6574\u9AD4\u98A8\u683C\u8A2D\u7F6E","app.setting.pagestyle.dark":"\u6697\u8272\u83DC\u55AE\u98A8\u683C","app.setting.pagestyle.realdark":"\u6697\u8272\u98A8\u683C(\u5B9E\u9A8C\u529F\u80FD)","app.setting.pagestyle.light":"\u4EAE\u8272\u83DC\u55AE\u98A8\u683C","app.setting.content-width":"\u5167\u5BB9\u5340\u57DF\u5BEC\u5EA6","app.setting.content-width.fixed":"\u5B9A\u5BEC","app.setting.content-width.fluid":"\u6D41\u5F0F","app.setting.themecolor":"\u4E3B\u984C\u8272","app.setting.themecolor.dust":"\u8584\u66AE","app.setting.themecolor.volcano":"\u706B\u5C71","app.setting.themecolor.sunset":"\u65E5\u66AE","app.setting.themecolor.cyan":"\u660E\u9752","app.setting.themecolor.green":"\u6975\u5149\u7DA0","app.setting.themecolor.daybreak":"\u62C2\u66C9\u85CD\uFF08\u9ED8\u8A8D\uFF09","app.setting.themecolor.geekblue":"\u6975\u5BA2\u85CD","app.setting.themecolor.purple":"\u91AC\u7D2B","app.setting.navigationmode":"\u5C0E\u822A\u6A21\u5F0F","app.setting.sidemenu":"\u5074\u908A\u83DC\u55AE\u5E03\u5C40","app.setting.topmenu":"\u9802\u90E8\u83DC\u55AE\u5E03\u5C40","app.setting.mixmenu":"\u6DF7\u5408\u83DC\u55AE\u5E03\u5C40","app.setting.splitMenus":"\u81EA\u52A8\u5206\u5272\u83DC\u5355","app.setting.fixedheader":"\u56FA\u5B9A Header","app.setting.fixedsidebar":"\u56FA\u5B9A\u5074\u908A\u83DC\u55AE","app.setting.fixedsidebar.hint":"\u5074\u908A\u83DC\u55AE\u5E03\u5C40\u6642\u53EF\u914D\u7F6E","app.setting.hideheader":"\u4E0B\u6ED1\u6642\u96B1\u85CF Header","app.setting.hideheader.hint":"\u56FA\u5B9A Header \u6642\u53EF\u914D\u7F6E","app.setting.othersettings":"\u5176\u4ED6\u8A2D\u7F6E","app.setting.weakmode":"\u8272\u5F31\u6A21\u5F0F","app.setting.copy":"\u62F7\u8C9D\u8A2D\u7F6E","app.setting.loading":"\u6B63\u5728\u52A0\u8F09\u4E3B\u984C","app.setting.copyinfo":"\u62F7\u8C9D\u6210\u529F\uFF0C\u8ACB\u5230 src/defaultSettings.js \u4E2D\u66FF\u63DB\u9ED8\u8A8D\u914D\u7F6E","app.setting.production.hint":"\u914D\u7F6E\u6B04\u53EA\u5728\u958B\u767C\u74B0\u5883\u7528\u65BC\u9810\u89BD\uFF0C\u751F\u7522\u74B0\u5883\u4E0D\u6703\u5C55\u73FE\uFF0C\u8ACB\u62F7\u8C9D\u5F8C\u624B\u52D5\u4FEE\u6539\u914D\u7F6E\u6587\u4EF6"},Fn=(0,g.Z)({},Wn),Kn={"app.setting.pagestyle":"Page style setting","app.setting.pagestyle.dark":"Dark Menu style","app.setting.pagestyle.light":"Light Menu style","app.setting.pagestyle.realdark":"Dark style (Beta)","app.setting.content-width":"Content Width","app.setting.content-width.fixed":"Fixed","app.setting.content-width.fluid":"Fluid","app.setting.themecolor":"Theme Color","app.setting.themecolor.dust":"Dust Red","app.setting.themecolor.volcano":"Volcano","app.setting.themecolor.sunset":"Sunset Orange","app.setting.themecolor.cyan":"Cyan","app.setting.themecolor.green":"Polar Green","app.setting.themecolor.daybreak":"Daybreak Blue (default)","app.setting.themecolor.geekblue":"Geek Blue","app.setting.themecolor.purple":"Golden Purple","app.setting.navigationmode":"Navigation Mode","app.setting.regionalsettings":"Regional Settings","app.setting.regionalsettings.header":"Header","app.setting.regionalsettings.menu":"Menu","app.setting.regionalsettings.footer":"Footer","app.setting.regionalsettings.menuHeader":"Menu Header","app.setting.sidemenu":"Side Menu Layout","app.setting.topmenu":"Top Menu Layout","app.setting.mixmenu":"Mix Menu Layout","app.setting.splitMenus":"Split Menus","app.setting.fixedheader":"Fixed Header","app.setting.fixedsidebar":"Fixed Sidebar","app.setting.fixedsidebar.hint":"Works on Side Menu Layout","app.setting.hideheader":"Hidden Header when scrolling","app.setting.hideheader.hint":"Works when Hidden Header is enabled","app.setting.othersettings":"Other Settings","app.setting.weakmode":"Weak Mode","app.setting.copy":"Copy Setting","app.setting.loading":"Loading theme","app.setting.copyinfo":"copy success\uFF0Cplease replace defaultSettings in src/models/setting.js","app.setting.production.hint":"Setting panel shows in development environment only, please manually modify"},Hn=(0,g.Z)({},Kn),Un={"app.setting.pagestyle":"Impostazioni di stile","app.setting.pagestyle.dark":"Tema scuro","app.setting.pagestyle.light":"Tema chiaro","app.setting.content-width":"Largezza contenuto","app.setting.content-width.fixed":"Fissa","app.setting.content-width.fluid":"Fluida","app.setting.themecolor":"Colore del tema","app.setting.themecolor.dust":"Rosso polvere","app.setting.themecolor.volcano":"Vulcano","app.setting.themecolor.sunset":"Arancione tramonto","app.setting.themecolor.cyan":"Ciano","app.setting.themecolor.green":"Verde polare","app.setting.themecolor.daybreak":"Blu cielo mattutino (default)","app.setting.themecolor.geekblue":"Blu geek","app.setting.themecolor.purple":"Viola dorato","app.setting.navigationmode":"Modalit\xE0 di navigazione","app.setting.sidemenu":"Menu laterale","app.setting.topmenu":"Menu in testata","app.setting.mixmenu":"Menu misto","app.setting.splitMenus":"Menu divisi","app.setting.fixedheader":"Testata fissa","app.setting.fixedsidebar":"Menu laterale fisso","app.setting.fixedsidebar.hint":"Solo se selezionato Menu laterale","app.setting.hideheader":"Nascondi testata durante lo scorrimento","app.setting.hideheader.hint":"Solo se abilitato Nascondi testata durante lo scorrimento","app.setting.othersettings":"Altre impostazioni","app.setting.weakmode":"Inverti colori","app.setting.copy":"Copia impostazioni","app.setting.loading":"Carico tema...","app.setting.copyinfo":"Impostazioni copiate con successo! Incolla il contenuto in config/defaultSettings.js","app.setting.production.hint":"Questo pannello \xE8 visibile solo durante lo sviluppo. Le impostazioni devono poi essere modificate manulamente"},jn=(0,g.Z)({},Un),zn={"app.setting.pagestyle":"\uC2A4\uD0C0\uC77C \uC124\uC815","app.setting.pagestyle.dark":"\uB2E4\uD06C \uBAA8\uB4DC","app.setting.pagestyle.light":"\uB77C\uC774\uD2B8 \uBAA8\uB4DC","app.setting.content-width":"\uCEE8\uD150\uCE20 \uB108\uBE44","app.setting.content-width.fixed":"\uACE0\uC815","app.setting.content-width.fluid":"\uD750\uB984","app.setting.themecolor":"\uD14C\uB9C8 \uC0C9\uC0C1","app.setting.themecolor.dust":"Dust Red","app.setting.themecolor.volcano":"Volcano","app.setting.themecolor.sunset":"Sunset Orange","app.setting.themecolor.cyan":"Cyan","app.setting.themecolor.green":"Polar Green","app.setting.themecolor.daybreak":"Daybreak Blue (default)","app.setting.themecolor.geekblue":"Geek Blue","app.setting.themecolor.purple":"Golden Purple","app.setting.navigationmode":"\uB124\uBE44\uAC8C\uC774\uC158 \uBAA8\uB4DC","app.setting.regionalsettings":"\uC601\uC5ED\uBCC4 \uC124\uC815","app.setting.regionalsettings.header":"\uD5E4\uB354","app.setting.regionalsettings.menu":"\uBA54\uB274","app.setting.regionalsettings.footer":"\uBC14\uB2E5\uAE00","app.setting.regionalsettings.menuHeader":"\uBA54\uB274 \uD5E4\uB354","app.setting.sidemenu":"\uBA54\uB274 \uC0AC\uC774\uB4DC \uBC30\uCE58","app.setting.topmenu":"\uBA54\uB274 \uC0C1\uB2E8 \uBC30\uCE58","app.setting.mixmenu":"\uD63C\uD569\uD615 \uBC30\uCE58","app.setting.splitMenus":"\uBA54\uB274 \uBD84\uB9AC","app.setting.fixedheader":"\uD5E4\uB354 \uACE0\uC815","app.setting.fixedsidebar":"\uC0AC\uC774\uB4DC\uBC14 \uACE0\uC815","app.setting.fixedsidebar.hint":"'\uBA54\uB274 \uC0AC\uC774\uB4DC \uBC30\uCE58'\uB97C \uC120\uD0DD\uD588\uC744 \uB54C \uB3D9\uC791\uD568","app.setting.hideheader":"\uC2A4\uD06C\uB864 \uC911 \uD5E4\uB354 \uAC10\uCD94\uAE30","app.setting.hideheader.hint":"'\uD5E4\uB354 \uAC10\uCD94\uAE30 \uC635\uC158'\uC744 \uC120\uD0DD\uD588\uC744 \uB54C \uB3D9\uC791\uD568","app.setting.othersettings":"\uB2E4\uB978 \uC124\uC815","app.setting.weakmode":"\uACE0\uB300\uBE44 \uBAA8\uB4DC","app.setting.copy":"\uC124\uC815\uAC12 \uBCF5\uC0AC","app.setting.loading":"\uD14C\uB9C8 \uB85C\uB529 \uC911","app.setting.copyinfo":"\uBCF5\uC0AC \uC131\uACF5. src/models/settings.js\uC5D0 \uC788\uB294 defaultSettings\uB97C \uAD50\uCCB4\uD574 \uC8FC\uC138\uC694.","app.setting.production.hint":"\uC124\uC815 \uD310\uB12C\uC740 \uAC1C\uBC1C \uD658\uACBD\uC5D0\uC11C\uB9CC \uBCF4\uC5EC\uC9D1\uB2C8\uB2E4. \uC9C1\uC811 \uC218\uB3D9\uC73C\uB85C \uBCC0\uACBD\uBC14\uB78D\uB2C8\uB2E4."},kn=(0,g.Z)({},zn);var hn={"zh-CN":Vt,"zh-TW":Fn,"en-US":Hn,"it-IT":jn,"ko-KR":kn},Gn=function(){if(!(0,He.Z)())return"zh-CN";var e=window.localStorage.getItem("umi_locale");return e||window.g_locale||navigator.language},$n=function(){var e=Gn();return hn[e]||hn["zh-CN"]},Xn=t(56858),Dt=t(609),nt={};nt.styleTagTransform=pe(),nt.setAttributes=me(),nt.insert=de().bind(null,"head"),nt.domAPI=ue(),nt.insertStyleElement=ge();var wa=Ce()(Dt.Z,nt);const Va=Dt.Z&&Dt.Z.locals?Dt.Z.locals:void 0,wn=function(u){var e=u.className,r=u.prefixCls,n=u.links,l=u.copyright,s=u.style,o=(0,a.useContext)(Se.ZP.ConfigContext),d=o.getPrefixCls(r||"pro-global-footer");if((n==null||n===!1||Array.isArray(n)&&n.length===0)&&(l==null||l===!1))return null;var c=H()(d,e);return a.createElement("div",{className:c,style:s},n&&a.createElement("div",{className:"".concat(d,"-links")},n.map(function(m){return a.createElement("a",{key:m.key,title:m.key,target:m.blankTarget?"_blank":"_self",href:m.href,rel:"noreferrer"},m.title)})),l&&a.createElement("div",{className:"".concat(d,"-copyright")},l))};var Vn=Z.Z.Footer,Yn=function(e){var r=e.links,n=e.copyright,l=e.style,s=e.className,o=e.prefixCls;return a.createElement(Vn,{className:s,style:(0,g.Z)({padding:0},l)},a.createElement(wn,{links:r,prefixCls:o,copyright:n===!1?null:a.createElement(a.Fragment,null,a.createElement(Xn.Z,null)," ",n)}))};const Qn=Yn;var yn=t(64335),Ya=t(72953),Jn=t(83107),qn=function(e){var r=e.isMobile,n=e.menuData,l=e.siderWidth,s=e.collapsed,o=e.onCollapse,d=e.style,c=e.className,m=e.hide,y=e.getContainer,v=e.prefixCls,f=e.matchMenuKeys,C=D.useContainer(),E=C.setFlatMenuKeys;(0,a.useEffect)(function(){if(!(!n||n.length<1)){var T=(0,Ct.kv)(n);E(Object.keys(T))}},[f.join("-")]),(0,a.useEffect)(function(){r===!0&&(o==null||o(!0))},[r]);var R=(0,xe.Z)(e,["className","style"]);return m?null:r?a.createElement(Jn.Z,{visible:!s,placement:"left",className:H()("".concat(v,"-drawer-sider"),c),onClose:function(){return o==null?void 0:o(!0)},style:(0,g.Z)({padding:0,height:"100vh"},d),getContainer:y,width:l,bodyStyle:{height:"100vh",padding:0,display:"flex",flexDirection:"row"}},a.createElement(ut,(0,w.Z)({},R,{className:H()("".concat(v,"-sider"),c),collapsed:r?!1:s,splitMenus:!1}))):a.createElement(ut,(0,w.Z)({className:H()("".concat(v,"-sider"),c)},R,{style:d}))};const Cn=qn;function ea(u){if(!u||u==="/")return["/"];var e=u.split("/").filter(function(r){return r});return e.map(function(r,n){return"/".concat(e.slice(0,n+1).join("/"))})}var ta=function(e){var r=e.breadcrumbName,n=e.path;return a.createElement("a",{href:n},r)},na=function(e,r){var n=r.formatMessage,l=r.menu;return e.locale&&n&&(l==null?void 0:l.locale)!==!1?n({id:e.locale,defaultMessage:e.name}):e.name},aa=function(e,r){var n=e.get(r);if(!n){var l=Array.from(e.keys())||[],s=l.find(function(o){return mt()(o.replace("?","")).test(r)});s&&(n=e.get(s))}return n||{path:""}},ra=function(e){var r=e.location,n=e.breadcrumbMap;return{location:r,breadcrumbMap:n}},oa=function(e,r,n){var l=ea(e==null?void 0:e.pathname),s=l.map(function(o){var d=aa(r,o),c=na(d,n),m=d.hideInBreadcrumb;return c&&!m?{path:o,breadcrumbName:c,component:d.component}:{path:"",breadcrumbName:""}}).filter(function(o){return o&&o.path});return s},ia=function(e){var r=ra(e),n=r.location,l=r.breadcrumbMap;return n&&n.pathname&&l?oa(n,l,e):[]},la=function(e,r){var n=e.breadcrumbRender,l=e.itemRender,s=r.breadcrumbProps||{},o=s.minLength,d=o===void 0?2:o,c=ia(e),m=l||ta,y=c;return n&&(y=n(y)||[]),(y&&y.length<d||n===!1)&&(y=void 0),{routes:y,itemRender:m}};function sa(u){return(0,i.Z)(u).reduce(function(e,r){var n=(0,B.Z)(r,2),l=n[0],s=n[1];return e[l]=s,e},{})}var da=function u(e,r,n,l){var s=(0,Ct.Un)(e,(r==null?void 0:r.locale)||!1,n,!0),o=s.menuData,d=s.breadcrumb;return l?u(l(o),r,n,void 0):{breadcrumb:sa(d),breadcrumbMap:d,menuData:o}};const ca=da;var ua=t(83832),xn=t(7381),ma=t(78164),ga=function(e){var r=e.autoClearCache,n=r===void 0?!0:r,l=e.style,s=e.className,o=e.children,d=e.ErrorBoundary||ma.Z;return a.createElement(xn.oK,{autoClearCache:n},e.ErrorBoundary===!1?a.createElement(Z.Z.Content,{className:s,style:l},o):a.createElement(d,null,a.createElement(Z.Z.Content,{className:s,style:l},o)))};const pa=ga;var fa=function(e){var r=["sidemenu","topmenu"];return r.includes(e)?e==null?void 0:e.replace("menu",""):e};const va=fa;var ha=t(71002),ya=t(51812),Ca=function(e){var r=(0,a.useState)({}),n=(0,B.Z)(r,2),l=n[0],s=n[1];return(0,a.useEffect)(function(){s((0,ya.Z)({layout:(0,ha.Z)(e.layout)!=="object"?e.layout:void 0,navTheme:e.navTheme,menuRender:e.menuRender,footerRender:e.footerRender,menuHeaderRender:e.menuHeaderRender,headerRender:e.headerRender,fixSiderbar:e.fixSiderbar,headerTheme:e.headerTheme}))},[e.layout,e.navTheme,e.menuRender,e.footerRender,e.menuHeaderRender,e.headerRender,e.fixSiderbar,e.headerTheme]),l};const xa=Ca;var Ea=["id","defaultMessage"],ba=["fixSiderbar","navTheme","layout"],En=0,Ma=function(e,r){return e.headerRender===!1||e.pure?null:a.createElement(Pe,(0,w.Z)({matchMenuKeys:r},e))},Pa=function(e){return e.footerRender===!1||e.pure?null:e.footerRender?e.footerRender((0,g.Z)({},e),a.createElement(Qn,null)):null},Za=function(e,r){var n=e.layout,l=e.navTheme,s=e.isMobile,o=e.openKeys,d=e.splitMenus,c=e.menuRender;if(e.menuRender===!1||e.pure)return null;var m=e.menuData;if(d&&(o!==!1||n==="mix")&&!s){var y=(0,B.Z)(r,1),v=y[0];if(v){var f,C;m=((f=e.menuData)===null||f===void 0||(C=f.find(function(T){return T.key===v}))===null||C===void 0?void 0:C.routes)||[]}else m=[]}var E=G(m||[]);if(E&&(E==null?void 0:E.length)<1&&d)return null;if(n==="top"&&!s)return a.createElement(Cn,(0,w.Z)({matchMenuKeys:r},e,{hide:!0}));var R=a.createElement(Cn,(0,w.Z)({matchMenuKeys:r},e,{style:l==="realDark"?{boxShadow:"0 2px 8px 0 rgba(0, 0, 0, 65%)"}:{},menuData:E}));return c?c(e,R):R},Ra=function(e,r){var n=r.pageTitleRender,l=St(e);if(n===!1)return{title:r.title||"",id:"",pageName:""};if(n){var s=n(e,l.title,l);if(typeof s=="string")return(0,g.Z)((0,g.Z)({},l),{},{title:s});rn()(typeof s=="string","pro-layout: renderPageTitle return value should be a string")}return l},Ta=function(e,r,n){return e?r?48:n:0},bn=function(e){var r,n,l,s,o=e||{},d=o.children,c=o.onCollapse,m=o.location,y=m===void 0?{pathname:"/"}:m,v=o.contentStyle,f=o.route,C=o.defaultCollapsed,E=o.style,R=o.disableContentMargin,T=o.siderWidth,$=T===void 0?208:T,P=o.menu,re=o.isChildrenLayout,X=o.menuDataRender,ne=o.actionRef,J=o.formatMessage,Ne=o.loading,se=(0,a.useContext)(Se.ZP.ConfigContext),L=(r=e.prefixCls)!==null&&r!==void 0?r:se.getPrefixCls("pro"),Ae=(0,Je.Z)(!1,{value:P==null?void 0:P.loading,onChange:P==null?void 0:P.onLoadingChange}),Ze=(0,B.Z)(Ae,2),Re=Ze[0],Te=Ze[1],at=(0,a.useState)(function(){return En+=1,"pro-layout-".concat(En)}),rt=(0,B.Z)(at,1),ot=rt[0],he=(0,a.useCallback)(function(oe){var lt=oe.id,_t=oe.defaultMessage,nn=(0,Fe.Z)(oe,Ea);if(J)return J((0,g.Z)({id:lt,defaultMessage:_t},nn));var st=$n();return st[lt]?st[lt]:_t},[J]),Ie=(0,Ft.ZP)(function(){return P!=null&&P.params?[ot,P==null?void 0:P.params]:[ot,{}]},function(){var oe=(0,_.Z)(x().mark(function lt(_t,nn){var st,In;return x().wrap(function(dt){for(;;)switch(dt.prev=dt.next){case 0:return Te(!0),dt.next=3,P==null||(st=P.request)===null||st===void 0?void 0:st.call(P,nn,(f==null?void 0:f.routes)||[]);case 3:return In=dt.sent,Te(!1),dt.abrupt("return",In);case 6:case"end":return dt.stop()}},lt)}));return function(lt,_t){return oe.apply(this,arguments)}}(),{revalidateOnFocus:!1,shouldRetryOnError:!1,revalidateOnReconnect:!1}),Be=Ie.data,Ye=Ie.mutate,Oa=(0,Ft.kY)(),Mn=Oa.cache;(0,a.useEffect)(function(){return function(){Mn instanceof Map&&Mn.clear()}},[]);var _a=(0,a.useMemo)(function(){return ca(Be||(f==null?void 0:f.routes)||[],P,he,X)},[he,P,X,Be,f==null?void 0:f.routes]),Yt=_a||{},Pn=Yt.breadcrumb,Na=Pn===void 0?{}:Pn,Zn=Yt.breadcrumbMap,Rn=Yt.menuData,gt=Rn===void 0?[]:Rn;ne&&(P==null?void 0:P.request)&&(ne.current={reload:function(){Ye()}});var pt=(0,a.useMemo)(function(){return(0,Ct.nG)(y.pathname||"/",gt||[],!0)},[y.pathname,gt]),Qt=(0,a.useMemo)(function(){return Array.from(new Set(pt.map(function(oe){return oe.key||oe.path||""})))},[pt]),Tn=pt[pt.length-1]||{},Sn=xa(Tn),Lt=(0,g.Z)((0,g.Z)({},e),Sn),Aa=Lt.fixSiderbar,Dn=Lt.navTheme,Ia=Lt.layout,Ba=(0,Fe.Z)(Lt,ba),ft=va(Ia),Ot=(0,Bt.ZP)(),vt=(Ot==="sm"||Ot==="xs")&&!e.disableMobile,Wa=ft!=="top"&&!vt,Fa=(0,on.Z)(function(){return C||!1},{value:e.collapsed,onChange:c}),Ln=(0,B.Z)(Fa,2),ht=Ln[0],On=Ln[1],it=(0,xe.Z)((0,g.Z)((0,g.Z)((0,g.Z)({prefixCls:L},e),{},{siderWidth:$},Sn),{},{formatMessage:he,breadcrumb:Na,menu:(0,g.Z)((0,g.Z)({},P),{},{loading:Re}),layout:ft}),["className","style","breadcrumbRender"]),Jt=Ra((0,g.Z)((0,g.Z)({pathname:y.pathname},it),{},{breadcrumbMap:Zn}),e),Ka=la((0,g.Z)((0,g.Z)({},it),{},{breadcrumbRender:e.breadcrumbRender,breadcrumbMap:Zn}),e),qt=Za((0,g.Z)((0,g.Z)({},it),{},{menuData:gt,onCollapse:On,isMobile:vt,theme:Dn==="dark"?"dark":"light",collapsed:ht}),Qt),en=Ma((0,g.Z)((0,g.Z)({},it),{},{hasSiderMenu:!!qt,menuData:gt,isMobile:vt,collapsed:ht,onCollapse:On,theme:Dn==="dark"?"dark":"light"}),Qt),_n=Pa((0,g.Z)({isMobile:vt,collapsed:ht},it)),Ha=(0,a.useContext)(yn.Z),Ua=Ha.isChildrenLayout,tn=re!==void 0?re:Ua,We="".concat(L,"-basicLayout"),ja=H()(e.className,"ant-design-pro",We,(n={},(0,h.Z)(n,"screen-".concat(Ot),Ot),(0,h.Z)(n,"".concat(We,"-top-menu"),ft==="top"),(0,h.Z)(n,"".concat(We,"-is-children"),tn),(0,h.Z)(n,"".concat(We,"-fix-siderbar"),Aa),(0,h.Z)(n,"".concat(We,"-").concat(ft),ft),n)),za=Ta(!!Wa,ht,$),Nn={position:"relative"};(tn||v&&v.minHeight)&&(Nn.minHeight=0);var ka=H()("".concat(We,"-content"),(l={},(0,h.Z)(l,"".concat(We,"-has-header"),en),(0,h.Z)(l,"".concat(We,"-content-disable-margin"),R),l));(0,a.useEffect)(function(){var oe;(oe=e.onPageChange)===null||oe===void 0||oe.call(e,e.location)},[y.pathname,(s=y.pathname)===null||s===void 0?void 0:s.search]);var Ga=(0,a.useState)(!1),An=(0,B.Z)(Ga,2),$a=An[0],Xa=An[1];return(0,Wt.Z)(Jt,e.title||!1),a.createElement(D.Provider,null,a.createElement(yn.Z.Provider,{value:(0,g.Z)((0,g.Z)({},it),{},{breadcrumb:Ka,menuData:gt,isMobile:vt,collapsed:ht,isChildrenLayout:!0,title:Jt.pageName,hasSiderMenu:!!qt,hasHeader:!!en,siderWidth:za,hasFooter:!!_n,hasFooterToolbar:$a,setHasFooterToolbar:Xa,pageTitleInfo:Jt,matchMenus:pt,matchMenuKeys:Qt,currentMenu:Tn})},e.pure?a.createElement(xn.oK,{autoClearCache:!0},d):a.createElement("div",{className:ja},a.createElement(Z.Z,{style:(0,g.Z)({minHeight:"100%"},E)},qt,a.createElement("div",{style:Nn,className:se.getPrefixCls("layout")},en,a.createElement(pa,(0,w.Z)({autoClearCache:!1,isChildrenLayout:tn},Ba,{className:ka,style:v}),Ne?a.createElement(ua.Z,null):d),_n)))))},Sa=function(){return a.createElement("svg",{width:"32px",height:"32px",viewBox:"0 0 200 200"},a.createElement("defs",null,a.createElement("linearGradient",{x1:"62.1023273%",y1:"0%",x2:"108.19718%",y2:"37.8635764%",id:"linearGradient-1"},a.createElement("stop",{stopColor:"#4285EB",offset:"0%"}),a.createElement("stop",{stopColor:"#2EC7FF",offset:"100%"})),a.createElement("linearGradient",{x1:"69.644116%",y1:"0%",x2:"54.0428975%",y2:"108.456714%",id:"linearGradient-2"},a.createElement("stop",{stopColor:"#29CDFF",offset:"0%"}),a.createElement("stop",{stopColor:"#148EFF",offset:"37.8600687%"}),a.createElement("stop",{stopColor:"#0A60FF",offset:"100%"})),a.createElement("linearGradient",{x1:"69.6908165%",y1:"-12.9743587%",x2:"16.7228981%",y2:"117.391248%",id:"linearGradient-3"},a.createElement("stop",{stopColor:"#FA816E",offset:"0%"}),a.createElement("stop",{stopColor:"#F74A5C",offset:"41.472606%"}),a.createElement("stop",{stopColor:"#F51D2C",offset:"100%"})),a.createElement("linearGradient",{x1:"68.1279872%",y1:"-35.6905737%",x2:"30.4400914%",y2:"114.942679%",id:"linearGradient-4"},a.createElement("stop",{stopColor:"#FA8E7D",offset:"0%"}),a.createElement("stop",{stopColor:"#F74A5C",offset:"51.2635191%"}),a.createElement("stop",{stopColor:"#F51D2C",offset:"100%"}))),a.createElement("g",{stroke:"none",strokeWidth:1,fill:"none",fillRule:"evenodd"},a.createElement("g",{transform:"translate(-20.000000, -20.000000)"},a.createElement("g",{transform:"translate(20.000000, 20.000000)"},a.createElement("g",null,a.createElement("g",{fillRule:"nonzero"},a.createElement("g",null,a.createElement("path",{d:"M91.5880863,4.17652823 L4.17996544,91.5127728 C-0.519240605,96.2081146 -0.519240605,103.791885 4.17996544,108.487227 L91.5880863,195.823472 C96.2872923,200.518814 103.877304,200.518814 108.57651,195.823472 L145.225487,159.204632 C149.433969,154.999611 149.433969,148.181924 145.225487,143.976903 C141.017005,139.771881 134.193707,139.771881 129.985225,143.976903 L102.20193,171.737352 C101.032305,172.906015 99.2571609,172.906015 98.0875359,171.737352 L28.285908,101.993122 C27.1162831,100.824459 27.1162831,99.050775 28.285908,97.8821118 L98.0875359,28.1378823 C99.2571609,26.9692191 101.032305,26.9692191 102.20193,28.1378823 L129.985225,55.8983314 C134.193707,60.1033528 141.017005,60.1033528 145.225487,55.8983314 C149.433969,51.69331 149.433969,44.8756232 145.225487,40.6706018 L108.58055,4.05574592 C103.862049,-0.537986846 96.2692618,-0.500797906 91.5880863,4.17652823 Z",fill:"url(#linearGradient-1)"}),a.createElement("path",{d:"M91.5880863,4.17652823 L4.17996544,91.5127728 C-0.519240605,96.2081146 -0.519240605,103.791885 4.17996544,108.487227 L91.5880863,195.823472 C96.2872923,200.518814 103.877304,200.518814 108.57651,195.823472 L145.225487,159.204632 C149.433969,154.999611 149.433969,148.181924 145.225487,143.976903 C141.017005,139.771881 134.193707,139.771881 129.985225,143.976903 L102.20193,171.737352 C101.032305,172.906015 99.2571609,172.906015 98.0875359,171.737352 L28.285908,101.993122 C27.1162831,100.824459 27.1162831,99.050775 28.285908,97.8821118 L98.0875359,28.1378823 C100.999864,25.6271836 105.751642,20.541824 112.729652,19.3524487 C117.915585,18.4685261 123.585219,20.4140239 129.738554,25.1889424 C125.624663,21.0784292 118.571995,14.0340304 108.58055,4.05574592 C103.862049,-0.537986846 96.2692618,-0.500797906 91.5880863,4.17652823 Z",fill:"url(#linearGradient-2)"})),a.createElement("path",{d:"M153.685633,135.854579 C157.894115,140.0596 164.717412,140.0596 168.925894,135.854579 L195.959977,108.842726 C200.659183,104.147384 200.659183,96.5636133 195.960527,91.8688194 L168.690777,64.7181159 C164.472332,60.5180858 157.646868,60.5241425 153.435895,64.7316526 C149.227413,68.936674 149.227413,75.7543607 153.435895,79.9593821 L171.854035,98.3623765 C173.02366,99.5310396 173.02366,101.304724 171.854035,102.473387 L153.685633,120.626849 C149.47715,124.83187 149.47715,131.649557 153.685633,135.854579 Z",fill:"url(#linearGradient-3)"})),a.createElement("ellipse",{fill:"url(#linearGradient-4)",cx:"100.519339",cy:"100.436681",rx:"23.6001926",ry:"23.580786"}))))))};bn.defaultProps=(0,g.Z)((0,g.Z)({logo:a.createElement(Sa,null)},k),{},{location:(0,He.Z)()?window.location:void 0});const Da=bn;var Qa=null;const La=Da},34180:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-basicLayout {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}
.ant-pro-basicLayout .ant-layout-header.ant-pro-fixed-header {
  position: fixed;
  top: 0;
}
.ant-pro-basicLayout .ant-layout-header.ant-pro-header-light {
  background: #fff;
}
.ant-pro-basicLayout-content {
  position: relative;
  margin: 24px;
}
.ant-pro-basicLayout-content .ant-pro-page-container {
  margin: -24px -24px 0;
}
.ant-pro-basicLayout-content-disable-margin {
  margin: 0;
}
.ant-pro-basicLayout-content-disable-margin .ant-pro-page-container {
  margin: 0;
}
.ant-pro-basicLayout-content > .ant-layout {
  max-height: 100%;
}
.ant-pro-basicLayout .ant-pro-basicLayout-is-children.ant-pro-basicLayout-fix-siderbar {
  height: 100vh;
  overflow: hidden;
  transform: rotate(0);
}
.ant-pro-basicLayout .ant-pro-basicLayout-has-header .tech-page-container {
  height: calc(100vh - 48px);
}
.ant-pro-basicLayout .ant-pro-basicLayout-has-header .ant-pro-basicLayout-is-children.ant-pro-basicLayout-has-header .tech-page-container {
  height: calc(100vh - 48px - 48px);
}
.ant-pro-basicLayout .ant-pro-basicLayout-has-header .ant-pro-basicLayout-is-children.ant-pro-basicLayout-has-header .ant-pro-basicLayout-is-children {
  min-height: calc(100vh - 48px);
}
.ant-pro-basicLayout .ant-pro-basicLayout-has-header .ant-pro-basicLayout-is-children.ant-pro-basicLayout-has-header .ant-pro-basicLayout-is-children.ant-pro-basicLayout-fix-siderbar {
  height: calc(100vh - 48px);
}
`,""]);const _=x},37503:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-fixed-header {
  z-index: 9;
  width: 100%;
}
.ant-pro-fixed-header-action {
  transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.ant-pro-header-realDark {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.65);
}
`,""]);const _=x},65238:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-footer-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
  line-height: 44px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -6px 16px -8px rgba(0, 0, 0, 0.08), 0 -9px 28px 0 rgba(0, 0, 0, 0.05), 0 -12px 48px 16px rgba(0, 0, 0, 0.03);
  transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.ant-pro-footer-bar-left {
  flex: 1;
}
.ant-pro-footer-bar-right > * {
  margin-right: 8px;
}
.ant-pro-footer-bar-right > *:last-child {
  margin: 0;
}
`,""]);const _=x},609:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-global-footer {
  margin: 48px 0 24px 0;
  padding: 0 16px;
  text-align: center;
}
.ant-pro-global-footer-links {
  margin-bottom: 8px;
}
.ant-pro-global-footer-links a {
  color: rgba(0, 0, 0, 0.45);
  transition: all 0.3s;
}
.ant-pro-global-footer-links a:not(:last-child) {
  margin-right: 40px;
}
.ant-pro-global-footer-links a:hover {
  color: rgba(0, 0, 0, 0.85);
}
.ant-pro-global-footer-copyright {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
`,""]);const _=x},65302:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-global-header {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.ant-pro-global-header > * {
  height: 100%;
}
.ant-pro-global-header-collapsed-button {
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 20px;
}
.ant-pro-global-header-layout-mix {
  background-color: #001529;
}
.ant-pro-global-header-layout-mix .ant-pro-global-header-logo h1 {
  color: #fff;
}
.ant-pro-global-header-layout-mix .anticon {
  color: #fff;
}
.ant-pro-global-header-logo {
  position: relative;
  overflow: hidden;
}
.ant-pro-global-header-logo a {
  display: flex;
  align-items: center;
  height: 100%;
}
.ant-pro-global-header-logo a img {
  height: 28px;
}
.ant-pro-global-header-logo a h1 {
  height: 32px;
  margin: 0 0 0 12px;
  color: #1890ff;
  font-weight: 600;
  font-size: 18px;
  line-height: 32px;
}
.ant-pro-global-header-logo-rtl a h1 {
  margin: 0 12px 0 0;
}
.ant-pro-global-header-menu .anticon {
  margin-right: 8px;
}
.ant-pro-global-header-menu .ant-dropdown-menu-item {
  min-width: 160px;
}
.ant-pro-global-header .dark {
  height: 48px;
}
.ant-pro-global-header .dark .action {
  color: rgba(255, 255, 255, 0.85);
}
.ant-pro-global-header .dark .action > i {
  color: rgba(255, 255, 255, 0.85);
}
.ant-pro-global-header .dark .action:hover,
.ant-pro-global-header .dark .action.opened {
  background: #1890ff;
}
.ant-pro-global-header .dark .action .ant-badge {
  color: rgba(255, 255, 255, 0.85);
}
`,""]);const _=x},41176:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-grid-content {
  width: 100%;
}
.ant-pro-grid-content.wide {
  max-width: 1200px;
  margin: 0 auto;
}
`,""]);const _=x},16619:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-page-container-children-content {
  margin: 24px 24px 0;
  padding: inherit;
}
.ant-pro-page-container {
  background-color: inherit;
}
.ant-pro-page-container-warp {
  background-color: #fff;
}
.ant-pro-page-container-warp .ant-tabs-nav {
  margin: 0;
}
.ant-pro-page-container-ghost .ant-pro-page-container-warp {
  background-color: transparent;
}
.ant-pro-page-container-ghost .ant-pro-page-container-children-content {
  margin-top: 0;
}
.ant-pro-page-container-main .ant-pro-page-container-detail {
  display: flex;
}
.ant-pro-page-container-main .ant-pro-page-container-row {
  display: flex;
  width: 100%;
}
.ant-pro-page-container-main .ant-pro-page-container-title-content {
  margin-bottom: 16px;
}
.ant-pro-page-container-main .ant-pro-page-container-title,
.ant-pro-page-container-main .ant-pro-page-container-content {
  flex: auto;
  width: 100%;
}
.ant-pro-page-container-main .ant-pro-page-container-extraContent,
.ant-pro-page-container-main .ant-pro-page-container-main {
  flex: 0 1 auto;
}
.ant-pro-page-container-main .ant-pro-page-container-main {
  width: 100%;
}
.ant-pro-page-container-main .ant-pro-page-container-title {
  margin-bottom: 16px;
}
.ant-pro-page-container-main .ant-pro-page-container-logo {
  margin-bottom: 16px;
}
.ant-pro-page-container-main .ant-pro-page-container-extraContent {
  min-width: 242px;
  margin-left: 88px;
  text-align: right;
}
@media screen and (max-width: 1200px) {
  .ant-pro-page-container-main .ant-pro-page-container-extraContent {
    margin-left: 44px;
  }
}
@media screen and (max-width: 992px) {
  .ant-pro-page-container-main .ant-pro-page-container-extraContent {
    margin-left: 20px;
  }
}
@media screen and (max-width: 768px) {
  .ant-pro-page-container-main .ant-pro-page-container-row {
    display: block;
  }
  .ant-pro-page-container-main .ant-pro-page-container-action,
  .ant-pro-page-container-main .ant-pro-page-container-extraContent {
    margin-left: 0;
    text-align: left;
  }
}
@media screen and (max-width: 576px) {
  .ant-pro-page-container-detail {
    display: block;
  }
  .ant-pro-page-container-extraContent {
    margin-left: 0;
  }
}
`,""]);const _=x},17770:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-sider {
  position: relative;
  background-color: #001529;
  border-right: 0;
}
.ant-pro-sider .ant-menu {
  background: transparent;
}
.ant-pro-sider.ant-layout-sider-light .ant-menu-item a {
  color: rgba(0, 0, 0, 0.85);
}
.ant-pro-sider.ant-layout-sider-light .ant-menu-item-selected a,
.ant-pro-sider.ant-layout-sider-light .ant-menu-item a:hover {
  color: #1890ff;
}
.ant-pro-sider-logo {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 16px;
  cursor: pointer;
  transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.ant-pro-sider-logo > a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}
.ant-pro-sider-logo img {
  display: inline-block;
  height: 32px;
  vertical-align: middle;
}
.ant-pro-sider-logo h1 {
  display: inline-block;
  height: 32px;
  margin: 0 0 0 12px;
  color: white;
  font-weight: 600;
  font-size: 18px;
  line-height: 32px;
  vertical-align: middle;
  animation: pro-layout-title-hide 0.3s;
}
.ant-pro-sider-extra {
  margin-bottom: 16px;
  padding: 0 16px;
}
.ant-pro-sider-extra-no-logo {
  margin-top: 16px;
}
.ant-pro-sider-menu {
  position: relative;
  z-index: 10;
  min-height: 100%;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.ant-pro-sider .ant-layout-sider-children {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* \u6EDA\u52A8\u6761\u6ED1\u5757 */
}
.ant-pro-sider .ant-layout-sider-children ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.ant-pro-sider .ant-layout-sider-children ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  box-shadow: inset 0 0 5px rgba(37, 37, 37, 0.05);
}
.ant-pro-sider .ant-layout-sider-children ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.05);
}
.ant-pro-sider.ant-layout-sider-collapsed .ant-menu-inline-collapsed {
  width: 48px;
}
.ant-pro-sider.ant-layout-sider-collapsed .ant-pro-sider-logo {
  padding: 16px 8px;
}
.ant-pro-sider.ant-layout-sider.ant-pro-sider-fixed {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
}
.ant-pro-sider.ant-layout-sider.ant-pro-sider-fixed > .ant-menu-root :not(.ant-pro-sider-link-menu) {
  height: calc(100vh - 48px);
  overflow-y: auto;
}
.ant-pro-sider-light {
  background-color: #fff;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
}
.ant-pro-sider-light .ant-layout-sider-children {
  /* \u6EDA\u52A8\u6761\u6ED1\u5757 */
}
.ant-pro-sider-light .ant-layout-sider-children ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  box-shadow: inset 0 0 5px rgba(0, 21, 41, 0.05);
}
.ant-pro-sider-light .ant-layout-sider-children ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 3px;
  box-shadow: inset 0 0 5px rgba(0, 21, 41, 0.05);
}
.ant-pro-sider-light .ant-pro-sider-logo h1 {
  color: #1890ff;
}
.ant-pro-sider-light .ant-menu-light {
  border-right-color: transparent;
}
.ant-pro-sider-light .ant-pro-sider-collapsed-button {
  border-top: 1px solid #f0f0f0;
}
.ant-pro-sider-icon {
  width: 14px;
  vertical-align: baseline;
}
.ant-pro-sider-links {
  width: 100%;
}
.ant-pro-sider-links ul.ant-menu-root {
  height: auto;
}
.ant-pro-sider-collapsed-button {
  border-top: 1px solid rgba(0, 0, 0, 0.25);
}
.ant-pro-sider-collapsed-button .anticon {
  font-size: 16px;
}
.ant-pro-sider .top-nav-menu li.ant-menu-item {
  height: 100%;
  line-height: 1;
}
.ant-pro-sider .drawer .drawer-content {
  background: #001529;
}
@keyframes pro-layout-title-hide {
  0% {
    display: none;
    opacity: 0;
  }
  80% {
    display: none;
    opacity: 0;
  }
  100% {
    display: unset;
    opacity: 1;
  }
}
`,""]);const _=x},44219:(I,S,t)=>{t.d(S,{Z:()=>_});var N=t(8081),Z=t.n(N),h=t(23645),A=t.n(h),x=A()(Z());x.push([I.id,`.ant-pro-top-nav-header {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 1px 4px 0 rgba(0, 21, 41, 0.12);
  transition: background 0.3s, width 0.2s;
}
.ant-pro-top-nav-header .ant-menu {
  background: transparent;
}
.ant-pro-top-nav-header.light {
  background-color: #fff;
}
.ant-pro-top-nav-header.light .ant-pro-top-nav-header-logo h1 {
  color: rgba(0, 0, 0, 0.85);
}
.ant-pro-top-nav-header.light .anticon {
  color: inherit;
}
.ant-pro-top-nav-header-main {
  display: flex;
  height: 100%;
  padding-left: 16px;
}
.ant-pro-top-nav-header-main-left {
  display: flex;
  min-width: 192px;
}
.ant-pro-top-nav-header .anticon {
  color: #fff;
}
.ant-pro-top-nav-header-logo {
  position: relative;
  min-width: 165px;
  height: 100%;
  overflow: hidden;
}
.ant-pro-top-nav-header-logo img,
.ant-pro-top-nav-header-logo a > svg {
  display: inline-block;
  height: 32px;
  vertical-align: middle;
}
.ant-pro-top-nav-header-logo h1 {
  display: inline-block;
  margin: 0 0 0 12px;
  color: #fff;
  font-size: 16px;
  vertical-align: top;
}
.ant-pro-top-nav-header-menu {
  min-width: 0;
}
.ant-pro-top-nav-header-menu .ant-menu.ant-menu-horizontal {
  height: 100%;
  border: none;
}
`,""]);const _=x}}]);
