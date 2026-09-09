// src/Pages/Home.js
import React, { useEffect, useState } from "react";
import "../App.css";
import "font-awesome/css/font-awesome.min.css";
import Services from "../Components/Home/Services";
import Intro from "../Components/Home/Intro";
import HowToUse from "../Components/Home/HowToUse";
import Masthead from "../Components/Home/Masthead";
import { useAuth } from "../context/AuthContext";
import WelcomeCinematic from "../Components/Home/WelcomeCinematic";
import { useSharedScroll } from "../Components/Home/useSharedScroll";

function Home() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  const { ref: scrollRef, scrollYProgress } = useSharedScroll();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const token = user.token ?? (await user.getIdToken?.());
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.exists && data.user) {
          setUsername(data.user.username);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div>
      <section ref={scrollRef}>
        <WelcomeCinematic username={username} scrollYProgress={scrollYProgress} />
      </section>
      <Masthead />
      <Intro />
      <HowToUse />
      <Services />
    </div>
  );
}

export default Home;
