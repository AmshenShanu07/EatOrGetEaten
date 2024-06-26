import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

import useGameStore from '../Hooks/useGameStore';

type GLTFResult = GLTF & {
  nodes: {
    characterMedium001: THREE.SkinnedMesh;
    LeftFootCtrl: THREE.Bone;
    RightFootCtrl: THREE.Bone;
    HipsCtrl: THREE.Bone;
  };
  materials: {
    ["skin.001"]: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type ActionName = 'RunAnimation' | 'ZombieIdel'
interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

export function Zombie(props: JSX.IntrinsicElements["group"]) {
  const { speed, isPaused } = useGameStore()
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("./models/zombie.glb") as GLTFResult;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions.RunAnimation || !actions.ZombieIdel) return;
    actions.RunAnimation.fadeOut(0.3);
    actions.RunAnimation.fadeIn(0.3);

    if(isPaused) {
      actions.RunAnimation.stop()
      actions.ZombieIdel.play()
    } else {
      actions.ZombieIdel.stop()
      actions.RunAnimation.play();

    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  useEffect(() => {
    if(!actions.RunAnimation) return;
    
    actions.RunAnimation.timeScale = 1 + (speed * 2.3);
    
  },[actions, speed]);


  return (
    <group
      ref={group}
      dispose={null}
      scale={0.1}
      rotation-y={Math.PI}
      position-y={-0.118}
      {...props}
    >
        <mesh scale={0.45} >
          <primitive object={nodes.HipsCtrl} />
          <skinnedMesh
            name="characterMedium001"
            geometry={nodes.characterMedium001.geometry}
            material={materials["skin.001"]}
            skeleton={nodes.characterMedium001.skeleton}
          />
        </mesh>
    </group>
  );
}

useGLTF.preload("./models/zombie.glb");
