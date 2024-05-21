import { useFrame } from '@react-three/fiber';
import { Fragment, useRef, useState } from 'react';
import { Mesh, Box3 } from 'three'
import useGameStore from '../Hooks/useGameStore';
import Grave from './Grave';

interface ObstacleProps {
  xPos: number
}

const Obstacle = ({ xPos }:ObstacleProps):JSX.Element => {
  const { speed, isPaused, setGameMode } = useGameStore()
  const obstacleRef = useRef<Mesh>(null);
  const heroRef = useGameStore(state => state.hero);
  const randomRotation = useRef<number>(Math.random()<0.5?0:Math.PI);
  const deadAudio = new Audio('/audios/dead.wav')



  useFrame(({ scene }) => {
    
    if(!obstacleRef.current) return;
    if(!heroRef.current) return;

    if(isPaused) return;

    obstacleRef.current.position.z += speed;

    const heroBox = new Box3().setFromObject(heroRef.current)
    const coinBox = new Box3().setFromObject(obstacleRef.current);

    if(coinBox.intersectsBox(heroBox)) {
      deadAudio.play();
      setGameMode(true)
    }
    

    if(obstacleRef.current.position.z > 3)
      scene.remove(obstacleRef.current)
  })

  return (
    <>
      <mesh ref={obstacleRef} position={[xPos,0.15,-17]} rotation-y={randomRotation.current} name='obstacle' >
        <Grave/>
        <boxGeometry args={[0.4,0.3,0.05]} />
        <meshPhongMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}


const ObstacleGenerator = () => {
  const { isPaused, speed } = useGameStore();
  const objectSpeed = useRef<number>(0);
  const [hold, setHold] = useState<boolean>(false);
  const [coins, setCoins] = useState<JSX.Element[]>([])
  const [index, setIndex] = useState<number>(0);

  const addObstacle = () => {
    const pos = [-1,0,1];
    const randomPos = pos[Math.floor(Math.random() * pos.length)] * .4;

    setCoins([...coins, <Obstacle xPos={randomPos} />])


    setIndex(index === 10?0:index+1)
  }

  useFrame(({ clock }) => {

    if(isPaused) return;

    const limit = 5 - Math.round(speed * 10) 

    if( !hold && Math.round((clock.elapsedTime+ objectSpeed.current)%limit) === 0) {
      setHold(true);
      addObstacle()
    }

    if(Math.round((clock.elapsedTime + objectSpeed.current)%limit) != 0) {
      setHold(false);
    }
    
    objectSpeed.current += speed;

  })
  
  return (
    <>{coins.map((d,i) => {
        return <Fragment key={i} >{d}</Fragment>
      })}
    </>
  )
}

export default ObstacleGenerator