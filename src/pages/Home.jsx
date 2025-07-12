
import Card from '../components/Card'
import MarqueeAnimation from '../components/MarqueeAnimation'
import Myprojects from '../projects/Myprojects'
import Message from '../components/Message'
import Work from './work'

const Home = () => {
  return (
    <div className="bg-[#111111] min-h-screen">
      <Card />
      <MarqueeAnimation />
      <div className="text-white text-2xl font-bold text-center py-4">
      </div>
      <div className="text-white text-2xl font-bold text-center py-4">
        <Work/>
      </div>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Myprojects /> 
      </div> 
      <div className='flex justify-center space-x-4'>
        <Message />
      </div>
    </div>
  )
}

export default Home
