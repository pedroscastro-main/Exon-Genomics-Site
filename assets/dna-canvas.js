// Reusable DNA helix canvas — extracted from dna-helix-white.html
// Usage: <canvas id="dna-canvas"></canvas> + <script src="assets/dna-canvas.js"></script>
// Or call initDNA({ canvas, colors: [c1,c2,c3], bg: 0xffffff, alpha: 0.92 })

(function() {
  function init(opts) {
    opts = opts || {};
    var canvas = opts.canvas || document.getElementById('dna-canvas');
    if (!canvas) return;
    var bg = opts.bg != null ? opts.bg : 0xffffff;
    var colors = opts.colors || [0x0a2466, 0x1565c0, 0x42a5f5];
    var alpha = opts.alpha != null ? opts.alpha : 0.92;
    var scrollInfluence = opts.scrollInfluence != null ? opts.scrollInfluence : 1;

    var W = canvas.clientWidth || window.innerWidth;
    var H = canvas.clientHeight || window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: opts.transparent || false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    if (!opts.transparent) renderer.setClearColor(bg, 1);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    var camera = new THREE.PerspectiveCamera(60, W / H, 0.01, 100);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);

    var pVert = [
      'uniform float uSize;',
      'varying vec2 vUv;',
      'varying float vColorId;',
      'varying float vAlpha;',
      'float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}',
      'void main(){',
      '  vUv=uv;',
      '  vec4 mv=modelViewMatrix*vec4(position,1.0);',
      '  gl_Position=projectionMatrix*mv;',
      '  vColorId=random(uv);',
      '  vAlpha=random(uv+50.0);',
      '  gl_PointSize=min(uSize*(1.0/-mv.z),18.0);',
      '}'
    ].join('\n');

    var pFrag = [
      'uniform vec3 uColor1,uColor2,uColor3;',
      'uniform float uAlpha,uGradientInner,uGradientOuter;',
      'uniform vec2 uVerticalGradient;',
      'varying vec2 vUv;',
      'varying float vColorId,vAlpha;',
      'float circle(vec2 st,float r){',
      '  vec2 d=st-0.5;',
      '  return 1.0-smoothstep(r-(r*uGradientInner),r+(r*uGradientOuter),dot(d,d)*4.0);',
      '}',
      'void main(){',
      '  float s=circle(gl_PointCoord,0.5);',
      '  float v=smoothstep(0.0,uVerticalGradient.x,vUv.y)*(1.0-smoothstep(uVerticalGradient.y,1.0,vUv.y));',
      '  vec3 col=mix(uColor1,uColor2,smoothstep(0.0,0.5,vColorId));',
      '  col=mix(col,uColor3,smoothstep(0.5,1.0,vColorId));',
      '  gl_FragColor=vec4(col,s*vAlpha*uAlpha*v);',
      '}'
    ].join('\n');

    var TOTAL = 37370;
    var YMIN = 1.66, YMAX = 21.44, YSPAN = YMAX - YMIN;
    var VROWS = 374, USTEPS = 50;
    var AMP = 3.3, TURNS = 1.5;

    var pos = new Float32Array(TOTAL * 3);
    var uvs = new Float32Array(TOTAL * 2);
    var pi = 0;

    for (var strand = 0; strand < 2 && pi < TOTAL; strand++) {
      for (var vi = 0; vi < VROWS && pi < TOTAL; vi++) {
        var v = vi / (VROWS - 1);
        var yL = YMIN + v * YSPAN;
        var rMax = AMP * Math.sin(Math.PI * v);
        var theta = -Math.PI / 2 - 2 * Math.PI * TURNS * v + strand * Math.PI;
        for (var ui = 0; ui < USTEPS && pi < TOTAL; ui++) {
          var u = strand === 0 ? 0.5 - (ui + 1) * 0.01 : 0.5 + (ui + 1) * 0.01;
          var r = rMax * 2 * Math.abs(u - 0.5);
          var da = (Math.random() - 0.5) * 0.10;
          var dy = (Math.random() - 0.5) * 0.06;
          pos[pi * 3]     = Math.cos(theta + da) * r;
          pos[pi * 3 + 1] = yL + dy;
          pos[pi * 3 + 2] = Math.sin(theta + da) * r;
          uvs[pi * 2]     = u;
          uvs[pi * 2 + 1] = v;
          pi++;
        }
      }
    }

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    var uSize = 26 * (H * dpr / 1130);

    var pMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize:             { value: uSize },
        uAlpha:            { value: alpha },
        uColor1:           { value: new THREE.Color(colors[0]) },
        uColor2:           { value: new THREE.Color(colors[1]) },
        uColor3:           { value: new THREE.Color(colors[2]) },
        uGradientInner:    { value: 1.20 },
        uGradientOuter:    { value: 0.0 },
        uVerticalGradient: { value: new THREE.Vector2(0.41, 0.72) }
      },
      vertexShader:   pVert,
      fragmentShader: pFrag,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.NormalBlending
    });

    var pMesh = new THREE.Points(pGeo, pMat);
    pMesh.position.y = -10.89;
    pMesh.rotation.y = 1.36;

    var container = new THREE.Group();
    container.add(pMesh);
    scene.add(container);

    var tCY = 0, cCY = 0, tRY = 1.36, cRY = 1.36;
    window.addEventListener('scroll', function() {
      var sy = window.scrollY || window.pageYOffset;
      tCY = 5e-4 * sy * 1.8 * scrollInfluence;
      tRY = 1.36 + -0.001 * sy * scrollInfluence;
    });

    var mTx=0, mTy=0, mCx=0, mCy=0;
    window.addEventListener('mousemove', function(e) {
      mTx = (e.clientX / W - 0.5) * 2;
      mTy = (e.clientY / H - 0.5) * 2;
    });

    function onResize() {
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      pMat.uniforms.uSize.value = 26 * (H * dpr / 1130);
    }
    window.addEventListener('resize', onResize);

    function L(a,b,t){ return a + (b-a)*t; }
    function tick() {
      requestAnimationFrame(tick);
      cCY = L(cCY, tCY, 0.5);
      cRY = L(cRY, tRY, 0.5);
      mCx = L(mCx, mTx, 0.05);
      mCy = L(mCy, mTy, 0.05);
      container.position.y = cCY;
      pMesh.rotation.y = cRY;
      camera.position.x = L(-0.2, 0.2, (mCx + 1) / 2);
      camera.position.y = L(-0.1, 0.1, (mCy + 1) / 2);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    tick();

    return {
      setColors: function(c1, c2, c3) {
        pMat.uniforms.uColor1.value.set(c1);
        pMat.uniforms.uColor2.value.set(c2);
        pMat.uniforms.uColor3.value.set(c3);
      },
      setAlpha: function(a) { pMat.uniforms.uAlpha.value = a; },
      setBg: function(c) { if (!opts.transparent) renderer.setClearColor(c, 1); }
    };
  }

  window.initDNA = init;
})();
