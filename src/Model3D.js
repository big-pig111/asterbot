import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// 加载指示器组件
function LoadingIndicator() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#D4AF37',
      fontSize: '14px'
    }}>
      Loading 3D Model...
    </div>
  );
}

// 3D模型组件
function Model({ url }) {
  const modelRef = useRef();
  const { scene } = useGLTF(url);

    // 自动旋转动画
    useFrame((state, delta) => {
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.5; // 控制旋转速度
      }
    });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={[2, 2, 2]}
      position={[0, 0, 0]}
    />
  );
}

// 主3D场景组件
function Model3D({ modelPath }) {
  // 统一用 PUBLIC_URL 解析资源路径，确保 dev/prod 一致
  const resolvedUrl = useMemo(() => {
    if (!modelPath) return undefined;
    // 已经以 http(s) 或 / 开头则直接使用；否则拼接 PUBLIC_URL
    if (/^https?:\/\//i.test(modelPath) || modelPath.startsWith('/')) return modelPath;
    const base = process.env.PUBLIC_URL || '';
    return `${base}/${modelPath}`;
  }, [modelPath]);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingIndicator />}>
        <Canvas
          camera={{ 
            position: [0, 0, 5], 
            fov: 45,
            near: 0.1,
            far: 1000 
          }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* 环境光 */}
          <ambientLight intensity={0.5} />
          
          {/* 方向光 */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
          />
          
          {/* 点光源 */}
          <pointLight 
            position={[-10, -10, -10]} 
            intensity={0.5}
            color="#D4AF37" // 金色光源
          />
          
          {/* 3D模型 */}
          <Model url={resolvedUrl || '/1.glb'} />
        </Canvas>
      </Suspense>
    </div>
  );
}

// 预加载模型
useGLTF.preload('/1.glb');

export default Model3D;
