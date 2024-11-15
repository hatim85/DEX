import { useState } from 'react'
import Dex from './Dex'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Dex/>
    </>
  )
}

export default App
