import * as T from 'three';
import * as M from './models';
import { landmarks, CITY_START, CITY_END, ROUTE_LENGTH } from './route';
import type { Obstacle, State } from './simulation';
export function createWorld(container:HTMLElement, objects:Obstacle[]) {
  const renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFShadowMap; renderer.setClearColor(0xadb9bd); renderer.outputColorSpace=T.SRGBColorSpace; container.append(renderer.domElement);
  const scene=new T.Scene(); scene.fog=new T.Fog(0xadb9bd,65,125);
  const camera=new T.OrthographicCamera(); camera.position.set(0,18,45); camera.lookAt(0,4,-5);
  scene.add(new T.HemisphereLight(0xd8e7e7,0x77795a,2.3)); const sun=new T.DirectionalLight(0xffefd4,2.1); sun.position.set(-20,40,25); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-55,right:55,top:45,bottom:-45,far:120}); sun.shadow.bias=-.001; scene.add(sun);
  const ground=new T.Group(); scene.add(ground); M.box(ground,0,-.2,10,240,.3,110,0x7d8863);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=16;skyCanvas.height=256;const skyCtx=skyCanvas.getContext('2d')!;const gradient=skyCtx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#7c909f');gradient.addColorStop(1,'#c5cecb');skyCtx.fillStyle=gradient;skyCtx.fillRect(0,0,16,256);scene.background=new T.CanvasTexture(skyCanvas);scene.background.colorSpace=T.SRGBColorSpace;
  const clouds=new T.Group();scene.add(clouds);for(let i=0;i<10;i++){const c=M.ball(clouds,i*18-80,7+(i%3),-43,4,0xb9c4c4,1);c.scale.set(2.8,.3,.6);}
  M.box(ground,0,-.01,0,220,.06,10.8,0x647478);
  for(const z of [-5.5,5.5]) M.box(ground,0,.03,z,220,.12,.22,0xa9b29d);
  const markings=new T.Group(); scene.add(markings); for(let x=-100;x<=100;x+=5) for(const z of [-1.5,1.5]) M.box(markings,x,.04,z,2,.015,.055,0xb2b6a5);
  const scenery=new T.Group(); scene.add(scenery);
  for(let i=0;i<Math.ceil(ROUTE_LENGTH/35)+18;i++) { const x=i*7-60; const z=-10-(i*13%31); if((x>CITY_START/5-8&&x<CITY_END/5+8)||landmarks.some(l=>Math.abs(x-l.at/5)<18)) continue; const tree=M.tree(i%3); tree.position.set(x,0,z); tree.scale.setScalar(.7+(i%5)*.13); scenery.add(tree); if(i%7===0){const h=M.house(i);h.position.set(x+3,0,-38-(i%3)*5);scenery.add(h);} }
  for(let i=0;i<Math.ceil(ROUTE_LENGTH/50)+12;i++){const x=i*10-50; if(x>CITY_START/5&&x<CITY_END/5)continue; M.box(scenery,x,.7,7.7,.12,1.4,.12,0x75664d); if(i%3===0) M.box(scenery,x+4,.8,7.7,8,.08,.08,0x89775c);}
  for(const l of landmarks){const g=l.kind==='stadium'?M.stadium():l.kind==='boxen'?M.boxen():l.kind==='church'?M.church():M.campus();g.position.set(l.at/5,0,l.kind==='boxen'?-35:-18);scenery.add(g);}

  const city=new T.Group();city.position.x=(CITY_START+CITY_END)/10;scenery.add(city);
  const cityWidth=(CITY_END-CITY_START)/5;
  M.box(city,0,.06,-16,cityWidth,.12,20,0xa2a297);M.box(city,0,.06,8,cityWidth,.12,4,0xaca99a);
  for(let x=CITY_START/5;x<CITY_END/5;x+=9){if(Math.abs(x-900/5)>16){const shop=M.shop(Math.round(x/9));shop.position.set(x,0,-14);scenery.add(shop);}}
  for(let x=CITY_START/5;x<CITY_END/5;x+=12){const lamp=M.streetlight();lamp.position.set(x,0,-6);scenery.add(lamp);}
  for(const [x,text] of [[CITY_START/5,'BREDGADE'],[210,'ØSTERGADE']] as const){const label=M.sign(text,6,.7);label.position.set(x,2.1,-6.5);scenery.add(label);}
  const cyclist=M.cyclist(); cyclist.group.position.set(-14,0,0); cyclist.group.scale.setScalar(1.3); scene.add(cyclist.group);
  const models=new Map<number,T.Group>(); const objectGroup=new T.Group();scene.add(objectGroup);
  for(const o of objects){const mesh=M[o.kind](); mesh.position.set(o.at/5,0,(o.lane-1)*3);objectGroup.add(mesh);models.set(o.id,mesh);}
  const wind=new T.Group();scene.add(wind);for(let i=0;i<38;i++){const m=new T.Mesh(new T.BoxGeometry(1.2+i%4,.024,.024),new T.MeshBasicMaterial({color:0xe8eddf,transparent:true,opacity:.22+(i%3)*.1}));wind.add(m);}
  let width=0,height=0; const resize=()=>{width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height); const aspect=width/height; const halfH=aspect<1.1?20:13; camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();}; const ro=new ResizeObserver(resize);ro.observe(container);resize();
  return {render(s:State,time:number){const riderX=-Math.min(14,camera.right*.4); const offset=-s.distance/5+riderX;cyclist.group.position.x=riderX;scenery.position.x=offset; objectGroup.position.x=offset;markings.position.x=-(s.distance/5%5); cyclist.group.position.z=(s.lanePosition-1)*3;cyclist.group.visible=s.grace<=0 || Math.floor(time*12)%2===0;cyclist.animate(s.elapsed,s.speed>0); for(const o of objects){const m=models.get(o.id)!;m.visible=!o.consumed&&Math.abs(o.at-s.distance)<420;if(o.kind==='bread'){m.position.y=.15+Math.sin(time*3+o.id)*.15;m.rotation.y=time;}} scenery.children.forEach(c=>c.visible=Math.abs(c.position.x+offset)<115);wind.children.forEach((m,i)=>{m.position.set(52-((time*(14+i%5)+i*7)%110),1+(i*7%13),(i*13%50)-22);});renderer.render(scene,camera);},dispose(){ro.disconnect();renderer.dispose();}};
}


