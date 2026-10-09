import {createServerClient} from '@supabase/ssr';import {cookies} from 'next/headers';import {redirect} from 'next/navigation';
export const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://ukaxsqwnkoqbbsufpzga.supabase.co';
export const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_bKJm5Kfsci_E3DapEE7Wtw_01B48CQI';
export async function serverClient(){const jar=await cookies();return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:values=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server components rely on proxy cookie refresh. */}}}})}
export async function session(){const db=await serverClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)redirect('/login');const {data:admin}=await db.from('platform_admins').select('role').eq('user_id',user.id).eq('active',true).in('role',['owner','admin']).maybeSingle();return {db,user,isAdmin:!!admin}}
export async function adminSession(){const s=await session();if(!s.isAdmin)redirect('/');return s}
