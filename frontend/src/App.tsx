import {Routes, Route } from 'react-router';
import Home from './functions/core/pages/Home/Home';
import Header from './functions/core/components/Header';
import Footer from './functions/core/components/Footer';
import Contact from './functions/core/pages/Contact/Contact';
import Legal from './functions/core/pages/Legal/Legal';
import NotFound from './functions/core/pages/NotFound/NotFound';
import Portfolio from './functions/portfolio/pages/Portfolio/Portfolio';
import CV from './functions/cv/pages/CV/CV';
import Login from './functions/admin/pages/Login/Login';

export default function App() {

  return (
    <>
      <Header/>
      <main id='main-content'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/cv' element={<CV/>}/>
          <Route path='/portfolio' element={<Portfolio/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/legal' element={<Legal/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </main>
      <Footer/>
    </>
  )
}
