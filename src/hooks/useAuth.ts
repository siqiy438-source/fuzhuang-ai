import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        // 设置认证状态监听
        const { data } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              setIsLoading(false);
            }
          }
        );
        subscription = data.subscription;

        // 获取当前会话
        const { data: sessionData } = await supabase.auth.getSession();
        if (mounted) {
          setSession(sessionData.session);
          setUser(sessionData.session?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('认证初始化失败:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('登出失败:', error);
    }
  };

  return { user, session, isLoading, signOut };
};
