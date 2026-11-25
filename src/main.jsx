import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,useNavigate} from 'react-router-dom';
import {createClient} from '@supabase/supabase-js';
import {Camera,Menu,X,ArrowUpRight,Play,UserRound,Package,Settings,Mail,LogOut,Plus,Send,FileText,DollarSign} from 'lucide-react';
import {jsPDF} from 'jspdf';
import './style.css';
const supabase=createClient(import.meta.env.VITE_SUPABASE_URL||'https://xrbshdwrscczymizjthn.supabase.co',import.meta.env.VITE_SUPABASE_ANON_KEY||'sb_publishable_Dyswp6Ay9wzYQ7I4zPuC6A_s7eROkmN');
const WORKER_URL='https://wedding-photography-1.sarath9-araveti.workers.dev';
const demoPackages=[{id:'p1',name:'The Intimate',tag:'For meaningful moments',price:24999,features:['1 candid photographer','1 traditional photographer','300 edited photographs','Online gallery']},{id:'p2',name:'The Signature',tag:'Our most-loved experience',price:54999,featured:true,features:['2 candid photographers','2 traditional photographers','Cinematic highlight film','600+ edited photographs','Premium online gallery']},{id:'p3',name:'The Heirloom',tag:'For celebrations without limits',price:99999,features:['Dedicated photo & film team','Cinematic wedding film','Drone coverage (venue permitting)','1000+ edited photographs','Luxury album consultation']}];
const hero='https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=85';
const gallery=['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1507504031003-b417219a0bde?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85'];
const EVENT_FUNCTIONS=['Engagement','Haldi','Mehendi','Wedding','Reception','Pre-wedding','Post-wedding','Sangeet','Birthday','Corporate event','Other'];
const SERVICE_CATALOG=[{category:'Photography',items:[['Traditional photography','per day'],['Candid photography','per day'],['Premium candid photography','per day'],['HD photo delivery','per project'],['Full HD photo delivery','per project'],['Portrait photography','per session'],['Family photography','per session'],['Additional photography hours','per hour']]},{category:'Videography & films',items:[['Traditional videography','per day'],['Cinematic videography','per day'],['4K video coverage','per day'],['Full HD video coverage','per day'],['Wedding highlights film','per film'],['Full-length wedding film','per film'],['Same-day edit','per film'],['Live streaming','per event']]},{category:'Pre-wedding & special shoots',items:[['Pre-wedding photography','per session'],['Pre-wedding cinematic film','per film'],['Save-the-date video','per video'],['Maternity photography','per session'],['Newborn photography','per session']]},{category:'Albums & deliverables',items:[['Standard wedding album','per album'],['Premium lay-flat album','per album'],['Parent album','per album'],['Photo prints','per print'],['USB / digital delivery','per order']]},{category:'Special coverage & production',items:[['Drone coverage','per event'],['LED wall / screen coverage','per day'],['Crane / jib camera','per day'],['Additional photographer','per day'],['Additional videographer','per day'],['Photo booth','per event']]},{category:'Editing & post-production',items:[['Advanced photo retouching','per photo'],['Extra edited photographs','per photo'],['Video editing','per video'],['Teaser / social reel','per reel'],['Express delivery','per project']]}];
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
const DEFAULT_SERVICE_RATES=Object.fromEntries(SERVICE_CATALOG.flatMap(group=>group.items.map(([label])=>[label,''])));
const AuthContext=React.createContext(null);
function AuthProvider({children}){
 const [user,setUser]=useState(null),[role,setRole]=useState(null),[authLoading,setAuthLoading]=useState(true),[roleLoading,setRoleLoading]=useState(false);
 useEffect(()=>{
  let active=true,authEventReceived=false;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   authEventReceived=true;
   if(active){setUser(session?.user||null);setAuthLoading(false)}
  });
  supabase.auth.getSession().then(({data})=>{
   if(active&&!authEventReceived){setUser(data.session?.user||null);setAuthLoading(false)}
  }).catch(()=>{
   if(active&&!authEventReceived){setUser(null);setAuthLoading(false)}
  });
  return()=>{active=false;subscription.unsubscribe()}
 },[]);
 useEffect(()=>{
  let active=true;
  if(!user){setRole(null);setRoleLoading(false);return()=>{active=false}}
  setRole(null);setRoleLoading(true);
  supabase.from('profiles').select('role').eq('id',user.id).single().then(({data,error})=>{
   if(!active)return;
   setRole(!error&&data?.role==='admin'?'admin':'customer');
   setRoleLoading(false)
  }).catch(()=>{
   if(active){setRole('customer');setRoleLoading(false)}
  });
  return()=>{active=false}
 },[user?.id]);
 const value={user,role,loading:authLoading||roleLoading};
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
function useAuth(){return React.useContext(AuthContext)}
function Header(){const [open,setOpen]=useState(false);return <header className="nav"><Link to="/" className="brand"><span className="brand-mark"><Camera size={18}/></span><span>ATELIER<small>PHOTOGRAPHY</small></span></Link><nav className={open?'nav-links show':'nav-links'}><Link onClick={()=>setOpen(false)} to="/">Home</Link><a href="/#collections" onClick={()=>setOpen(false)}>Collections</a><Link to="/gallery" onClick={()=>setOpen(false)}>Stories</Link><a href="/#contact" onClick={()=>setOpen(false)}>Contact</a></nav><button className="menu-btn" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>}
function Footer(){return <footer id="contact" className="footer"><div><div className="brand footer-brand"><span className="brand-mark"><Camera size={18}/></span><span>ATELIER<small>PHOTOGRAPHY</small></span></div><p>Honest moments. Artfully remembered.</p></div><div className="footer-right"><a href="mailto:hello@yourstudio.com">hello@yourstudio.com</a><span>Hyderabad · Available worldwide</span><span>© {new Date().getFullYear()} Atelier Photography</span></div></footer>}
function Home(){const [packages,setPackages]=useState(demoPackages);useEffect(()=>{supabase.from('packages').select('*').eq('active',true).order('sort_order').then(({data})=>{if(data?.length)setPackages(data)})},[]);return <><section className="hero" style={{backgroundImage:'linear-gradient(90deg,rgba(12,11,10,.76),rgba(12,11,10,.08)),url('+hero+')'}}><div className="hero-copy"><span className="eyebrow">THE ART OF REMEMBERING</span><h1>Moments that<br/><em>become forever.</em></h1><p>Thoughtful wedding photography and films for stories worth telling.</p><div className="hero-actions"><a className="btn btn-light" href="#collections">Explore collections <ArrowUpRight size={16}/></a><a className="text-link" href="/gallery"><Play size={14}/> Discover our stories</a></div></div><div className="hero-note">HYDERABAD · INDIA <span>01 — 03</span></div></section><section className="intro section"><span className="eyebrow">A DIFFERENT KIND OF WEDDING STORY</span><h2>Not just how it looked.<br/><em>How it felt.</em></h2><p>We notice the quiet glances, the joyful chaos, the people who make your story yours. Then we turn those fleeting seconds into something you can return to.</p></section><section className="section collection" id="collections"><div className="section-head"><div><span className="eyebrow">CURATED FOR YOUR CELEBRATION</span><h2>Our collections</h2></div><a className="text-link dark" href="#contact">Enquire about a collection <ArrowUpRight size={16}/></a></div><div className="package-grid">{packages.map((p,i)=><article className={'package-card '+(p.featured?'featured':'')} key={p.id}><div className="package-top"><span>0{i+1} / COLLECTION</span>{p.featured&&<span className="popular">MOST LOVED</span>}</div><h3>{p.name}</h3><p>{p.tag}</p><div className="price">{money(p.price)}<small> / starting</small></div><ul>{(p.features||[]).map(f=><li key={f}>{f}</li>)}</ul><a className="package-link" href="#contact">Enquire about package <ArrowUpRight size={16}/></a></article>)}</div></section><section className="gallery-section section" id="stories"><div className="section-head"><div><span className="eyebrow">A FEW MOMENTS WE KEEP</span><h2>Stories in frames</h2></div><Link className="text-link dark" to="/gallery">View all stories <ArrowUpRight size={16}/></Link></div><div className="gallery-grid">{gallery.slice(0,4).map((src,i)=><div className={'gallery-tile tile-'+i} key={src}><img src={src} alt="Wedding photography portfolio" loading="lazy"/></div>)}</div></section><section className="cta"><span className="eyebrow">YOUR STORY STARTS HERE</span><h2>Let's make something<br/><em>beautiful together.</em></h2><a className="btn btn-light" href="#contact">Talk to our studio <ArrowUpRight size={16}/></a></section><Footer/></>}
function Gallery(){const [items,setItems]=useState([]);useEffect(()=>{supabase.from('gallery_items').select('*').order('sort_order').then(({data})=>{if(data)setItems(data)})},[]);const media=items.length?items.map(x=>x.media_url):gallery;return <><Header/><main className="form-page"><span className="eyebrow">THE VISUAL JOURNAL</span><h1>Stories in <em>frames.</em></h1><p className="form-lead">A collection of celebrations, connections and beautiful in-between moments.</p><div className="gallery-grid gallery-page">{media.map((src,i)=><div className={'gallery-tile tile-'+(i%4)} key={src}><img src={src} alt="Wedding portfolio"/></div>)}</div></main><Footer/></>}
function Account(){const {user,loading}=useAuth();const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState('');const nav=useNavigate();useEffect(()=>{if(!loading&&user)nav('/dashboard')},[loading,user]);const submit=async e=>{e.preventDefault();const result=mode==='signup'?await supabase.auth.signUp({email,password,options:{emailRedirectTo:WORKER_URL+'/account'}}):await supabase.auth.signInWithPassword({email,password});if(result.error){console.error('Customer authentication failed',result.error);setMessage('Unable to sign in right now. Check your details and try again.')}else setMessage(mode==='signup'?'Check your email to verify your account.':'Signed in.')};return <><Header/><main className="auth-page"><div className="auth-card"><span className="eyebrow">CUSTOMER SPACE</span><h1>{mode==='login'?'Welcome back.':'Create your account.'}</h1><p>Sign in to view your customer account.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-dark full">{mode==='login'?'Customer sign in':'Create customer account'}</button></form>{message&&<p className="notice">{message}</p>}<button className="switch-mode" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'New here? Create a customer account':'Already registered? Sign in'}</button></div></main><Footer/></>}
function AdminLogin(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const nav=useNavigate();
 const submit=async e=>{
  e.preventDefault();
  setBusy(true);
  setMessage('');
  try{
   const {data,error}=await supabase.auth.signInWithPassword({email,password});
   if(error){console.error('Admin sign-in failed',error);setMessage('Unable to sign in. Check your email and password, then try again.');return}
   const {data:profile,error:profileError}=await supabase.from('profiles').select('role').eq('id',data.user.id).single();
   if(profileError){
    await supabase.auth.signOut();
    console.error('Admin profile lookup failed',profileError);setMessage('We could not verify studio access. Please try again later.');
    return
   }
   if(profile?.role!=='admin'){
    await supabase.auth.signOut();
    setMessage('This account does not have administrator access.');
    return
   }
   nav('/studio-admin/dashboard')
  }catch(error){
   console.error('Admin sign-in request failed',error);
   setMessage('Sign-in failed. Please try again in a moment.')
  }finally{
   setBusy(false)
  }
 };
 return <main className="auth-page"><div className="auth-card"><span className="eyebrow">PRIVATE STUDIO ACCESS</span><h1>Admin sign in.</h1><p>Authorized studio administrators only.</p><form onSubmit={submit}><label>Admin email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-dark full" disabled={busy}>{busy?'Checking access…':'Enter studio dashboard'}</button></form>{message&&<p className="notice" role="alert">{message}</p>}</div></main>
}
function AdminGuard({children}){const {user,role,loading}=useAuth();const nav=useNavigate();useEffect(()=>{if(!loading&&!user)nav('/studio-admin');else if(!loading&&user&&role!=='admin')nav('/dashboard')},[loading,user,role]);if(loading||!user||role!=='admin')return <main className="auth-page">Verifying studio access…</main>;return children}
function makeQuotationPdf(q){
 const doc=new jsPDF({unit:'mm',format:'a4'});
 const W=210,H=297,ink=[42,39,34],gold=[157,126,79],muted=[112,106,97],pale=[246,243,237];
 const fmt=n=>'INR '+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
 let page=1,y=0;
 const frame=()=>{
  doc.setDrawColor(...gold);doc.setLineWidth(.65);doc.rect(11,11,W-22,H-22);
  doc.setDrawColor(226,220,210);doc.setLineWidth(.2);doc.rect(14,14,W-28,H-28);
 };
 const header=()=>{
  frame();
  doc.setTextColor(...ink);doc.setFont('times','bold');doc.setFontSize(21);doc.text('ATELIER',22,27);
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...gold);doc.text('P H O T O G R A P H Y',22,33);
  doc.setFontSize(8);doc.setTextColor(...muted);doc.text('WEDDING PHOTOGRAPHY  |  FILMS',188,25,{align:'right'});doc.text('HYDERABAD, INDIA',188,31,{align:'right'});
  doc.setDrawColor(...gold);doc.setLineWidth(.45);doc.line(22,39,188,39);
  doc.setTextColor(...ink);doc.setFont('times','bold');doc.setFontSize(16);doc.text('QUOTATION',22,51);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...muted);
  doc.text('REF  '+q.reference,188,48,{align:'right'});doc.text('DATE  '+new Date().toLocaleDateString('en-IN'),188,54,{align:'right'});
 };
 const footer=()=>{
  doc.setDrawColor(...gold);doc.setLineWidth(.4);doc.line(22,278,188,278);
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...muted);
  doc.text('ATELIER PHOTOGRAPHY  ·  HYDERABAD',22,285);
  doc.text('Thank you for considering our studio.',105,285,{align:'center'});
  doc.text('PAGE '+page,188,285,{align:'right'});
 };
 const newPage=()=>{footer();doc.addPage();page++;header();y=64;};
 const ensure=height=>{if(y+height>267)newPage();};
 const sectionTitle=label=>{
  ensure(13);doc.setFont('times','bold');doc.setFontSize(12);doc.setTextColor(...ink);doc.text(label,22,y);
  y+=4;doc.setDrawColor(222,214,201);doc.setLineWidth(.25);doc.line(22,y,188,y);y+=7;
 };
 header();y=64;
 // Customer and event information in two clean columns
 doc.setFillColor(...pale);doc.roundedRect(22,y,166,35,1.5,1.5,'F');
 doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(...gold);
 doc.text('PREPARED FOR',28,y+7);doc.text('EVENT DETAILS',112,y+7);
 doc.setFont('times','bold');doc.setFontSize(12);doc.setTextColor(...ink);
 doc.text(String(q.name||'Client'),28,y+15,{maxWidth:76});
 doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...muted);
 doc.text(String(q.email||''),28,y+22,{maxWidth:76});doc.text(String(q.phone||''),28,y+28,{maxWidth:76});
 doc.setTextColor(...ink);doc.text('Occasion: '+String(q.event||'Celebration'),112,y+15,{maxWidth:70});
 doc.text('Coverage: '+String(q.days||1)+' day(s)',112,y+22);
 doc.text('Functions: '+((q.functions||[]).join(', ')||'As discussed'),112,y+29,{maxWidth:70});
 y+=45;sectionTitle('SERVICES & INVESTMENT');
 // Table heading
 const drawTableHead=()=>{
  doc.setFillColor(...pale);doc.rect(22,y-4,166,9,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...muted);
  doc.text('SERVICE / DELIVERABLE',26,y+2);doc.text('QTY',127,y+2,{align:'right'});
  doc.text('RATE',157,y+2,{align:'right'});doc.text('AMOUNT',184,y+2,{align:'right'});y+=11;
 };
 drawTableHead();
 const rows=(q.lines||[]).filter(row=>row.label);
 for(const row of rows){
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  const labelLines=doc.splitTextToSize(String(row.label||'Service'),86);
  const unit=String(row.unit||'');
  const detailLines=unit?doc.splitTextToSize(unit,86):[];
  const rowHeight=Math.max(9,(labelLines.length+detailLines.length)*3.5+3);
  ensure(rowHeight+3);
  if(y<65)drawTableHead();
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...ink);
  doc.text(labelLines,26,y);
  if(detailLines.length){doc.setFontSize(7);doc.setTextColor(...muted);doc.text(detailLines,26,y+labelLines.length*3.5);}
  doc.setFontSize(8);doc.setTextColor(...ink);
  doc.text(String(row.qty),127,y,{align:'right'});
  doc.text(fmt(row.rate),157,y,{align:'right'});
  doc.setFont('helvetica','bold');doc.text(fmt(row.amount),184,y,{align:'right'});
  y+=rowHeight;doc.setDrawColor(232,227,219);doc.setLineWidth(.2);doc.line(22,y-2,188,y-2);
 }
 y+=3;ensure(47);
 // Totals aligned to the right; plain language and easy scanning
 const totalRow=(label,value,bold=false)=>{
  doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(bold?10:8.5);
  doc.setTextColor(...(bold?ink:muted));doc.text(label,137,y,{align:'right'});
  doc.setTextColor(...ink);doc.text(fmt(value),184,y,{align:'right'});y+=7;
 };
 totalRow('Subtotal',q.subtotal);
 if(Number(q.discount)>0)totalRow('Discount',-Number(q.discount));
 if(Number(q.tax)>0)totalRow('GST / additional charges',q.tax);
 doc.setFillColor(43,40,35);doc.roundedRect(116,y-4,72,13,1,1,'F');
 doc.setFont('times','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
 doc.text('TOTAL',122,y+4);doc.text(fmt(q.total),183,y+4,{align:'right'});y+=17;
 if(Number(q.advance)>0){
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...muted);
  doc.text('Advance received',137,y,{align:'right'});doc.setTextColor(...ink);doc.text(fmt(q.advance),184,y,{align:'right'});y+=7;
  doc.setFont('helvetica','bold');doc.text('Balance payable',137,y,{align:'right'});doc.text(fmt(q.balance),184,y,{align:'right'});y+=9;
 }
 if(q.notes){
  const noteLines=doc.splitTextToSize(String(q.notes),160);
  ensure(noteLines.length*4+13);sectionTitle('NOTES & AGREED DETAILS');
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...ink);doc.text(noteLines,22,y);y+=noteLines.length*4+8;
 }
 ensure(35);
 doc.setFont('times','italic');doc.setFontSize(10);doc.setTextColor(...muted);
 doc.text('We would be honoured to tell your story.',22,y);y+=12;
 doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(...ink);
 doc.text('FOR ATELIER PHOTOGRAPHY',22,y);doc.text('CLIENT ACCEPTANCE',125,y);
 doc.setDrawColor(...gold);doc.line(22,y+17,82,y+17);doc.line(125,y+17,185,y+17);
 doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...muted);
 doc.text('Authorized signature',22,y+22);doc.text('Name / signature / date',125,y+22);
 // Add the same restrained frame and footer to the final page.
 footer();
 return doc;
}
function QuotationBuilder(){const [serviceRates,setServiceRates]=useState(DEFAULT_SERVICE_RATES);useEffect(()=>{supabase.from('site_settings').select('value').eq('key','service_rates').maybeSingle().then(({data,error})=>{if(error){console.error('Quotation service rates could not be loaded',error);return}if(data?.value)setServiceRates({...DEFAULT_SERVICE_RATES,...data.value})}).catch(error=>console.error('Quotation service rates request failed',error))},[]);const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[event,setEvent]=useState('Wedding'),[functions,setFunctions]=useState(['Wedding']),[days,setDays]=useState(1),[notes,setNotes]=useState(''),[discount,setDiscount]=useState(0),[tax,setTax]=useState(0),[advance,setAdvance]=useState(0),[lines,setLines]=useState([{label:'Traditional photography',unit:'per day',qty:1,rate:''}]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[waUrl,setWaUrl]=useState(''),[reference]=useState('ATL-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase());useEffect(()=>{setLines(p=>p.map(x=>!Number(x.rate)&&Number(serviceRates[x.label])>0?{...x,rate:serviceRates[x.label]}:x))},[serviceRates]);const subtotal=lines.reduce((s,x)=>s+Number(x.qty||0)*Number(x.rate||0),0),total=Math.max(0,subtotal-Number(discount||0)+Number(tax||0));const toggle=f=>setFunctions(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);const update=(i,k,v)=>setLines(p=>p.map((x,j)=>i===j?{...x,[k]:v}:x));const addLine=()=>setLines(p=>[...p,{label:'',unit:'per item',qty:1,rate:''}]);const createAndSend=async()=>{if(!name.trim()||!email.trim()||!phone.trim()||!lines.some(x=>x.label.trim())){setMessage('Please enter customer details and at least one service.');return}if(lines.filter(x=>x.label.trim()).some(x=>Number(x.rate)<=0)){setMessage('Add a price above ₹0 for every service before continuing.');return}setBusy(true);setMessage('Preparing your branded PDF…');try{const quote={reference,name,email,phone,event,functions,days,notes,lines:lines.filter(x=>x.label.trim()).map(x=>({...x,qty:Number(x.qty),rate:Number(x.rate),amount:Number(x.qty)*Number(x.rate)})),subtotal,discount:Number(discount),tax:Number(tax),advance:Number(advance),balance:Math.max(0,total-Number(advance)),total};const doc=makeQuotationPdf(quote),pdfBase64=doc.output('datauristring').split(',')[1];const {error}=await supabase.from('enquiries').insert({customer_id:null,name,email,phone,event_type:event,event_days:days,estimated_total:total,notes,quote_details:quote,status:'quoted'});if(error)throw error;doc.save(reference+'.pdf');setMessage('Quotation saved and PDF downloaded. Sending email with attachment…');const {data:sessionData}=await supabase.auth.getSession();const response=await fetch((import.meta.env.VITE_SUPABASE_URL||'https://xrbshdwrscczymizjthn.supabase.co')+'/functions/v1/send-quotation-email',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+sessionData.session.access_token,'apikey':import.meta.env.VITE_SUPABASE_ANON_KEY||'sb_publishable_Dyswp6Ay9wzYQ7I4zPuC6A_s7eROkmN'},body:JSON.stringify({name,email,phone,event,days,packageName:'Custom photography quotation',total,reference,quote,pdfBase64})});const mail=await response.json();if(!response.ok)throw new Error(mail.error||'Email sending failed. Check email service configuration.');setMessage('Quotation saved and emailed successfully to '+email+'.');setWaUrl('https://wa.me/?text='+encodeURIComponent('Hello '+name+', your Atelier Photography quotation '+reference+' for '+money(total)+' has been emailed to you. Please check your email.'))}catch(err){console.error('Quotation creation or delivery failed',err);setMessage('We could not complete this quotation. Please try again later. Check the quotations list before retrying.')}finally{setBusy(false)}};return <main className="dash-main"><div className="dash-top"><div><span className="eyebrow">OWNER WORKSPACE / QUOTATIONS</span><h1>Create a client quotation.</h1><p className="form-lead">Build a tailored service estimate and email the branded PDF directly to your customer.</p></div><Link className="text-link dark" to="/studio-admin/dashboard">← Back to dashboard</Link></div><div className="quote-layout"><div className="form-card"><h2>Customer details</h2><div className="two-col"><label>Customer name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="customer@email.com"/></label></div><label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91"/></label><div className="two-col"><label>Occasion<select value={event} onChange={e=>setEvent(e.target.value)}>{['Wedding','Engagement','Pre-wedding','Birthday','Maternity','Portrait','Product photography','Corporate / Events','Family function','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>Number of days<input type="number" min="1" max="30" value={days} onChange={e=>setDays(Math.max(1,Number(e.target.value)))}/></label></div><fieldset className="service-fieldset"><legend>Event functions</legend><div className="service-checks">{EVENT_FUNCTIONS.map(f=><label key={f}><input type="checkbox" checked={functions.includes(f)} onChange={()=>toggle(f)}/>{f}</label>)}</div></fieldset><div className="line-items-head"><h2>Photography services & pricing</h2><button type="button" className="btn btn-outline" onClick={addLine}><Plus size={15}/> Add service</button></div>{SERVICE_CATALOG.map(group=><div className="service-catalog" key={group.category}><h3>{group.category}</h3><div>{group.items.map(([label,unit])=><button type="button" key={label} onClick={()=>setLines(p=>p.some(x=>x.label===label)?p:[...p,{label,unit,qty:1,rate:serviceRates[label]||''}])}>{label} · {Number(serviceRates[label])>0?money(serviceRates[label]):'Price not set'} <Plus size={13}/></button>)}</div></div>)}<div className="quote-lines">{lines.map((x,i)=><div className="quote-line" key={i}><input aria-label="Service description" value={x.label} onChange={e=>update(i,'label',e.target.value)} placeholder="Service / deliverable"/><input aria-label="Unit" value={x.unit} onChange={e=>update(i,'unit',e.target.value)} placeholder="Unit"/><input aria-label="Quantity" type="number" min="1" value={x.qty} onChange={e=>update(i,'qty',e.target.value)}/><input aria-label="Rate" type="number" min="0" value={x.rate} onChange={e=>update(i,'rate',e.target.value)} placeholder="Rate ₹"/><b>{Number(x.rate)>0?money(Number(x.qty||0)*Number(x.rate||0)):'Set price'}</b><button type="button" className="remove-line" onClick={()=>setLines(p=>p.filter((_,j)=>i!==j))}>×</button></div>)}</div><label>Notes, venue and special instructions<textarea rows="3" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Venue, schedule, deliverables, travel, terms…"/></label><div className="two-col"><label>Discount (₹)<input type="number" min="0" value={discount} onChange={e=>setDiscount(e.target.value)}/></label><label>GST / other charges (₹)<input type="number" min="0" value={tax} onChange={e=>setTax(e.target.value)}/></label><label>Advance received (₹)<input type="number" min="0" value={advance} onChange={e=>setAdvance(e.target.value)}/></label></div><button className="btn btn-dark full" disabled={busy} onClick={createAndSend}>{busy?'Preparing quotation…':'Save quotation & email PDF'} <Send size={16}/></button>{message&&<p className="notice">{message}</p>}{waUrl&&<a className="btn btn-outline full" href={waUrl} target="_blank" rel="noreferrer">Share quotation update on WhatsApp</a>}<small className="muted">The PDF uses Atelier letterhead, a double-line border, classic typography, page numbering and footer.</small></div><aside className="quote-summary"><span className="eyebrow">LIVE QUOTATION PREVIEW</span><h3>ATELIER PHOTOGRAPHY</h3><p>{name||'Customer name'} · {event} · {days} day(s)</p>{lines.filter(x=>x.label).map((x,i)=><div className="summary-line" key={i}><span>{x.label} × {x.qty}</span><b>{Number(x.rate)>0?money(Number(x.qty||0)*Number(x.rate||0)):'Price not set'}</b></div>)}<div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Discount</span><b>− {money(discount)}</b></div><div className="summary-line"><span>GST / charges</span><b>{money(tax)}</b></div><div className="summary-line"><span>Advance</span><b>{money(advance)}</b></div><div className="summary-total"><span>Total payable</span><strong>{money(total)}</strong></div><p className="muted">Balance due: {money(Math.max(0,total-Number(advance)))}. Rates and scope are set by the studio owner. Confirm availability and final terms with the client.</p></aside></div></main>}
function Dashboard(){const {user}=useAuth();const [tab,setTab]=useState('overview'),[serviceRates,setServiceRates]=useState(DEFAULT_SERVICE_RATES),[savingRates,setSavingRates]=useState(false),[rateMessage,setRateMessage]=useState(''),[packages,setPackages]=useState(demoPackages),[newName,setNewName]=useState(''),[newPrice,setNewPrice]=useState(''),[enquiries,setEnquiries]=useState([]),[loadingItems,setLoadingItems]=useState(false);const nav=useNavigate();const loadEnquiries=async()=>{setLoadingItems(true);const {data,error}=await supabase.from('enquiries').select('*').order('created_at',{ascending:false});if(error){console.error('Quotation list failed to load',error);setEnquiries([])}else setEnquiries(data||[]);setLoadingItems(false)};useEffect(()=>{supabase.from('packages').select('*').order('sort_order').then(({data,error})=>{if(error)console.error('Packages failed to load',error);else if(data)setPackages(data)}).catch(error=>console.error('Packages request failed',error));supabase.from('site_settings').select('value').eq('key','service_rates').maybeSingle().then(({data,error})=>{if(error)console.error('Service rate settings failed to load',error);else if(data?.value)setServiceRates({...DEFAULT_SERVICE_RATES,...data.value})}).catch(error=>console.error('Service rate settings request failed',error))},[]);useEffect(()=>{if(tab==='enquiries')loadEnquiries()},[tab]);const resendQuotation=async q=>{try{const quote=q.quote_details;if(!quote?.reference)throw new Error('Saved PDF details are missing for this record.');const doc=makeQuotationPdf(quote);doc.save(quote.reference+'.pdf');const pdfBase64=doc.output('datauristring').split(',')[1];const {data:session}=await supabase.auth.getSession();const response=await fetch((import.meta.env.VITE_SUPABASE_URL||'https://xrbshdwrscczymizjthn.supabase.co')+'/functions/v1/send-quotation-email',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.session.access_token,'apikey':import.meta.env.VITE_SUPABASE_ANON_KEY||'sb_publishable_Dyswp6Ay9wzYQ7I4zPuC6A_s7eROkmN'},body:JSON.stringify({name:q.name,email:q.email,phone:q.phone,event:q.event_type,days:q.event_days,total:q.estimated_total,reference:quote.reference,quote,pdfBase64})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Email failed');alert('Quotation emailed again. PDF downloaded.')}catch(e){console.error('Quotation resend failed',e);alert('Could not resend this quotation. Please try again later.')}};const saveRates=async()=>{if(SERVICE_CATALOG.some(group=>group.items.some(([label])=>Number(serviceRates[label])<=0))){setRateMessage('Enter a price above ₹0 for every listed service before saving.');return}setSavingRates(true);setRateMessage('');try{const {error}=await supabase.from('site_settings').upsert({key:'service_rates',value:serviceRates,updated_at:new Date().toISOString()},{onConflict:'key'});if(error)throw error;setRateMessage('Service prices saved. They will be used in new quotations.')}catch(error){console.error('Service prices could not be saved',error);setRateMessage('Could not save prices. Please try again later.')}finally{setSavingRates(false)}};const signout=async()=>{await supabase.auth.signOut();nav('/')};const addPackage=async()=>{if(!newName||!newPrice)return;const {data,error}=await supabase.from('packages').insert({name:newName,price:Number(newPrice),tag:'New collection',features:[],active:true}).select().single();if(error){console.error('Package could not be created',error);alert('Could not add this package. Please try again later.');return}setPackages([...packages,data]);setNewName('');setNewPrice('')};return <><Header/><main className="dashboard"><aside className="dash-side"><span className="eyebrow">PRIVATE STUDIO CONSOLE</span><h2>Manage beautifully.</h2><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><Settings size={17}/>Overview</button><button className={tab==='packages'?'active':''} onClick={()=>setTab('packages')}><Package size={17}/>Packages</button><button className={tab==='pricing'?'active':''} onClick={()=>setTab('pricing')}><DollarSign size={17}/>Service prices</button><button className={tab==='enquiries'?'active':''} onClick={()=>setTab('enquiries')}><Mail size={17}/>Quotations & clients</button><Link className="dash-nav-link" to="/studio-admin/quotation"><FileText size={17}/>Create quotation</Link><button onClick={signout}><LogOut size={17}/>Sign out</button></aside><section className="dash-main"><div className="dash-top"><div><span className="eyebrow">ADMINISTRATION</span><h1>Good things are taking shape.</h1></div><span className="user-pill"><UserRound size={15}/>{user?.email}</span></div>{tab==='overview'&&<div className="stat-grid"><div className="stat"><span>Active collections</span><strong>{packages.length}</strong></div><div className="stat"><span>Quotation records</span><strong>{enquiries.length||'—'}</strong></div><div className="stat"><span>Studio status</span><strong>Private</strong></div><div className="stat wide-stat"><span>Next step</span><strong><Link to="/studio-admin/quotation">Create a customer quotation →</Link></strong></div></div>}{tab==='pricing'&&<><div className="section-head"><div><h2>Service prices</h2><p className="form-lead">Set a rate for every catalog service. New quotations will use these saved prices.</p></div><button className="btn btn-dark" disabled={savingRates} onClick={saveRates}>{savingRates?'Saving…':'Save prices'}</button></div>{SERVICE_CATALOG.map(group=><div className="service-catalog" key={group.category}><h3>{group.category}</h3><div className="price-settings-list">{group.items.map(([label,unit])=><label key={label}>{label} <small>{unit}</small><input type="number" min="0" value={serviceRates[label]??''} onChange={e=>setServiceRates(p=>({...p,[label]:e.target.value}))}/></label>)}</div></div>)}{rateMessage&&<p className="notice" role="status">{rateMessage}</p>}</>}{tab==='packages'&&<><h2>Manage collections</h2><div className="inline-form"><input placeholder="Collection name" value={newName} onChange={e=>setNewName(e.target.value)}/><input placeholder="Price in INR" type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/><button className="btn btn-dark" onClick={addPackage}><Plus size={16}/> Add</button></div><div className="manage-list">{packages.map(p=><div key={p.id}><div><b>{p.name}</b><span>{money(p.price)}</span></div></div>)}</div></>}{tab==='enquiries'&&<><div className="section-head"><h2>Customer quotations</h2><button className="btn btn-outline" onClick={loadEnquiries}>Refresh</button></div>{loadingItems?<p>Loading quotations…</p>:enquiries.length?<div className="enquiry-list">{enquiries.map(q=><article key={q.id}><div><span className="eyebrow">{q.status||'NEW'} · {new Date(q.created_at).toLocaleDateString('en-IN')}</span><h3>{q.name}</h3><p>{q.email} · {q.phone||'No phone'} · {q.event_type||'Event not specified'}</p></div><strong>{money(q.estimated_total)}</strong><span className="muted">{q.quote_details?.reference||'Enquiry record'}</span><button className="btn btn-outline" onClick={()=>resendQuotation(q)}>Download / resend PDF</button></article>)}</div>:<div className="empty-state"><Mail size={30}/><h2>No quotations yet</h2><p>New owner-created quotations will appear here.</p><Link className="btn btn-dark" to="/studio-admin/quotation">Create first quotation</Link></div>}</>}</section></main><Footer/></>}
function CustomerDashboard(){const {user}=useAuth();const nav=useNavigate();const signout=async()=>{await supabase.auth.signOut();nav('/')};return <><Header/><main className="form-page"><span className="eyebrow">CUSTOMER SPACE</span><h1>Welcome.</h1><p className="form-lead">Signed in as {user?.email}. For a tailored quotation, please contact our studio directly.</p><a className="btn btn-dark" href="mailto:hello@yourstudio.com">Contact the studio</a> <button className="btn btn-outline" onClick={signout}>Sign out</button></main><Footer/></>}
function App(){return <BrowserRouter><AuthProvider><Routes><Route path="/" element={<><Header/><Home/></>}/><Route path="/gallery" element={<Gallery/>}/><Route path="/account" element={<Account/>}/><Route path="/dashboard" element={<CustomerDashboard/>}/><Route path="/studio-admin" element={<AdminLogin/>}/><Route path="/studio-admin/dashboard" element={<AdminGuard><Dashboard/></AdminGuard>}/><Route path="/studio-admin/quotation" element={<AdminGuard><QuotationBuilder/></AdminGuard>}/><Route path="*" element={<main className="auth-page"><h1>Page not found</h1><Link to="/">Return home</Link></main>}/></Routes></AuthProvider></BrowserRouter>}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
