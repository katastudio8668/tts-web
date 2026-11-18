import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '../../lib/supabase';
type AuthValue={session:Session|null;loading:boolean;configured:boolean;signInWithGoogle:()=>Promise<void>;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const[session,setSession]=useState<Session|null>(null);const[loading,setLoading]=useState(Boolean(supabase));
useEffect(()=>{if(!supabase)return;let active=true;supabase.auth.getSession().then(({data})=>{if(active){setSession(data.session);setLoading(false);}});const{data}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setLoading(false);});return()=>{active=false;data.subscription.unsubscribe();};},[]);
const value=useMemo<AuthValue>(()=>({session,loading,configured:Boolean(supabase),signInWithGoogle:async()=>{if(!supabase)throw new Error('Chưa cấu hình Supabase. Hãy thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.');const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/signin`}});if(error)throw error;},signOut:async()=>{if(!supabase)return;const{error}=await supabase.auth.signOut();if(error)throw error;}}),[session,loading]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value;}