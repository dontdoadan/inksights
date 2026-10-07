'use server';
import {adminSession,serverClient} from '@/lib/supabase';import {generateReport} from '@/lib/contract';import {redirect} from 'next/navigation';import {revalidatePath} from 'next/cache';import {z} from 'zod';
export type ActionState={error?:string};
export async function signOut(){const db=await serverClient();await db.auth.signOut();redirect('/login')}
export async function mutate(_state:ActionState,form:FormData):Promise<ActionState>{
const {db}=await adminSession();let destination='';try{const action=z.enum(['create','save','review','approve','publish','return','clone','grant','revoke','progress']).parse(form.get('action'));const rawId=form.get('reportId');const reportId=rawId?z.uuid().parse(rawId):null;let payload:Record<string,unknown>={note:String(form.get('note')||''),expectedHash:String(form.get('expectedHash')||'')};
if(['create','save'].includes(action)){const raw=String(form.get('input')||'');if(raw.length>300000)throw new Error('Input is too large. Maximum 300 KB.');payload.manifest=generateReport(JSON.parse(raw));if(action==='create'&&form.get('studioId'))payload.studioId=z.uuid().parse(form.get('studioId'));}
if(action==='approve'&&form.get('confirmed')!=='yes')throw new Error('Confirm the evidence, calculations and recommendations before approval.');
if(['grant','revoke'].includes(action))payload.email=z.email().parse(form.get('email'));
if(action==='progress'){for(const key of ['recommendationId','status','intervention','outcome','attribution','learning'])payload[key]=String(form.get(key)||'');}
const {data,error}=await db.rpc('si_command',{p_action:action,p_report:reportId,p_payload:payload});if(error)throw new Error(error.message);destination=`/analyst/${data}`;revalidatePath('/');revalidatePath('/analyst');if(reportId){revalidatePath(`/analyst/${reportId}`);revalidatePath(`/reports/${reportId}`)}}catch(e){return {error:e instanceof Error?e.message:'The change could not be saved.'}}redirect(destination)}
