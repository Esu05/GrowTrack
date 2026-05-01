import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'
import Ctx from '../components/Ctx'

const Landing = () => {
  return (
    <>
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Ctx />
        <Footer />
    </>
  );
};

export default Landing;
