import * as T from 'three';
const materials = new Map<number, T.MeshStandardMaterial>();
export function mat(color: number) { if(!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, flatShading: true, roughness: .95 })); return materials.get(color)!; }
export function box(g: T.Group, x:number,y:number,z:number,w:number,h:number,d:number,c:number) { const m = new T.Mesh(new T.BoxGeometry(w,h,d), mat(c)); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
export function ball(g:T.Group,x:number,y:number,z:number,r:number,c:number,detail=0) { const m=new T.Mesh(new T.IcosahedronGeometry(r,detail),mat(c)); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; }
export function rod(g:T.Group,a:number[],b:number[],r:number,c:number) { const v=new T.Vector3(...b).sub(new T.Vector3(...a)); const m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),6),mat(c)); m.position.copy(new T.Vector3(...a).addScaledVector(v,.5)); m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()); g.add(m); return m; }
export function sign(text:string,w:number,h:number,color='#eee5cb',bg='#142839') {
  const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=192; const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=bg; ctx.fillRect(0,0,1024,192); ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='bold 80px monospace'; ctx.fillText(text,512,100,950);
  const tex=new T.CanvasTexture(canvas); tex.colorSpace=T.SRGBColorSpace;
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex})); return m;
}
export function tree(seed=0) { const g=new T.Group(); rod(g,[0,0,0],[-.65,3.6,0],.22,0x65533b); for(let i=0;i<3;i++){ const b=ball(g,-.6-i*.38,3+i*.8,0,1.7-i*.28,[0x657651,0x71805a,0x53664c][(i+seed)%3]); b.scale.set(1.1,1,.8); } return g; }
export function house(seed=0) { const g=new T.Group(); box(g,0,1.4,0,5,2.8,3.5,[0xb5ae96,0xb8b7a5,0xc1b19b][seed%3]); const roof=new T.Mesh(new T.CylinderGeometry(0,3.8,1.7,4),mat(0x785950)); roof.rotation.y=Math.PI/4; roof.position.y=3.6; roof.scale.z=.8; g.add(roof); for(let i=-1;i<=1;i++) box(g,i*1.4,1.5,1.77,.8,1,.05,0x486371); return g; }
export function sheep() { const g=new T.Group(); const b=ball(g,0,.9,0,.85,0xe2dfc6,1); b.scale.set(1.25,.85,.7); ball(g,.85,.92,0,.38,0x3a3d38); for(const x of [-.5,.5]) for(const z of [-.35,.35]) box(g,x,.3,z,.16,.6,.16,0x43473c); ball(g,1.07,1.03,.27,.07,0xffffff); return g; }
export function tractor() { const g=new T.Group(); box(g,.4,.9,0,2.5,.8,1.3,0xa54335); box(g,-.6,1.5,0,1.2,1.4,1.3,0x933e32); box(g,-.6,2,0,1.05,.7,1.32,0x698b94); box(g,-.6,2.47,0,1.6,.17,1.6,0xb3543d); rod(g,[1,.9,.4],[1,2.1,.4],.1,0x323b3a); for(const x of [-.8,1]) for(const z of [-.8,.8]) { const m=new T.Mesh(new T.CylinderGeometry(x<0?.7:.45,x<0?.7:.45,.3,10),mat(0x273138)); m.rotation.x=Math.PI/2; m.position.set(x,x<0?.7:.45,z); g.add(m); } return g; }
export function bread() { const g=new T.Group(); const b=ball(g,0,.9,0,.48,0xd69b47,1); b.scale.y=.75; for(let i=0;i<12;i++){const a=i*2.4; ball(g,Math.cos(a)*.3,1.17+Math.sin(i)*.04,Math.sin(a)*.24,.034,0x59462b); } return g; }
export function puddle() { const g=new T.Group(); const m=new T.Mesh(new T.CircleGeometry(1.25,9),new T.MeshStandardMaterial({color:0x779da9,roughness:.2,metalness:.2})); m.rotation.x=-Math.PI/2; m.scale.y=.57; m.position.y=.035; g.add(m); return g; }
export function shop(seed:number) {
  const g=new T.Group(), height=5+(seed%3)*1.3;
  box(g,0,height/2,0,7,height,5,[0xaf725b,0xc7b68e,0x9b6653,0xb4b8b1][seed%4]);
  box(g,0,height+.15,0,7.4,.3,5.3,0x4c585c);
  for(const x of [-2.2,0,2.2]){box(g,x,1.15,2.53,1.7,1.9,.08,0x496471);for(let y=3.4;y<height;y+=1.8)box(g,x,y,2.54,1.1,1.15,.1,0xc9d3c9);}
  const names=['KAFFE','BAGERI','BØGER','CYKLER'];const s=sign(names[seed%4],5.8,.6,'#eee6d2','#3c5152');s.position.set(0,2.5,2.64);g.add(s);
  box(g,0,2.9,2.9,7,.18,1.3,seed%2?0xb68b58:0x617a66);
  return g;
}
export function streetlight() {const g=new T.Group();rod(g,[0,0,0],[0,4.8,0],.07,0x364a51);rod(g,[0,4.8,0],[.8,4.8,0],.07,0x364a51);box(g,.8,4.75,0,.6,.12,.35,0xeee1b3);return g;}
export function church() {
  const g=new T.Group();box(g,0,2.4,0,12,4.8,7,0xa66348);
  const roof=new T.Mesh(new T.CylinderGeometry(0,8,2.8,4),mat(0x4a545c));roof.rotation.y=Math.PI/4;roof.position.y=5.6;roof.scale.z=.7;g.add(roof);
  box(g,0,4.4,3,3.5,8.8,3.5,0xac654a);box(g,0,8.65,3,3.8,.35,3.8,0xdbc5a5);
  const spire=new T.Mesh(new T.ConeGeometry(2.65,4.3,4),mat(0x45515b));spire.rotation.y=Math.PI/4;spire.position.set(0,10.9,3);g.add(spire);
  const clock=new T.Mesh(new T.CircleGeometry(.58,20),mat(0xe5d7b2));clock.position.set(0,7.3,4.77);g.add(clock);rod(g,[0,7.3,4.8],[0,7.68,4.8],.035,0x243a43);rod(g,[0,7.3,4.8],[.27,7.16,4.8],.035,0x243a43);
  box(g,0,1.1,4.78,1.3,2.2,.1,0x344046);for(const x of [-4.5,-2.8,2.8,4.5])box(g,x,2.5,3.53,.7,1.6,.08,0x405c66);
  const label=sign('HERNING KIRKE',8,.75);label.position.set(0,.65,6);g.add(label);return g;
}
export function cyclist() {
  const g=new T.Group(); const wheels:T.Mesh[]=[];
  for(const x of [-.95,.95]) { const m=new T.Mesh(new T.TorusGeometry(.66,.085,5,14),mat(0x202c32)); m.position.set(x,.7,0); g.add(m); wheels.push(m); for(let i=0;i<6;i++){const a=i*Math.PI/3; rod(g,[x,.7,.01],[x+Math.cos(a)*.59,.7+Math.sin(a)*.59,.01],.012,0xa3a9a3);} }
  for(const [a,b] of [[[-.95,.7,0],[-.3,1.4,0]],[[-.3,1.4,0],[0,.7,0]],[[0,.7,0],[-.95,.7,0]],[[-.3,1.4,0],[.6,1.4,0]],[[.6,1.4,0],[0,.7,0]],[[.6,1.4,0],[.95,.7,0]]]) rod(g,a,b,.045,0xd7ad3b);
  rod(g,[.6,1.4,0],[.72,1.8,0],.05,0x28353c); rod(g,[.72,1.8,0],[.98,1.8,0],.05,0x28353c); box(g,-.32,1.48,0,.48,.12,.28,0x28353c);
  const torso=box(g,-.1,2.03,0,.53,.9,.5,0xe3b43e); torso.rotation.z=-.5;
  const pack=box(g,-.46,2.15,-.02,.28,.64,.55,0x273e48); pack.rotation.z=-.5;
  ball(g,.38,2.57,0,.25,0xc49a72,1); const helmet=ball(g,.33,2.76,0,.3,0xe0e3d5,1); helmet.scale.y=.62;
  rod(g,[.16,2.23,.27],[.58,1.86,.3],.09,0xdcb03c); rod(g,[.58,1.86,.3],[.91,1.79,.22],.065,0xc49a72);
  const legs=new T.Group(); g.add(legs);
  const limbs=[-1,1].map(side=>({side,upper:rod(legs,[0,0,0],[0,1,0],.11,0x25313c),lower:rod(legs,[0,0,0],[0,1,0],.09,0x25313c),shoe:box(legs,0,0,0,.35,.14,.2,0xede1b9)}));
  const axis=new T.Vector3(0,1,0), aVec=new T.Vector3(), bVec=new T.Vector3();
  function moveBone(mesh:T.Mesh,a:number[],b:number[]){aVec.set(...a as [number,number,number]);bVec.set(...b as [number,number,number]).sub(aVec);mesh.position.copy(aVec).addScaledVector(bVec,.5);mesh.scale.y=bVec.length();mesh.quaternion.setFromUnitVectors(axis,bVec.normalize());}
  return {group:g,wheels,legs, animate(time:number,moving:boolean){ for(const limb of limbs) {const side=limb.side;const a=(moving?time*11:0)+(side===1?Math.PI:0);const foot=[.02+Math.sin(a)*.3,.66+Math.cos(a)*.28,side*.22];const knee=[.13+Math.sin(a)*.22,1.12+Math.cos(a)*.13,side*.22];moveBone(limb.upper,[-.32,1.58,side*.2],knee);moveBone(limb.lower,knee,foot);limb.shoe.position.set(foot[0]+.08,foot[1],foot[2]);} if(moving) wheels.forEach(w=>w.rotation.z=-time*5); }};
}
export function stadium() { const g=new T.Group(); box(g,0,.15,0,20,.3,11,0x657f4f); for(const z of [-6,6]) { box(g,0,1.6,z,23,3.2,2.5,0x939894); box(g,0,3.4,z,24,.35,3.5,0x48545b); for(let i=0;i<3;i++) box(g,0,1+i*.55,z>0?z-1.5+i*.3:z+1.5-i*.3,20,.4,.6,0xa3433d); } for(const x of [-11,11]) { box(g,x,1.5,0,2,3,12,0x939894); box(g,x,3.4,0,3,.35,15,0x48545b); } for(const x of [-11,11]) for(const z of [-7,7]) { rod(g,[x,0,z],[x,9,z],.13,0x929b97); box(g,x,9,z,1.5,1.4,.25,0xd9daca); } const s=sign('MCH ARENA',10,1.4); s.position.set(0,2.1,7.3); g.add(s); return g; }
export function boxen() { const g=new T.Group(); box(g,0,4,0,16,8,11,0x343e44); for(let x=-7.5;x<8;x+=.75) box(g,x,4,5.55,.06,8,.08,0x626b6c); const s=sign('JYSKE BANK BOXEN',12,1.4,'#eee9d8','#343e44'); s.position.set(0,6,5.65); g.add(s); return g; }
export function campus() { const g=new T.Group(); box(g,0,2,0,24,4,6,0xe2e0cf); for(let x=-11;x<12;x+=1.8) for(const y of [1.3,3]) box(g,x,y,3.03,.95,1.05,.08,0x587b8a); box(g,0,5.2,1.2,4,10.4,4,0xe9e6d5); box(g,0,5.2,3.25,.38,10.4,.05,0x446f8a); box(g,5,1.8,3.1,5,3.5,.2,0x688991); box(g,5,3.8,4,6,.18,2.6,0xf0ecdb); const s=sign('AU HERNING',5,.7,'#243b49','#e2e0cf'); s.position.set(-6,4.55,3.1); g.add(s); box(g,0,.03,6,27,.05,5,0xa3a798); for(let x=-10;x<-3;x+=1.1) {rod(g,[x,0,5],[x,.8,5],.055,0x475354); rod(g,[x,.8,5],[x,.8,6],.055,0x475354); rod(g,[x,.8,6],[x,0,6],.055,0x475354);} return g; }
