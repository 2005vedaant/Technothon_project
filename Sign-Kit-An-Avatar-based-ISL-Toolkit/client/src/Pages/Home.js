import React from "react";
import "../App.css";
import "font-awesome/css/font-awesome.min.css";
import Services from "../Components/Home/Services";
import Intro from "../Components/Home/Intro";
import HowToUse from "../Components/Home/HowToUse";
import Masthead from "../Components/Home/Masthead";

function Home() {
  return (
    <div>

      <Masthead />

      <Intro />

      <HowToUse />

      <Services />

    </div>
  );
}

export default Home;
