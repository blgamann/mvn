// hooks/useCycles.js
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useInView } from "react-intersection-observer";

export function useCycles({ isLoggedIn, user, username }) {
  const [cycles, setCycles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (isLoggedIn) {
      setCycles([]);
      setHasMore(true);
      setInitialLoadComplete(false);
      pageRef.current = 0;
      fetchCycles(true);
    }
  }, [isLoggedIn, username]);

  useEffect(() => {
    if (!initialLoadComplete || !isLoggedIn) return;

    if (inView && hasMore && !isLoadingRef.current) {
      fetchCycles(false);
    }
  }, [inView]); // Only depend on 'inView' to prevent unnecessary triggers

  const fetchCycles = useCallback(
    async (resetPage = false) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);

      const pageSize = 10;
      const newPage = resetPage ? 0 : pageRef.current;
      const from = newPage * pageSize;
      const to = from + pageSize - 1;

      try {
        let query = supabase
          .from("cycles")
          .select(
            `
            *,
            users:user_id (id, username, medium)
          `
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (username) {
          // First, get the user_id for the given username
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .single();

          if (userError) throw userError;

          // Then use the user_id to filter cycles
          query = query.eq("user_id", userData.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        setCycles((prevCycles) => {
          const newCycles = resetPage ? data : [...prevCycles, ...data];
          const uniqueCycles = Array.from(
            new Map(newCycles.map((item) => [item.id, item])).values()
          );
          return uniqueCycles;
        });

        setHasMore(data.length === pageSize);

        pageRef.current = newPage + 1;

        if (resetPage) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("사이클 가져오기 오류:", error);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [username]
  );

  const addCycle = useCallback((newCycle) => {
    setCycles((prevCycles) => [newCycle, ...prevCycles]);
  }, []);

  const handleCycleSubmit = async ({ reflection, medium, imgUrl }) => {
    const { data, error } = await supabase
      .from("cycles")
      .insert({
        user_id: user.id,
        type: "cycle",
        medium: medium,
        reflection: reflection,
        img_url: imgUrl,
      })
      .select("*, users:user_id (id, username, medium)");

    if (error) {
      alert("사이클 작성 오류: " + error.message);
    } else {
      addCycle(data[0]);
    }
  };

  function handleCycleDelete(cycleId) {
    setCycles((prevCycles) =>
      prevCycles.filter((cycle) => cycle.id !== cycleId)
    );
  }

  const handleEventSubmit = async (eventData) => {
    const { data, error } = await supabase
      .from("cycles")
      .insert({
        user_id: user.id,
        type: "event",
        ...eventData,
      })
      .select("*, users:user_id (id, username, medium)");

    if (error) {
      alert("이벤트 생성 오류: " + error.message);
    } else {
      addCycle(data[0]);
    }
  };

  async function handleRecycle() {
    setCycles([]);
    setHasMore(true);
    setInitialLoadComplete(false);
    pageRef.current = 0;
    await fetchCycles(true);
  }

  return {
    cycles,
    isLoading,
    hasMore,
    ref,
    handleCycleSubmit,
    handleEventSubmit,
    handleCycleDelete,
    handleRecycle,
    initialLoadComplete, // Expose initialLoadComplete if needed
  };
}
