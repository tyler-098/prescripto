import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/banner'
import ArticlesSection from '../components/ArticleSelection'
const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <ArticlesSection />
      <Banner />
    </div>
  )
}

export default Home